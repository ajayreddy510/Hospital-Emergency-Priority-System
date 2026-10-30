package com.hospital.priority.algorithm;

import com.hospital.priority.model.EmergencyCase;
import com.hospital.priority.model.EmergencyLevel;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.PriorityQueue;

import static org.junit.jupiter.api.Assertions.assertEquals;

class EmergencyPriorityComparatorTest {

    private EmergencyPriorityComparator comparator;

    @BeforeEach
    void setUp() {
        comparator = new EmergencyPriorityComparator();
    }

    @Test
    @DisplayName("Higher priority score should come before lower score")
    void testPriorityScoreOrdering() {
        EmergencyCase criticalCase = EmergencyCase.builder()
                .caseId("EMG-1")
                .priorityScore(100)
                .emergencyLevel(EmergencyLevel.CRITICAL)
                .arrivalTime(Instant.now())
                .build();

        EmergencyCase highCase = EmergencyCase.builder()
                .caseId("EMG-2")
                .priorityScore(75)
                .emergencyLevel(EmergencyLevel.HIGH)
                .arrivalTime(Instant.now())
                .build();

        PriorityQueue<EmergencyCase> queue = new PriorityQueue<>(comparator);
        queue.add(highCase);
        queue.add(criticalCase);

        assertEquals(criticalCase, queue.poll(), "CRITICAL case (100) should be polled before HIGH case (75)");
        assertEquals(highCase, queue.poll());
    }

    @Test
    @DisplayName("Equal priority scores should tie-break by earlier arrival time")
    void testArrivalTieBreaker() {
        Instant earlier = Instant.now().minus(30, ChronoUnit.MINUTES);
        Instant later = Instant.now().minus(10, ChronoUnit.MINUTES);

        EmergencyCase caseEarlier = EmergencyCase.builder()
                .caseId("EMG-EARLY")
                .priorityScore(100)
                .emergencyLevel(EmergencyLevel.CRITICAL)
                .arrivalTime(earlier)
                .build();

        EmergencyCase caseLater = EmergencyCase.builder()
                .caseId("EMG-LATE")
                .priorityScore(100)
                .emergencyLevel(EmergencyLevel.CRITICAL)
                .arrivalTime(later)
                .build();

        PriorityQueue<EmergencyCase> queue = new PriorityQueue<>(comparator);
        queue.add(caseLater);
        queue.add(caseEarlier);

        assertEquals(caseEarlier, queue.poll(), "Case with earlier arrival time must have priority over later arrival time when scores match");
        assertEquals(caseLater, queue.poll());
    }
}
