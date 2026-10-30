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

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "treatment_records")
public class TreatmentRecord {

    @Id
    private String id;

    @Indexed
    private String patientId;

    @Indexed
    private String caseId;

    @Indexed
    private String doctorId;

    private String diagnosisNotes;

    private String treatmentNotes;

    private String medicationNotes;

    @Builder.Default
    private TreatmentStatus treatmentStatus = TreatmentStatus.IN_PROGRESS;

    @CreatedDate
    private Instant createdAt;

    @LastModifiedDate
    private Instant updatedAt;
}
