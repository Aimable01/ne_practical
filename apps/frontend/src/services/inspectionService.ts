import api from './api';
import type { Inspection, PaginatedResponse } from '../types';

export const inspectionService = {
  getAll: async (page = 1, limit = 10): Promise<PaginatedResponse<Inspection>> => {
    const response = await api.get<PaginatedResponse<Inspection>>(`/inspections?page=${page}&limit=${limit}`);
    return response.data;
  },

  getMyInspections: async (page = 1, limit = 10): Promise<PaginatedResponse<Inspection>> => {
    const response = await api.get<PaginatedResponse<Inspection>>(`/inspections/my?page=${page}&limit=${limit}`);
    return response.data;
  },

  getById: async (id: string): Promise<{ inspection: Inspection }> => {
    const response = await api.get<{ inspection: Inspection }>(`/inspections/${id}`);
    return response.data;
  },

  create: async (data: Omit<Inspection, 'id' | 'createdAt' | 'updatedAt' | 'inspector' | 'extinguisher' | 'notified'>): Promise<{ message: string; inspection: Inspection }> => {
    const response = await api.post<{ message: string; inspection: Inspection }>('/inspections', data);
    return response.data;
  },

  update: async (id: string, data: Partial<Omit<Inspection, 'id' | 'createdAt' | 'updatedAt' | 'inspector' | 'extinguisher'>>): Promise<{ message: string; inspection: Inspection }> => {
    const response = await api.put<{ message: string; inspection: Inspection }>(`/inspections/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<{ message: string }> => {
    const response = await api.delete<{ message: string }>(`/inspections/${id}`);
    return response.data;
  },
};
