// partnersService.ts - Service de gestion des partenaires FlotteQ

import { api } from "@/lib/api";

// Types pour les partenaires
export interface Partner {
  id: number;
  name: string;
  type: 'garage' | 'controle_technique' | 'assurance';
  email: string;
  phone: string;
  website?: string;
  description?: string;
  status: 'active' | 'inactive' | 'pending';
  address: {
    street: string;
    city: string;
    postal_code: string;
    country: string;
    latitude?: number;
    longitude?: number;
  };
  services: string[];
  certifications?: string[];
  pricing?: {
    service_type: string;
    price_min: number;
    price_max: number;
    currency: string;
  }[];
  availability: {
    monday: { open: string; close: string; } | null;
    tuesday: { open: string; close: string; } | null;
    wednesday: { open: string; close: string; } | null;
    thursday: { open: string; close: string; } | null;
    friday: { open: string; close: string; } | null;
    saturday: { open: string; close: string; } | null;
    sunday: { open: string; close: string; } | null;
  };
  coverage_zone?: {
    radius_km: number;
    cities: string[];
  };
  rating?: {
    average: number;
    total_reviews: number;
  };
  contact_person?: {
    name: string;
    role: string;
    email: string;
    phone: string;
  };
  created_at: string;
  updated_at: string;
}

export interface CreatePartnerData {
  name: string;
  type: 'garage' | 'controle_technique' | 'assurance';
  email: string;
  phone: string;
  website?: string;
  description?: string;
  address: {
    street: string;
    city: string;
    postal_code: string;
    country: string;
  };
  services: string[];
  certifications?: string[];
  contact_person?: {
    name: string;
    role: string;
    email: string;
    phone: string;
  };
}

export interface PartnerFilters {
  type?: 'garage' | 'controle_technique' | 'assurance';
  status?: 'active' | 'inactive' | 'pending';
  city?: string;
  services?: string[];
  search?: string;
  latitude?: number;
  longitude?: number;
  radius_km?: number;
}

export interface PartnerStats {
  total: number;
  by_type: {
    garage: number;
    controle_technique: number;
    assurance: number;
  };
  by_status: {
    active: number;
    inactive: number;
    pending: number;
  };
  top_cities: Array<{
    city: string;
    count: number;
  }>;
  coverage_stats: {
    total_covered_cities: number;
    average_coverage_radius: number;
  };
}

/**
 * Service de gestion des partenaires FlotteQ - Updated for Production Integration
 */
