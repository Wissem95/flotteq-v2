import { useQuery } from '@tanstack/react-query';
import { vehiclesService } from '../api/services/vehicles.service';

export const useVehicles = () => {
  return useQuery({
    queryKey: ['vehicles'],
    queryFn: () => vehiclesService.getAll(),
  });
};

export const useVehicle = (id: string) => {
  return useQuery({
    queryKey: ['vehicle', id],
    queryFn: () => vehiclesService.getById(id),
    enabled: !!id,
  });
};
