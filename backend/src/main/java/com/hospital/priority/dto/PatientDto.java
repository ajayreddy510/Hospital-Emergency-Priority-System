package com.hospital.priority.dto;

import com.hospital.priority.model.CaseStatus;
import com.hospital.priority.model.EmergencyLevel;
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

    // --- Medical Information ---
    private String chiefComplaint;
    private String symptoms;
    private String existingConditions;
    private List<String> allergies;
    private String currentMedications;
    private String medicalHistory;

    // --- Emergency Assessment / Vitals ---
    private Double temperature;
    private String bloodPressure;
    private Integer heartRate;
    private Integer respiratoryRate;
    private Double oxygenSaturation;
    private Instant arrivalTime;

    // --- Priority & Status ---
    private EmergencyLevel emergencyLevel;
    private Integer priorityScore;
    private CaseStatus status;
    private String assignedDoctorId;
    private String notes;

    private Patient.EmergencyContact emergencyContact;

    private Instant createdAt;
    private Instant updatedAt;
}
