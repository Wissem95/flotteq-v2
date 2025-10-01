// tenantService.ts - Service pour la gestion des tenants

import { api } from '@/lib/api';


export interface Tenant {
  id: string;
  name: string;
  domain: string;
  admin_email: string;
  admin_name: string;
  subscription_plan: string;
  status: 'active' | 'inactive' | 'suspended';
  users_count: number;
  vehicles_count: number;
  max_users: number;
  max_vehicles: number;
  description?: string;
  created_at: string;
  updated_at: string;
  last_activity: string;
  settings?: {
    features_enabled: string[];
    custom_branding: boolean;
    api_access: boolean;
  };
  billing?: {
    last_payment: string;
    next_payment: string;
    payment_status: 'current' | 'overdue' | 'cancelled';
  };
}

export interface TenantCreateData {
  name: string;
  domain: string;
  admin_email: string;
  admin_name: string;
  subscription_plan: string;
  description?: string;
  max_users: number;
  max_vehicles: number;
}

export interface TenantUpdateData extends Partial<TenantCreateData> {
  status?: Tenant['status'];
  settings?: Tenant['settings'];
}

export interface TenantFilters {
  status?: Tenant['status'];
  plan?: string;
  search?: string;
  sort_by?: 'name' | 'created_at' | 'last_activity' | 'users_count' | 'vehicles_count';
  sort_order?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface TenantStats {
  total: number;
  active: number;
  inactive: number;
  suspended: number;
  total_users: number;
  total_vehicles: number;
  monthly_growth: number;
  revenue_monthly: number;
}

class TenantService {
  // Récupérer tous les tenants avec filtres depuis Supabase uniquement
  async getAll(filters: TenantFilters = {}): Promise<{ tenants: Tenant[]; stats: TenantStats; pagination: any }> {
    try {
      const response = await api.get('/internal/tenants', { params: filters });
      const tenantsData = response.data.data || [];
      
      // Transformer les données Supabase vers le format attendu
      const tenants: Tenant[] = tenantsData.map((t: any) => ({
        id: t.id.toString(),
        name: t.name,
        domain: t.domain,
        admin_email: t.email || 'admin@' + t.domain,
        admin_name: t.name,
        subscription_plan: 'professional', // À adapter selon la DB
        status: t.is_active ? 'active' : 'inactive',
        users_count: t.users_count || 0,
        vehicles_count: t.vehicles_count || 0,
        max_users: 100, // À adapter selon le plan
        max_vehicles: 200, // À adapter selon le plan
        description: `Tenant ${t.name}`,
        created_at: t.created_at,
        updated_at: t.updated_at,
        last_activity: t.updated_at,
        settings: {
          features_enabled: ['maintenance', 'tracking', 'reports'],
          custom_branding: true,
          api_access: true
        },
        billing: {
          last_payment: t.created_at,
          next_payment: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          payment_status: 'current'
        }
      }));
      
      const stats = this.calculateStatsFromReal(tenants);
      
      return {
        tenants,
        stats,
        pagination: response.data.pagination || {
          current_page: 1,
          per_page: tenants.length,
          total: tenants.length,
          last_page: 1
        }
      };
    } catch (error: any) {
      console.error('Erreur récupération tenants depuis Supabase:', error);
      throw new Error('Impossible de récupérer les tenants');
    }
  }

  // Calculer les statistiques à partir des vraies données Supabase
  private calculateStatsFromReal(tenants: Tenant[]): TenantStats {
    return {
      total: tenants.length,
      active: tenants.filter(t => t.status === 'active').length,
      inactive: tenants.filter(t => t.status === 'inactive').length,
      suspended: tenants.filter(t => t.status === 'suspended').length,
      total_users: tenants.reduce((sum, t) => sum + t.users_count, 0),
      total_vehicles: tenants.reduce((sum, t) => sum + t.vehicles_count, 0),
      monthly_growth: tenants.length > 0 ? ((tenants.filter(t => t.status === 'active').length / tenants.length) * 100) : 0,
      revenue_monthly: tenants.length * 89.99 // Estimation basée sur le plan moyen
    };
  }

