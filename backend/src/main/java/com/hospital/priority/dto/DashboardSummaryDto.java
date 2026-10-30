package com.hospital.priority.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardSummaryDto {

    private long totalPatients;
    private long activeEmergencyCases;
    private long criticalCasesCount;
    private long highCasesCount;
    private long mediumCasesCount;
    private long lowCasesCount;
    private long availableDoctorsCount;
    private long waitingPatientsCount;
    private long completedCasesToday;
    private double averageWaitTimeMinutes;

    private List<QueueItemDto> topPriorityQueue;
    private List<EmergencyLevelStat> levelDistribution;
    private List<HourlyCaseStat> hourlyCases;
    private List<DoctorWorkloadStat> doctorWorkloads;

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class EmergencyLevelStat {
        private String level;
        private long count;
        private String color;
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class HourlyCaseStat {
        private String hourLabel;
        private long count;
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class DoctorWorkloadStat {
        private String doctorId;
        private String doctorName;
        private String specialization;
        private String availability;
        private int activeCases;
    }
}
