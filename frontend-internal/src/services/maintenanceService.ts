// /maintenanceService.ts

import axios from "@/lib/api";

const API_URL = "/maintenances";

export const getMaintenances = async () => {
  const response = await axios.get(API_URL);
  return response.data;
};

export const addMaintenance = async (data: FormData) => {
  const response = await axios.post(API_URL, data, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

export const deleteMaintenance = async (id: number) => {
  const response = await axios.delete(`${API_URL}/${id}`);
  return response.data;
};

export const updateMaintenance = async (id: number, data: FormData) => {
  const response = await axios.put(`${API_URL}/${id}`, data, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

