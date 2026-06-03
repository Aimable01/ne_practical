import api from './api';
import type { DashboardStats, Extinguisher, Inspection, Maintenance } from '../types';

export const reportService = {
  getDashboardStats: async (): Promise<DashboardStats> => {
    const response = await api.get<DashboardStats>('/reports/dashboard');
    return response.data;
  },

  getExtinguisherReports: async (period: 'daily' | 'monthly' | 'yearly'): Promise<{ extinguishers: Extinguisher[] }> => {
    const response = await api.get<{ extinguishers: Extinguisher[] }>(`/reports/extinguishers?period=${period}`);
    return response.data;
  },

  getInspectionReports: async (period: 'daily' | 'monthly' | 'yearly'): Promise<{ inspections: Inspection[] }> => {
    const response = await api.get<{ inspections: Inspection[] }>(`/reports/inspections?period=${period}`);
    return response.data;
  },

  getMaintenanceHistory: async (): Promise<{ maintenance: Maintenance[] }> => {
    const response = await api.get<{ maintenance: Maintenance[] }>('/reports/maintenance');
    return response.data;
  },

  getExpiredExtinguishers: async (): Promise<{ extinguishers: Extinguisher[] }> => {
    const response = await api.get<{ extinguishers: Extinguisher[] }>('/reports/expired');
    return response.data;
  },
};
