import { api } from './api';
import { ApiResponse, TreatmentRecord } from '../types';

export const treatmentService = {
  getTreatmentsByPatient: async (patientId: string): Promise<TreatmentRecord[]> => {
    const res = await api.get<ApiResponse<TreatmentRecord[]>>(`/treatments/patient/${patientId}`);
    return res.data.data;
  },

  getTreatmentByCase: async (caseId: string): Promise<TreatmentRecord> => {
    const res = await api.get<ApiResponse<TreatmentRecord>>(`/treatments/case/${caseId}`);
    return res.data.data;
  },

  saveTreatmentRecord: async (record: Partial<TreatmentRecord>): Promise<TreatmentRecord> => {
    const res = await api.post<ApiResponse<TreatmentRecord>>('/treatments', record);
    return res.data.data;
  },
};
