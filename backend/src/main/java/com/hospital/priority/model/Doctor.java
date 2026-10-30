package com.hospital.priority.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "doctors")
public class Doctor {

    @Id
    private String id;

    @Indexed(unique = true)
    private String doctorId;

    private String name;

    private String specialization;

    private String department;

    private String phone;

    private String email;

    @Builder.Default
    private DoctorAvailability availabilityStatus = DoctorAvailability.AVAILABLE;

    private String currentPatientId;

    @Builder.Default
    private Integer activeCasesCount = 0;

    @CreatedDate
    private Instant createdAt;
}
