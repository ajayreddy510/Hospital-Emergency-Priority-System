package com.hospital.priority.dto;

import com.hospital.priority.model.CaseStatus;
import com.hospital.priority.model.EmergencyCase;
import com.hospital.priority.model.EmergencyLevel;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EmergencyCaseDto {

    private String id;
    private String caseId;

    @NotBlank(message = "Patient ID is required")
    private String patientId;

    private PatientDto patientDetails;

    @NotBlank(message = "Symptoms description is required")
    private String symptoms;

    @NotNull(message = "Emergency level is required")
    private EmergencyLevel emergencyLevel;

    private Integer priorityScore;
    private Instant arrivalTime;
    private CaseStatus status;
    private String assignedDoctorId;
    private DoctorDto assignedDoctorDetails;
    private String notes;
    private List<EmergencyCase.OverrideRecord> overrideHistory;
    private Instant createdAt;
    private Instant updatedAt;
}
