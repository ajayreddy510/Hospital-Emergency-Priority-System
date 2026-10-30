import { api } from './api';
import { ApiResponse, Doctor, DoctorAvailability } from '../types';

export const doctorService = {
  getAllDoctors: async (): Promise<Doctor[]> => {
    const res = await api.get<ApiResponse<Doctor[]>>('/doctors');
    return res.data.data;
  },

  getDoctorById: async (id: string): Promise<Doctor> => {
    const res = await api.get<ApiResponse<Doctor>>(`/doctors/${id}`);
    return res.data.data;
  },

  createDoctor: async (doctor: Doctor): Promise<Doctor> => {
    const res = await api.post<ApiResponse<Doctor>>('/doctors', doctor);
    return res.data.data;
  },

  updateAvailability: async (id: string, status: DoctorAvailability): Promise<Doctor> => {
    const res = await api.patch<ApiResponse<Doctor>>(`/doctors/${id}/status`, null, {
      params: { status },
    });
    return res.data.data;
  },
};
