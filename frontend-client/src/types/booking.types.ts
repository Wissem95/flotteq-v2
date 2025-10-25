export type BookingStatus = 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'rejected';

export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';

export interface Booking {
  id: string;
  partnerId: string;
  partnerName: string;
  tenantId: number;
  tenantName: string;
  tenantEmail: string;
  vehicleId: string;
  vehicleRegistration: string;
  driverId?: string;
  driverName?: string;
  serviceId: string;
  serviceName: string;
  serviceDescription?: string;
  scheduledDate: string;
  scheduledTime: string;
  endTime?: string;
  status: BookingStatus;
  price: number;
  commissionAmount?: number;
  paymentStatus: PaymentStatus;
  customerNotes?: string;
  partnerNotes?: string;
  rejectionReason?: string;
  cancellationReason?: string;
  confirmedAt?: string;
  completedAt?: string;
  paidAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBookingDto {
  partnerId: string;
  serviceId: string;
  vehicleId: string;
  driverId?: string;
  scheduledDate: string;
  scheduledTime: string;
  endTime?: string;
  customerNotes?: string;
}

export interface BookingFilterDto {
  partnerId?: string;
  vehicleId?: string;
  driverId?: string;
  status?: BookingStatus;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export interface BookingListResponse {
  bookings: Booking[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
