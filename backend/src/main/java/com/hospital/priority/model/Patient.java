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

    private String name;

    private Integer age;

    private String gender;

    private String phone;

    private String email;

    private String address;

    private String bloodGroup;

    @Builder.Default
    private List<String> allergies = new ArrayList<>();

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
