import { useQuery, type UseQueryResult } from '@tantml/react-query';
import { tripsService, type TripsFilters, type TripsListResponse } from '../api/services/trips.service';
import type { Trip } from '../types/trip.types';

/**
 * Hook to fetch all trips with filters (tenant view)
 */
export function useTripsHistory(
  filters?: TripsFilters
): UseQueryResult<TripsListResponse, Error> {
  return useQuery({
    queryKey: ['trips', filters],
    queryFn: () => tripsService.getAllTrips(filters),
    staleTime: 30000, // 30 seconds
  });
}

/**
 * Hook to fetch a single trip by ID
 */
export function useTripDetail(tripId: string): UseQueryResult<Trip, Error> {
  return useQuery({
    queryKey: ['trip', tripId],
    queryFn: () => tripsService.getTripById(tripId),
    enabled: !!tripId,
  });
}

/**
 * Hook to fetch trips statistics
 */
export function useTripsStats(): UseQueryResult<{
  totalTrips: number;
  totalKm: number;
  totalHours: number;
  activeTrips: number;
}, Error> {
  return useQuery({
    queryKey: ['trips', 'stats'],
    queryFn: () => tripsService.getTripsStats(),
    staleTime: 60000, // 1 minute
  });
}
