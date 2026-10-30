import { api } from './api';
import { ApiResponse } from '../types';

export const reportService = {
  getReport: async (type = 'daily'): Promise<Record<string, any>> => {
    const res = await api.get<ApiResponse<Record<string, any>>>('/reports', {
      params: { type },
    });
    return res.data.data;
  },

  downloadCsv: async (type = 'daily'): Promise<Blob> => {
    const res = await api.get('/reports/export/csv', {
      params: { type },
      responseType: 'blob',
    });
    return res.data;
  },
};
