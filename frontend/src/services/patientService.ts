import { api } from './api';
import { ApiResponse, Patient } from '../types';

export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

export const patientService = {
  getPatients: async (page = 0, size = 10, search = ''): Promise<PaginatedResponse<Patient>> => {
    const res = await api.get<ApiResponse<PaginatedResponse<Patient>>>('/patients', {
      params: { page, size, search },
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

  deletePatient: async (id: string): Promise<void> => {
    await api.delete(`/patients/${id}`);
  },
};
