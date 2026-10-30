package com.hospital.priority.controller;

import com.hospital.priority.dto.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
public class HealthController {

    @GetMapping("/")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getRoot() {
        return ResponseEntity.ok(ApiResponse.success(
                Map.of(
                        "system", "Hospital Emergency Priority System API",
                        "status", "HEALTHY",
                        "version", "1.0.0",
                        "endpoints", Map.of(
                                "health", "/api/health",
                                "authLogin", "/api/auth/login",
                                "queue", "/api/queue",
                                "dashboard", "/api/dashboard/summary"
                        )
                ),
                "Hospital Emergency Priority System Backend is online"
        ));
    }

    @GetMapping("/api")
    public ResponseEntity<ApiResponse<Map<String, String>>> getApiRoot() {
        return ResponseEntity.ok(ApiResponse.success(
                Map.of(
                        "system", "Hospital Emergency Priority System",
                        "status", "UP",
                        "version", "1.0.0",
                        "dsaEngine", "Min-Heap PriorityQueue (Level weight + Arrival timestamp tie-breaker)"
                ),
                "Hospital Emergency Priority System API Backend Running"
        ));
    }

    @GetMapping("/api/health")
    public ResponseEntity<ApiResponse<String>> getHealth() {
        return ResponseEntity.ok(ApiResponse.success("HEALTHY", "System operational"));
    }
}
