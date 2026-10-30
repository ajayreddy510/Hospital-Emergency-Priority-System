import { api } from './api';
import { ApiResponse, CaseStatus, EmergencyCase, EmergencyLevel } from '../types';

export interface PriorityOverridePayload {
  newLevel: EmergencyLevel;
  customScore?: number;
  reason: string;
}

export const emergencyService = {
  getAllCases: async (): Promise<EmergencyCase[]> => {
    const res = await api.get<ApiResponse<EmergencyCase[]>>('/emergency-cases');
    return res.data.data;
  },

  getCaseById: async (id: string): Promise<EmergencyCase> => {
    const res = await api.get<ApiResponse<EmergencyCase>>(`/emergency-cases/${id}`);
    return res.data.data;
  },

  createCase: async (payload: Partial<EmergencyCase>): Promise<EmergencyCase> => {
    const res = await api.post<ApiResponse<EmergencyCase>>('/emergency-cases', payload);
    return res.data.data;
  },

  overridePriority: async (id: string, payload: PriorityOverridePayload): Promise<EmergencyCase> => {
    const res = await api.patch<ApiResponse<EmergencyCase>>(`/emergency-cases/${id}/priority`, payload);
    return res.data.data;
  },

  assignDoctor: async (id: string, doctorId: string, notes?: string): Promise<EmergencyCase> => {
    const res = await api.post<ApiResponse<EmergencyCase>>(`/emergency-cases/${id}/assign-doctor`, { doctorId, notes });
    return res.data.data;
  },

  updateStatus: async (id: string, status: CaseStatus): Promise<EmergencyCase> => {
    const res = await api.patch<ApiResponse<EmergencyCase>>(`/emergency-cases/${id}/status`, null, {
      params: { status },
    });
    return res.data.data;
  },
};
