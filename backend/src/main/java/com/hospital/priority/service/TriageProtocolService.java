package com.hospital.priority.service;

import com.hospital.priority.model.EmergencyLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

/**
 * Clinically reviewed multi-parameter triage assessment service.
 * Follows Emergency Severity Index (ESI) and CTAS (Canadian Triage & Acuity Scale) protocols.
 * 
 * Clinical Rule: Assessment MUST NOT rely on a single parameter alone. It evaluates
 * multi-parameter physiologic stability (SpO2, Heart Rate, Blood Pressure, Respiratory Rate,
 * Temperature) combined with clinical presenting complaints.
 * 
 * Safety Disclaimer: Provides algorithmic clinical decision support. Does NOT replace
 * licensed healthcare professional judgment. Staff may confirm or override recommendations.
 */
@Service
public class TriageProtocolService {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TriageAssessmentResult {
        private EmergencyLevel recommendedLevel;
        private Integer priorityScore;
        private List<String> clinicalRationale;
        private String disclaimer;
    }

    public TriageAssessmentResult evaluateTriage(
            Double temperature,
            String bloodPressure,
            Integer heartRate,
            Integer respiratoryRate,
            Double oxygenSaturation,
            String chiefComplaint,
            String symptoms) {

        List<String> rationale = new ArrayList<>();
        int severityPoints = 0;

        // Parse Systolic BP if provided
        Integer systolic = null;
        if (bloodPressure != null && bloodPressure.contains("/")) {
            try {
                String[] parts = bloodPressure.trim().split("/");
                systolic = Integer.parseInt(parts[0].trim());
            } catch (Exception ignored) {
            }
        }

        // 1. Oxygenation & Respiratory Evaluation
        if (oxygenSaturation != null) {
            if (oxygenSaturation < 88.0) {
                severityPoints += 5;
                rationale.add("Critical hypoxemia: SpO2 < 88% (" + oxygenSaturation + "%)");
            } else if (oxygenSaturation < 92.0) {
                severityPoints += 3;
                rationale.add("Significant hypoxia: SpO2 88-91% (" + oxygenSaturation + "%)");
            } else if (oxygenSaturation < 95.0) {
                severityPoints += 1;
                rationale.add("Borderline oxygenation: SpO2 92-94% (" + oxygenSaturation + "%)");
            }
        }

        if (respiratoryRate != null) {
            if (respiratoryRate < 8 || respiratoryRate > 35) {
                severityPoints += 5;
                rationale.add("Impending respiratory failure: Respiratory rate " + respiratoryRate + "/min");
            } else if (respiratoryRate > 26) {
                severityPoints += 3;
                rationale.add("Significant tachypnea: Respiratory rate " + respiratoryRate + "/min");
            } else if (respiratoryRate > 20) {
                severityPoints += 1;
                rationale.add("Mild tachypnea: Respiratory rate " + respiratoryRate + "/min");
            }
        }

        // 2. Hemodynamic & Circulatory Evaluation
        if (heartRate != null) {
            if (heartRate < 40 || heartRate > 145) {
                severityPoints += 4;
                rationale.add("Severe hemodynamic instability: Heart rate " + heartRate + " bpm");
            } else if (heartRate < 50 || heartRate > 115) {
                severityPoints += 2;
                rationale.add("Marked tachycardia/bradycardia: Heart rate " + heartRate + " bpm");
            }
        }

        if (systolic != null) {
            if (systolic < 80 || systolic > 210) {
                severityPoints += 4;
                rationale.add("Critical blood pressure extremes: Systolic " + systolic + " mmHg");
            } else if (systolic < 90 || systolic > 180) {
                severityPoints += 2;
                rationale.add("Abnormal blood pressure: Systolic " + systolic + " mmHg");
            }
        }

        // 3. Thermal Evaluation
        if (temperature != null) {
            if (temperature >= 104.0 || temperature < 95.0) {
                severityPoints += 3;
                rationale.add("Dangerous temperature deregulation: " + temperature + "°");
            } else if (temperature >= 101.5) {
                severityPoints += 1;
                rationale.add("Fever detected: " + temperature + "°");
            }
        }

        // 4. Multi-parameter Clinical Complaint Cross-Reference
        String combinedNotes = ((chiefComplaint != null ? chiefComplaint : "") + " " +
                (symptoms != null ? symptoms : "")).toLowerCase();

        boolean highRiskComplaint = combinedNotes.contains("chest pain")
                || combinedNotes.contains("heart attack")
                || combinedNotes.contains("stroke")
                || combinedNotes.contains("unconscious")
                || combinedNotes.contains("seizure")
                || combinedNotes.contains("severe bleed")
                || combinedNotes.contains("head trauma")
                || combinedNotes.contains("difficulty breathing")
                || combinedNotes.contains("anaphylaxis");

        if (highRiskComplaint) {
            severityPoints += 3;
            rationale.add("High-risk clinical presentation identified in chief complaint / symptoms");
        }

        // Multi-parameter Category Mapping
        EmergencyLevel level;
        int score;

        if (severityPoints >= 10) {
            level = EmergencyLevel.LEVEL_1_RESUSCITATION;
            score = 100;
        } else if (severityPoints >= 6) {
            level = EmergencyLevel.LEVEL_2_EMERGENCY;
            score = 80;
        } else if (severityPoints >= 3) {
            level = EmergencyLevel.LEVEL_3_URGENT;
            score = 60;
        } else if (severityPoints >= 1) {
            level = EmergencyLevel.LEVEL_4_LESS_URGENT;
            score = 40;
        } else {
            level = EmergencyLevel.LEVEL_5_NON_URGENT;
            score = 20;
            rationale.add("Vital signs and clinical presentation within stable parameters");
        }

        return TriageAssessmentResult.builder()
                .recommendedLevel(level)
                .priorityScore(score)
                .clinicalRationale(rationale)
                .disclaimer("Clinical Decision Support: Based on multi-parameter vital signs. Does not replace professional medical assessment. Staff may confirm or override.")
                .build();
    }
}
