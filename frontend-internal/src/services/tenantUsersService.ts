// tenantUsersService.ts - Service pour la gestion des utilisateurs des tenants

import { api } from '@/lib/api';

export interface TenantUser {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  username?: string;
  tenant_id: string;
  tenant?: {
    id: string;
    name: string;
    domain?: string;
  };
  role?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  stats?: {
    days_since_registration: number;
    account_status: 'active' | 'suspended';
  };
}

export interface TenantUsersStats {
  total_users: number;
  active_users: number;
  inactive_users: number;
  users_by_tenant: Array<{
    tenant_id: string;
    count: number;
    tenant?: { 
      id: string;
      name: string; 
    };
  }>;
  recent_registrations: number;
  recent_logins: number;
}

export interface TenantUsersFilters {
  page?: number;
  per_page?: number;
  search?: string;
  tenant_id?: string;
  status?: 'all' | 'active' | 'inactive';
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

export interface TenantUsersResponse {
  users: {
    data: TenantUser[];
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
  };
  stats: TenantUsersStats;
  tenants: Array<{
    id: string;
    name: string;
  }>;
}

export interface UpdateTenantUserData {
  first_name?: string;
  last_name?: string;
  email?: string;
  is_active?: boolean;
  tenant_id?: string;
  password?: string;
}

/**
 * Service pour la gestion des utilisateurs des tenants (clients FlotteQ)
 * Distinct des employés internes FlotteQ
 */
class TenantUsersService {

  /**
   * Récupérer tous les utilisateurs des tenants avec filtres et statistiques
   */
  async getAll(filters?: TenantUsersFilters): Promise<TenantUsersResponse> {
    try {
      const params = new URLSearchParams();
      
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== 'all') {
            params.append(key, value.toString());
          }
        });
      }

      const url = params.toString() 
        ? `/internal/tenant-users?${params.toString()}`
        : '/internal/tenant-users';

      const response = await api.get(url);
      return response.data;
    } catch (error: any) {
      console.error('Erreur lors de la récupération des utilisateurs des tenants:', error);
      throw new Error(error.response?.data?.error || 'Erreur lors de la récupération des utilisateurs');
    }
  }

  /**
   * Récupérer un utilisateur spécifique par ID
   */
  async getById(userId: string): Promise<TenantUser> {
    try {
      const response = await api.get(`/internal/tenant-users/${userId}`);
      return response.data;
    } catch (error: any) {
      console.error(`Erreur lors de la récupération de l'utilisateur ${userId}:`, error);
      throw new Error(error.response?.data?.error || 'Utilisateur non trouvé');
    }
  }

  /**
   * Mettre à jour un utilisateur
   */
  async update(userId: string, data: UpdateTenantUserData): Promise<{
    message: string;
    user: TenantUser;
  }> {
    try {
      const response = await api.put(`/internal/tenant-users/${userId}`, data);
      return response.data;
    } catch (error: any) {
      console.error(`Erreur lors de la mise à jour de l'utilisateur ${userId}:`, error);
      throw new Error(error.response?.data?.error || 'Erreur lors de la mise à jour');
    }
  }

  /**
   * Basculer le statut actif/inactif d'un utilisateur
   */
  async toggleStatus(userId: string): Promise<{
    message: string;
    user: TenantUser;
  }> {
    try {
      const response = await api.post(`/internal/tenant-users/${userId}/toggle-status`);
      return response.data;
    } catch (error: any) {
      console.error(`Erreur lors du changement de statut de l'utilisateur ${userId}:`, error);
      throw new Error(error.response?.data?.error || 'Erreur lors du changement de statut');
    }
  }

  /**
   * Supprimer un utilisateur
   */
  async delete(userId: string): Promise<{
    message: string;
  }> {
    try {
      const response = await api.delete(`/internal/tenant-users/${userId}`);
      return response.data;
    } catch (error: any) {
      console.error(`Erreur lors de la suppression de l'utilisateur ${userId}:`, error);
      throw new Error(error.response?.data?.error || 'Erreur lors de la suppression');
    }
  }

  /**
   * Exporter la liste des utilisateurs en CSV
   */
  async export(filters?: TenantUsersFilters): Promise<{
    data: Array<Record<string, any>>;
    filename: string;
  }> {
    try {
      const params = new URLSearchParams();
      
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== 'all') {
            params.append(key, value.toString());
          }
        });
      }

      const url = params.toString() 
        ? `/internal/tenant-users/export?${params.toString()}`
        : '/internal/tenant-users/export';

      const response = await api.get(url);
      return response.data;
    } catch (error: any) {
      console.error('Erreur lors de l\'export des utilisateurs:', error);
      throw new Error(error.response?.data?.error || 'Erreur lors de l\'export');
    }
  }

  /**
   * Convertir les données d'export en format CSV téléchargeable
   */
  async exportAndDownload(filters?: TenantUsersFilters): Promise<void> {
    try {
      const exportData = await this.export(filters);
      
      if (!exportData.data || exportData.data.length === 0) {
        throw new Error('Aucune donnée à exporter');
      }

      // Convertir en CSV
      const csv = this.convertToCSV(exportData.data);
      
      // Télécharger le fichier
      this.downloadCSV(csv, exportData.filename);
    } catch (error: any) {
      console.error('Erreur lors de l\'export et téléchargement:', error);
      throw error;
    }
  }

  /**
   * Convertir un tableau d'objets en format CSV
   */
  private convertToCSV(data: Array<Record<string, any>>): string {
    if (!data || data.length === 0) {
      return '';
    }

    // Récupérer les en-têtes
    const headers = Object.keys(data[0]);
    const csvHeaders = headers.join(',');

    // Convertir les lignes en CSV
    const csvRows = data.map(row => {
      return headers.map(header => {
        const value = row[header];
        // Échapper les valeurs qui contiennent des virgules ou des guillemets
        if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value || '';
      }).join(',');
    });

    return [csvHeaders, ...csvRows].join('\n');
  }

  /**
   * Télécharger un contenu CSV
   */
  private downloadCSV(csv: string, filename: string): void {
    // Créer un Blob avec BOM UTF-8 pour l'encodage correct
    const BOM = '\uFEFF';
    const blob = new Blob([BOM + csv], { 
      type: 'text/csv;charset=utf-8;'
    });
    
    // Créer un lien de téléchargement temporaire
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    
    // Ajouter au DOM, cliquer, puis supprimer
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Nettoyer l'URL
    URL.revokeObjectURL(url);
  }

  /**
   * Rechercher des utilisateurs (raccourci pour getAll avec recherche)
   */
  async search(query: string, filters?: Omit<TenantUsersFilters, 'search'>): Promise<TenantUsersResponse> {
    return this.getAll({
      ...filters,
      search: query
    });
  }

  /**
   * Récupérer les statistiques uniquement (sans les utilisateurs)
   */
  async getStats(): Promise<TenantUsersStats> {
    try {
      const response = await this.getAll({ per_page: 1 }); // Récupérer juste 1 utilisateur pour avoir les stats
      return response.stats;
    } catch (error: any) {
      console.error('Erreur lors de la récupération des statistiques:', error);
      throw error;
    }
  }
}

// Instance unique du service
export const tenantUsersService = new TenantUsersService();
export default tenantUsersService;