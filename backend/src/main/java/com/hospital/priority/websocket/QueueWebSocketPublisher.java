package com.hospital.priority.websocket;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.HashMap;
import java.util.Map;

@Slf4j
@Component
@RequiredArgsConstructor
public class QueueWebSocketPublisher {

    private final SimpMessagingTemplate messagingTemplate;

    public void broadcastQueueUpdate(String eventType, Object payload) {
        try {
            Map<String, Object> message = new HashMap<>();
            message.put("event", eventType);
            message.put("timestamp", Instant.now().toString());
            message.put("data", payload);

            log.info("Broadcasting WebSocket queue update event: {}", eventType);
            messagingTemplate.convertAndSend("/topic/queue-updates", message);
        } catch (Exception ex) {
            log.error("Failed to broadcast WebSocket queue update", ex);
        }
    }

    public void broadcastDashboardStats(Object dashboardData) {
        try {
            log.info("Broadcasting WebSocket dashboard stats update");
            messagingTemplate.convertAndSend("/topic/dashboard-stats", dashboardData);
        } catch (Exception ex) {
            log.error("Failed to broadcast dashboard stats", ex);
        }
    }
}
