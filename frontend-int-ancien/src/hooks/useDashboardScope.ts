// hooks/useDashboardScope.ts - Hook pour la gestion du scope hybride global/tenant

import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';
import { toast } from '@/hooks/use-toast';

interface DashboardStats {
  scope: 'global' | 'tenant';
  tenant_info?: {
    id: string;
    name: string;
    domain?: string;
  } | null;
  stats: {
    tenants: {
      total: number;
      active: number;
    };
    vehicles: {
      total: number;
      active: number;
      in_maintenance: number;
    };
    users: {
      total: number;
      active: number;
      inactive: number;
    };
    maintenances: {
      pending: number;
      upcoming_30_days: number;
    };
    alerts: {
      critical: number;
      total: number;
    };
  };
  generated_at: string;
}

interface MaintenanceItem {
  id: number;
  vehicle_name: string;
  license_plate: string;
  maintenance_type: string;
  scheduled_date: string;
  tenant_name: string;
  status: string;
}

interface AlertItem {
  id: string;
  title: string;
  description: string;
  severity: 'critical' | 'medium' | 'low';
  category: string;
  created_at: string;
  tenant_name?: string;
}

interface Tenant {
  id: string;
  name: string;
  domain: string;
  is_active: boolean;
  users_count: number;
  vehicles_count: number;
  display_label: string;
}

interface UseDashboardScopeReturn {
  // État du scope
  selectedTenantId: string | null;
  setSelectedTenantId: (tenantId: string | null) => void;
  
  // Données du dashboard
  stats: DashboardStats | null;
  upcomingMaintenances: MaintenanceItem[];
  systemAlerts: AlertItem[];
  
  // Liste des tenants pour le sélecteur
  availableTenants: Tenant[];
  
  // États de chargement
  loading: boolean;
  tenantsLoading: boolean;
  error: string | null;
  
  // Méthodes
  loadData: () => Promise<void>;
  refreshData: () => Promise<void>;
}

export const useDashboardScope = (): UseDashboardScopeReturn => {
  // État du scope sélectionné
  const [selectedTenantId, setSelectedTenantId] = useState<string | null>(null);
  
  // Données du dashboard
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [upcomingMaintenances, setUpcomingMaintenances] = useState<MaintenanceItem[]>([]);
  const [systemAlerts, setSystemAlerts] = useState<AlertItem[]>([]);
  
  // Liste des tenants disponibles
  const [availableTenants, setAvailableTenants] = useState<Tenant[]>([]);
  
  // États de chargement et erreurs
  const [loading, setLoading] = useState(false);
  const [tenantsLoading, setTenantsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Construire les paramètres de requête selon le scope
  const buildParams = useCallback((tenantId: string | null) => {
    return tenantId ? `?tenant_id=${tenantId}` : '';
  }, []);

  // Charger la liste des tenants (une seule fois)
  const loadTenants = useCallback(async () => {
    if (availableTenants.length > 0) return; // Déjà chargé
    
    try {
      setTenantsLoading(true);
      const response = await api.get('/internal/dashboard/tenants-list');
      setAvailableTenants(response.data.tenants || []);
    } catch (error) {
      console.error('Erreur chargement tenants:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger la liste des tenants",
        variant: "destructive"
      });
    } finally {
      setTenantsLoading(false);
    }
  }, [availableTenants.length]);

  // Charger toutes les données du dashboard
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = buildParams(selectedTenantId);
      
      // Charger toutes les données en parallèle
      const [statsResponse, maintenancesResponse, alertsResponse] = await Promise.all([
        api.get(`/internal/dashboard/stats${params}`),
        api.get(`/internal/dashboard/upcoming-maintenances${params}&limit=5`),
        api.get(`/internal/dashboard/alerts${params}&limit=5`)
      ]);

      setStats(statsResponse.data);
      setUpcomingMaintenances(maintenancesResponse.data.data || []);
      setSystemAlerts(alertsResponse.data.data || []);
      
    } catch (error: any) {
      console.error('Erreur chargement dashboard:', error);
      const errorMessage = error.response?.data?.message || 'Impossible de charger les données du dashboard';
      setError(errorMessage);
      
      toast({
        title: "Erreur",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [selectedTenantId, buildParams]);

  // Méthode de rafraîchissement
  const refreshData = useCallback(async () => {
    await loadData();
    toast({
      title: "Données actualisées",
      description: "Les données du dashboard ont été mises à jour",
    });
  }, [loadData]);

  // Charger les tenants au montage du composant
  useEffect(() => {
    loadTenants();
  }, [loadTenants]);

  // Recharger les données quand le tenant sélectionné change
  useEffect(() => {
    loadData();
  }, [selectedTenantId, loadData]);

  // Helper pour obtenir les informations du tenant sélectionné
  const getSelectedTenantInfo = useCallback(() => {
    if (!selectedTenantId || !availableTenants.length) return null;
    return availableTenants.find(t => t.id === selectedTenantId) || null;
  }, [selectedTenantId, availableTenants]);

  // Helper pour déterminer si on est en mode global
  const isGlobalScope = !selectedTenantId;

  // Helper pour obtenir le titre de la page
  const getPageTitle = useCallback(() => {
    if (isGlobalScope) {
      return 'Dashboard Global - Vue d\'ensemble de la plateforme';
    }
    const tenant = getSelectedTenantInfo();
    return `Dashboard - ${tenant?.name || 'Tenant'}`;
  }, [isGlobalScope, getSelectedTenantInfo]);

  // Helper pour obtenir le nombre total d'éléments selon le contexte
  const getTotalItemsLabel = useCallback((type: 'tenants' | 'vehicles' | 'users') => {
    if (!stats) return '';
    
    if (isGlobalScope) {
      switch (type) {
        case 'tenants':
          return `${stats.stats.tenants.total} au total`;
        case 'vehicles':
          return `${stats.stats.vehicles.total} enregistrés`;
        case 'users':
          return `${stats.stats.users.total} inscrits`;
      }
    } else {
      // En mode tenant spécifique, on adapte les labels
      switch (type) {
        case 'vehicles':
          return `${stats.stats.vehicles.total} dans ce tenant`;
        case 'users':
          return `${stats.stats.users.total} dans ce tenant`;
        default:
          return '';
      }
    }
  }, [stats, isGlobalScope]);

  return {
    // État du scope
    selectedTenantId,
    setSelectedTenantId,
    
    // Données du dashboard
    stats,
    upcomingMaintenances,
    systemAlerts,
    
    // Liste des tenants
    availableTenants,
    
    // États de chargement
    loading,
    tenantsLoading,
    error,
    
    // Méthodes publiques
    loadData,
    refreshData,
    
    // Helpers (non exposés mais disponibles si besoin)
    // isGlobalScope,
    // getPageTitle,
    // getTotalItemsLabel,
    // getSelectedTenantInfo
  };
};