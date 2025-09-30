// useAnalytics.ts - Hook personnalisé pour la gestion des analytics FlotteQ

import { useState, useEffect, useCallback } from 'react';
import { 
  analyticsService, 
  PlatformMetrics,
  UsageAnalytics,
  PerformanceMetrics,
  BehaviorAnalytics,
  RevenueAnalytics,
  GeographicAnalytics,
  TechnicalAnalytics,
  RealtimeMetrics,
  AnalyticsFilters
} from '@/services/analyticsService';

interface UseAnalyticsReturn {
  // State
  platformMetrics: PlatformMetrics | null;
  usageAnalytics: UsageAnalytics | null;
  performanceMetrics: PerformanceMetrics | null;
  behaviorAnalytics: BehaviorAnalytics | null;
  revenueAnalytics: RevenueAnalytics | null;
  geographicAnalytics: GeographicAnalytics | null;
  technicalAnalytics: TechnicalAnalytics | null;
  realtimeMetrics: RealtimeMetrics | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  loadPlatformMetrics: () => Promise<void>;
  loadUsageAnalytics: (filters?: AnalyticsFilters) => Promise<void>;
  loadPerformanceMetrics: () => Promise<void>;
  loadBehaviorAnalytics: (filters?: AnalyticsFilters) => Promise<void>;
  loadRevenueAnalytics: (filters?: AnalyticsFilters) => Promise<void>;
  loadGeographicAnalytics: () => Promise<void>;
  loadTechnicalAnalytics: () => Promise<void>;
  loadRealtimeMetrics: () => Promise<void>;
  
  generateCustomReport: (config: any) => Promise<any>;
  exportReport: (reportType: string, format: 'pdf' | 'excel' | 'csv', filters?: AnalyticsFilters) => Promise<Blob | null>;
  
  refreshAllData: (filters?: AnalyticsFilters) => Promise<void>;
  startRealtimeUpdates: () => void;
  stopRealtimeUpdates: () => void;
}

