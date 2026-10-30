import { api } from './api';
import { ApiResponse, AuditLog } from '../types';
import { PaginatedResponse } from './patientService';

export const auditService = {
  getAuditLogs: async (page = 0, size = 20): Promise<PaginatedResponse<AuditLog>> => {
    const res = await api.get<ApiResponse<PaginatedResponse<AuditLog>>>('/audit-logs', {
      params: { page, size },
    });
    return res.data.data;
  },
};
