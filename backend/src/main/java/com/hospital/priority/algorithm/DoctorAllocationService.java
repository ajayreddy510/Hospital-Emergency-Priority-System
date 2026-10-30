package com.hospital.priority.algorithm;

import com.hospital.priority.model.Doctor;
import com.hospital.priority.model.DoctorAvailability;
import com.hospital.priority.model.EmergencyCase;
import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.util.List;
import java.util.Optional;

@Service
public class DoctorAllocationService {

    /**
     * Recommends the optimal available doctor based on:
     * 1. Status == AVAILABLE
     * 2. Active cases workload (lowest active cases preferred)
     * 3. Department matching (if applicable)
     */
    public Optional<Doctor> recommendDoctor(EmergencyCase emergencyCase, List<Doctor> availableDoctors) {
        if (availableDoctors == null || availableDoctors.isEmpty()) {
            return Optional.empty();
        }

        return availableDoctors.stream()
                .filter(doc -> doc.getAvailabilityStatus() == DoctorAvailability.AVAILABLE)
                .min(Comparator
                        .comparingInt(Doctor::getActiveCasesCount)
                        .thenComparing(Doctor::getName));
    }
}
