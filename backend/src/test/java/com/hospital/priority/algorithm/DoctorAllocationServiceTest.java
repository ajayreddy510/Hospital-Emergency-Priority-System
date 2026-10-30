package com.hospital.priority.algorithm;

import com.hospital.priority.model.Doctor;
import com.hospital.priority.model.DoctorAvailability;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

class DoctorAllocationServiceTest {

    private DoctorAllocationService doctorAllocationService;

    @BeforeEach
    void setUp() {
        doctorAllocationService = new DoctorAllocationService();
    }

    @Test
    @DisplayName("Should recommend available doctor with lowest active cases count")
    void testRecommendDoctorLowestWorkload() {
        Doctor docBusy = Doctor.builder()
                .doctorId("DOC-1")
                .name("Dr. Heavy Workload")
                .availabilityStatus(DoctorAvailability.AVAILABLE)
                .activeCasesCount(5)
                .build();

        Doctor docLight = Doctor.builder()
                .doctorId("DOC-2")
                .name("Dr. Light Workload")
                .availabilityStatus(DoctorAvailability.AVAILABLE)
                .activeCasesCount(1)
                .build();

        Optional<Doctor> recommended = doctorAllocationService.recommendDoctor(null, List.of(docBusy, docLight));

        assertTrue(recommended.isPresent());
        assertEquals("DOC-2", recommended.get().getDoctorId(), "Doctor with lowest active cases should be recommended");
    }
}
