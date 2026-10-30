import { api } from './api';
import { ApiResponse, QueueItem } from '../types';

export const queueService = {
  getActiveQueue: async (): Promise<QueueItem[]> => {
    const res = await api.get<ApiResponse<QueueItem[]>>('/queue');
    return res.data.data;
  },

  getNextPatient: async (): Promise<QueueItem | null> => {
    const res = await api.get<ApiResponse<QueueItem | null>>('/queue/next');
    return res.data.data;
  },
};
