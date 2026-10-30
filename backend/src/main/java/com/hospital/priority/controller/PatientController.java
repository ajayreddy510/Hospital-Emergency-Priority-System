package com.hospital.priority.controller;

import com.hospital.priority.dto.ApiResponse;
import com.hospital.priority.dto.PatientDto;
import com.hospital.priority.service.PatientService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/patients")
@RequiredArgsConstructor
public class PatientController {

    private final PatientService patientService;

    @GetMapping
    public ResponseEntity<ApiResponse<Page<PatientDto>>> getPatients(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String search) {
        Page<PatientDto> patients = patientService.getPatients(page, size, search);
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

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deletePatient(@PathVariable String id) {
        patientService.deletePatient(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Patient record deleted successfully"));
    }
}
