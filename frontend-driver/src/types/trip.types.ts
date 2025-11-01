export type TripStatus = 'in_progress' | 'completed' | 'cancelled';

export const TripStatus = {
  IN_PROGRESS: 'in_progress' as TripStatus,
  COMPLETED: 'completed' as TripStatus,
  CANCELLED: 'cancelled' as TripStatus,
};

export type DefectType = 'scratch' | 'dent' | 'broken' | 'dirty' | 'missing' | 'other';

export const DefectType = {
  SCRATCH: 'scratch' as DefectType,
  DENT: 'dent' as DefectType,
  BROKEN: 'broken' as DefectType,
  DIRTY: 'dirty' as DefectType,
  MISSING: 'missing' as DefectType,
  OTHER: 'other' as DefectType,
};

export type DefectSeverity = 'minor' | 'moderate' | 'severe';

export const DefectSeverity = {
  MINOR: 'minor' as DefectSeverity,
  MODERATE: 'moderate' as DefectSeverity,
  SEVERE: 'severe' as DefectSeverity,
};

export interface VehicleDefect {
  id: string;
  type: DefectType;
  location: string;
  severity: DefectSeverity;
  description: string;
  photos: string[];
}

export interface Location {
  lat: number;
  lng: number;
}

export interface Trip {
  id: string;
  vehicleId: string;
  driverId: string;
  tenantId: number;
  status: TripStatus;
  startKm: number;
  startFuelLevel: number;
  startPhotos: string[] | null;
  startNotes: string | null;
  startDefects: VehicleDefect[] | null;
  startedAt: string;
  startLocation: Location | null;
  endKm: number | null;
  endFuelLevel: number | null;
  endPhotos: string[] | null;
  endNotes: string | null;
  endDefects: VehicleDefect[] | null;
  endedAt: string | null;
  endLocation: Location | null;
  distanceKm: number | null;
  durationMinutes: number | null;
  createdAt: string;
  updatedAt: string;
  vehicle?: {
    id: string;
    registration: string;
    brand: string;
    model: string;
  };
}

export interface StartTripData {
  vehicleId: string;
  startKm: number;
  startFuelLevel: number;
  startPhotos: string[];
  startDefects?: VehicleDefect[];
  startNotes?: string;
  startLocation?: Location;
}

export interface EndTripData {
  endKm: number;
  endFuelLevel: number;
  endPhotos: string[];
  endDefects?: VehicleDefect[];
  endNotes?: string;
  endLocation?: Location;
}
