package com.hospital.priority.controller;

import com.hospital.priority.dto.*;
import com.hospital.priority.model.CaseStatus;
import com.hospital.priority.service.EmergencyCaseService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/emergency-cases")
@RequiredArgsConstructor
public class EmergencyCaseController {

    private final EmergencyCaseService emergencyCaseService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<EmergencyCaseDto>>> getAllCases() {
        List<EmergencyCaseDto> cases = emergencyCaseService.getAllCases();
        return ResponseEntity.ok(ApiResponse.success(cases));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<EmergencyCaseDto>> getCaseById(@PathVariable String id) {
        EmergencyCaseDto emergencyCase = emergencyCaseService.getCaseById(id);
        return ResponseEntity.ok(ApiResponse.success(emergencyCase));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<EmergencyCaseDto>> createEmergencyCase(@Valid @RequestBody EmergencyCaseDto dto) {
        EmergencyCaseDto created = emergencyCaseService.createEmergencyCase(dto);
        return ResponseEntity.ok(ApiResponse.success(created, "Emergency triage case created and queued successfully"));
    }

    @PatchMapping("/{id}/priority")
    public ResponseEntity<ApiResponse<EmergencyCaseDto>> overridePriority(
            @PathVariable String id,
            @Valid @RequestBody PriorityOverrideDto overrideDto) {
        EmergencyCaseDto updated = emergencyCaseService.overridePriority(id, overrideDto);
        return ResponseEntity.ok(ApiResponse.success(updated, "Priority level manually overridden and audit logged"));
    }

    @PostMapping("/{id}/assign-doctor")
    public ResponseEntity<ApiResponse<EmergencyCaseDto>> assignDoctor(
            @PathVariable String id,
            @Valid @RequestBody DoctorAssignmentDto dto) {
        EmergencyCaseDto updated = emergencyCaseService.assignDoctor(id, dto);
        return ResponseEntity.ok(ApiResponse.success(updated, "Doctor assigned to emergency case"));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ApiResponse<EmergencyCaseDto>> updateStatus(
            @PathVariable String id,
            @RequestParam CaseStatus status) {
        EmergencyCaseDto updated = emergencyCaseService.updateStatus(id, status);
        return ResponseEntity.ok(ApiResponse.success(updated, "Case status updated to " + status.name()));
    }
}
