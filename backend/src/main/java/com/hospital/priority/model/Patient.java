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
@Document(collection = "patients")
public class Patient {

    @Id
    private String id;

    @Indexed(unique = true)
    private String patientId;

    @Indexed
    private String name;

    private Integer age;

    private String gender;

    @Indexed
    private String phone;

    private String email;

    private String address;

    private String bloodGroup;

    // --- Medical Information ---
    private String chiefComplaint;

    private String symptoms;

    private String existingConditions;

    @Builder.Default
    private List<String> allergies = new ArrayList<>();

    private String currentMedications;

    private String medicalHistory;

    // --- Emergency Assessment / Vitals ---
    private Double temperature;          // Body Temperature (°F or °C)

    private String bloodPressure;        // Blood Pressure (e.g. 120/80)

    private Integer heartRate;           // Heart Rate (bpm)

    private Integer respiratoryRate;     // Respiratory Rate (breaths/min)

    private Double oxygenSaturation;     // SpO2 (%)

    private Instant arrivalTime;         // Arrival Date and Time

    // --- Emergency Priority & Status ---
    @Indexed
    @Builder.Default
    private EmergencyLevel emergencyLevel = EmergencyLevel.LEVEL_3_URGENT;

    private Integer priorityScore;

    @Indexed
    @Builder.Default
    private CaseStatus status = CaseStatus.WAITING;

    private String assignedDoctorId;

    private String notes;

    // --- Emergency Contact ---
    private EmergencyContact emergencyContact;

    @CreatedDate
    private Instant createdAt;

    @LastModifiedDate
    private Instant updatedAt;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class EmergencyContact {
        private String name;
        private String relationship;
        private String phone;
    }
}
