package com.hospital.priority.repository;

import com.hospital.priority.model.Doctor;
import com.hospital.priority.model.DoctorAvailability;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DoctorRepository extends MongoRepository<Doctor, String> {
    Optional<Doctor> findByDoctorId(String doctorId);
    boolean existsByDoctorId(String doctorId);

    List<Doctor> findByAvailabilityStatus(DoctorAvailability availabilityStatus);
    List<Doctor> findByDepartmentAndAvailabilityStatus(String department, DoctorAvailability availabilityStatus);
}
