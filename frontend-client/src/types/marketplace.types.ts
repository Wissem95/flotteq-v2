export interface MarketplacePartner {
  id: string;
  companyName: string;
  type: 'garage' | 'bodyshop' | 'tire_specialist' | 'car_wash' | 'inspection_center' | 'rental' | 'other';
  city: string;
  address: string;
  phone?: string;
  rating: number;
  totalReviews: number;
  services: PartnerService[];
  distance?: number;
  nextAvailableSlot?: string;
  relevanceScore?: number;
  hasAvailability: boolean;
}

export interface PartnerService {
  id: string;
  name: string;
  description?: string;
  price: number;
  durationMinutes: number;
  isActive: boolean;
}

export interface SearchPartnersParams {
  latitude: number;
  longitude: number;
  radius?: number; // km
  type?: string;
  services?: string[];
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  availableFrom?: string;
  availableTo?: string;
  sortBy?: 'distance' | 'rating' | 'price' | 'relevance';
  page?: number;
  limit?: number;
}

export interface SearchPartnersResponse {
  data: MarketplacePartner[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

export interface AvailableSlot {
  start: string;
  end: string;
  available: boolean;
}

export interface AvailableSlotsResponse {
  date: string;
  slots: AvailableSlot[];
}
