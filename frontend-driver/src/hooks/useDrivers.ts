import { useQuery } from '@tanstack/react-query';
import { driversService } from '../api/services/drivers.service';

export const useDrivers = () => {
  return useQuery({
    queryKey: ['drivers'],
    queryFn: () => driversService.getDrivers(),
  });
};

export const useDriver = (id: string) => {
  return useQuery({
    queryKey: ['driver', id],
    queryFn: () => driversService.getDriver(id),
    enabled: !!id,
  });
};

export const useAvailableDrivers = () => {
  return useQuery({
    queryKey: ['drivers', 'available'],
    queryFn: () => driversService.getAvailableDrivers(),
  });
};
