package com.hospital.priority.controller;

import com.hospital.priority.dto.ApiResponse;
import com.hospital.priority.dto.PatientDto;
import com.hospital.priority.model.CaseStatus;
import com.hospital.priority.model.EmergencyLevel;
import com.hospital.priority.service.PatientService;
import com.hospital.priority.service.TriageProtocolService;
import jakarta.validation.Valid;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/patients")
@RequiredArgsConstructor
public class PatientController {

    private final PatientService patientService;
    private final TriageProtocolService triageProtocolService;

    @GetMapping
    public ResponseEntity<ApiResponse<Page<PatientDto>>> getPatients(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) EmergencyLevel priority,
            @RequestParam(required = false) CaseStatus status) {
        Page<PatientDto> patients = patientService.getPatients(page, size, search, priority, status);
        return ResponseEntity.ok(ApiResponse.success(patients));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<PatientDto>> getPatientById(@PathVariable String id) {
        PatientDto patient = patientService.getPatientById(id);
        return ResponseEntity.ok(ApiResponse.success(patient));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<PatientDto>> createPatient(@Valid @RequestBody PatientDto dto) {
        PatientDto created = patientService.createPatient(dto);
        return ResponseEntity.ok(ApiResponse.success(created, "Patient registered successfully"));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<PatientDto>> updatePatient(@PathVariable String id, @Valid @RequestBody PatientDto dto) {
        PatientDto updated = patientService.updatePatient(id, dto);
        return ResponseEntity.ok(ApiResponse.success(updated, "Patient record updated successfully"));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ApiResponse<PatientDto>> updatePatientStatus(
            @PathVariable String id,
            @RequestParam CaseStatus status,
            @RequestParam(required = false) String notes) {
        PatientDto updated = patientService.updatePatientStatus(id, status, notes);
        return ResponseEntity.ok(ApiResponse.success(updated, "Patient status updated successfully"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deletePatient(@PathVariable String id) {
        patientService.deletePatient(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Patient record deleted successfully"));
    }

    @Data
    public static class TriageEvalRequest {
        private Double temperature;
        private String bloodPressure;
        private Integer heartRate;
        private Integer respiratoryRate;
        private Double oxygenSaturation;
        private String chiefComplaint;
        private String symptoms;
    }

    @PostMapping("/triage-evaluate")
    public ResponseEntity<ApiResponse<TriageProtocolService.TriageAssessmentResult>> evaluateTriage(
            @RequestBody TriageEvalRequest request) {
        var result = triageProtocolService.evaluateTriage(
                request.getTemperature(),
                request.getBloodPressure(),
                request.getHeartRate(),
                request.getRespiratoryRate(),
                request.getOxygenSaturation(),
                request.getChiefComplaint(),
                request.getSymptoms()
        );
        return ResponseEntity.ok(ApiResponse.success(result, "Triage assessment generated"));
    }
}
