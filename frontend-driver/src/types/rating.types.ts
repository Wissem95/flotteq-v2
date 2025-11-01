export interface Rating {
  id: string;
  bookingId: string;
  partnerId: string;
  partnerName: string;
  tenantId: number;
  tenantName: string;
  rating: number; // 1-5
  comment?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateRatingDto {
  bookingId: string;
  rating: number; // 1-5
  comment?: string;
}

export interface RatingListResponse {
  ratings: Rating[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