export const useAnalytics = (): UseAnalyticsReturn => {
  const [platformMetrics, setPlatformMetrics] = useState<PlatformMetrics | null>(null);
  const [usageAnalytics, setUsageAnalytics] = useState<UsageAnalytics | null>(null);
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetrics | null>(null);
  const [behaviorAnalytics, setBehaviorAnalytics] = useState<BehaviorAnalytics | null>(null);
  const [revenueAnalytics, setRevenueAnalytics] = useState<RevenueAnalytics | null>(null);
  const [geographicAnalytics, setGeographicAnalytics] = useState<GeographicAnalytics | null>(null);
  const [technicalAnalytics, setTechnicalAnalytics] = useState<TechnicalAnalytics | null>(null);
  const [realtimeMetrics, setRealtimeMetrics] = useState<RealtimeMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [realtimeInterval, setRealtimeInterval] = useState<NodeJS.Timeout | null>(null);

  // Charger les métriques de la plateforme
  const loadPlatformMetrics = useCallback(async () => {
    setError(null);
    try {
      const data = await analyticsService.getPlatformMetrics();
      setPlatformMetrics(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des métriques de plateforme');
      console.error('Erreur loadPlatformMetrics:', err);
    }
  }, []);

  // Charger les analytics d'utilisation
  const loadUsageAnalytics = useCallback(async (filters?: AnalyticsFilters) => {
    setError(null);
    try {
      const data = await analyticsService.getUsageAnalytics(filters);
      setUsageAnalytics(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des analytics d\'utilisation');
      console.error('Erreur loadUsageAnalytics:', err);
    }
  }, []);

  // Charger les métriques de performance
  const loadPerformanceMetrics = useCallback(async () => {
    setError(null);
    try {
      const data = await analyticsService.getPerformanceMetrics();
      setPerformanceMetrics(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des métriques de performance');
      console.error('Erreur loadPerformanceMetrics:', err);
    }
  }, []);

  // Charger les analytics de comportement
  const loadBehaviorAnalytics = useCallback(async (filters?: AnalyticsFilters) => {
    setError(null);
    try {
      const data = await analyticsService.getBehaviorAnalytics(filters);
      setBehaviorAnalytics(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des analytics de comportement');
      console.error('Erreur loadBehaviorAnalytics:', err);
    }
  }, []);

  // Charger les analytics de revenus
  const loadRevenueAnalytics = useCallback(async (filters?: AnalyticsFilters) => {
    setError(null);
    try {
      const data = await analyticsService.getRevenueAnalytics(filters);
      setRevenueAnalytics(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des analytics de revenus');
      console.error('Erreur loadRevenueAnalytics:', err);
    }
  }, []);

  // Charger les analytics géographiques
  const loadGeographicAnalytics = useCallback(async () => {
    setError(null);
    try {
      const data = await analyticsService.getGeographicAnalytics();
      setGeographicAnalytics(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des analytics géographiques');
      console.error('Erreur loadGeographicAnalytics:', err);
    }
  }, []);

  // Charger les analytics techniques
  const loadTechnicalAnalytics = useCallback(async () => {
    setError(null);
    try {
      const data = await analyticsService.getTechnicalAnalytics();
      setTechnicalAnalytics(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des analytics techniques');
      console.error('Erreur loadTechnicalAnalytics:', err);
    }
  }, []);

  // Charger les métriques temps réel
  const loadRealtimeMetrics = useCallback(async () => {
    setError(null);
    try {
      const data = await analyticsService.getRealtimeMetrics();
      setRealtimeMetrics(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des métriques temps réel');
      console.error('Erreur loadRealtimeMetrics:', err);
    }
  }, []);

  // Générer un rapport personnalisé
  const generateCustomReport = useCallback(async (config: any) => {
    setError(null);
    try {
      const data = await analyticsService.generateCustomReport(config);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la génération du rapport personnalisé');
      console.error('Erreur generateCustomReport:', err);
      return null;
    }
  }, []);

  // Exporter un rapport
  const exportReport = useCallback(async (reportType: string, format: 'pdf' | 'excel' | 'csv', filters?: AnalyticsFilters): Promise<Blob | null> => {
    setError(null);
    try {
      const blob = await analyticsService.exportReport(reportType, format, filters);
      return blob;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de l\'export du rapport');
      console.error('Erreur exportReport:', err);
      return null;
    }
  }, []);

  // Rafraîchir toutes les données
  const refreshAllData = useCallback(async (filters?: AnalyticsFilters) => {
    setIsLoading(true);
    try {
      await Promise.all([
        loadPlatformMetrics(),
        loadUsageAnalytics(filters),
        loadPerformanceMetrics(),
        loadBehaviorAnalytics(filters),
        loadRevenueAnalytics(filters),
        loadGeographicAnalytics(),
        loadTechnicalAnalytics(),
        loadRealtimeMetrics()
      ]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du rafraîchissement des données');
      console.error('Erreur refreshAllData:', err);
    } finally {
      setIsLoading(false);
    }
  }, [
    loadPlatformMetrics,
    loadUsageAnalytics,
    loadPerformanceMetrics,
    loadBehaviorAnalytics,
    loadRevenueAnalytics,
    loadGeographicAnalytics,
    loadTechnicalAnalytics,
    loadRealtimeMetrics
  ]);

  // Démarrer les mises à jour temps réel
  const startRealtimeUpdates = useCallback(() => {
    if (realtimeInterval) {
      clearInterval(realtimeInterval);
    }

    const interval = setInterval(() => {
      loadRealtimeMetrics();
      loadPerformanceMetrics(); // Mise à jour des métriques de performance aussi
    }, 30000); // Toutes les 30 secondes

    setRealtimeInterval(interval);
  }, [loadRealtimeMetrics, loadPerformanceMetrics, realtimeInterval]);

  // Arrêter les mises à jour temps réel
  const stopRealtimeUpdates = useCallback(() => {
    if (realtimeInterval) {
      clearInterval(realtimeInterval);
      setRealtimeInterval(null);
    }
  }, [realtimeInterval]);

  // Charger les données initiales au montage
  useEffect(() => {
    refreshAllData();
    startRealtimeUpdates();

    // Nettoyage au démontage
    return () => {
      stopRealtimeUpdates();
    };
  }, []);

  // Auto-refresh périodique (toutes les 5 minutes pour les données moins critiques)
  useEffect(() => {
    const autoRefreshInterval = setInterval(() => {
      loadPlatformMetrics();
      loadUsageAnalytics();
      loadRevenueAnalytics();
      loadGeographicAnalytics();
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(autoRefreshInterval);
  }, [loadPlatformMetrics, loadUsageAnalytics, loadRevenueAnalytics, loadGeographicAnalytics]);

  return {
    // State
    platformMetrics,
    usageAnalytics,
    performanceMetrics,
    behaviorAnalytics,
    revenueAnalytics,
    geographicAnalytics,
    technicalAnalytics,
    realtimeMetrics,
    isLoading,
    error,

    // Actions
    loadPlatformMetrics,
    loadUsageAnalytics,
    loadPerformanceMetrics,
    loadBehaviorAnalytics,
    loadRevenueAnalytics,
    loadGeographicAnalytics,
    loadTechnicalAnalytics,
    loadRealtimeMetrics,
    generateCustomReport,
    exportReport,
    refreshAllData,
    startRealtimeUpdates,
    stopRealtimeUpdates,
  };
}; 