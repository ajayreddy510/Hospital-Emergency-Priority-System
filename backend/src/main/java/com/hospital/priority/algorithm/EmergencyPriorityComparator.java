package com.hospital.priority.algorithm;

import com.hospital.priority.model.EmergencyCase;
import java.io.Serializable;
import java.util.Comparator;

/**
 * Priority Queue Comparator demonstrating core DSA concepts.
 * Ordering criteria:
 * 1. Priority score descending (CRITICAL 100 > HIGH 75 > MEDIUM 50 > LOW 25)
 * 2. Arrival time ascending (Earlier arrival receives precedence - Min-heap tie breaker)
 */
public class EmergencyPriorityComparator implements Comparator<EmergencyCase>, Serializable {

    @Override
    public int compare(EmergencyCase c1, EmergencyCase c2) {
        if (c1 == null && c2 == null) return 0;
        if (c1 == null) return 1;
        if (c2 == null) return -1;

        // Primary criteria: Priority score (higher score = higher priority)
        int scoreCompare = Integer.compare(c2.getPriorityScore(), c1.getPriorityScore());
        if (scoreCompare != 0) {
            return scoreCompare;
        }

        // Secondary tie-breaker: Arrival time (earlier time = higher priority)
        if (c1.getArrivalTime() != null && c2.getArrivalTime() != null) {
            return c1.getArrivalTime().compareTo(c2.getArrivalTime());
        }

        return 0;
    }
}
