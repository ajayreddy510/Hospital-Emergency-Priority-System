package com.hospital.priority.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "emergency_cases")
public class EmergencyCase {

    @Id
    private String id;

    @Indexed(unique = true)
    private String caseId;

    @Indexed
    private String patientId;

    private String symptoms;

    @Indexed
    private EmergencyLevel emergencyLevel;

    @Indexed
    private Integer priorityScore;

    @Indexed
    private Instant arrivalTime;

    @Indexed
    @Builder.Default
    private CaseStatus status = CaseStatus.WAITING;

    private String assignedDoctorId;

    private String notes;

    @Builder.Default
    private List<OverrideRecord> overrideHistory = new ArrayList<>();

    @CreatedDate
    private Instant createdAt;

    @LastModifiedDate
    private Instant updatedAt;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class OverrideRecord {
        private EmergencyLevel previousLevel;
        private EmergencyLevel newLevel;
        private Integer previousScore;
        private Integer newScore;
        private String updatedByUserId;
        private String updatedByUserName;
        private String reason;
        private Instant timestamp;
    }
}
