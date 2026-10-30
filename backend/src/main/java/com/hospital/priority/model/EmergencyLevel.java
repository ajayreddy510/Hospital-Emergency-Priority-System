package com.hospital.priority.model;

import lombok.Getter;

@Getter
public enum EmergencyLevel {
    LEVEL_1_RESUSCITATION(100, "Level 1 – Resuscitation (Immediate life-saving intervention)"),
    LEVEL_2_EMERGENCY(80, "Level 2 – Emergency (Urgent care needed within 15 mins)"),
    LEVEL_3_URGENT(60, "Level 3 – Urgent (Medical assessment within 30 mins)"),
    LEVEL_4_LESS_URGENT(40, "Level 4 – Less Urgent (Assessment within 60 mins)"),
    LEVEL_5_NON_URGENT(20, "Level 5 – Non-Urgent (Routine triage within 120 mins)"),

    // Legacy backward-compatible aliases
    CRITICAL(100, "Level 1 – Resuscitation (Critical)"),
    HIGH(80, "Level 2 – Emergency (High Priority)"),
    MEDIUM(60, "Level 3 – Urgent (Medium Priority)"),
    LOW(20, "Level 5 – Non-Urgent (Low Priority)");

    private final int defaultScore;
    private final String description;

    EmergencyLevel(int defaultScore, String description) {
        this.defaultScore = defaultScore;
        this.description = description;
    }
}
