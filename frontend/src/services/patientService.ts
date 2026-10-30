import { api } from './api';
import { ApiResponse, Patient, TriageAssessmentResult } from '../types';

export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

export const patientService = {
  getPatients: async (
    page = 0,
    size = 10,
    search = '',
    priority?: string,
    status?: string
  ): Promise<PaginatedResponse<Patient>> => {
    const params: Record<string, any> = { page, size };
    if (search && search.trim()) params.search = search.trim();
    if (priority && priority !== 'ALL') params.priority = priority;
    if (status && status !== 'ALL') params.status = status;

    const res = await api.get<ApiResponse<PaginatedResponse<Patient>>>('/patients', {
      params,
    });
    return res.data.data;
  },

  getPatientById: async (id: string): Promise<Patient> => {
    const res = await api.get<ApiResponse<Patient>>(`/patients/${id}`);
    return res.data.data;
  },

  createPatient: async (patient: Patient): Promise<Patient> => {
    const res = await api.post<ApiResponse<Patient>>('/patients', patient);
    return res.data.data;
  },

  updatePatient: async (id: string, patient: Patient): Promise<Patient> => {
    const res = await api.put<ApiResponse<Patient>>(`/patients/${id}`, patient);
    return res.data.data;
  },

  updatePatientStatus: async (id: string, status: string, notes?: string): Promise<Patient> => {
    const res = await api.patch<ApiResponse<Patient>>(`/patients/${id}/status`, null, {
      params: { status, notes },
    });
    return res.data.data;
  },

  deletePatient: async (id: string): Promise<void> => {
    await api.delete(`/patients/${id}`);
  },

  evaluateTriage: async (data: {
    temperature?: number;
    bloodPressure?: string;
    heartRate?: number;
    respiratoryRate?: number;
    oxygenSaturation?: number;
    chiefComplaint?: string;
    symptoms?: string;
  }): Promise<TriageAssessmentResult> => {
    const res = await api.post<ApiResponse<TriageAssessmentResult>>('/patients/triage-evaluate', data);
    return res.data.data;
  },
};
