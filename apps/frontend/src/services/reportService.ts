import api from './api';

export const reportService = {
  getDashboardStats: async (): Promise<any> => {
    const response = await api.get<any>('/reports/dashboard');
    return response.data;
  },

  getExtinguisherReports: async (period: 'daily' | 'monthly' | 'yearly'): Promise<any> => {
    const response = await api.get<any>(`/reports/extinguishers?period=${period}`);
    return response.data;
  },

  getInspectionReports: async (period: 'daily' | 'monthly' | 'yearly'): Promise<any> => {
    const response = await api.get<any>(`/reports/inspections?period=${period}`);
    return response.data;
  },

  getMaintenanceHistory: async (): Promise<any> => {
    const response = await api.get<any>('/reports/maintenance');
    return response.data;
  },

  getExpiredExtinguishers: async (): Promise<any> => {
    const response = await api.get<any>('/reports/expired');
    return response.data;
  },
};
