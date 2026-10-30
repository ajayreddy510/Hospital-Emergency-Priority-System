package com.hospital.priority.dto;

import com.hospital.priority.model.EmergencyLevel;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class PriorityOverrideDto {

    @NotNull(message = "New emergency level is required")
    private EmergencyLevel newLevel;

    private Integer customScore;

    @NotBlank(message = "Override reason is mandatory for medical audit compliance")
    private String reason;
}
