// /maintenanceService.ts

import { api } from "@/lib/api";

const API_URL = "/maintenances";

export const getMaintenances = async () => {
  const response = await api.get(API_URL);
  return response.data;
};

export const getMaintenancesWithFilters = async (filters: { vehicle_id?: number; status?: string } = {}) => {
  const params = new URLSearchParams();
  
  if (filters.vehicle_id) {
    params.append('vehicle_id', filters.vehicle_id.toString());
  }
  
  if (filters.status) {
    params.append('status', filters.status);
  }
  
  const response = await api.get(`${API_URL}?${params.toString()}`);
  return response.data;
};

export const addMaintenance = async (data: FormData) => {
  const response = await api.post(API_URL, data, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

export const deleteMaintenance = async (id: number) => {
  const response = await api.delete(`${API_URL}/${id}`);
  return response.data;
};

export const updateMaintenance = async (id: number, data: FormData) => {
  const response = await api.put(`${API_URL}/${id}`, data, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

export const updateMaintenanceStatus = async (id: number, status: string) => {
  const response = await api.put(`${API_URL}/${id}`, 
    { status },
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
  return response.data;
};

