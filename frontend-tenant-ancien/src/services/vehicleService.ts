// 📁 frontend/src/services/vehicleService.ts

import { api } from "@/lib/api";

// Type pour les inspections techniques
export interface TechnicalInspection {
  id: number;
  vehicle_id: number;
  date: string;
  result: string;
  notes?: string | null;
  created_at: string;
  updated_at: string;
}

// Type pour les maintenances
export interface Maintenance {
  id: number;
  vehicle_id: number;
  type: string;
  date: string;
  description?: string | null;
  cost?: number | null;
  status: string;
  created_at: string;
  updated_at: string;
}

// Type pour les factures
export interface Invoice {
  id: number;
  vehicle_id: number;
  amount: number;
  date: string;
  description?: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

// Type pour l'utilisateur
export interface User {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  username?: string | null;
  created_at: string;
  updated_at: string;
}

// Type pour les données JSON converties depuis FormData
export interface VehicleJsonData {
  immatriculation?: string;
  marque?: string;
  modele?: string;
  vin?: string | null;
  annee?: number | null;
  kilometrage?: number | null;
  carburant?: string | null;
  transmission?: string | null;
  couleur?: string | null;
  puissance?: number | null;
  purchase_date?: string | null;
  purchase_price?: number | null;
  status?: string;
  notes?: string | null;
  [key: string]: string | number | null | undefined;
}

export interface VehiclePayload {
  immatriculation: string;
  marque: string;
  modele: string;
  vin?: string | null;
  annee?: number | null;
  kilometrage?: number | null;
  carburant?: string | null;
  transmission?: string | null;
  couleur?: string | null;
  puissance?: number | null;
  purchase_date?: string | null;
  purchase_price?: number | null;
  status?: "active" | "vendu" | "en_reparation" | "hors_service";
  notes?: string | null;
}

export interface Vehicle {
  id: number;
  immatriculation: string;
  marque: string;
  modele: string;
  vin?: string | null;
  annee?: number | null;
  kilometrage?: number | null;
  carburant?: string | null;
  transmission?: string | null;
  couleur?: string | null;
  puissance?: number | null;
  purchase_date?: string | null;
  purchase_price?: number | null;
  status?: string | null;
  notes?: string | null;
  user_id: number;
  tenant_id: number;
  // Champs CT (contrôle technique) - peuvent venir des relations
  last_ct_date?: string | null;
  next_ct_date?: string | null;
  technical_inspections?: TechnicalInspection[];
  maintenances?: Maintenance[];
  invoices?: Invoice[];
  user?: User;
}

export async function fetchVehicles(): Promise<Vehicle[]> {
  const { data } = await api.get<{data: Vehicle[]}>(`/vehicles?t=${Date.now()}`);
  return data.data; // Récupérer les véhicules depuis la réponse paginée
}

export async function fetchVehicleById(id: string): Promise<Vehicle> {
  const { data } = await api.get<{data: Vehicle}>(`/vehicles/${id}`);
  return data.data; // L'API retourne aussi une structure avec data pour un véhicule individuel
}

export async function createVehicle(
  payload: FormData
): Promise<Vehicle> {
  // Convertir FormData en objet JSON pour les types corrects
  const jsonData: VehicleJsonData = {};
  for (const [key, value] of payload.entries()) {
    if (key === "photos" || key === "documents") continue; // Ignorer les fichiers pour l'instant
    
    // Convertir les champs numériques
    if (["annee", "kilometrage", "puissance", "purchase_price"].includes(key)) {
      jsonData[key] = value ? parseInt(value.toString(), 10) : null;
    } else if (key === "purchase_date") {
      jsonData[key] = value ? value.toString() : null;
    } else {
      jsonData[key] = value.toString();
    }
  }
  
  const { data } = await api.post<{message: string, vehicle: Vehicle}>("/vehicles", jsonData, {
    headers: { "Content-Type": "application/json" },
  });
  return data.vehicle;
}

export async function updateVehicle(
  id: number,
  payload: FormData
): Promise<Vehicle> {
  // Convertir FormData en objet JSON pour les types corrects
  const jsonData: VehicleJsonData = {};
  for (const [key, value] of payload.entries()) {
    if (key === "photos" || key === "documents") continue; // Ignorer les fichiers pour l'instant
    
    // Convertir les champs numériques
    if (["annee", "kilometrage", "puissance", "purchase_price"].includes(key)) {
      jsonData[key] = value ? parseInt(value.toString(), 10) : null;
    } else if (key === "purchase_date") {
      jsonData[key] = value ? value.toString() : null;
    } else {
      jsonData[key] = value.toString();
    }
  }
  
  const { data } = await api.put<{message: string, vehicle: Vehicle}>(`/vehicles/${id}`, jsonData, {
    headers: { "Content-Type": "application/json" },
  });
  return data.vehicle;
}

export async function updateVehicleStatus(
  id: number,
  status: string
): Promise<Vehicle> {
  const { data } = await api.put<{message: string, vehicle: Vehicle}>(`/vehicles/${id}`, 
    { status },
    { headers: { "Content-Type": "application/json" } }
  );
  return data.vehicle;
}

export async function deleteVehicle(id: number): Promise<void> {
  await api.delete(`/vehicles/${id}`);
}

export async function fetchVehicleHistory(): Promise<unknown[]> {
  const { data } = await api.get<unknown[]>("/vehicles/history");
  return data;
}