  // Récupérer un tenant par ID depuis Supabase uniquement
  async getById(id: string): Promise<Tenant> {
    try {
      const response = await api.get(`/internal/tenants/${id}`);
      const t = response.data.data;
      
      // Transformer les données Supabase vers le format attendu
      return {
        id: t.id.toString(),
        name: t.name,
        domain: t.domain,
        admin_email: t.email || 'admin@' + t.domain,
        admin_name: t.name,
        subscription_plan: 'professional',
        status: t.is_active ? 'active' : 'inactive',
        users_count: t.users_count || 0,
        vehicles_count: t.vehicles_count || 0,
        max_users: 100,
        max_vehicles: 200,
        description: `Tenant ${t.name}`,
        created_at: t.created_at,
        updated_at: t.updated_at,
        last_activity: t.updated_at,
        settings: {
          features_enabled: ['maintenance', 'tracking', 'reports'],
          custom_branding: true,
          api_access: true
        },
        billing: {
          last_payment: t.created_at,
          next_payment: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          payment_status: 'current'
        }
      };
    } catch (error: any) {
      console.error('Erreur récupération tenant depuis Supabase:', error);
      throw new Error('Tenant non trouvé');
    }
  }

  // Créer un nouveau tenant dans Supabase uniquement
  async create(data: TenantCreateData): Promise<Tenant> {
    try {
      const response = await api.post('/internal/tenants', {
        name: data.name,
        domain: data.domain,
        email: data.admin_email,
        description: data.description,
        is_active: true
      });
      
      const t = response.data.data;
      
      return {
        id: t.id.toString(),
        name: t.name,
        domain: t.domain,
        admin_email: t.email,
        admin_name: data.admin_name,
        subscription_plan: data.subscription_plan,
        status: 'active',
        users_count: 1,
        vehicles_count: 0,
        max_users: data.max_users,
        max_vehicles: data.max_vehicles,
        description: data.description,
        created_at: t.created_at,
        updated_at: t.updated_at,
        last_activity: t.created_at,
        settings: {
          features_enabled: ['maintenance', 'tracking'],
          custom_branding: data.subscription_plan !== 'starter',
          api_access: data.subscription_plan === 'enterprise'
        },
        billing: {
          last_payment: t.created_at,
          next_payment: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          payment_status: 'current'
        }
      };
    } catch (error: any) {
      console.error('Erreur création tenant dans Supabase:', error);
      throw new Error('Impossible de créer le tenant');
    }
  }

  // Mettre à jour un tenant dans Supabase uniquement
  async update(id: string, data: TenantUpdateData): Promise<Tenant> {
    try {
      const updateData = {
        name: data.name,
        domain: data.domain,
        email: data.admin_email,
        is_active: data.status === 'active'
      };
      
      const response = await api.put(`/internal/tenants/${id}`, updateData);
      const t = response.data.data;
      
      return {
        id: t.id.toString(),
        name: t.name,
        domain: t.domain,
        admin_email: t.email,
        admin_name: data.admin_name || t.name,
        subscription_plan: data.subscription_plan || 'professional',
        status: t.is_active ? 'active' : 'inactive',
        users_count: t.users_count || 0,
        vehicles_count: t.vehicles_count || 0,
        max_users: data.max_users || 100,
        max_vehicles: data.max_vehicles || 200,
        description: data.description,
        created_at: t.created_at,
        updated_at: t.updated_at,
        last_activity: t.updated_at,
        settings: data.settings || {
          features_enabled: ['maintenance', 'tracking', 'reports'],
          custom_branding: true,
          api_access: true
        },
        billing: {
          last_payment: t.created_at,
          next_payment: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          payment_status: 'current'
        }
      };
    } catch (error: any) {
      console.error('Erreur mise à jour tenant dans Supabase:', error);
      throw new Error('Impossible de mettre à jour le tenant');
    }
  }

  // Suspendre un tenant dans Supabase
  async suspend(id: string, reason?: string): Promise<void> {
    try {
      await api.put(`/internal/tenants/${id}`, { is_active: false });
    } catch (error: any) {
      console.error('Erreur suspension tenant dans Supabase:', error);
      throw new Error('Impossible de suspendre le tenant');
    }
  }

  // Réactiver un tenant dans Supabase
  async activate(id: string): Promise<void> {
    try {
      await api.put(`/internal/tenants/${id}`, { is_active: true });
    } catch (error: any) {
      console.error('Erreur activation tenant dans Supabase:', error);
      throw new Error('Impossible de réactiver le tenant');
    }
  }

  // Supprimer un tenant dans Supabase
  async delete(id: string): Promise<void> {
    try {
      await api.delete(`/internal/tenants/${id}`);
    } catch (error: any) {
      console.error('Erreur suppression tenant dans Supabase:', error);
      throw new Error('Impossible de supprimer le tenant');
    }
  }


