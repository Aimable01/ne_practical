import api from './api';
import type { Maintenance } from '../types';

export interface MaintenancePaginatedResponse {
  maintenanceRecords: Maintenance[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
    totalPages?: number;
  };
}

export const maintenanceService = {
  getAll: async (page = 1, limit = 10): Promise<MaintenancePaginatedResponse> => {
    const response = await api.get<MaintenancePaginatedResponse>(`/maintenance?page=${page}&limit=${limit}`);
    return response.data;
  },

  getMyMaintenance: async (page = 1, limit = 10): Promise<MaintenancePaginatedResponse> => {
    const response = await api.get<MaintenancePaginatedResponse>(`/maintenance/my?page=${page}&limit=${limit}`);
    return response.data;
  },

  getByExtinguisher: async (extinguisherId: string, page = 1, limit = 10): Promise<MaintenancePaginatedResponse> => {
    const response = await api.get<MaintenancePaginatedResponse>(`/maintenance/extinguisher/${extinguisherId}?page=${page}&limit=${limit}`);
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
