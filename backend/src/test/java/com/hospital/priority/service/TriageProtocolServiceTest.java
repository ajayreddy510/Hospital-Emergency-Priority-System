package com.hospital.priority.service;

import com.hospital.priority.model.EmergencyLevel;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class TriageProtocolServiceTest {

    private TriageProtocolService triageProtocolService;

    @BeforeEach
    void setUp() {
        triageProtocolService = new TriageProtocolService();
    }

    @Test
    @DisplayName("Critical vital compromise evaluates to Level 1 Resuscitation")
    void testLevel1Resuscitation() {
        var result = triageProtocolService.evaluateTriage(
                99.0,
                "70/40",
                148,
                38,
                82.0,
                "Unconscious and severe respiratory arrest",
                "Cyanosis, no verbal response"
        );

        assertEquals(EmergencyLevel.LEVEL_1_RESUSCITATION, result.getRecommendedLevel());
        assertEquals(100, result.getPriorityScore());
        assertFalse(result.getClinicalRationale().isEmpty());
        assertNotNull(result.getDisclaimer());
    }

    @Test
    @DisplayName("Significant acute vitals and chest pain evaluates to Level 2 Emergency")
    void testLevel2Emergency() {
        var result = triageProtocolService.evaluateTriage(
                98.6,
                "175/100",
                122,
                24,
                90.0,
                "Acute crushing chest pain",
                "Diaphoresis and pain radiating to arm"
        );

        assertEquals(EmergencyLevel.LEVEL_2_EMERGENCY, result.getRecommendedLevel());
        assertEquals(80, result.getPriorityScore());
    }

    @Test
    @DisplayName("Moderate fever and persistent symptoms evaluates to Level 3 Urgent")
    void testLevel3Urgent() {
        var result = triageProtocolService.evaluateTriage(
                102.5,
                "130/85",
                105,
                21,
                94.0,
                "Severe abdominal pain and vomiting",
                "Persistent right lower quadrant tenderness"
        );

        assertEquals(EmergencyLevel.LEVEL_3_URGENT, result.getRecommendedLevel());
        assertEquals(60, result.getPriorityScore());
    }

    @Test
    @DisplayName("Mild symptoms with stable vitals evaluates to Level 4 Less Urgent")
    void testLevel4LessUrgent() {
        var result = triageProtocolService.evaluateTriage(
                98.4,
                "125/80",
                78,
                21,
                97.0,
                "Sprained left ankle from soccer",
                "Mild swelling, able to bear partial weight"
        );

        assertEquals(EmergencyLevel.LEVEL_4_LESS_URGENT, result.getRecommendedLevel());
        assertEquals(40, result.getPriorityScore());
    }

    @Test
    @DisplayName("Normal vitals and minor routine complaint evaluates to Level 5 Non-Urgent")
    void testLevel5NonUrgent() {
        var result = triageProtocolService.evaluateTriage(
                98.6,
                "120/80",
                72,
                16,
                99.0,
                "Routine medication refill",
                "No acute distress"
        );

        assertEquals(EmergencyLevel.LEVEL_5_NON_URGENT, result.getRecommendedLevel());
        assertEquals(20, result.getPriorityScore());
    }
}
