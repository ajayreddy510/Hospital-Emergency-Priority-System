package com.hospital.priority.dto;

import com.hospital.priority.model.CaseStatus;
import com.hospital.priority.model.EmergencyLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QueueItemDto {

    private int queuePosition;
    private String id;
    private String caseId;
    private String patientId;
    private String patientName;
    private Integer patientAge;
    private String patientGender;
    private String symptoms;
    private EmergencyLevel emergencyLevel;
    private Integer priorityScore;
    private Instant arrivalTime;
    private String formattedWaitTime;
    private CaseStatus status;
    private String assignedDoctorId;
    private String assignedDoctorName;
    private Instant createdAt;
}
