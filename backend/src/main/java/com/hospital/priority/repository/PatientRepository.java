package com.hospital.priority.repository;

import com.hospital.priority.model.Patient;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PatientRepository extends MongoRepository<Patient, String> {
    Optional<Patient> findByPatientId(String patientId);
    boolean existsByPatientId(String patientId);

    @Query("{ '$or': [ { 'name': { '$regex': ?0, '$options': 'i' } }, { 'patientId': { '$regex': ?0, '$options': 'i' } }, { 'phone': { '$regex': ?0, '$options': 'i' } }, { 'email': { '$regex': ?0, '$options': 'i' } } ] }")
    Page<Patient> searchPatients(String searchKeyword, Pageable pageable);
}
