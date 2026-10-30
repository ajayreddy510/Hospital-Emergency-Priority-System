package com.hospital.priority.service;

import com.hospital.priority.dto.PatientDto;
import com.hospital.priority.exception.InvalidInputException;
import com.hospital.priority.exception.ResourceNotFoundException;
import com.hospital.priority.model.Patient;
import com.hospital.priority.repository.PatientRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PatientService {

    private final PatientRepository patientRepository;
    private final AuditLogService auditLogService;

    public Page<PatientDto> getPatients(int page, int size, String search) {
        PageRequest pageRequest = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<Patient> patients;

        if (search != null && !search.trim().isEmpty()) {
            patients = patientRepository.searchPatients(search.trim(), pageRequest);
        } else {
            patients = patientRepository.findAll(pageRequest);
        }

        return patients.map(this::mapToDto);
    }

    public PatientDto getPatientById(String id) {
        Patient patient = patientRepository.findById(id)
                .or(() -> patientRepository.findByPatientId(id))
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found with ID: " + id));
        return mapToDto(patient);
    }

    public PatientDto createPatient(PatientDto dto) {
        String patientId = "PAT-" + (1000 + patientRepository.count() + 1);
        
        Patient patient = Patient.builder()
                .patientId(patientId)
                .name(dto.getName())
                .age(dto.getAge())
                .gender(dto.getGender())
                .phone(dto.getPhone())
                .email(dto.getEmail())
                .address(dto.getAddress())
                .bloodGroup(dto.getBloodGroup())
                .allergies(dto.getAllergies())
                .emergencyContact(dto.getEmergencyContact())
                .createdAt(Instant.now())
                .updatedAt(Instant.now())
                .build();

        patient = patientRepository.save(patient);
        auditLogService.logAction("PATIENT_CREATE", "PATIENT", patient.getPatientId(), null, patient.getName(), "Registered new patient");

        return mapToDto(patient);
    }

    public PatientDto updatePatient(String id, PatientDto dto) {
        Patient patient = patientRepository.findById(id)
                .or(() -> patientRepository.findByPatientId(id))
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found with ID: " + id));

        patient.setName(dto.getName());
        patient.setAge(dto.getAge());
        patient.setGender(dto.getGender());
        patient.setPhone(dto.getPhone());
        patient.setEmail(dto.getEmail());
        patient.setAddress(dto.getAddress());
        patient.setBloodGroup(dto.getBloodGroup());
        patient.setAllergies(dto.getAllergies());
        if (dto.getEmergencyContact() != null) {
            patient.setEmergencyContact(dto.getEmergencyContact());
        }
        patient.setUpdatedAt(Instant.now());

        patient = patientRepository.save(patient);
        auditLogService.logAction("PATIENT_UPDATE", "PATIENT", patient.getPatientId(), null, patient.getName(), "Updated patient profile");

        return mapToDto(patient);
    }

    public void deletePatient(String id) {
        Patient patient = patientRepository.findById(id)
                .or(() -> patientRepository.findByPatientId(id))
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found with ID: " + id));

        patientRepository.delete(patient);
        auditLogService.logAction("PATIENT_DELETE", "PATIENT", patient.getPatientId(), patient.getName(), null, "Deleted patient record");
    }

    private PatientDto mapToDto(Patient p) {
        return PatientDto.builder()
                .id(p.getId())
                .patientId(p.getPatientId())
                .name(p.getName())
                .age(p.getAge())
                .gender(p.getGender())
                .phone(p.getPhone())
                .email(p.getEmail())
                .address(p.getAddress())
                .bloodGroup(p.getBloodGroup())
                .allergies(p.getAllergies())
                .emergencyContact(p.getEmergencyContact())
                .createdAt(p.getCreatedAt())
                .updatedAt(p.getUpdatedAt())
                .build();
    }
}