export const partnersService = {
  /**
   * Récupérer tous les partenaires avec filtres (Internal API)
   */
  async getPartners(
    page: number = 1,
    perPage: number = 20,
    filters?: PartnerFilters
  ): Promise<{
    data: Partner[];
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
  }> {
    try {
      let url = `/partners?page=${page}&per_page=${perPage}`;
      
      if (filters) {
        const params = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            if (Array.isArray(value)) {
              value.forEach(v => params.append(`${key}[]`, v));
            } else {
              params.append(key, value.toString());
            }
          }
        });
        url += `&${params.toString()}`;
      }
      
      const response = await api.get(url);
      return response.data;
    } catch (error: any) {
      console.error("Erreur lors de la récupération des partenaires:", error);
      throw new Error(error.response?.data?.message || "Erreur lors de la récupération");
    }
  },

  /**
   * Récupérer un partenaire par ID (Internal API)
   */
  async getPartner(id: number): Promise<Partner> {
    try {
      const response = await api.get(`/partners/${id}`);
      return response.data;
    } catch (error: any) {
      console.error(`Erreur lors de la récupération du partenaire ${id}:`, error);
      throw new Error(error.response?.data?.message || "Partenaire non trouvé");
    }
  },

  /**
   * Créer un nouveau partenaire (Internal API)
   */
  async createPartner(data: CreatePartnerData): Promise<Partner> {
    try {
      const response = await api.post('/partners', data);
      return response.data;
    } catch (error: any) {
      console.error("Erreur lors de la création du partenaire:", error);
      throw new Error(error.response?.data?.message || "Erreur lors de la création");
    }
  },

  /**
   * Mettre à jour un partenaire (Internal API)
   */
  async updatePartner(id: number, data: Partial<CreatePartnerData>): Promise<Partner> {
    try {
      const response = await api.put(`/partners/${id}`, data);
      return response.data;
    } catch (error: any) {
      console.error(`Erreur lors de la mise à jour du partenaire ${id}:`, error);
      throw new Error(error.response?.data?.message || "Erreur lors de la mise à jour");
    }
  },

  /**
   * Supprimer un partenaire (Internal API)
   */
  async deletePartner(id: number): Promise<{ message: string }> {
    try {
      const response = await api.delete(`/partners/${id}`);
      return response.data;
    } catch (error: any) {
      console.error(`Erreur lors de la suppression du partenaire ${id}:`, error);
      throw new Error(error.response?.data?.message || "Erreur lors de la suppression");
    }
  },

  /**
   * Activer/désactiver un partenaire (Internal API)
   */
  async togglePartnerStatus(id: number, isActive: boolean): Promise<Partner> {
    try {
      const response = await api.put(`/partners/${id}`, { is_active: isActive });
      return response.data;
    } catch (error: any) {
      console.error(`Erreur lors du changement de statut du partenaire ${id}:`, error);
      throw new Error(error.response?.data?.message || "Erreur lors du changement de statut");
    }
  },

  /**
   * Vérifier/désvérifier un partenaire (Internal API)
   */
  async togglePartnerVerification(id: number, isVerified: boolean): Promise<Partner> {
    try {
      const response = await api.put(`/partners/${id}`, { is_verified: isVerified });
      return response.data;
    } catch (error: any) {
      console.error(`Erreur lors du changement de vérification du partenaire ${id}:`, error);
      throw new Error(error.response?.data?.message || "Erreur lors du changement de vérification");
    }
  },

  /**
   * Récupérer les statistiques des partenaires (Internal API)
   */
  async getPartnerStats(): Promise<PartnerStats> {
    try {
      const response = await api.get('/partners/statistics');
      return response.data;
    } catch (error: any) {
      console.error("Erreur lors de la récupération des statistiques:", error);
      throw new Error(error.response?.data?.message || "Erreur lors de la récupération des statistiques");
    }
  },

  /**
   * Rechercher des partenaires par géolocalisation
   */
  async findPartnersByLocation(
    latitude: number,
    longitude: number,
    radius_km: number = 50,
    type?: 'garage' | 'controle_technique' | 'assurance'
  ): Promise<Array<Partner & { distance_km: number }>> {
    try {
      const params = new URLSearchParams({
        latitude: latitude.toString(),
        longitude: longitude.toString(),
        radius_km: radius_km.toString(),
      });
      
      if (type) {
        params.append('type', type);
      }
      
      const response = await api.get(`/partners/nearby?${params.toString()}`);
      return response.data.partners;
    } catch (error: any) {
      console.error("Erreur lors de la recherche géolocalisée:", error);
      throw new Error(error.response?.data?.message || "Erreur lors de la recherche");
    }
  },

  /**
   * Géocoder une adresse
   */
  async geocodeAddress(address: string): Promise<{
    latitude: number;
    longitude: number;
    formatted_address: string;
  }> {
    try {
      const response = await api.post('/partners/geocode', { address });
      return response.data;
    } catch (error: any) {
      console.error("Erreur lors du géocodage:", error);
      throw new Error(error.response?.data?.message || "Erreur lors du géocodage");
    }
  },

  /**
   * Exporter les partenaires (CSV, Excel)
   */
  async exportPartners(format: 'csv' | 'excel', filters?: PartnerFilters): Promise<Blob> {
    try {
      let url = `/partners/export?format=${format}`;
      
      if (filters) {
        const params = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            if (Array.isArray(value)) {
              value.forEach(v => params.append(`${key}[]`, v));
            } else {
              params.append(key, value.toString());
            }
          }
        });
        url += `&${params.toString()}`;
      }
      
      const response = await api.get(url, {
        responseType: 'blob'
      });
      
      return response.data;
    } catch (error: any) {
      console.error("Erreur lors de l'export:", error);
      throw new Error(error.response?.data?.message || "Erreur lors de l'export");
    }
  }
}; 