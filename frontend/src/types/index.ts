export type Role = 'ADMIN' | 'DOCTOR' | 'NURSE' | 'RECEPTIONIST';

export type EmergencyLevel = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export type CaseStatus = 'WAITING' | 'IN_TRIAGE' | 'IN_TREATMENT' | 'COMPLETED' | 'CANCELLED';

export type DoctorAvailability = 'AVAILABLE' | 'BUSY' | 'OFFLINE';

export type TreatmentStatus = 'WAITING' | 'IN_PROGRESS' | 'COMPLETED';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
}

export interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
}

export interface Patient {
  id?: string;
  patientId?: string;
  name: string;
  age: number;
  gender: string;
  phone: string;
  email?: string;
  address?: string;
  bloodGroup?: string;
  allergies?: string[];
  emergencyContact?: EmergencyContact;
  createdAt?: string;
  updatedAt?: string;
}

export interface Doctor {
  id?: string;
  doctorId?: string;
  name: string;
  specialization: string;
  department: string;
  phone?: string;
  email?: string;
  availabilityStatus: DoctorAvailability;
  currentPatientId?: string;
  activeCasesCount?: number;
  createdAt?: string;
}

export interface OverrideRecord {
  previousLevel: EmergencyLevel;
  newLevel: EmergencyLevel;
  previousScore: number;
  newScore: number;
  updatedByUserId: string;
  updatedByUserName: string;
  reason: string;
  timestamp: string;
}

export interface EmergencyCase {
  id?: string;
  caseId?: string;
  patientId: string;
  patientDetails?: Patient;
  symptoms: string;
  emergencyLevel: EmergencyLevel;
  priorityScore?: number;
  arrivalTime?: string;
  status: CaseStatus;
  assignedDoctorId?: string;
  assignedDoctorDetails?: Doctor;
  notes?: string;
  overrideHistory?: OverrideRecord[];
  createdAt?: string;
  updatedAt?: string;
}

export interface TreatmentRecord {
  id?: string;
  patientId: string;
  caseId: string;
  doctorId: string;
  diagnosisNotes?: string;
  treatmentNotes?: string;
  medicationNotes?: string;
  treatmentStatus: TreatmentStatus;
  createdAt?: string;
  updatedAt?: string;
}

export interface QueueItem {
  queuePosition: number;
  id: string;
  caseId: string;
  patientId: string;
  patientName: string;
  patientAge?: number;
  patientGender?: string;
  symptoms: string;
  emergencyLevel: EmergencyLevel;
  priorityScore: number;
  arrivalTime: string;
  formattedWaitTime: string;
  status: CaseStatus;
  assignedDoctorId?: string;
  assignedDoctorName?: string;
  createdAt: string;
}

export interface DashboardSummary {
  totalPatients: number;
  activeEmergencyCases: number;
  criticalCasesCount: number;
  highCasesCount: number;
  mediumCasesCount: number;
  lowCasesCount: number;
  availableDoctorsCount: number;
  waitingPatientsCount: number;
  completedCasesToday: number;
  averageWaitTimeMinutes: number;
  topPriorityQueue: QueueItem[];
  levelDistribution: Array<{ level: string; count: number; color: string }>;
  hourlyCases: Array<{ hourLabel: string; count: number }>;
  doctorWorkloads: Array<{
    doctorId: string;
    doctorName: string;
    specialization: string;
    availability: string;
    activeCases: number;
  }>;
}

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  userRole: Role;
  action: string;
  entityType: string;
  entityId: string;
  oldValue?: string;
  newValue?: string;
  reason?: string;
  timestamp: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  errorCode?: string;
  timestamp: string;
}
