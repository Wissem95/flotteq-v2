import { api } from '@/lib/api';

export interface Partner {
  id: number;
  name: string;
  type: 'garage' | 'controle_technique' | 'assurance';
  description?: string;
  email?: string;
  phone?: string;
  website?: string;
  address: string;
  city: string;
  postal_code: string;
  country: string;
  latitude: number;
  longitude: number;
  services?: string[];
  pricing?: Record<string, number>;
  availability?: Record<string, string[]>;
  rating: number;
  rating_count: number;
  is_active: boolean;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
  distance?: number;
  tenant_relation?: {
    distance: number;
    is_preferred: boolean;
    tenant_rating?: number;
    tenant_comment?: string;
    booking_count: number;
    last_booking_at?: string;
    last_interaction_at?: string;
    custom_pricing?: Record<string, number>;
  };
}

export interface FindNearbyParams {
  latitude: number;
  longitude: number;
  radius?: number;
  type?: 'garage' | 'controle_technique' | 'assurance';
  service?: string;
}

export interface RatePartnerData {
  rating: number;
  comment?: string;
}

export interface BookPartnerData {
  service_type: string;
  preferred_date: string;
  preferred_time: string;
  vehicle_id: number;
  notes?: string;
}

export interface BookingResponse {
  message: string;
  booking_id: string;
  partner: Partner;
  details: BookPartnerData;
}

/**
 * Service de gestion des partenaires pour les tenants (clients FlotteQ)
 */
class PartnersService {
  private readonly basePath = '/partners';

  /**
   * Rechercher des partenaires près d'une localisation
   */
  async findNearby(params: FindNearbyParams): Promise<Partner[]> {
    try {
      const response = await api.post<Partner[]>(`${this.basePath}/find-nearby`, params);
      return response.data;
    } catch (error: any) {
      console.error('Erreur lors de la recherche de partenaires:', error);
      throw new Error(error.response?.data?.message || 'Erreur lors de la recherche');
    }
  }

  /**
   * Noter un partenaire
   */
  async ratePartner(partnerId: number, data: RatePartnerData): Promise<{
    message: string;
    partner: Partner;
    relation: any;
  }> {
    try {
      const response = await api.post(`${this.basePath}/${partnerId}/rate`, data);
      return response.data;
    } catch (error: any) {
      console.error('Erreur lors de la notation du partenaire:', error);
      throw new Error(error.response?.data?.message || 'Erreur lors de la notation');
    }
  }

  /**
   * Réserver un service avec un partenaire
   */
  async bookService(partnerId: number, data: BookPartnerData): Promise<BookingResponse> {
    try {
      const response = await api.post<BookingResponse>(`${this.basePath}/${partnerId}/book`, data);
      return response.data;
    } catch (error: any) {
      console.error('Erreur lors de la réservation:', error);
      throw new Error(error.response?.data?.message || 'Erreur lors de la réservation');
    }
  }

  /**
   * Rechercher des garages pour un type de service spécifique
   */
  async findGaragesForService(
    latitude: number,
    longitude: number,
    serviceType: string,
    radius: number = 25
  ): Promise<Partner[]> {
    return this.findNearby({
      latitude,
      longitude,
      radius,
      type: 'garage',
      service: serviceType
    });
  }

  /**
   * Rechercher des centres de contrôle technique
   */
  async findControleTechnique(
    latitude: number,
    longitude: number,
    radius: number = 50
  ): Promise<Partner[]> {
    return this.findNearby({
      latitude,
      longitude,
      radius,
      type: 'controle_technique'
    });
  }

  /**
   * Rechercher des assurances
   */
  async findAssurances(
    latitude: number,
    longitude: number
  ): Promise<Partner[]> {
    return this.findNearby({
      latitude,
      longitude,
      radius: 100, // Plus large pour les assurances
      type: 'assurance'
    });
  }

