# Database Schema: MongoDB Atlas

Collections in `hospital_emergency_db`:

1. `users`
   - `_id`: ObjectId
   - `name`: String
   - `email`: String (Unique Index)
   - `passwordHash`: String
   - `role`: Enum (ADMIN, DOCTOR, NURSE, RECEPTIONIST)
   - `active`: Boolean
   - `createdAt`: ISODate

2. `patients`
   - `_id`: ObjectId
   - `patientId`: String (Unique Index)
   - `name`: String
   - `age`: Number
   - `gender`: String
   - `phone`: String
   - `email`: String
   - `address`: String
   - `bloodGroup`: String
   - `allergies`: Array<String>
   - `emergencyContact`: Object
   - `createdAt`: ISODate
   - `updatedAt`: ISODate

3. `doctors`
   - `_id`: ObjectId
   - `doctorId`: String (Unique Index)
   - `name`: String
   - `specialization`: String
   - `department`: String
   - `phone`: String
   - `email`: String
   - `availabilityStatus`: String (AVAILABLE, BUSY, OFFLINE)
   - `currentPatientId`: String
   - `activeCasesCount`: Number
   - `createdAt`: ISODate

4. `emergency_cases`
   - `_id`: ObjectId
   - `caseId`: String (Unique Index)
   - `patientId`: String (Index)
   - `symptoms`: String
   - `emergencyLevel`: String (CRITICAL, HIGH, MEDIUM, LOW) (Index)
   - `priorityScore`: Number (Index)
   - `arrivalTime`: ISODate (Index)
   - `status`: String (WAITING, IN_TRIAGE, IN_TREATMENT, COMPLETED, CANCELLED) (Index)
   - `assignedDoctorId`: String
   - `notes`: String
   - `overrideHistory`: Array<Object>
   - `createdAt`: ISODate
   - `updatedAt`: ISODate

5. `treatment_records`
   - `_id`: ObjectId
   - `patientId`: String (Index)
   - `caseId`: String (Index)
   - `doctorId`: String
   - `diagnosisNotes`: String
   - `treatmentNotes`: String
   - `medicationNotes`: String
   - `treatmentStatus`: String
   - `createdAt`: ISODate

6. `audit_logs`
   - `_id`: ObjectId
   - `userId`: String
   - `userRole`: String
   - `action`: String
   - `entityType`: String
   - `entityId`: String
   - `oldValue`: String
   - `newValue`: String
   - `reason`: String
   - `timestamp`: ISODate (Index)
