import { api } from '../../config/api';
import type { Trip, StartTripData, EndTripData } from '../../types/trip.types';

export const tripsService = {
  /**
   * Démarrer un nouveau trip
   */
  async startTrip(data: StartTripData): Promise<Trip> {
    const response = await api.post<Trip>('/driver/trips/start', data);
    return response.data;
  },

  /**
   * Terminer un trip
   */
  async endTrip(tripId: string, data: EndTripData): Promise<Trip> {
    const response = await api.post<Trip>(`/driver/trips/${tripId}/end`, data);
    return response.data;
  },

  /**
   * Obtenir le trip en cours
   */
  async getCurrentTrip(): Promise<Trip | null> {
    const response = await api.get<Trip | null>('/driver/trips/current');
    return response.data;
  },

  /**
   * Obtenir l'historique des trips
   */
  async getTripHistory(params?: {
    page?: number;
    limit?: number;
    dateFrom?: string;
    dateTo?: string;
  }): Promise<{
    data: Trip[];
    total: number;
    page: number;
    limit: number;
  }> {
    const response = await api.get('/driver/trips/history', { params });
    return response.data;
  },
};
