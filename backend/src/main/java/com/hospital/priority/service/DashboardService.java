package com.hospital.priority.service;

import com.hospital.priority.dto.DashboardSummaryDto;
import com.hospital.priority.dto.QueueItemDto;
import com.hospital.priority.model.*;
import com.hospital.priority.repository.DoctorRepository;
import com.hospital.priority.repository.EmergencyCaseRepository;
import com.hospital.priority.repository.PatientRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.Instant;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.time.temporal.ChronoUnit;
import java.util.*;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final PatientRepository patientRepository;
    private final DoctorRepository doctorRepository;
    private final EmergencyCaseRepository emergencyCaseRepository;
    private final PriorityQueueService priorityQueueService;

    public DashboardSummaryDto getDashboardSummary() {
        long totalPatients = patientRepository.count();
        
        List<EmergencyCase> allCases = emergencyCaseRepository.findAll();
        List<EmergencyCase> activeCases = allCases.stream()
                .filter(c -> c.getStatus() == CaseStatus.WAITING || c.getStatus() == CaseStatus.IN_TRIAGE || c.getStatus() == CaseStatus.IN_TREATMENT)
                .toList();

        long criticalCount = activeCases.stream().filter(c -> c.getEmergencyLevel() == EmergencyLevel.CRITICAL).count();
        long highCount = activeCases.stream().filter(c -> c.getEmergencyLevel() == EmergencyLevel.HIGH).count();
        long mediumCount = activeCases.stream().filter(c -> c.getEmergencyLevel() == EmergencyLevel.MEDIUM).count();
        long lowCount = activeCases.stream().filter(c -> c.getEmergencyLevel() == EmergencyLevel.LOW).count();

        long availableDoctors = doctorRepository.findByAvailabilityStatus(DoctorAvailability.AVAILABLE).size();
        long waitingCount = activeCases.stream().filter(c -> c.getStatus() == CaseStatus.WAITING).count();

        Instant startOfDay = ZonedDateTime.now(ZoneId.systemDefault()).truncatedTo(ChronoUnit.DAYS).toInstant();
        long completedToday = allCases.stream()
                .filter(c -> c.getStatus() == CaseStatus.COMPLETED && c.getUpdatedAt() != null && c.getUpdatedAt().isAfter(startOfDay))
                .count();

        // Calculate average wait time
        double avgWaitMinutes = activeCases.stream()
                .mapToLong(c -> c.getArrivalTime() != null ? Duration.between(c.getArrivalTime(), Instant.now()).toMinutes() : 0)
                .average()
                .orElse(0.0);

        List<QueueItemDto> topPriorityQueue = priorityQueueService.getActivePriorityQueue().stream()
                .limit(5)
                .toList();

        List<DashboardSummaryDto.EmergencyLevelStat> levelStats = List.of(
                new DashboardSummaryDto.EmergencyLevelStat("CRITICAL", criticalCount, "#ef4444"),
                new DashboardSummaryDto.EmergencyLevelStat("HIGH", highCount, "#f59e0b"),
                new DashboardSummaryDto.EmergencyLevelStat("MEDIUM", mediumCount, "#10b981"),
                new DashboardSummaryDto.EmergencyLevelStat("LOW", lowCount, "#3b82f6")
        );

        // Calculate hourly distribution over last 12 hours
        List<DashboardSummaryDto.HourlyCaseStat> hourlyStats = new ArrayList<>();
        ZonedDateTime now = ZonedDateTime.now();
        for (int i = 11; i >= 0; i--) {
            ZonedDateTime hourStart = now.minusHours(i).truncatedTo(ChronoUnit.HOURS);
            ZonedDateTime hourEnd = hourStart.plusHours(1);
            long count = allCases.stream()
                    .filter(c -> c.getCreatedAt() != null && c.getCreatedAt().isAfter(hourStart.toInstant()) && c.getCreatedAt().isBefore(hourEnd.toInstant()))
                    .count();
            String label = String.format("%02d:00", hourStart.getHour());
            hourlyStats.add(new DashboardSummaryDto.HourlyCaseStat(label, count));
        }

        List<DashboardSummaryDto.DoctorWorkloadStat> doctorWorkloads = doctorRepository.findAll().stream()
                .map(d -> new DashboardSummaryDto.DoctorWorkloadStat(
                        d.getDoctorId(),
                        d.getName(),
                        d.getSpecialization(),
                        d.getAvailabilityStatus().name(),
                        d.getActiveCasesCount() != null ? d.getActiveCasesCount() : 0
                ))
                .toList();

        return DashboardSummaryDto.builder()
                .totalPatients(totalPatients)
                .activeEmergencyCases(activeCases.size())
                .criticalCasesCount(criticalCount)
                .highCasesCount(highCount)
                .mediumCasesCount(mediumCount)
                .lowCasesCount(lowCount)
                .availableDoctorsCount(availableDoctors)
                .waitingPatientsCount(waitingCount)
                .completedCasesToday(completedToday)
                .averageWaitTimeMinutes(Math.round(avgWaitMinutes * 10.0) / 10.0)
                .topPriorityQueue(topPriorityQueue)
                .levelDistribution(levelStats)
                .hourlyCases(hourlyStats)
                .doctorWorkloads(doctorWorkloads)
                .build();
    }
}
