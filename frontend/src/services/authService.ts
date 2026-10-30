import { api } from './api';
import { ApiResponse, User } from '../types';

export interface LoginResponseData {
  token: string;
  user: User;
}

export const authService = {
  login: async (email: string, password: string): Promise<LoginResponseData> => {
    const res = await api.post<ApiResponse<LoginResponseData>>('/auth/login', { email, password });
    return res.data.data;
  },

  register: async (name: string, email: string, password: string, role: string): Promise<LoginResponseData> => {
    const res = await api.post<ApiResponse<LoginResponseData>>('/auth/register', { name, email, password, role });
    return res.data.data;
  },

  getCurrentUser: async (): Promise<User> => {
    const res = await api.get<ApiResponse<User>>('/auth/me');
    return res.data.data;
  },
};
