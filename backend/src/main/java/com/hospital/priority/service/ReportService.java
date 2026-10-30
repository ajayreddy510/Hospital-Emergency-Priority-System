package com.hospital.priority.service;

import com.hospital.priority.dto.DashboardSummaryDto;
import com.hospital.priority.model.CaseStatus;
import com.hospital.priority.model.EmergencyCase;
import com.hospital.priority.model.EmergencyLevel;
import com.hospital.priority.repository.DoctorRepository;
import com.hospital.priority.repository.EmergencyCaseRepository;
import com.hospital.priority.repository.PatientRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class ReportService {

    private final EmergencyCaseRepository emergencyCaseRepository;
    private final PatientRepository patientRepository;
    private final DoctorRepository doctorRepository;

    public Map<String, Object> generateReport(String type) {
        Instant now = Instant.now();
        Instant startTime = switch (type.toLowerCase()) {
            case "weekly" -> now.minus(7, ChronoUnit.DAYS);
            case "monthly" -> now.minus(30, ChronoUnit.DAYS);
            default -> now.minus(1, ChronoUnit.DAYS); // Daily
        };

        List<EmergencyCase> cases = emergencyCaseRepository.findAll().stream()
                .filter(c -> c.getCreatedAt() != null && c.getCreatedAt().isAfter(startTime))
                .toList();

        long totalCases = cases.size();
        long criticalCases = cases.stream().filter(c -> c.getEmergencyLevel() == EmergencyLevel.CRITICAL).count();
        long highCases = cases.stream().filter(c -> c.getEmergencyLevel() == EmergencyLevel.HIGH).count();
        long mediumCases = cases.stream().filter(c -> c.getEmergencyLevel() == EmergencyLevel.MEDIUM).count();
        long lowCases = cases.stream().filter(c -> c.getEmergencyLevel() == EmergencyLevel.LOW).count();
        long completedCases = cases.stream().filter(c -> c.getStatus() == CaseStatus.COMPLETED).count();
        long cancelledCases = cases.stream().filter(c -> c.getStatus() == CaseStatus.CANCELLED).count();

        double avgWaitMinutes = cases.stream()
                .mapToLong(c -> c.getArrivalTime() != null ? Duration.between(c.getArrivalTime(), now).toMinutes() : 0)
                .average()
                .orElse(0.0);

        Map<String, Object> report = new HashMap<>();
        report.put("reportType", type.toUpperCase());
        report.put("generatedAt", now.toString());
        report.put("totalCases", totalCases);
        report.put("criticalCases", criticalCases);
        report.put("highCases", highCases);
        report.put("mediumCases", mediumCases);
        report.put("lowCases", lowCases);
        report.put("completedCases", completedCases);
        report.put("cancelledCases", cancelledCases);
        report.put("averageWaitTimeMinutes", Math.round(avgWaitMinutes * 10.0) / 10.0);
        report.put("totalPatientsRegistered", patientRepository.count());
        report.put("totalDoctorsInSystem", doctorRepository.count());

        return report;
    }

    public String generateCsvReport(String type) {
        Map<String, Object> data = generateReport(type);
        StringBuilder csv = new StringBuilder();
        csv.append("Report Type,Generated At,Total Cases,Critical Cases,High Priority,Medium Priority,Low Priority,Completed Cases,Cancelled Cases,Avg Wait Time (Mins)\n");
        csv.append(String.format("%s,%s,%d,%d,%d,%d,%d,%d,%d,%.1f\n",
                data.get("reportType"),
                data.get("generatedAt"),
                data.get("totalCases"),
                data.get("criticalCases"),
                data.get("highCases"),
                data.get("mediumCases"),
                data.get("lowCases"),
                data.get("completedCases"),
                data.get("cancelledCases"),
                data.get("averageWaitTimeMinutes")
        ));
        return csv.toString();
    }
}
