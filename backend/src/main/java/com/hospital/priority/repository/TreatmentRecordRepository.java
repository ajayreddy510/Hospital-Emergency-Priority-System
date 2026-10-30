package com.hospital.priority.repository;

import com.hospital.priority.model.TreatmentRecord;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TreatmentRecordRepository extends MongoRepository<TreatmentRecord, String> {
    List<TreatmentRecord> findByPatientId(String patientId);
    Optional<TreatmentRecord> findByCaseId(String caseId);
    List<TreatmentRecord> findByDoctorId(String doctorId);
}
