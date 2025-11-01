import { api } from '../../config/api';
import type { Trip } from '../../types/trip.types';

export interface TripsFilters {
  driverId?: string;
  vehicleId?: string;
  status?: 'in_progress' | 'completed' | 'cancelled' | 'all';
  startDate?: string;
  endDate?: string;
  limit?: number;
  offset?: number;
}

export interface TripsListResponse {
  data: Trip[];
  total: number;
  page: number;
  limit: number;
}

export interface TripDetailResponse {
  trip: Trip;
}

export const tripsService = {
  /**
   * Get all trips with filters (tenant view - all drivers)
   */
  async getAllTrips(filters?: TripsFilters): Promise<TripsListResponse> {
    const params = new URLSearchParams();

    if (filters?.driverId) params.append('driverId', filters.driverId);
    if (filters?.vehicleId) params.append('vehicleId', filters.vehicleId);
    if (filters?.status && filters.status !== 'all') params.append('status', filters.status);
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);
    if (filters?.limit) params.append('limit', filters.limit.toString());
    if (filters?.offset) params.append('offset', filters.offset.toString());

    const response = await api.get<TripsListResponse>(`/trips?${params.toString()}`);
    return response.data;
  },

  /**
   * Get trip by ID
   */
  async getTripById(tripId: string): Promise<Trip> {
    const response = await api.get<TripDetailResponse>(`/trips/${tripId}`);
    return response.data.trip;
  },

  /**
   * Get trips statistics for tenant
   */
  async getTripsStats(): Promise<{
    totalTrips: number;
    totalKm: number;
    totalHours: number;
    activeTrips: number;
  }> {
    const response = await api.get('/trips/stats');
    return response.data;
  },
};
