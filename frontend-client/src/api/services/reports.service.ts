import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export interface Report {
  id: string;
  vehicleId: string;
  vehicleRegistration?: string;
  driverId: string;
  driverName?: string;
  type: 'mechanical' | 'accident' | 'damage' | 'cleaning' | 'other';
  description: string;
  notes: string | null;
  status: 'open' | 'acknowledged' | 'resolved';
  photos: string[] | null;
  acknowledgedAt: Date | null;
  acknowledgedBy: string | null;
  acknowledgedByName: string | null;
  resolvedAt: Date | null;
  resolvedBy: string | null;
  resolvedByName: string | null;
  resolutionNotes: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateReportDto {
  vehicleId: string;
  type: 'mechanical' | 'accident' | 'damage' | 'cleaning' | 'other';
  description: string;
  notes?: string;
}

export interface ReportListResponse {
  data: Report[];
  total: number;
  page: number;
  limit: number;
}

export interface ReportFilterParams {
  type?: 'mechanical' | 'accident' | 'damage' | 'cleaning' | 'other';
  status?: 'open' | 'acknowledged' | 'resolved';
  vehicleId?: string;
  driverId?: string;
  page?: number;
  limit?: number;
}

export const reportsService = {
  // Driver endpoints
  async createDriverReport(reportDto: Omit<CreateReportDto, 'vehicleId'>): Promise<{ message: string; reportId: string; status: string }> {
    const response = await axios.post(`${API_URL}/api/driver/reports`, reportDto);
    return response.data;
  },

  async getDriverReports(): Promise<Report[]> {
    const response = await axios.get(`${API_URL}/api/driver/reports`);
    return response.data;
  },

  // Tenant admin endpoints
  async getAllReports(filters?: ReportFilterParams): Promise<ReportListResponse> {
    const response = await axios.get(`${API_URL}/api/reports`, { params: filters });
    return response.data;
  },

  async getReportById(id: string): Promise<Report> {
    const response = await axios.get(`${API_URL}/api/reports/${id}`);
    return response.data;
  },

  async acknowledgeReport(id: string): Promise<Report> {
    const response = await axios.patch(`${API_URL}/api/reports/${id}/acknowledge`);
    return response.data;
  },

  async resolveReport(id: string, resolutionNotes?: string): Promise<Report> {
    const response = await axios.patch(`${API_URL}/api/reports/${id}/resolve`, {
      resolutionNotes,
    });
    return response.data;
  },

  async updateReport(id: string, updates: { status?: string; resolutionNotes?: string }): Promise<Report> {
    const response = await axios.patch(`${API_URL}/api/reports/${id}`, updates);
    return response.data;
  },

  // Upload photos for report
  async uploadReportPhotos(reportId: string, photos: File[]): Promise<void> {
    const formData = new FormData();
    photos.forEach((photo) => {
      formData.append('photos', photo);
    });

    await axios.post(`${API_URL}/api/reports/${reportId}/photos`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
};

export default reportsService;