  /**
   * Obtenir la géolocalisation actuelle de l'utilisateur
   */
  async getCurrentLocation(): Promise<{ latitude: number; longitude: number }> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('La géolocalisation n\'est pas supportée par ce navigateur'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
        },
        (error) => {
          reject(new Error('Impossible d\'obtenir votre position : ' + error.message));
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000 // 5 minutes
        }
      );
    });
  }

  /**
   * Géocoder une adresse via OpenStreetMap
   */
  async geocodeAddress(address: string): Promise<{ latitude: number; longitude: number } | null> {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1&countrycodes=fr`
      );
      
      const data = await response.json();
      
      if (data && data.length > 0) {
        return {
          latitude: parseFloat(data[0].lat),
          longitude: parseFloat(data[0].lon)
        };
      }
      
      return null;
    } catch (error) {
      console.error('Erreur de géocodage:', error);
      return null;
    }
  }

  /**
   * Calculer la distance entre deux points
   */
  calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371; // Rayon de la Terre en km
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) *
        Math.cos(this.deg2rad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance en km
  }

  private deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }

  /**
   * Formater la distance pour l'affichage
   */
  formatDistance(distance?: number): string {
    if (!distance) return '';
    return distance < 1
      ? `${Math.round(distance * 1000)}m`
      : `${distance.toFixed(1)}km`;
  }

  /**
   * Formater la note pour l'affichage
   */
  formatRating(rating: number, count: number): string {
    if (count === 0) return 'Aucune note';
    return `${rating.toFixed(1)}/5 (${count} avis)`;
  }

  /**
   * Obtenir le libellé du type de partenaire
   */
  getPartnerTypeLabel(type: string): string {
    const labels = {
      garage: 'Garage',
      controle_technique: 'Contrôle Technique',
      assurance: 'Assurance'
    };
    return labels[type as keyof typeof labels] || type;
  }

  /**
   * Obtenir l'icône du type de partenaire
   */
  getPartnerTypeIcon(type: string): string {
    const icons = {
      garage: '🔧',
      controle_technique: '🔍',
      assurance: '🛡️'
    };
    return icons[type as keyof typeof icons] || '📍';
  }

  /**
   * Vérifier si un partenaire est ouvert maintenant
   */
  isOpenNow(availability?: Record<string, string[]>): boolean {
    if (!availability) return false;

    const now = new Date();
    const dayName = now.toLocaleDateString('fr-FR', { weekday: 'long' }).toLowerCase();
    const currentTime = now.toTimeString().slice(0, 5); // HH:MM

    const todaySlots = availability[dayName];
    if (!todaySlots || todaySlots.length === 0) return false;

    return todaySlots.some(slot => {
      const [start, end] = slot.split('-');
      return currentTime >= start && currentTime <= end;
    });
  }

  /**
   * Obtenir les créneaux disponibles pour aujourd'hui
   */
  getTodaySlots(availability?: Record<string, string[]>): string[] {
    if (!availability) return [];

    const today = new Date().toLocaleDateString('fr-FR', { weekday: 'long' }).toLowerCase();
    return availability[today] || [];
  }

  /**
   * Obtenir le statut d'ouverture
   */
  getOpenStatus(availability?: Record<string, string[]>): {
    isOpen: boolean;
    status: string;
    nextSlot?: string;
  } {
    const isOpen = this.isOpenNow(availability);
    const todaySlots = this.getTodaySlots(availability);

    if (isOpen) {
      return { isOpen: true, status: 'Ouvert maintenant' };
    }

    if (todaySlots.length > 0) {
      const nextSlot = todaySlots.find(slot => {
        const [start] = slot.split('-');
        const currentTime = new Date().toTimeString().slice(0, 5);
        return start > currentTime;
      });

      if (nextSlot) {
        const [start] = nextSlot.split('-');
        return {
          isOpen: false,
          status: `Ouvre à ${start}`,
          nextSlot: start
        };
      }
    }

    return { isOpen: false, status: 'Fermé' };
  }

  /**
   * Trier les partenaires par pertinence
   */
  sortPartnersByRelevance(partners: Partner[]): Partner[] {
    return partners.sort((a, b) => {
      // Priorité : vérifié > actif > distance > note
      if (a.is_verified !== b.is_verified) {
        return b.is_verified ? 1 : -1;
      }
      
      if (a.is_active !== b.is_active) {
        return b.is_active ? 1 : -1;
      }
      
      if (a.distance !== b.distance) {
        return (a.distance || 999) - (b.distance || 999);
      }
      
      return b.rating - a.rating;
    });
  }

  /**
   * Filtrer les partenaires par service
   */
  filterByService(partners: Partner[], service: string): Partner[] {
    return partners.filter(partner => 
      partner.services?.includes(service)
    );
  }

  /**
   * Obtenir les services disponibles pour un type de partenaire
   */
  getAvailableServices(type: string): string[] {
    const services = {
      garage: [
        'entretien',
        'reparation',
        'carrosserie',
        'pneus',
        'diagnostic',
        'climatisation',
        'freins',
        'vidange'
      ],
      controle_technique: [
        'controle_technique',
        'contre_visite',
        'diagnostic_pollution'
      ],
      assurance: [
        'assurance_flotte',
        'assistance_24h',
        'gestion_sinistres',
        'expertise'
      ]
    };
    
    return services[type as keyof typeof services] || [];
  }
}

export const partnersService = new PartnersService();