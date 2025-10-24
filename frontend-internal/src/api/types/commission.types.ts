export enum CommissionStatus {
  PENDING = 'pending',
  PAID = 'paid',
  CANCELLED = 'cancelled',
}

export interface Commission {
  id: string;
  partnerId: string;
  partnerName: string;
  bookingId: string;
  bookingReference: string;
  amount: number;
  status: CommissionStatus;
  paidAt: Date | null;
  paymentReference: string | null;
  createdAt: Date;
  updatedAt: Date;
  booking?: {
    tenant?: { id: number; name: string };
    vehicle?: { id: string; registration: string; brand: string; model: string };
    service?: { id: string; name: string };
  };
}

export interface CommissionStats {
  totalThisMonth: number;
  pendingAmount: number;
  activePartners: number;
  platformRevenue: number;
  evolution: CommissionEvolution[];
  topPartners: TopPartner[];
}

export interface CommissionEvolution {
  month: string;
  commissions: number;
  revenue: number;
}

export interface TopPartner {
  rank: number;
  partnerId: string;
  partnerName: string;
  bookingsCount: number;
  revenue: number;
  commissions: number;
}

export interface CommissionsListResponse {
  data: Commission[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CommissionFilterParams {
  page?: number;
  limit?: number;
  partnerId?: string;
  status?: CommissionStatus;
  startDate?: string;
  endDate?: string;
}

export interface MarkPaidDto {
  paymentReference: string;
}
