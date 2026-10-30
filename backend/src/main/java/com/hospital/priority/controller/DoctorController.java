package com.hospital.priority.controller;

import com.hospital.priority.dto.ApiResponse;
import com.hospital.priority.dto.DoctorDto;
import com.hospital.priority.model.DoctorAvailability;
import com.hospital.priority.service.DoctorService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/doctors")
@RequiredArgsConstructor
public class DoctorController {

    private final DoctorService doctorService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<DoctorDto>>> getAllDoctors() {
        List<DoctorDto> doctors = doctorService.getAllDoctors();
        return ResponseEntity.ok(ApiResponse.success(doctors));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<DoctorDto>> getDoctorById(@PathVariable String id) {
        DoctorDto doctor = doctorService.getDoctorById(id);
        return ResponseEntity.ok(ApiResponse.success(doctor));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<DoctorDto>> createDoctor(@Valid @RequestBody DoctorDto dto) {
        DoctorDto created = doctorService.createDoctor(dto);
        return ResponseEntity.ok(ApiResponse.success(created, "Doctor profile created successfully"));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ApiResponse<DoctorDto>> updateAvailability(
            @PathVariable String id,
            @RequestParam DoctorAvailability status) {
        DoctorDto updated = doctorService.updateAvailability(id, status);
        return ResponseEntity.ok(ApiResponse.success(updated, "Doctor availability status updated"));
    }
}
