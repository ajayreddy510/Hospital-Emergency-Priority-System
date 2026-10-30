package com.hospital.priority.service;

import com.hospital.priority.dto.PatientDto;
import com.hospital.priority.exception.InvalidInputException;
import com.hospital.priority.exception.ResourceNotFoundException;
import com.hospital.priority.model.CaseStatus;
import com.hospital.priority.model.EmergencyCase;
import com.hospital.priority.model.EmergencyLevel;
import com.hospital.priority.model.Patient;
import com.hospital.priority.repository.EmergencyCaseRepository;
import com.hospital.priority.repository.PatientRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class PatientService {

    private final PatientRepository patientRepository;
    private final EmergencyCaseRepository emergencyCaseRepository;
    private final AuditLogService auditLogService;
    private final TriageProtocolService triageProtocolService;
    private final MongoTemplate mongoTemplate;

    public Page<PatientDto> getPatients(int page, int size, String search, EmergencyLevel priority, CaseStatus status) {
        PageRequest pageRequest = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Query query = new Query();
        List<Criteria> criteriaList = new ArrayList<>();

        if (search != null && !search.trim().isEmpty()) {
            String s = search.trim();
            criteriaList.add(new Criteria().orOperator(
                    Criteria.where("name").regex(s, "i"),
                    Criteria.where("patientId").regex(s, "i"),
                    Criteria.where("phone").regex(s, "i"),
                    Criteria.where("email").regex(s, "i"),
                    Criteria.where("chiefComplaint").regex(s, "i")
            ));
        }

        if (priority != null) {
            criteriaList.add(Criteria.where("emergencyLevel").is(priority));
        }

        if (status != null) {
            criteriaList.add(Criteria.where("status").is(status));
        }

        if (!criteriaList.isEmpty()) {
            query.addCriteria(new Criteria().andOperator(criteriaList.toArray(new Criteria[0])));
        }

        long total = mongoTemplate.count(query, Patient.class);
        query.with(pageRequest);
        List<Patient> patients = mongoTemplate.find(query, Patient.class);

        return new PageImpl<>(patients.stream().map(this::mapToDto).toList(), pageRequest, total);
    }

    public PatientDto getPatientById(String id) {
        Patient patient = patientRepository.findById(id)
                .or(() -> patientRepository.findByPatientId(id))
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found with ID: " + id));
        return mapToDto(patient);
    }

    public synchronized PatientDto createPatient(PatientDto dto) {
        if (dto.getName() == null || dto.getName().trim().isEmpty()) {
            throw new InvalidInputException("Patient name is required");
        }
        if (dto.getPhone() == null || dto.getPhone().trim().isEmpty()) {
            throw new InvalidInputException("Phone number is required");
        }

        // Duplicate prevention check: warn if identical phone and name already exists
        Optional<Patient> existing = patientRepository.findByPhoneAndNameIgnoreCase(dto.getPhone().trim(), dto.getName().trim());
        if (existing.isPresent()) {
            log.warn("Patient with name {} and phone {} already exists with ID {}", dto.getName(), dto.getPhone(), existing.get().getPatientId());
        }

        // Automatic unique Patient ID generation
        String patientId = generateUniquePatientId();

        // Triage recommendation & priority calculation
        EmergencyLevel assignedLevel = dto.getEmergencyLevel();
        Integer score = dto.getPriorityScore();

        if (assignedLevel == null) {
            var triageEval = triageProtocolService.evaluateTriage(
                    dto.getTemperature(),
                    dto.getBloodPressure(),
                    dto.getHeartRate(),
                    dto.getRespiratoryRate(),
                    dto.getOxygenSaturation(),
                    dto.getChiefComplaint(),
                    dto.getSymptoms()
            );
            assignedLevel = triageEval.getRecommendedLevel();
            score = triageEval.getPriorityScore();
        } else if (score == null) {
            score = assignedLevel.getDefaultScore();
        }

        CaseStatus patientStatus = dto.getStatus() != null ? dto.getStatus() : CaseStatus.WAITING;
        Instant arrival = dto.getArrivalTime() != null ? dto.getArrivalTime() : Instant.now();

        Patient patient = Patient.builder()
                .patientId(patientId)
                .name(dto.getName().trim())
                .age(dto.getAge())
                .gender(dto.getGender() != null ? dto.getGender() : "OTHER")
                .phone(dto.getPhone().trim())
                .email(dto.getEmail())
                .address(dto.getAddress())
                .bloodGroup(dto.getBloodGroup())
                .chiefComplaint(dto.getChiefComplaint())
                .symptoms(dto.getSymptoms())
                .existingConditions(dto.getExistingConditions())
                .allergies(dto.getAllergies() != null ? dto.getAllergies() : new ArrayList<>())
                .currentMedications(dto.getCurrentMedications())
                .medicalHistory(dto.getMedicalHistory())
                .temperature(dto.getTemperature())
                .bloodPressure(dto.getBloodPressure())
                .heartRate(dto.getHeartRate())
                .respiratoryRate(dto.getRespiratoryRate())
                .oxygenSaturation(dto.getOxygenSaturation())
                .arrivalTime(arrival)
                .emergencyLevel(assignedLevel)
                .priorityScore(score)
                .status(patientStatus)
                .assignedDoctorId(dto.getAssignedDoctorId())
                .notes(dto.getNotes())
                .emergencyContact(dto.getEmergencyContact())
                .createdAt(Instant.now())
                .updatedAt(Instant.now())
                .build();

        patient = patientRepository.save(patient);

        // Automatic synchronization: create linked EmergencyCase so patient appears on Triage & Emergency Queue
        try {
            String caseId = "EMG-" + (8800 + emergencyCaseRepository.count() + 1);
            String symptomDesc = (dto.getChiefComplaint() != null ? dto.getChiefComplaint() : "")
                    + (dto.getSymptoms() != null ? " | " + dto.getSymptoms() : "");
            if (symptomDesc.isBlank()) {
                symptomDesc = "Emergency patient intake";
            }

            EmergencyCase emergencyCase = EmergencyCase.builder()
                    .caseId(caseId)
                    .patientId(patient.getPatientId())
                    .symptoms(symptomDesc)
                    .emergencyLevel(assignedLevel)
                    .priorityScore(score)
                    .arrivalTime(arrival)
                    .status(patientStatus)
                    .assignedDoctorId(dto.getAssignedDoctorId())
                    .notes(dto.getNotes())
                    .createdAt(Instant.now())
                    .updatedAt(Instant.now())
                    .build();

            emergencyCaseRepository.save(emergencyCase);
        } catch (Exception ex) {
            log.error("Failed to create linked emergency case for patient {}: {}", patient.getPatientId(), ex.getMessage());
        }

        auditLogService.logAction("PATIENT_REGISTER", "PATIENT", patient.getPatientId(), null, patient.getName(),
                "Registered new emergency patient with priority " + assignedLevel.name());

        return mapToDto(patient);
    }

    public PatientDto updatePatient(String id, PatientDto dto) {
        Patient patient = patientRepository.findById(id)
                .or(() -> patientRepository.findByPatientId(id))
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found with ID: " + id));

        if (dto.getName() != null) patient.setName(dto.getName().trim());
        if (dto.getAge() != null) patient.setAge(dto.getAge());
        if (dto.getGender() != null) patient.setGender(dto.getGender());
        if (dto.getPhone() != null) patient.setPhone(dto.getPhone().trim());
        if (dto.getEmail() != null) patient.setEmail(dto.getEmail());
        if (dto.getAddress() != null) patient.setAddress(dto.getAddress());
        if (dto.getBloodGroup() != null) patient.setBloodGroup(dto.getBloodGroup());
        if (dto.getChiefComplaint() != null) patient.setChiefComplaint(dto.getChiefComplaint());
        if (dto.getSymptoms() != null) patient.setSymptoms(dto.getSymptoms());
        if (dto.getExistingConditions() != null) patient.setExistingConditions(dto.getExistingConditions());
        if (dto.getAllergies() != null) patient.setAllergies(dto.getAllergies());
        if (dto.getCurrentMedications() != null) patient.setCurrentMedications(dto.getCurrentMedications());
        if (dto.getMedicalHistory() != null) patient.setMedicalHistory(dto.getMedicalHistory());

        // Update vitals
        if (dto.getTemperature() != null) patient.setTemperature(dto.getTemperature());
        if (dto.getBloodPressure() != null) patient.setBloodPressure(dto.getBloodPressure());
        if (dto.getHeartRate() != null) patient.setHeartRate(dto.getHeartRate());
        if (dto.getRespiratoryRate() != null) patient.setRespiratoryRate(dto.getRespiratoryRate());
        if (dto.getOxygenSaturation() != null) patient.setOxygenSaturation(dto.getOxygenSaturation());

        // Update priority & status
        if (dto.getEmergencyLevel() != null) {
            patient.setEmergencyLevel(dto.getEmergencyLevel());
            if (dto.getPriorityScore() != null) {
                patient.setPriorityScore(dto.getPriorityScore());
            } else {
                patient.setPriorityScore(dto.getEmergencyLevel().getDefaultScore());
            }
        }
        if (dto.getStatus() != null) patient.setStatus(dto.getStatus());
        if (dto.getAssignedDoctorId() != null) patient.setAssignedDoctorId(dto.getAssignedDoctorId());
        if (dto.getNotes() != null) patient.setNotes(dto.getNotes());
        if (dto.getEmergencyContact() != null) patient.setEmergencyContact(dto.getEmergencyContact());

        patient.setUpdatedAt(Instant.now());
        patient = patientRepository.save(patient);

        // Also sync status and priority to any active emergency case
        try {
            List<EmergencyCase> cases = emergencyCaseRepository.findByPatientId(patient.getPatientId());
            for (EmergencyCase ec : cases) {
                if (dto.getStatus() != null) ec.setStatus(dto.getStatus());
                if (dto.getEmergencyLevel() != null) ec.setEmergencyLevel(dto.getEmergencyLevel());
                if (dto.getPriorityScore() != null) ec.setPriorityScore(dto.getPriorityScore());
                if (dto.getAssignedDoctorId() != null) ec.setAssignedDoctorId(dto.getAssignedDoctorId());
                ec.setUpdatedAt(Instant.now());
                emergencyCaseRepository.save(ec);
            }
        } catch (Exception ex) {
            log.warn("Could not sync updated emergency cases for patient {}: {}", patient.getPatientId(), ex.getMessage());
        }

        auditLogService.logAction("PATIENT_UPDATE", "PATIENT", patient.getPatientId(), null, patient.getName(), "Updated patient profile and clinical data");
        return mapToDto(patient);
    }

    public PatientDto updatePatientStatus(String id, CaseStatus status, String notes) {
        Patient patient = patientRepository.findById(id)
                .or(() -> patientRepository.findByPatientId(id))
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found with ID: " + id));

        CaseStatus prevStatus = patient.getStatus();
        patient.setStatus(status);
        if (notes != null && !notes.isBlank()) {
            patient.setNotes((patient.getNotes() != null ? patient.getNotes() + " | " : "") + notes);
        }
        patient.setUpdatedAt(Instant.now());
        patient = patientRepository.save(patient);

        // Sync with emergency cases
        try {
            List<EmergencyCase> cases = emergencyCaseRepository.findByPatientId(patient.getPatientId());
            for (EmergencyCase ec : cases) {
                ec.setStatus(status);
                ec.setUpdatedAt(Instant.now());
                emergencyCaseRepository.save(ec);
            }
        } catch (Exception ignored) {
        }

        auditLogService.logAction("PATIENT_STATUS_CHANGE", "PATIENT", patient.getPatientId(),
                prevStatus != null ? prevStatus.name() : null, status.name(), "Updated patient status to " + status.name());

        return mapToDto(patient);
    }

    public void deletePatient(String id) {
        Patient patient = patientRepository.findById(id)
                .or(() -> patientRepository.findByPatientId(id))
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found with ID: " + id));

        patientRepository.delete(patient);
        auditLogService.logAction("PATIENT_DELETE", "PATIENT", patient.getPatientId(), patient.getName(), null, "Deleted patient record");
    }

    private synchronized String generateUniquePatientId() {
        long count = patientRepository.count();
        long candidateNum = 1001 + count;
        String candidate = "PAT-" + candidateNum;
        int safety = 1;
        while (patientRepository.existsByPatientId(candidate)) {
            candidate = "PAT-" + (candidateNum + safety);
            safety++;
        }
        return candidate;
    }

    private PatientDto mapToDto(Patient p) {
        return PatientDto.builder()
                .id(p.getId())
                .patientId(p.getPatientId())
                .name(p.getName())
                .age(p.getAge())
                .gender(p.getGender())
                .phone(p.getPhone())
                .email(p.getEmail())
                .address(p.getAddress())
                .bloodGroup(p.getBloodGroup())
                .chiefComplaint(p.getChiefComplaint())
                .symptoms(p.getSymptoms())
                .existingConditions(p.getExistingConditions())
                .allergies(p.getAllergies())
                .currentMedications(p.getCurrentMedications())
                .medicalHistory(p.getMedicalHistory())
                .temperature(p.getTemperature())
                .bloodPressure(p.getBloodPressure())
                .heartRate(p.getHeartRate())
                .respiratoryRate(p.getRespiratoryRate())
                .oxygenSaturation(p.getOxygenSaturation())
                .arrivalTime(p.getArrivalTime())
                .emergencyLevel(p.getEmergencyLevel())
                .priorityScore(p.getPriorityScore())
                .status(p.getStatus())
                .assignedDoctorId(p.getAssignedDoctorId())
                .notes(p.getNotes())
                .emergencyContact(p.getEmergencyContact())
                .createdAt(p.getCreatedAt())
                .updatedAt(p.getUpdatedAt())
                .build();
    }
}
