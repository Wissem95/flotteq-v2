import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { maintenanceService } from '../api/services/maintenance.service';
import {
  CreateMaintenanceDto,
  UpdateMaintenanceDto,
  CreateMaintenanceTemplateDto,
  CreateMaintenanceFromTemplateDto,
} from '../types/maintenance.types';

export const useMaintenances = () => {
  return useQuery({
    queryKey: ['maintenances'],
    queryFn: () => maintenanceService.getAll(),
  });
};

export const useMaintenance = (id: string) => {
  return useQuery({
    queryKey: ['maintenance', id],
    queryFn: () => maintenanceService.getById(id),
    enabled: !!id,
  });
};

export const useVehicleMaintenances = (vehicleId: string) => {
  return useQuery({
    queryKey: ['maintenances', 'vehicle', vehicleId],
    queryFn: () => maintenanceService.getByVehicle(vehicleId),
    enabled: !!vehicleId,
  });
};

export const useUpcomingMaintenances = (daysAhead: number = 7) => {
  return useQuery({
    queryKey: ['maintenances', 'upcoming', daysAhead],
    queryFn: () => maintenanceService.getUpcomingAlerts(daysAhead),
  });
};

export const useKmAlerts = () => {
  return useQuery({
    queryKey: ['maintenances', 'km-alerts'],
    queryFn: () => maintenanceService.getKmAlerts(),
  });
};

export const useCreateMaintenance = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: CreateMaintenanceDto) => maintenanceService.create(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenances'] });
    },
  });
};

export const useUpdateMaintenance = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateMaintenanceDto }) =>
      maintenanceService.update(id, dto),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['maintenances'] });
      queryClient.invalidateQueries({ queryKey: ['maintenance', id] });
    },
  });
};

export const useDeleteMaintenance = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => maintenanceService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenances'] });
    },
  });
};

// Templates hooks
export const useMaintenanceTemplates = () => {
  return useQuery({
    queryKey: ['maintenance-templates'],
    queryFn: () => maintenanceService.getAllTemplates(),
  });
};

export const useCreateMaintenanceTemplate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: CreateMaintenanceTemplateDto) => maintenanceService.createTemplate(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenance-templates'] });
    },
  });
};

export const useCreateFromTemplate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ templateId, dto }: { templateId: string; dto: CreateMaintenanceFromTemplateDto }) =>
      maintenanceService.createFromTemplate(templateId, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenances'] });
    },
  });
};
