package com.hospital.priority.dto;

import com.hospital.priority.model.DoctorAvailability;
import jakarta.validation.constraints.Email;
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
public class DoctorDto {

    private String id;
    private String doctorId;

    @NotBlank(message = "Doctor name is required")
    private String name;

    @NotBlank(message = "Specialization is required")
    private String specialization;

    @NotBlank(message = "Department is required")
    private String department;

    private String phone;

    @Email(message = "Invalid email format")
    private String email;

    private DoctorAvailability availabilityStatus;
    private String currentPatientId;
    private Integer activeCasesCount;
    private Instant createdAt;
}
