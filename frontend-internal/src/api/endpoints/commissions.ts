import { apiClient } from '../httpClient';
import type {
  Commission,
  CommissionStats,
  CommissionsListResponse,
  CommissionFilterParams,
  MarkPaidDto,
} from '../types/commission.types';

export const commissionsApi = {
  getAll: async (params?: CommissionFilterParams): Promise<CommissionsListResponse> => {
    const response = await apiClient.get<CommissionsListResponse>('/commissions', {
      params,
    });
    return response.data;
  },

  getStats: async (startDate?: string, endDate?: string): Promise<CommissionStats> => {
    const response = await apiClient.get<{ message: string; stats: CommissionStats }>(
      '/commissions/stats',
      {
        params: { startDate, endDate },
      }
    );
    return response.data.stats;
  },

  getPending: async (): Promise<Commission[]> => {
    const response = await apiClient.get<{
      message: string;
      count: number;
      commissions: Commission[];
    }>('/commissions/pending');
    return response.data.commissions;
  },

  getOne: async (id: string): Promise<Commission> => {
    const response = await apiClient.get<{ message: string; commission: Commission }>(
      `/commissions/${id}`
    );
    return response.data.commission;
  },

  markAsPaid: async (id: string, data: MarkPaidDto): Promise<Commission> => {
    const response = await apiClient.patch<{ message: string; commission: Commission }>(
      `/commissions/${id}/paid`,
      data
    );
    return response.data.commission;
  },

  exportToExcel: async (params?: CommissionFilterParams): Promise<Blob> => {
    const response = await apiClient.get('/commissions/export', {
      params,
      responseType: 'blob',
    });
    return response.data;
  },
};
