import api from './api';
import type { Maintenance, PaginatedResponse } from '../types';

export const maintenanceService = {
  getAll: async (page = 1, limit = 10): Promise<PaginatedResponse<Maintenance>> => {
    const response = await api.get<PaginatedResponse<Maintenance>>(`/maintenance?page=${page}&limit=${limit}`);
    return response.data;
  },

  getMyMaintenance: async (page = 1, limit = 10): Promise<PaginatedResponse<Maintenance>> => {
    const response = await api.get<PaginatedResponse<Maintenance>>(`/maintenance/my?page=${page}&limit=${limit}`);
    return response.data;
  },

  getByExtinguisher: async (extinguisherId: string, page = 1, limit = 10): Promise<PaginatedResponse<Maintenance>> => {
    const response = await api.get<PaginatedResponse<Maintenance>>(`/maintenance/extinguisher/${extinguisherId}?page=${page}&limit=${limit}`);
    return response.data;
  },

  getById: async (id: string): Promise<{ maintenance: Maintenance }> => {
    const response = await api.get<{ maintenance: Maintenance }>(`/maintenance/${id}`);
    return response.data;
  },

  create: async (data: Omit<Maintenance, 'id' | 'createdAt' | 'updatedAt' | 'inspector' | 'extinguisher'>): Promise<{ message: string; maintenance: Maintenance }> => {
    const response = await api.post<{ message: string; maintenance: Maintenance }>('/maintenance', data);
    return response.data;
  },
};
