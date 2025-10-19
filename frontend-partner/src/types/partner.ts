export interface PartnerUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  partnerId: string;
  role?: string;
  partner?: {
    id: string;
    companyName: string;
    type: string;
    status: 'pending' | 'approved' | 'rejected' | 'suspended';
  };
}

export interface Partner {
  id: string;
  companyName: string;
  siret: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  latitude?: number;
  longitude?: number;
  type: 'garage' | 'car_wash' | 'body_shop' | 'tire_shop' | 'towing' | 'inspection' | 'rental' | 'other';
  status: 'pending' | 'approved' | 'rejected' | 'suspended';
  commissionRate: number;
  createdAt: string;
  updatedAt: string;
}

export interface PartnerService {
  id: string;
  partnerId: string;
  name: string;
  description?: string;
  price: number | string; // API returns string from PostgreSQL DECIMAL
  durationMinutes: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Booking {
  id: string;
  partnerId: string;
  tenantId: number;
  vehicleId: string;
  serviceId: string;
  scheduledDate: string;
  scheduledTime: string;
  endTime?: string;
  status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'rejected';
  price: number | string;
  commissionAmount?: number;

  // Nested objects (from backend with relations)
  service?: {
    id: string;
    name: string;
    description?: string;
    price: number | string;
    durationMinutes?: number;
  };
  vehicle?: {
    id: string;
    registration: string;
    brand: string;
    model: string;
  };
  tenant?: {
    id: number;
    name: string;
    email: string;
    phone?: string;
  };
  driver?: {
    id: string;
    firstName: string;
    lastName: string;
  } | null;

  // Flat fields (from BookingResponseDto)
  partnerName?: string;
  tenantName?: string;
  tenantEmail?: string;
  vehicleRegistration?: string;
  driverName?: string;
  serviceName?: string;
  serviceDescription?: string;

  customerNotes?: string;
  partnerNotes?: string;
  rejectionReason?: string;
  cancellationReason?: string;
  notes?: string; // legacy field
  confirmedAt?: string;
  completedAt?: string;
  cancelledAt?: string;
  paidAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Availability {
  id: string;
  partnerId: string;
  dayOfWeek: number; // 0-6 (Sunday to Saturday)
  dayName?: string; // Monday, Tuesday, etc.
  startTime: string; // HH:mm format
  endTime: string; // HH:mm format
  slotDuration: number; // in minutes (5-120)
  totalSlots?: number; // calculated on backend
  createdAt: string;
  updatedAt: string;
}

export interface Unavailability {
  id: string;
  partnerId: string;
  date: string; // YYYY-MM-DD format
  reason: string;
  isFullDay: boolean;
  startTime?: string; // HH:mm format (if partial)
  endTime?: string; // HH:mm format (if partial)
  createdAt: string;
  updatedAt: string;
}

export interface SetAvailabilityDto {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  slotDuration: number;
}

export interface AddUnavailabilityDto {
  date: string;
  reason: string;
  isFullDay: boolean;
  startTime?: string;
  endTime?: string;
}

export interface UpdateServiceDto {
  name?: string;
  description?: string;
  price?: number;
  durationMinutes?: number;
  isActive?: boolean;
}

export interface Commission {
  id: string;
  partnerId: string;
  bookingId: string;
  booking?: Booking; // Relation chargée par backend
  amount: number;
  rate: number;
  status: 'pending' | 'paid' | 'cancelled';
  paidAt?: string;
  paymentReference?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CommissionStats {
  totalEarned: number;
  totalPending: number;
  totalPaid: number;
  monthlyEarnings: Array<{
    month: string;
    amount: number;
  }>;
}

// Booking DTOs
export interface RescheduleBookingDto {
  scheduledDate: string;
  scheduledTime: string;
  endTime: string;
}

export interface CompleteBookingDto {
  partnerNotes: string;
  photos?: File[];
}

export interface RejectBookingDto {
  reason: string;
}

export interface BookingFilters {
  status?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface CommissionFilters {
  status?: 'pending' | 'paid' | 'cancelled' | 'all';
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export interface CommissionTotalDto {
  status: 'pending' | 'paid' | 'cancelled';
  totalAmount: number;
  count: number;
}
