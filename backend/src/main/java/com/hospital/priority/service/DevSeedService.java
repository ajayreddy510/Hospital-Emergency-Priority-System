package com.hospital.priority.service;

import com.hospital.priority.algorithm.EmergencyPriorityAlgorithm;
import com.hospital.priority.model.*;
import com.hospital.priority.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class DevSeedService implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PatientRepository patientRepository;
    private final DoctorRepository doctorRepository;
    private final EmergencyCaseRepository emergencyCaseRepository;
    private final TreatmentRecordRepository treatmentRecordRepository;
    private final AuditLogRepository auditLogRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmergencyPriorityAlgorithm priorityAlgorithm;

    @Value("${app.dev-seed.enabled:true}")
    private boolean devSeedEnabled;

    @Override
    public void run(String... args) {
        if (!devSeedEnabled) {
            log.info("Development data seeding is disabled by configuration.");
            return;
        }

        try {
            if (userRepository.count() > 0) {
                log.info("Database already populated. Skipping initial seed.");
                return;
            }

            seedDatabase();
        } catch (Exception e) {
            log.warn("Database initial seeding encountered an issue (app will continue): {}", e.getMessage());
        }
    }

    public void seedDatabase() {
        log.info("Seeding demo hospital data...");

        // 1. Seed Users
        User admin = User.builder()
                .name("System Administrator")
                .email("admin@hospital.org")
                .passwordHash(passwordEncoder.encode("Admin123!"))
                .role(Role.ADMIN)
                .active(true)
                .createdAt(Instant.now())
                .build();

        User doctorUser = User.builder()
                .name("Dr. Sarah Jenkins")
                .email("doctor.smith@hospital.org")
                .passwordHash(passwordEncoder.encode("Doctor123!"))
                .role(Role.DOCTOR)
                .active(true)
                .createdAt(Instant.now())
                .build();

        User nurseUser = User.builder()
                .name("Nurse Joy Williams")
                .email("nurse.joy@hospital.org")
                .passwordHash(passwordEncoder.encode("Nurse123!"))
                .role(Role.NURSE)
                .active(true)
                .createdAt(Instant.now())
                .build();

        User receptUser = User.builder()
                .name("Receptionist Alex Miller")
                .email("receptionist@hospital.org")
                .passwordHash(passwordEncoder.encode("Recept123!"))
                .role(Role.RECEPTIONIST)
                .active(true)
                .createdAt(Instant.now())
                .build();

        userRepository.saveAll(List.of(admin, doctorUser, nurseUser, receptUser));

        // 2. Seed Doctors
        Doctor d1 = Doctor.builder().doctorId("DOC-201").name("Dr. Aris Thorne").specialization("CARDIOLOGY").department("Emergency Cardiology").phone("+1-555-0101").email("aris.thorne@hospital.org").availabilityStatus(DoctorAvailability.AVAILABLE).activeCasesCount(2).createdAt(Instant.now()).build();
        Doctor d2 = Doctor.builder().doctorId("DOC-202").name("Dr. Elena Rostova").specialization("NEUROLOGY").department("Neurological Emergency").phone("+1-555-0102").email("elena.rostova@hospital.org").availabilityStatus(DoctorAvailability.AVAILABLE).activeCasesCount(1).createdAt(Instant.now()).build();
        Doctor d3 = Doctor.builder().doctorId("DOC-203").name("Dr. Marcus Vance").specialization("TRAUMA_SURGERY").department("Trauma Unit").phone("+1-555-0103").email("marcus.vance@hospital.org").availabilityStatus(DoctorAvailability.BUSY).activeCasesCount(3).createdAt(Instant.now()).build();
        Doctor d4 = Doctor.builder().doctorId("DOC-204").name("Dr. Sophia Lin").specialization("PEDIATRICS").department("Pediatric Emergency").phone("+1-555-0104").email("sophia.lin@hospital.org").availabilityStatus(DoctorAvailability.AVAILABLE).activeCasesCount(0).createdAt(Instant.now()).build();
        Doctor d5 = Doctor.builder().doctorId("DOC-205").name("Dr. James Carter").specialization("GENERAL_INTERNAL").department("General Triage").phone("+1-555-0105").email("james.carter@hospital.org").availabilityStatus(DoctorAvailability.AVAILABLE).activeCasesCount(1).createdAt(Instant.now()).build();

        doctorRepository.saveAll(List.of(d1, d2, d3, d4, d5));

        // 3. Seed Patients
        Patient p1 = Patient.builder().patientId("PAT-1001").name("Eleanor Vance").age(58).gender("FEMALE").phone("+1-555-0201").email("eleanor@example.com").address("742 Evergreen Terrace").bloodGroup("O_POSITIVE").allergies(List.of("Penicillin")).createdAt(Instant.now().minus(5, ChronoUnit.HOURS)).build();
        Patient p2 = Patient.builder().patientId("PAT-1002").name("Robert Chen").age(42).gender("MALE").phone("+1-555-0202").email("robert.chen@example.com").address("123 Maple Street").bloodGroup("A_POSITIVE").allergies(List.of("Latex")).createdAt(Instant.now().minus(4, ChronoUnit.HOURS)).build();
        Patient p3 = Patient.builder().patientId("PAT-1003").name("Amara Okafor").age(29).gender("FEMALE").phone("+1-555-0203").email("amara.o@example.com").address("456 Oak Avenue").bloodGroup("B_POSITIVE").allergies(List.of()).createdAt(Instant.now().minus(3, ChronoUnit.HOURS)).build();
        Patient p4 = Patient.builder().patientId("PAT-1004").name("Liam O'Connor").age(67).gender("MALE").phone("+1-555-0204").email("liam.oc@example.com").address("789 Pine Road").bloodGroup("AB_NEGATIVE").allergies(List.of("Aspirin")).createdAt(Instant.now().minus(2, ChronoUnit.HOURS)).build();
        Patient p5 = Patient.builder().patientId("PAT-1005").name("Sophia Martinez").age(8).gender("FEMALE").phone("+1-555-0205").email("parent.martinez@example.com").address("321 Cedar Lane").bloodGroup("O_NEGATIVE").allergies(List.of("Peanuts")).createdAt(Instant.now().minus(1, ChronoUnit.HOURS)).build();
        Patient p6 = Patient.builder().patientId("PAT-1006").name("David Kowalski").age(34).gender("MALE").phone("+1-555-0206").email("david.k@example.com").address("654 Elm Boulevard").bloodGroup("A_NEGATIVE").allergies(List.of()).createdAt(Instant.now().minus(45, ChronoUnit.MINUTES)).build();

        patientRepository.saveAll(List.of(p1, p2, p3, p4, p5, p6));

        // 4. Seed Emergency Cases
        EmergencyCase c1 = EmergencyCase.builder().caseId("EMG-8801").patientId("PAT-1001").symptoms("Severe crushing chest pain, radiating to left shoulder and jaw, diaphoresis").emergencyLevel(EmergencyLevel.CRITICAL).priorityScore(100).arrivalTime(Instant.now().minus(45, ChronoUnit.MINUTES)).status(CaseStatus.IN_TREATMENT).assignedDoctorId("DOC-201").notes("Transferred via EMS ambulance. Suspected STEMI.").createdAt(Instant.now().minus(45, ChronoUnit.MINUTES)).build();
        EmergencyCase c2 = EmergencyCase.builder().caseId("EMG-8802").patientId("PAT-1002").symptoms("Sudden onset right-sided weakness, facial droop, slurred speech").emergencyLevel(EmergencyLevel.CRITICAL).priorityScore(100).arrivalTime(Instant.now().minus(25, ChronoUnit.MINUTES)).status(CaseStatus.WAITING).assignedDoctorId("DOC-202").notes("Stroke code activated. Urgent CT Brain required.").createdAt(Instant.now().minus(25, ChronoUnit.MINUTES)).build();
        EmergencyCase c3 = EmergencyCase.builder().caseId("EMG-8803").patientId("PAT-1003").symptoms("Blunt force abdominal trauma following motor vehicle collision").emergencyLevel(EmergencyLevel.HIGH).priorityScore(75).arrivalTime(Instant.now().minus(60, ChronoUnit.MINUTES)).status(CaseStatus.IN_TRIAGE).assignedDoctorId("DOC-203").notes("Vitals stable but abdominal tenderness present.").createdAt(Instant.now().minus(60, ChronoUnit.MINUTES)).build();
        EmergencyCase c4 = EmergencyCase.builder().caseId("EMG-8804").patientId("PAT-1004").symptoms("Severe dyspnea, wheezing, COPD acute exacerbation").emergencyLevel(EmergencyLevel.HIGH).priorityScore(75).arrivalTime(Instant.now().minus(35, ChronoUnit.MINUTES)).status(CaseStatus.WAITING).assignedDoctorId("DOC-205").notes("O2 sat 89% on room air. Nebulizer started.").createdAt(Instant.now().minus(35, ChronoUnit.MINUTES)).build();
        EmergencyCase c5 = EmergencyCase.builder().caseId("EMG-8805").patientId("PAT-1005").symptoms("High fever (103.5°F), pediatric lethargy, vomiting").emergencyLevel(EmergencyLevel.MEDIUM).priorityScore(50).arrivalTime(Instant.now().minus(90, ChronoUnit.MINUTES)).status(CaseStatus.WAITING).assignedDoctorId("DOC-204").notes("Pediatric intake.").createdAt(Instant.now().minus(90, ChronoUnit.MINUTES)).build();
        EmergencyCase c6 = EmergencyCase.builder().caseId("EMG-8806").patientId("PAT-1006").symptoms("Deep laceration on forearm from glass, controlled bleeding").emergencyLevel(EmergencyLevel.LOW).priorityScore(25).arrivalTime(Instant.now().minus(110, ChronoUnit.MINUTES)).status(CaseStatus.WAITING).assignedDoctorId("DOC-205").notes("Tetanus update needed.").createdAt(Instant.now().minus(110, ChronoUnit.MINUTES)).build();

        emergencyCaseRepository.saveAll(List.of(c1, c2, c3, c4, c5, c6));

        // 5. Seed Treatment Record
        TreatmentRecord tr1 = TreatmentRecord.builder()
                .caseId("EMG-8801")
                .patientId("PAT-1001")
                .doctorId("DOC-201")
                .diagnosisNotes("Acute Inferolateral ST-Elevation Myocardial Infarction (STEMI)")
                .treatmentNotes("Administered Aspirin 325mg PO, Clopidogrel 600mg PO, Sublingual Nitroglycerin. Oxygen 2L/min nasal cannula. STAT Cath Lab activation.")
                .medicationNotes("Heparin 5000 units IV bolus administered.")
                .treatmentStatus(TreatmentStatus.IN_PROGRESS)
                .createdAt(Instant.now().minus(30, ChronoUnit.MINUTES))
                .build();

        treatmentRecordRepository.save(tr1);

        // 6. Seed Initial Audit Log
        AuditLog audit = AuditLog.builder()
                .userId(admin.getId())
                .userName(admin.getName())
                .userRole(Role.ADMIN)
                .action("SYSTEM_INITIALIZATION")
                .entityType("SYSTEM")
                .entityId("INIT")
                .reason("Hospital Emergency Priority System seed database initialized successfully.")
                .timestamp(Instant.now())
                .build();

        auditLogRepository.save(audit);

        log.info("Demo database seeded successfully with 4 Users, 5 Doctors, 6 Patients, 6 Emergency Cases, 1 Treatment Record!");
    }
}
