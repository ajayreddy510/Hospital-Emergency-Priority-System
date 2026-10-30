package com.hospital.priority.repository;

import com.hospital.priority.model.CaseStatus;
import com.hospital.priority.model.EmergencyCase;
import com.hospital.priority.model.EmergencyLevel;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

@Repository
public interface EmergencyCaseRepository extends MongoRepository<EmergencyCase, String> {
    Optional<EmergencyCase> findByCaseId(String caseId);
    boolean existsByCaseId(String caseId);

    List<EmergencyCase> findByStatusIn(List<CaseStatus> statuses);
    List<EmergencyCase> findByPatientId(String patientId);
    List<EmergencyCase> findByAssignedDoctorId(String assignedDoctorId);
    
    long countByStatus(CaseStatus status);
    long countByEmergencyLevel(EmergencyLevel emergencyLevel);
    long countByCreatedAtBetween(Instant start, Instant end);
}
