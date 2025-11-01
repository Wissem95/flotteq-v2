import api from '../../config/api';
import type { Report, CreateReportDto, ReportType, ReportStatus } from '../../types/report.types';

export interface ReportListResponse {
  data: Report[];
  total: number;
  page: number;
  limit: number;
}

export interface ReportFilterParams {
  type?: ReportType;
  status?: ReportStatus;
  vehicleId?: string;
  driverId?: string;
  page?: number;
  limit?: number;
}

export const reportsService = {
  // Driver endpoints
  async createDriverReport(reportDto: Omit<CreateReportDto, 'vehicleId'>): Promise<{ message: string; reportId: string; status: string }> {
    const response = await api.post('/driver/reports', reportDto);
    return response.data;
  },

  async getDriverReports(): Promise<Report[]> {
    const response = await api.get('/driver/reports');
    return response.data;
  },

  // Tenant admin endpoints
  async getAllReports(filters?: ReportFilterParams): Promise<ReportListResponse> {
    const response = await api.get('/reports', { params: filters });
    return response.data;
  },

  async getReportById(id: string): Promise<Report> {
    const response = await api.get(`/reports/${id}`);
    return response.data;
  },

  async acknowledgeReport(id: string): Promise<Report> {
    const response = await api.patch(`/reports/${id}/acknowledge`);
    return response.data;
  },

  async resolveReport(id: string, resolutionNotes?: string): Promise<Report> {
    const response = await api.patch(`/reports/${id}/resolve`, {
      resolutionNotes,
    });
    return response.data;
  },

  async updateReport(id: string, updates: { status?: string; resolutionNotes?: string }): Promise<Report> {
    const response = await api.patch(`/reports/${id}`, updates);
    return response.data;
  },

  // Upload photos for report (driver endpoint)
  async uploadReportPhotos(reportId: string, photos: File[]): Promise<void> {
    const formData = new FormData();
    photos.forEach((photo) => {
      formData.append('photos', photo);
    });

    await api.post(`/driver/reports/${reportId}/photos`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
};

export default reportsService;
