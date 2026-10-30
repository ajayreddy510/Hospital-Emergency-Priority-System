package com.hospital.priority.controller;

import com.hospital.priority.dto.ApiResponse;
import com.hospital.priority.dto.TreatmentRecordDto;
import com.hospital.priority.service.TreatmentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/treatments")
@RequiredArgsConstructor
public class TreatmentController {

    private final TreatmentService treatmentService;

    @GetMapping("/patient/{patientId}")
    public ResponseEntity<ApiResponse<List<TreatmentRecordDto>>> getTreatmentsByPatient(@PathVariable String patientId) {
        List<TreatmentRecordDto> records = treatmentService.getTreatmentsByPatient(patientId);
        return ResponseEntity.ok(ApiResponse.success(records));
    }

    @GetMapping("/case/{caseId}")
    public ResponseEntity<ApiResponse<TreatmentRecordDto>> getTreatmentByCase(@PathVariable String caseId) {
        TreatmentRecordDto record = treatmentService.getTreatmentByCase(caseId);
        return ResponseEntity.ok(ApiResponse.success(record));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<TreatmentRecordDto>> saveTreatmentRecord(@Valid @RequestBody TreatmentRecordDto dto) {
        TreatmentRecordDto saved = treatmentService.saveTreatmentRecord(dto);
        return ResponseEntity.ok(ApiResponse.success(saved, "Clinical treatment record saved successfully"));
    }
}
