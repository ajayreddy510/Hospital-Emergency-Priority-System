package com.hospital.priority.controller;

import com.hospital.priority.dto.ApiResponse;
import com.hospital.priority.dto.QueueItemDto;
import com.hospital.priority.service.PriorityQueueService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/queue")
@RequiredArgsConstructor
public class QueueController {

    private final PriorityQueueService priorityQueueService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<QueueItemDto>>> getActiveQueue() {
        List<QueueItemDto> queue = priorityQueueService.getActivePriorityQueue();
        return ResponseEntity.ok(ApiResponse.success(queue, "Active emergency priority queue calculated by DSA Heap Engine"));
    }

    @GetMapping("/next")
    public ResponseEntity<ApiResponse<QueueItemDto>> getNextPatient() {
        Optional<QueueItemDto> nextPatient = priorityQueueService.getNextPatientInQueue();
        return nextPatient.map(queueItemDto -> ResponseEntity.ok(ApiResponse.success(queueItemDto, "Highest priority next patient fetched")))
                .orElseGet(() -> ResponseEntity.ok(ApiResponse.success(null, "Emergency queue is currently empty")));
    }
}
