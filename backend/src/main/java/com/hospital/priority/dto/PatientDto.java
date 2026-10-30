package com.hospital.priority.dto;

import com.hospital.priority.model.Patient;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
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
public class PatientDto {

    private String id;
    private String patientId;

    @NotBlank(message = "Patient name is required")
    private String name;

    @Min(value = 0, message = "Age must be valid")
    private Integer age;

    private String gender;

    @NotBlank(message = "Phone number is required")
    private String phone;

    @Email(message = "Invalid email format")
    private String email;

    private String address;
    private String bloodGroup;
    private List<String> allergies;
    private Patient.EmergencyContact emergencyContact;

    private Instant createdAt;
    private Instant updatedAt;
}
