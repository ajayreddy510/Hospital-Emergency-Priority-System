package com.hospital.priority.service;

import com.hospital.priority.dto.TreatmentRecordDto;
import com.hospital.priority.exception.ResourceNotFoundException;
import com.hospital.priority.model.TreatmentRecord;
import com.hospital.priority.model.TreatmentStatus;
import com.hospital.priority.repository.TreatmentRecordRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;

@Service
@RequiredArgsConstructor
public class TreatmentService {

    private final TreatmentRecordRepository treatmentRecordRepository;
    private final AuditLogService auditLogService;

    public List<TreatmentRecordDto> getTreatmentsByPatient(String patientId) {
        return treatmentRecordRepository.findByPatientId(patientId).stream()
                .map(this::mapToDto)
                .toList();
    }

    public TreatmentRecordDto getTreatmentByCase(String caseId) {
        TreatmentRecord record = treatmentRecordRepository.findByCaseId(caseId)
                .orElseThrow(() -> new ResourceNotFoundException("No treatment record found for Case ID: " + caseId));
        return mapToDto(record);
    }

    public TreatmentRecordDto saveTreatmentRecord(TreatmentRecordDto dto) {
        TreatmentRecord record = treatmentRecordRepository.findByCaseId(dto.getCaseId())
                .orElseGet(() -> TreatmentRecord.builder()
                        .caseId(dto.getCaseId())
                        .patientId(dto.getPatientId())
                        .doctorId(dto.getDoctorId())
                        .createdAt(Instant.now())
                        .build());

        record.setDiagnosisNotes(dto.getDiagnosisNotes());
        record.setTreatmentNotes(dto.getTreatmentNotes());
        record.setMedicationNotes(dto.getMedicationNotes());
        record.setTreatmentStatus(dto.getTreatmentStatus() != null ? dto.getTreatmentStatus() : TreatmentStatus.IN_PROGRESS);
        record.setUpdatedAt(Instant.now());

        record = treatmentRecordRepository.save(record);
        auditLogService.logAction("TREATMENT_RECORD_SAVE", "TREATMENT_RECORD", record.getId(), null, record.getTreatmentStatus().name(), "Saved clinical treatment record");

        return mapToDto(record);
    }

    private TreatmentRecordDto mapToDto(TreatmentRecord tr) {
        return TreatmentRecordDto.builder()
                .id(tr.getId())
                .patientId(tr.getPatientId())
                .caseId(tr.getCaseId())
                .doctorId(tr.getDoctorId())
                .diagnosisNotes(tr.getDiagnosisNotes())
                .treatmentNotes(tr.getTreatmentNotes())
                .medicationNotes(tr.getMedicationNotes())
                .treatmentStatus(tr.getTreatmentStatus())
                .createdAt(tr.getCreatedAt())
                .updatedAt(tr.getUpdatedAt())
                .build();
    }
}
