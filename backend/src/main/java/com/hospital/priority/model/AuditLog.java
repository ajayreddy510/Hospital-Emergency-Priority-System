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
@Document(collection = "audit_logs")
public class AuditLog {

    @Id
    private String id;

    private String userId;

    private String userName;

    private Role userRole;

    private String action; // USER_LOGIN, PATIENT_CREATE, PRIORITY_OVERRIDE, DOCTOR_ASSIGN, etc.

    private String entityType;

    private String entityId;

    private String oldValue;

    private String newValue;

    private String reason;

    @Indexed
    @CreatedDate
    private Instant timestamp;
}
