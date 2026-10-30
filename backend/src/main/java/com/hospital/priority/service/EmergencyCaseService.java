package com.hospital.priority.service;

import com.hospital.priority.algorithm.DoctorAllocationService;
import com.hospital.priority.algorithm.EmergencyPriorityAlgorithm;
import com.hospital.priority.dto.*;
import com.hospital.priority.exception.InvalidInputException;
import com.hospital.priority.exception.ResourceNotFoundException;
import com.hospital.priority.model.*;
import com.hospital.priority.repository.DoctorRepository;
import com.hospital.priority.repository.EmergencyCaseRepository;
import com.hospital.priority.repository.PatientRepository;
import com.hospital.priority.security.UserPrincipal;
import com.hospital.priority.websocket.QueueWebSocketPublisher;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class EmergencyCaseService {

    private final EmergencyCaseRepository emergencyCaseRepository;
    private final PatientRepository patientRepository;
    private final DoctorRepository doctorRepository;
    private final PriorityQueueService priorityQueueService;
    private final EmergencyPriorityAlgorithm priorityAlgorithm;
    private final DoctorAllocationService doctorAllocationService;
    private final AuditLogService auditLogService;
    private final QueueWebSocketPublisher webSocketPublisher;
    private final DoctorService doctorService;

    public List<EmergencyCaseDto> getAllCases() {
        return emergencyCaseRepository.findAll().stream()
                .map(this::mapToDto)
                .toList();
    }

    public EmergencyCaseDto getCaseById(String id) {
        EmergencyCase emergencyCase = emergencyCaseRepository.findById(id)
                .or(() -> emergencyCaseRepository.findByCaseId(id))
                .orElseThrow(() -> new ResourceNotFoundException("Emergency Case not found with ID: " + id));
        return mapToDto(emergencyCase);
    }

    public EmergencyCaseDto createEmergencyCase(EmergencyCaseDto dto) {
        Patient patient = patientRepository.findByPatientId(dto.getPatientId())
                .or(() -> patientRepository.findById(dto.getPatientId()))
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found with ID: " + dto.getPatientId()));

        String caseId = "EMG-" + (8800 + emergencyCaseRepository.count() + 1);
        int score = priorityAlgorithm.calculatePriorityScore(dto.getEmergencyLevel(), dto.getPriorityScore());
        Instant arrival = (dto.getArrivalTime() != null) ? dto.getArrivalTime() : Instant.now();

        // Doctor recommendation algorithm
        List<Doctor> availableDoctors = doctorRepository.findByAvailabilityStatus(DoctorAvailability.AVAILABLE);
        Optional<Doctor> recommendedDoctor = doctorAllocationService.recommendDoctor(null, availableDoctors);

        String assignedDoctorId = dto.getAssignedDoctorId();
        if ((assignedDoctorId == null || assignedDoctorId.isBlank()) && recommendedDoctor.isPresent()) {
            assignedDoctorId = recommendedDoctor.get().getDoctorId();
        }

        EmergencyCase emergencyCase = EmergencyCase.builder()
                .caseId(caseId)
                .patientId(patient.getPatientId())
                .symptoms(dto.getSymptoms())
                .emergencyLevel(dto.getEmergencyLevel())
                .priorityScore(score)
                .arrivalTime(arrival)
                .status(CaseStatus.WAITING)
                .assignedDoctorId(assignedDoctorId)
                .notes(dto.getNotes())
                .overrideHistory(new ArrayList<>())
                .createdAt(Instant.now())
                .updatedAt(Instant.now())
                .build();

        if (assignedDoctorId != null) {
            doctorRepository.findByDoctorId(assignedDoctorId).ifPresent(d -> {
                d.setActiveCasesCount(d.getActiveCasesCount() + 1);
                doctorRepository.save(d);
            });
        }

        emergencyCase = emergencyCaseRepository.save(emergencyCase);

        auditLogService.logAction("EMERGENCY_CASE_CREATE", "EMERGENCY_CASE", emergencyCase.getCaseId(),
                null, dto.getEmergencyLevel().name(), "Created new emergency triage intake case");

        // Broadcast real-time WebSocket event
        webSocketPublisher.broadcastQueueUpdate("CASE_CREATED", priorityQueueService.getActivePriorityQueue());

        return mapToDto(emergencyCase);
    }

    public EmergencyCaseDto overridePriority(String id, PriorityOverrideDto overrideDto) {
        if (overrideDto.getReason() == null || overrideDto.getReason().trim().isEmpty()) {
            throw new InvalidInputException("Manual priority override requires an explicit medical/administrative reason for audit log compliance.");
        }

        EmergencyCase emergencyCase = emergencyCaseRepository.findById(id)
                .or(() -> emergencyCaseRepository.findByCaseId(id))
                .orElseThrow(() -> new ResourceNotFoundException("Emergency Case not found with ID: " + id));

        EmergencyLevel previousLevel = emergencyCase.getEmergencyLevel();
        Integer previousScore = emergencyCase.getPriorityScore();

        int newScore = priorityAlgorithm.calculatePriorityScore(overrideDto.getNewLevel(), overrideDto.getCustomScore());

        String currentUserId = "STAFF";
        String currentUserName = "Authorized Staff";

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof UserPrincipal principal) {
            currentUserId = principal.getId();
            currentUserName = principal.getName();
        }

        EmergencyCase.OverrideRecord overrideRecord = EmergencyCase.OverrideRecord.builder()
                .previousLevel(previousLevel)
                .newLevel(overrideDto.getNewLevel())
                .previousScore(previousScore)
                .newScore(newScore)
                .updatedByUserId(currentUserId)
                .updatedByUserName(currentUserName)
                .reason(overrideDto.getReason())
                .timestamp(Instant.now())
                .build();

        emergencyCase.setEmergencyLevel(overrideDto.getNewLevel());
        emergencyCase.setPriorityScore(newScore);
        emergencyCase.getOverrideHistory().add(overrideRecord);
        emergencyCase.setUpdatedAt(Instant.now());

        emergencyCase = emergencyCaseRepository.save(emergencyCase);

        auditLogService.logAction("PRIORITY_OVERRIDE", "EMERGENCY_CASE", emergencyCase.getCaseId(),
                previousLevel.name(), overrideDto.getNewLevel().name(), overrideDto.getReason());

        // Broadcast real-time WebSocket update
        webSocketPublisher.broadcastQueueUpdate("PRIORITY_OVERRIDDEN", priorityQueueService.getActivePriorityQueue());

        return mapToDto(emergencyCase);
    }

    public EmergencyCaseDto assignDoctor(String id, DoctorAssignmentDto dto) {
        EmergencyCase emergencyCase = emergencyCaseRepository.findById(id)
                .or(() -> emergencyCaseRepository.findByCaseId(id))
                .orElseThrow(() -> new ResourceNotFoundException("Emergency Case not found with ID: " + id));

        Doctor doctor = doctorRepository.findByDoctorId(dto.getDoctorId())
                .or(() -> doctorRepository.findById(dto.getDoctorId()))
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found with ID: " + dto.getDoctorId()));

        String previousDoctorId = emergencyCase.getAssignedDoctorId();
        
        if (previousDoctorId != null && !previousDoctorId.equals(doctor.getDoctorId())) {
            doctorRepository.findByDoctorId(previousDoctorId).ifPresent(prev -> {
                prev.setActiveCasesCount(Math.max(0, prev.getActiveCasesCount() - 1));
                doctorRepository.save(prev);
            });
        }

        emergencyCase.setAssignedDoctorId(doctor.getDoctorId());
        emergencyCase.setUpdatedAt(Instant.now());
        emergencyCase = emergencyCaseRepository.save(emergencyCase);

        doctor.setActiveCasesCount(doctor.getActiveCasesCount() + 1);
        doctorRepository.save(doctor);

        auditLogService.logAction("DOCTOR_ASSIGNED", "EMERGENCY_CASE", emergencyCase.getCaseId(),
                previousDoctorId, doctor.getDoctorId(), dto.getNotes() != null ? dto.getNotes() : "Doctor assigned to emergency case");

        webSocketPublisher.broadcastQueueUpdate("DOCTOR_ASSIGNED", priorityQueueService.getActivePriorityQueue());

        return mapToDto(emergencyCase);
    }

    public EmergencyCaseDto updateStatus(String id, CaseStatus status) {
        EmergencyCase emergencyCase = emergencyCaseRepository.findById(id)
                .or(() -> emergencyCaseRepository.findByCaseId(id))
                .orElseThrow(() -> new ResourceNotFoundException("Emergency Case not found with ID: " + id));

        CaseStatus oldStatus = emergencyCase.getStatus();
        emergencyCase.setStatus(status);
        emergencyCase.setUpdatedAt(Instant.now());

        if (status == CaseStatus.COMPLETED || status == CaseStatus.CANCELLED) {
            if (emergencyCase.getAssignedDoctorId() != null) {
                doctorRepository.findByDoctorId(emergencyCase.getAssignedDoctorId()).ifPresent(d -> {
                    d.setActiveCasesCount(Math.max(0, d.getActiveCasesCount() - 1));
                    doctorRepository.save(d);
                });
            }
        }

        emergencyCase = emergencyCaseRepository.save(emergencyCase);

        auditLogService.logAction("CASE_STATUS_UPDATE", "EMERGENCY_CASE", emergencyCase.getCaseId(),
                oldStatus.name(), status.name(), "Updated emergency case status");

        webSocketPublisher.broadcastQueueUpdate("STATUS_UPDATED", priorityQueueService.getActivePriorityQueue());

        return mapToDto(emergencyCase);
    }

    private EmergencyCaseDto mapToDto(EmergencyCase ec) {
        PatientDto patientDto = patientRepository.findByPatientId(ec.getPatientId())
                .map(p -> PatientDto.builder()
                        .id(p.getId())
                        .patientId(p.getPatientId())
                        .name(p.getName())
                        .age(p.getAge())
                        .gender(p.getGender())
                        .phone(p.getPhone())
                        .email(p.getEmail())
                        .bloodGroup(p.getBloodGroup())
                        .build())
                .orElse(null);

        DoctorDto doctorDto = (ec.getAssignedDoctorId() != null)
                ? doctorRepository.findByDoctorId(ec.getAssignedDoctorId())
                .map(doctorService::mapToDto)
                .orElse(null)
                : null;

        return EmergencyCaseDto.builder()
                .id(ec.getId())
                .caseId(ec.getCaseId())
                .patientId(ec.getPatientId())
                .patientDetails(patientDto)
                .symptoms(ec.getSymptoms())
                .emergencyLevel(ec.getEmergencyLevel())
                .priorityScore(ec.getPriorityScore())
                .arrivalTime(ec.getArrivalTime())
                .status(ec.getStatus())
                .assignedDoctorId(ec.getAssignedDoctorId())
                .assignedDoctorDetails(doctorDto)
                .notes(ec.getNotes())
                .overrideHistory(ec.getOverrideHistory())
                .createdAt(ec.getCreatedAt())
                .updatedAt(ec.getUpdatedAt())
                .build();
    }
}
