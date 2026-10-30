package com.hospital.priority.algorithm;

import com.hospital.priority.model.EmergencyCase;
import com.hospital.priority.model.EmergencyLevel;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.util.PriorityQueue;

/**
 * Encapsulates Priority Queue DSA operations:
 * - Heap Insertion: O(log N)
 * - Heap Peek: O(1)
 * - Heap Poll: O(log N)
 * - Heap Rebuild: O(N log N)
 */
@Component
public class EmergencyPriorityAlgorithm {

    /**
     * Calculates administrative priority score for a triage case.
     */
    public int calculatePriorityScore(EmergencyLevel level, Integer customScoreModifier) {
        int baseScore = (level != null) ? level.getDefaultScore() : EmergencyLevel.LOW.getDefaultScore();
        if (customScoreModifier != null) {
            baseScore += customScoreModifier;
        }
        return Math.max(1, Math.min(100, baseScore)); // Clamped 1..100
    }

    /**
     * Builds and sorts a Min/Max Heap PriorityQueue from raw cases.
     */
    public PriorityQueue<EmergencyCase> buildPriorityQueue(Collection<EmergencyCase> cases) {
        PriorityQueue<EmergencyCase> priorityQueue = new PriorityQueue<>(new EmergencyPriorityComparator());
        if (cases != null) {
            priorityQueue.addAll(cases);
        }
        return priorityQueue;
    }

    /**
     * Extracts all cases in sorted priority order without mutating original data.
     */
    public List<EmergencyCase> getSortedQueueList(Collection<EmergencyCase> cases) {
        PriorityQueue<EmergencyCase> pq = buildPriorityQueue(cases);
        List<EmergencyCase> sortedList = new ArrayList<>(pq.size());
        while (!pq.isEmpty()) {
            sortedList.add(pq.poll());
        }
        return sortedList;
    }
}
