package com.hospital.priority.controller;

import com.hospital.priority.dto.ApiResponse;
import com.hospital.priority.service.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
public class ReportController {

    private final ReportService reportService;

    @GetMapping
    public ResponseEntity<ApiResponse<Map<String, Object>>> getReport(@RequestParam(defaultValue = "daily") String type) {
        Map<String, Object> report = reportService.generateReport(type);
        return ResponseEntity.ok(ApiResponse.success(report, "Emergency operations report generated"));
    }

    @GetMapping("/export/csv")
    public ResponseEntity<String> exportCsvReport(@RequestParam(defaultValue = "daily") String type) {
        String csvContent = reportService.generateCsvReport(type);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=emergency_report_" + type + ".csv")
                .contentType(MediaType.parseMediaType("text/csv"))
                .body(csvContent);
    }
}
