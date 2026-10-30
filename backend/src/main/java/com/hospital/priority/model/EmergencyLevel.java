package com.hospital.priority.model;

import lombok.Getter;

@Getter
public enum EmergencyLevel {
    CRITICAL(100, "Red - Immediate life-saving intervention required"),
    HIGH(75, "Yellow - Urgent emergency care needed within 15-30 mins"),
    MEDIUM(50, "Green - Semi-urgent medical condition"),
    LOW(25, "Blue - Non-urgent administrative triage queue");

    private final int defaultScore;
    private final String description;

    EmergencyLevel(int defaultScore, String description) {
        this.defaultScore = defaultScore;
        this.description = description;
    }
}
