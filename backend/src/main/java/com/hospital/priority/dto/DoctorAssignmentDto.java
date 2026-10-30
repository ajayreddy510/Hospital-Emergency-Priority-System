package com.hospital.priority.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class DoctorAssignmentDto {

    @NotBlank(message = "Doctor ID is required")
    private String doctorId;

    private String notes;
}