  // Obtenir les détails d'utilisation d'un tenant depuis les vraies données
  async getUsageDetails(id: string): Promise<{
    current_usage: {
      users: number;
      vehicles: number;
      storage_mb: number;
      api_calls_monthly: number;
    };
    limits: {
      users: number;
      vehicles: number;
      storage_mb: number;
      api_calls_monthly: number;
    };
    usage_percentage: {
      users: number;
      vehicles: number;
      storage: number;
      api_calls: number;
    };
  }> {
    try {
      const tenant = await this.getById(id);
      
      const currentUsers = tenant.users_count;
      const currentVehicles = tenant.vehicles_count;
      const maxUsers = tenant.max_users;
      const maxVehicles = tenant.max_vehicles;
      
      return {
        current_usage: {
          users: currentUsers,
          vehicles: currentVehicles,
          storage_mb: currentVehicles * 50, // Estimation 50MB par véhicule
          api_calls_monthly: currentUsers * 1000 // Estimation 1000 appels par utilisateur
        },
        limits: {
          users: maxUsers,
          vehicles: maxVehicles,
          storage_mb: maxVehicles * 100,
          api_calls_monthly: maxUsers * 2000
        },
        usage_percentage: {
          users: maxUsers > 0 ? Math.round((currentUsers / maxUsers) * 100) : 0,
          vehicles: maxVehicles > 0 ? Math.round((currentVehicles / maxVehicles) * 100) : 0,
          storage: maxVehicles > 0 ? Math.round(((currentVehicles * 50) / (maxVehicles * 100)) * 100) : 0,
          api_calls: maxUsers > 0 ? Math.round(((currentUsers * 1000) / (maxUsers * 2000)) * 100) : 0
        }
      };
    } catch (error) {
      console.error('Erreur récupération usage tenant:', error);
      throw new Error('Impossible de récupérer les détails d\'utilisation');
    }
  }

  // Obtenir l'historique des activités d'un tenant depuis les vraies données
  async getActivityHistory(id: string, limit: number = 50): Promise<Array<{
    id: string;
    type: 'login' | 'vehicle_added' | 'user_added' | 'maintenance' | 'payment';
    user: string;
    description: string;
    timestamp: string;
    metadata?: any;
  }>> {
    try {
      // Pour l'instant, retourner un historique basé sur les vraies données du tenant
      const tenant = await this.getById(id);
      
      const activities = [];
      
      // Ajouter l'activité de création
      activities.push({
        id: '1',
        type: 'user_added' as const,
        user: tenant.admin_name,
        description: `Création du tenant ${tenant.name}`,
        timestamp: tenant.created_at
      });
      
      // Ajouter des activités basées sur les données réelles
      if (tenant.users_count > 0) {
        activities.push({
          id: '2',
          type: 'user_added' as const,
          user: 'System',
          description: `${tenant.users_count} utilisateur(s) actif(s)`,
          timestamp: tenant.last_activity
        });
      }
      
      if (tenant.vehicles_count > 0) {
        activities.push({
          id: '3',
          type: 'vehicle_added' as const,
          user: tenant.admin_name,
          description: `${tenant.vehicles_count} véhicule(s) géré(s)`,
          timestamp: tenant.updated_at
        });
      }
      
      return activities.slice(0, limit);
    } catch (error) {
      console.error('Erreur récupération historique tenant:', error);
      throw new Error('Impossible de récupérer l\'historique des activités');
    }
  }

  // Générer un rapport d'utilisation pour un tenant
  async generateUsageReport(id: string): Promise<Blob> {
    try {
      
      const tenant = await this.getById(id);
      const usage = await this.getUsageDetails(id);
      const activities = await this.getActivityHistory(id);
      
      const reportContent = `
Rapport d'utilisation - ${tenant.name}
=====================================

Période: ${new Date().toLocaleDateString('fr-FR')}

Utilisation actuelle:
- Utilisateurs: ${usage.current_usage.users}/${usage.limits.users} (${usage.usage_percentage.users}%)
- Véhicules: ${usage.current_usage.vehicles}/${usage.limits.vehicles} (${usage.usage_percentage.vehicles}%)
- Stockage: ${usage.current_usage.storage_mb}MB/${usage.limits.storage_mb}MB (${usage.usage_percentage.storage}%)
- Appels API: ${usage.current_usage.api_calls_monthly}/${usage.limits.api_calls_monthly} (${usage.usage_percentage.api_calls}%)

Activités récentes:
${activities.map(a => `- ${new Date(a.timestamp).toLocaleDateString('fr-FR')} - ${a.description} (${a.user})`).join('\n')}
      `;
      
      return new Blob([reportContent], { type: 'text/plain' });
    } catch (error) {
      console.error('Erreur génération rapport tenant:', error);
      throw new Error('Impossible de générer le rapport d\'utilisation');
    }
  }
}

export const tenantService = new TenantService();