package com.hospital.priority.controller;

import com.hospital.priority.dto.ApiResponse;
import com.hospital.priority.service.DevSeedService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/dev")
@RequiredArgsConstructor
public class DevSeedController {

    private final DevSeedService devSeedService;

    @PostMapping("/seed")
    public ResponseEntity<ApiResponse<String>> triggerSeedData() {
        devSeedService.seedDatabase();
        return ResponseEntity.ok(ApiResponse.success("Database seed completed with fictional test data", "SEED_SUCCESS"));
    }

    @GetMapping("/seed")
    public ResponseEntity<ApiResponse<String>> triggerSeedDataGet() {
        devSeedService.seedDatabase();
        return ResponseEntity.ok(ApiResponse.success("Database seed completed with fictional test data", "SEED_SUCCESS"));
    }
}
