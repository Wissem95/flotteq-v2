import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { tripsService, type TripsFilters, type TripsListResponse } from '../api/services/trips.service';
import type { Trip } from '../types/trip.types';
import type { MonthlyStats, DriverPerformance } from '../types/trip-stats.types';

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

/**
 * Hook to fetch monthly statistics
 */
export function useMonthlyStats(
  startDate?: string,
  endDate?: string
): UseQueryResult<MonthlyStats[], Error> {
  return useQuery({
    queryKey: ['trips', 'monthly-stats', startDate, endDate],
    queryFn: () => tripsService.getMonthlyStats(startDate, endDate),
    staleTime: 60000,
  });
}

/**
 * Hook to fetch drivers performance
 */
export function useDriversPerformance(
  startDate?: string,
  endDate?: string
): UseQueryResult<DriverPerformance[], Error> {
  return useQuery({
    queryKey: ['trips', 'drivers-performance', startDate, endDate],
    queryFn: () => tripsService.getDriversPerformance(startDate, endDate),
    staleTime: 60000,
  });
}
