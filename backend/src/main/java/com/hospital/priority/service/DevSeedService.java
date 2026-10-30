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

        if (userRepository.findByEmail("admin@hospital.org").isPresent()) {
            log.info("Admin user already exists. Seed already performed.");
            return;
        }

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

        // 3. Seed Patients with Complete Clinical & Emergency Assessment Data
        Patient p1 = Patient.builder()
                .patientId("PAT-1001")
                .name("Eleanor Vance")
                .age(58)
                .gender("FEMALE")
                .phone("+1-555-0201")
                .email("eleanor@example.com")
                .address("742 Evergreen Terrace")
                .bloodGroup("O_POSITIVE")
                .chiefComplaint("Severe crushing chest pain radiating to left shoulder and jaw")
                .symptoms("Diaphoresis, acute shortness of breath, nausea")
                .existingConditions("Hypertension, Type 2 Diabetes")
                .allergies(List.of("Penicillin"))
                .currentMedications("Metformin 500mg, Lisinopril 10mg")
                .medicalHistory("Prior coronary stent in 2021")
                .temperature(98.6)
                .bloodPressure("165/100")
                .heartRate(118)
                .respiratoryRate(24)
                .oxygenSaturation(91.0)
                .arrivalTime(Instant.now().minus(45, ChronoUnit.MINUTES))
                .emergencyLevel(EmergencyLevel.LEVEL_1_RESUSCITATION)
                .priorityScore(100)
                .status(CaseStatus.IN_TREATMENT)
                .assignedDoctorId("DOC-201")
                .emergencyContact(Patient.EmergencyContact.builder().name("Arthur Vance").relationship("Spouse").phone("+1-555-0291").build())
                .createdAt(Instant.now().minus(5, ChronoUnit.HOURS))
                .build();

        Patient p2 = Patient.builder()
                .patientId("PAT-1002")
                .name("Robert Chen")
                .age(42)
                .gender("MALE")
                .phone("+1-555-0202")
                .email("robert.chen@example.com")
                .address("123 Maple Street")
                .bloodGroup("A_POSITIVE")
                .chiefComplaint("Sudden onset right-sided weakness and facial droop")
                .symptoms("Slurred dysarthric speech, mild confusion")
                .existingConditions("Hyperlipidemia")
                .allergies(List.of("Latex"))
                .currentMedications("Atorvastatin 20mg")
                .medicalHistory("Smoker (10 pack-years)")
                .temperature(98.2)
                .bloodPressure("180/105")
                .heartRate(96)
                .respiratoryRate(18)
                .oxygenSaturation(97.0)
                .arrivalTime(Instant.now().minus(25, ChronoUnit.MINUTES))
                .emergencyLevel(EmergencyLevel.LEVEL_1_RESUSCITATION)
                .priorityScore(100)
                .status(CaseStatus.WAITING)
                .assignedDoctorId("DOC-202")
                .emergencyContact(Patient.EmergencyContact.builder().name("Mei Chen").relationship("Sister").phone("+1-555-0292").build())
                .createdAt(Instant.now().minus(4, ChronoUnit.HOURS))
                .build();

        Patient p3 = Patient.builder()
                .patientId("PAT-1003")
                .name("Amara Okafor")
                .age(29)
                .gender("FEMALE")
                .phone("+1-555-0203")
                .email("amara.o@example.com")
                .address("456 Oak Avenue")
                .bloodGroup("B_POSITIVE")
                .chiefComplaint("Blunt force abdominal trauma following motor vehicle collision")
                .symptoms("Sharp RUQ abdominal pain, guarded palpation")
                .existingConditions("None reported")
                .allergies(List.of())
                .currentMedications("None")
                .medicalHistory("Healthy athlete, no past surgeries")
                .temperature(99.0)
                .bloodPressure("110/72")
                .heartRate(104)
                .respiratoryRate(20)
                .oxygenSaturation(98.0)
                .arrivalTime(Instant.now().minus(60, ChronoUnit.MINUTES))
                .emergencyLevel(EmergencyLevel.LEVEL_2_EMERGENCY)
                .priorityScore(80)
                .status(CaseStatus.IN_TRIAGE)
                .assignedDoctorId("DOC-203")
                .emergencyContact(Patient.EmergencyContact.builder().name("Chidi Okafor").relationship("Brother").phone("+1-555-0293").build())
                .createdAt(Instant.now().minus(3, ChronoUnit.HOURS))
                .build();

        Patient p4 = Patient.builder()
                .patientId("PAT-1004")
                .name("Liam O'Connor")
                .age(67)
                .gender("MALE")
                .phone("+1-555-0204")
                .email("liam.oc@example.com")
                .address("789 Pine Road")
                .bloodGroup("AB_NEGATIVE")
                .chiefComplaint("Severe dyspnea, wheezing and COPD acute exacerbation")
                .symptoms("Productive cough, chest tightness, cyanotic lips")
                .existingConditions("COPD Stage 3, Congestive Heart Failure")
                .allergies(List.of("Aspirin", "Sulfa"))
                .currentMedications("Albuterol inhaler, Furosemide 40mg")
                .medicalHistory("Ex-smoker, chronic bronchitis")
                .temperature(99.4)
                .bloodPressure("138/88")
                .heartRate(112)
                .respiratoryRate(28)
                .oxygenSaturation(89.0)
                .arrivalTime(Instant.now().minus(35, ChronoUnit.MINUTES))
                .emergencyLevel(EmergencyLevel.LEVEL_2_EMERGENCY)
                .priorityScore(80)
                .status(CaseStatus.WAITING)
                .assignedDoctorId("DOC-205")
                .emergencyContact(Patient.EmergencyContact.builder().name("Fiona O'Connor").relationship("Daughter").phone("+1-555-0294").build())
                .createdAt(Instant.now().minus(2, ChronoUnit.HOURS))
                .build();

        Patient p5 = Patient.builder()
                .patientId("PAT-1005")
                .name("Sophia Martinez")
                .age(8)
                .gender("FEMALE")
                .phone("+1-555-0205")
                .email("parent.martinez@example.com")
                .address("321 Cedar Lane")
                .bloodGroup("O_NEGATIVE")
                .chiefComplaint("High fever (103.5°F), pediatric lethargy, vomiting")
                .symptoms("Persistent dehydration signs, febrile flushed face")
                .existingConditions("Asthma (mild)")
                .allergies(List.of("Peanuts"))
                .currentMedications("Montelukast 4mg")
                .medicalHistory("Full childhood immunizations up to date")
                .temperature(103.5)
                .bloodPressure("102/64")
                .heartRate(126)
                .respiratoryRate(22)
                .oxygenSaturation(96.0)
                .arrivalTime(Instant.now().minus(90, ChronoUnit.MINUTES))
                .emergencyLevel(EmergencyLevel.LEVEL_3_URGENT)
                .priorityScore(60)
                .status(CaseStatus.WAITING)
                .assignedDoctorId("DOC-204")
                .emergencyContact(Patient.EmergencyContact.builder().name("Maria Martinez").relationship("Mother").phone("+1-555-0295").build())
                .createdAt(Instant.now().minus(1, ChronoUnit.HOURS))
                .build();

        Patient p6 = Patient.builder()
                .patientId("PAT-1006")
                .name("David Kowalski")
                .age(34)
                .gender("MALE")
                .phone("+1-555-0206")
                .email("david.k@example.com")
                .address("654 Elm Boulevard")
                .bloodGroup("A_NEGATIVE")
                .chiefComplaint("Deep laceration on right forearm from workshop glass")
                .symptoms("Controlled bleeding with direct pressure, localized pain")
                .existingConditions("None")
                .allergies(List.of())
                .currentMedications("None")
                .medicalHistory("Tetanus vaccine last taken 6 years ago")
                .temperature(98.4)
                .bloodPressure("122/78")
                .heartRate(76)
                .respiratoryRate(16)
                .oxygenSaturation(99.0)
                .arrivalTime(Instant.now().minus(110, ChronoUnit.MINUTES))
                .emergencyLevel(EmergencyLevel.LEVEL_4_LESS_URGENT)
                .priorityScore(40)
                .status(CaseStatus.WAITING)
                .assignedDoctorId("DOC-205")
                .emergencyContact(Patient.EmergencyContact.builder().name("Anna Kowalski").relationship("Spouse").phone("+1-555-0296").build())
                .createdAt(Instant.now().minus(45, ChronoUnit.MINUTES))
                .build();

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
