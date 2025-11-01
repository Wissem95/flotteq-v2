import api from '@/config/api';

export interface UpdateMileageData {
  mileage: number;
  notes?: string;
}

export interface MileageHistoryItem {
  id: string;
  vehicleId: string;
  mileage: number;
  previousMileage: number | null;
  difference: number;
  source: 'manual' | 'maintenance' | 'inspection';
  notes: string | null;
  recordedAt: string;
}

export interface MileageHistoryResponse {
  vehicle: {
    id: string;
    registration: string;
    brand: string;
    model: string;
    currentKm: number;
  };
  history: MileageHistoryItem[];
  total: number;
}

export const mileageService = {
  async updateMileage(data: UpdateMileageData) {
    const response = await api.post('/driver/vehicle/mileage', data);
    return response.data;
  },

  async getHistory(): Promise<MileageHistoryResponse> {
    const response = await api.get('/driver/vehicle/mileage-history');
    return response.data;
  },
};
