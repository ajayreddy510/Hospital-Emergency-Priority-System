package com.hospital.priority.service;

import com.hospital.priority.dto.DoctorDto;
import com.hospital.priority.exception.ResourceNotFoundException;
import com.hospital.priority.model.Doctor;
import com.hospital.priority.model.DoctorAvailability;
import com.hospital.priority.repository.DoctorRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;

@Service
@RequiredArgsConstructor
public class DoctorService {

    private final DoctorRepository doctorRepository;
    private final AuditLogService auditLogService;

    public List<DoctorDto> getAllDoctors() {
        return doctorRepository.findAll().stream().map(this::mapToDto).toList();
    }

    public DoctorDto getDoctorById(String id) {
        Doctor doctor = doctorRepository.findById(id)
                .or(() -> doctorRepository.findByDoctorId(id))
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found with ID: " + id));
        return mapToDto(doctor);
    }

    public DoctorDto createDoctor(DoctorDto dto) {
        String doctorId = "DOC-" + (200 + doctorRepository.count() + 1);

        Doctor doctor = Doctor.builder()
                .doctorId(doctorId)
                .name(dto.getName())
                .specialization(dto.getSpecialization())
                .department(dto.getDepartment())
                .phone(dto.getPhone())
                .email(dto.getEmail())
                .availabilityStatus(dto.getAvailabilityStatus() != null ? dto.getAvailabilityStatus() : DoctorAvailability.AVAILABLE)
                .activeCasesCount(0)
                .createdAt(Instant.now())
                .build();

        doctor = doctorRepository.save(doctor);
        auditLogService.logAction("DOCTOR_CREATE", "DOCTOR", doctor.getDoctorId(), null, doctor.getName(), "Created doctor profile");

        return mapToDto(doctor);
    }

    public DoctorDto updateAvailability(String id, DoctorAvailability status) {
        Doctor doctor = doctorRepository.findById(id)
                .or(() -> doctorRepository.findByDoctorId(id))
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found with ID: " + id));

        DoctorAvailability oldStatus = doctor.getAvailabilityStatus();
        doctor.setAvailabilityStatus(status);
        doctor = doctorRepository.save(doctor);

        auditLogService.logAction("DOCTOR_STATUS_UPDATE", "DOCTOR", doctor.getDoctorId(),
                oldStatus.name(), status.name(), "Updated doctor availability status");

        return mapToDto(doctor);
    }

    public DoctorDto mapToDto(Doctor d) {
        return DoctorDto.builder()
                .id(d.getId())
                .doctorId(d.getDoctorId())
                .name(d.getName())
                .specialization(d.getSpecialization())
                .department(d.getDepartment())
                .phone(d.getPhone())
                .email(d.getEmail())
                .availabilityStatus(d.getAvailabilityStatus())
                .currentPatientId(d.getCurrentPatientId())
                .activeCasesCount(d.getActiveCasesCount())
                .createdAt(d.getCreatedAt())
                .build();
    }
}
