import axiosInstance from '../lib/axios';
import { API_CONFIG } from '../config/api';
import type {
  Availability,
  Unavailability,
  SetAvailabilityDto,
  AddUnavailabilityDto
} from '../types/partner';

interface AvailabilitiesResponse {
  message: string;
  count: number;
  availabilities: Availability[];
}

interface UnavailabilitiesResponse {
  message: string;
  count: number;
  unavailabilities: Unavailability[];
}

interface CreateAvailabilityResponse {
  message: string;
  availability?: Availability;
  availabilities?: Availability[];
}

interface CreateUnavailabilityResponse {
  message: string;
  unavailability: Unavailability;
}

export const availabilitiesService = {
  /**
   * Set multiple availability rules for the week (bulk upsert)
   */
  setWeekAvailabilities: async (availabilities: SetAvailabilityDto[]): Promise<CreateAvailabilityResponse> => {
    const { data } = await axiosInstance.post<CreateAvailabilityResponse>(
      `${API_CONFIG.ENDPOINTS.AVAILABILITIES}/bulk`,
      availabilities
    );
    return data;
  },

  /**
   * Get my availability rules
   */
  getMyAvailabilities: async (): Promise<Availability[]> => {
    const { data } = await axiosInstance.get<AvailabilitiesResponse>(
      `${API_CONFIG.ENDPOINTS.AVAILABILITIES}/me`
    );
    return data.availabilities;
  },

  /**
   * Update a single availability rule
   */
  updateAvailability: async (id: string, updates: Partial<SetAvailabilityDto>): Promise<Availability> => {
    const { data } = await axiosInstance.patch<CreateAvailabilityResponse>(
      `${API_CONFIG.ENDPOINTS.AVAILABILITIES}/${id}`,
      updates
    );
    return data.availability!;
  },

  /**
   * Delete an availability rule
   */
  deleteAvailability: async (id: string): Promise<void> => {
    await axiosInstance.delete(`${API_CONFIG.ENDPOINTS.AVAILABILITIES}/${id}`);
  },

  /**
   * Add an unavailability (closed day/time)
   */
  addUnavailability: async (unavailability: AddUnavailabilityDto): Promise<Unavailability> => {
    const { data } = await axiosInstance.post<CreateUnavailabilityResponse>(
      `${API_CONFIG.ENDPOINTS.AVAILABILITIES}/unavailability`,
      unavailability
    );
    return data.unavailability;
  },

  /**
   * Get my unavailabilities with optional date range filter
   */
  getUnavailabilities: async (startDate?: string, endDate?: string): Promise<Unavailability[]> => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);

    const { data } = await axiosInstance.get<UnavailabilitiesResponse>(
      `${API_CONFIG.ENDPOINTS.AVAILABILITIES}/unavailability/list?${params.toString()}`
    );
    return data.unavailabilities;
  },

  /**
   * Update an unavailability
   */
  updateUnavailability: async (id: string, data: AddUnavailabilityDto): Promise<Unavailability> => {
    const response = await axiosInstance.patch<CreateUnavailabilityResponse>(
      `${API_CONFIG.ENDPOINTS.AVAILABILITIES}/unavailability/${id}`,
      data
    );
    return response.data.unavailability;
  },

  /**
   * Remove an unavailability
   */
  removeUnavailability: async (id: string): Promise<void> => {
    await axiosInstance.delete(
      `${API_CONFIG.ENDPOINTS.AVAILABILITIES}/unavailability/${id}`
    );
  },
};
