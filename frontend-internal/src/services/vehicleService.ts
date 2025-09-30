// 📁 frontend/src/services/vehicleService.ts

import axios from "@/lib/api";

export interface VehiclePayload {
  plaque: string;
  marque: string;
  modele: string;
  numero_serie?: string | null;
  annee?: number | null;
  kilometrage?: number | null;
  carburant?: string | null;
  type?: string | null;
  couleur?: string | null;
  annee_mise_en_circulation?: number | null;
  annee_achat?: number | null;
  puissance?: number | null;
  purchaseDate?: string | null;
  purchasePrice?: number | null;
  last_ct_date?: string | null;
  next_ct_date?: string | null;
  driver?: string | null;
  status?: "active" | "inactive" | "maintenance" | "warning";
  notes?: string | null;
  // plus tard : driver, etc.
}

export interface Vehicle {
  id: number;
  plaque: string;
  marque: string;
  modele: string;
  numero_serie?: string | null;
  annee?: number | null;
  kilometrage?: number | null;
  carburant?: string | null;
  type?: string | null;
  couleur?: string | null;
  annee_mise_en_circulation?: number | null;
  annee_achat?: number | null;
  puissance?: number | null;
  purchaseDate?: string | null;
  purchasePrice?: number | null;
  last_ct_date?: string | null;
  next_ct_date?: string | null;
  driver?: string | null;
  status?: string | null;
  notes?: string | null;
  userId: number;
}

export async function fetchVehicles(): Promise<Vehicle[]> {
  const { data } = await axios.get<Vehicle[]>("/vehicles");
  return data;
}

export async function fetchVehicleById(id: string): Promise<Vehicle> {
  const { data } = await axios.get<Vehicle>(`/vehicles/${id}`);
  return data;
}

export async function createVehicle(
  payload: FormData
): Promise<Vehicle> {
  const { data } = await axios.post<Vehicle>("/vehicles", payload, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
}

export async function updateVehicle(
  id: number,
  payload: FormData
): Promise<Vehicle> {
  const { data } = await axios.put<Vehicle>(`/vehicles/${id}`, payload, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
}

export async function deleteVehicle(id: number): Promise<void> {
  await axios.delete(`/vehicles/${id}`);
}

export async function fetchVehicleHistory(): Promise<any[]> {
  const { data } = await axios.get<any[]>("/vehicles/history");
  return data;
}

