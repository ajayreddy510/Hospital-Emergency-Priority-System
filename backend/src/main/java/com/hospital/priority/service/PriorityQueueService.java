package com.hospital.priority.service;

import com.hospital.priority.algorithm.EmergencyPriorityAlgorithm;
import com.hospital.priority.dto.QueueItemDto;
import com.hospital.priority.model.CaseStatus;
import com.hospital.priority.model.Doctor;
import com.hospital.priority.model.EmergencyCase;
import com.hospital.priority.model.Patient;
import com.hospital.priority.repository.DoctorRepository;
import com.hospital.priority.repository.EmergencyCaseRepository;
import com.hospital.priority.repository.PatientRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PriorityQueueService {

    private final EmergencyCaseRepository emergencyCaseRepository;
    private final PatientRepository patientRepository;
    private final DoctorRepository doctorRepository;
    private final EmergencyPriorityAlgorithm priorityAlgorithm;

    public List<QueueItemDto> getActivePriorityQueue() {
        List<CaseStatus> activeStatuses = List.of(CaseStatus.WAITING, CaseStatus.IN_TRIAGE, CaseStatus.IN_TREATMENT);
        List<EmergencyCase> activeCases = emergencyCaseRepository.findByStatusIn(activeStatuses);

        // Sort via Heap DSA Engine
        List<EmergencyCase> sortedCases = priorityAlgorithm.getSortedQueueList(activeCases);

        Map<String, Patient> patientMap = patientRepository.findAll().stream()
                .collect(Collectors.toMap(Patient::getPatientId, Function.identity(), (p1, p2) -> p1));

        Map<String, Doctor> doctorMap = doctorRepository.findAll().stream()
                .collect(Collectors.toMap(Doctor::getDoctorId, Function.identity(), (d1, d2) -> d1));

        List<QueueItemDto> queueItems = new ArrayList<>();
        int position = 1;

        for (EmergencyCase ec : sortedCases) {
            Patient p = patientMap.get(ec.getPatientId());
            Doctor d = doctorMap.get(ec.getAssignedDoctorId());

            queueItems.add(QueueItemDto.builder()
                    .queuePosition(position++)
                    .id(ec.getId())
                    .caseId(ec.getCaseId())
                    .patientId(ec.getPatientId())
                    .patientName(p != null ? p.getName() : "Unknown Patient")
                    .patientAge(p != null ? p.getAge() : null)
                    .patientGender(p != null ? p.getGender() : "N/A")
                    .symptoms(ec.getSymptoms())
                    .emergencyLevel(ec.getEmergencyLevel())
                    .priorityScore(ec.getPriorityScore())
                    .arrivalTime(ec.getArrivalTime())
                    .formattedWaitTime(formatWaitTime(ec.getArrivalTime()))
                    .status(ec.getStatus())
                    .assignedDoctorId(ec.getAssignedDoctorId())
                    .assignedDoctorName(d != null ? d.getName() : "Unassigned")
                    .createdAt(ec.getCreatedAt())
                    .build());
        }

        return queueItems;
    }

    public Optional<QueueItemDto> getNextPatientInQueue() {
        List<QueueItemDto> queue = getActivePriorityQueue();
        return queue.isEmpty() ? Optional.empty() : Optional.of(queue.get(0));
    }

    private String formatWaitTime(Instant arrivalTime) {
        if (arrivalTime == null) return "0 mins";
        Duration duration = Duration.between(arrivalTime, Instant.now());
        long minutes = Math.max(0, duration.toMinutes());
        if (minutes >= 60) {
            long hours = minutes / 60;
            long remMinutes = minutes % 60;
            return hours + "h " + remMinutes + "m";
        }
        return minutes + " mins";
    }
}
