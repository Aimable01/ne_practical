import api from './api';
import type { Extinguisher, PaginatedResponse } from '../types';

export const extinguisherService = {
  getAll: async (page = 1, limit = 10): Promise<PaginatedResponse<Extinguisher>> => {
    const response = await api.get<PaginatedResponse<Extinguisher>>(`/extinguishers?page=${page}&limit=${limit}`);
    return response.data;
  },

  getById: async (id: string): Promise<{ extinguisher: Extinguisher }> => {
    const response = await api.get<{ extinguisher: Extinguisher }>(`/extinguishers/${id}`);
    return response.data;
  },

  create: async (data: Omit<Extinguisher, 'id' | 'createdAt' | 'updatedAt'>): Promise<{ message: string; extinguisher: Extinguisher }> => {
    const response = await api.post<{ message: string; extinguisher: Extinguisher }>('/extinguishers', data);
    return response.data;
  },

  update: async (id: string, data: Partial<Omit<Extinguisher, 'id' | 'createdAt' | 'updatedAt'>>): Promise<{ message: string; extinguisher: Extinguisher }> => {
    const response = await api.put<{ message: string; extinguisher: Extinguisher }>(`/extinguishers/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<{ message: string }> => {
    const response = await api.delete<{ message: string }>(`/extinguishers/${id}`);
    return response.data;
  },
};
