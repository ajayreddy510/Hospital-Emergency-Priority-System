package com.hospital.priority.dto;

import com.hospital.priority.model.TreatmentStatus;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TreatmentRecordDto {

    private String id;

    @NotBlank(message = "Patient ID is required")
    private String patientId;

    @NotBlank(message = "Case ID is required")
    private String caseId;

    @NotBlank(message = "Doctor ID is required")
    private String doctorId;

    private String diagnosisNotes;
    private String treatmentNotes;
    private String medicationNotes;
    private TreatmentStatus treatmentStatus;
    private Instant createdAt;
    private Instant updatedAt;
}
