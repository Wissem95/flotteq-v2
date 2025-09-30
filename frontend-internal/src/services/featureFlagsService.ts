import { api } from '@/lib/api';

export interface FeatureFlag {
  id: number;
  name: string;
  key: string;
  description: string;
  type: 'boolean' | 'variant' | 'experiment';
  status: 'enabled' | 'disabled' | 'testing' | 'rollback';
  rollout_percentage: number;
  target_users: number[];
  target_tenants: number[];
  target_plans: string[];
  target_regions: string[];
  exclude_users: number[];
  exclude_tenants: number[];
  conditions: any[];
  variants: Array<{
    name: string;
    percentage: number;
    config?: any;
  }>;
  default_variant: string;
  start_date: string;
  end_date: string;
  dependencies: string[];
  parent_flag_id: number;
  category: string;
  tags: string[];
  risk_level: 'low' | 'medium' | 'high';
  impact_areas: string[];
  rollback_plan: any[];
  monitoring_metrics: string[];
  success_criteria: any[];
  failure_threshold: number;
  auto_disable_on_error: boolean;
  error_count: number;
  last_error_at: string;
  enabled_by: number;
  enabled_at: string;
  disabled_by: number;
  disabled_at: string;
  tested_by: number;
  tested_at: string;
  approved_by: number;
  approved_at: string;
  documentation_url: string;
  jira_ticket: string;
  notes: string;
  analytics_enabled: boolean;
  track_usage: boolean;
  usage_count: number;
  unique_users_count: number;
  conversion_impact: number;
  performance_impact: number;
  metadata: any;
  created_at: string;
  updated_at: string;
  parent_flag?: FeatureFlag;
  child_flags?: FeatureFlag[];
  enabled_by_user?: {
    id: number;
    first_name: string;
    last_name: string;
  };
  disabled_by_user?: {
    id: number;
    first_name: string;
    last_name: string;
  };
}

export interface FeatureFlagFilters {
  status?: 'enabled' | 'disabled';
  category?: string;
  risk_level?: 'low' | 'medium' | 'high';
  search?: string;
  per_page?: number;
  page?: number;
}

export interface FeatureFlagStats {
  total_flags: number;
  enabled_flags: number;
  high_risk_flags: number;
  flags_by_category: Record<string, number>;
  flags_by_risk: Record<string, number>;
  recently_modified: number;
}

export interface FlagCheckResult {
  enabled: boolean;
  variant?: string;
  key: string;
}

export interface BulkCheckResult {
  flags: Record<string, FlagCheckResult>;
}

export const featureFlagsService = {
  // Récupérer tous les feature flags avec filtres
  async getFeatureFlags(filters: FeatureFlagFilters = {}) {
    const response = await api.get('/internal/feature-flags', { params: filters });
    return response.data;
  },

  // Créer un nouveau feature flag
  async createFeatureFlag(data: Partial<FeatureFlag>) {
    const response = await api.post('/internal/feature-flags', data);
    return response.data;
  },

  // Récupérer un feature flag spécifique
  async getFeatureFlag(id: number) {
    const response = await api.get(`/internal/feature-flags/${id}`);
    return response.data;
  },

  // Mettre à jour un feature flag
  async updateFeatureFlag(id: number, data: Partial<FeatureFlag>) {
    const response = await api.put(`/internal/feature-flags/${id}`, data);
    return response.data;
  },

  // Supprimer un feature flag
  async deleteFeatureFlag(id: number) {
    const response = await api.delete(`/internal/feature-flags/${id}`);
    return response.data;
  },

  // Activer un feature flag
  async enableFlag(id: number) {
    const response = await api.post(`/internal/feature-flags/${id}/enable`);
    return response.data;
  },

  // Désactiver un feature flag
  async disableFlag(id: number, reason?: string) {
    const response = await api.post(`/internal/feature-flags/${id}/disable`, { reason });
    return response.data;
  },

  // Vérifier un flag spécifique
  async checkFlag(key: string, userId?: number, tenantId?: number): Promise<FlagCheckResult> {
    const response = await api.post('/internal/feature-flags/check', {
      key,
      user_id: userId,
      tenant_id: tenantId
    });
    return response.data;
  },

  // Vérifier plusieurs flags en une fois
  async bulkCheckFlags(keys: string[], userId?: number, tenantId?: number): Promise<BulkCheckResult> {
    const response = await api.post('/internal/feature-flags/bulk-check', {
      keys,
      user_id: userId,
      tenant_id: tenantId
    });
    return response.data;
  },

  // Obtenir les statistiques des feature flags
  async getStatistics(): Promise<FeatureFlagStats> {
    const response = await api.get('/internal/feature-flags/statistics');
    return response.data;
  },

  // Obtenir les catégories de flags
  async getCategories(): Promise<string[]> {
    const response = await api.get('/internal/feature-flags/categories');
    return response.data.categories;
  },

  // Cloner un feature flag
  async cloneFlag(id: number) {
    const response = await api.post(`/internal/feature-flags/${id}/clone`);
    return response.data;
  },

  // === FONCTIONNALITÉS AVANCÉES ===

  // Programmer l'activation/désactivation d'un flag
  async scheduleFlag(id: number, action: 'enable' | 'disable', scheduledAt: string) {
    const response = await api.post(`/internal/feature-flags/${id}/schedule`, {
      action,
      scheduled_at: scheduledAt
    });
    return response.data;
  },

  // Obtenir l'historique des modifications d'un flag
  async getFlagHistory(id: number) {
    const response = await api.get(`/internal/feature-flags/${id}/history`);
    return response.data;
  },

  // Obtenir les métriques d'usage d'un flag
  async getFlagMetrics(id: number, period = '30d') {
    const response = await api.get(`/internal/feature-flags/${id}/metrics`, {
      params: { period }
    });
    return response.data;
  },

  // Analyser l'impact d'un flag
  async analyzeFlagImpact(id: number, metrics: string[] = ['performance', 'conversion', 'errors']) {
    const response = await api.post(`/internal/feature-flags/${id}/analyze-impact`, {
      metrics
    });
    return response.data;
  },

  // Rollback automatique d'un flag
  async rollbackFlag(id: number, reason: string) {
    const response = await api.post(`/internal/feature-flags/${id}/rollback`, {
      reason
    });
    return response.data;
  },

  // Configuration d'un test A/B
  async setupABTest(id: number, testConfig: {
    variants: Array<{
      name: string;
      percentage: number;
      config?: any;
    }>;
    success_metrics: string[];
    test_duration_days: number;
  }) {
    const response = await api.post(`/internal/feature-flags/${id}/ab-test`, testConfig);
    return response.data;
  },

  // Obtenir les résultats d'un test A/B
  async getABTestResults(id: number) {
    const response = await api.get(`/internal/feature-flags/${id}/ab-results`);
    return response.data;
  },

  // Terminer un test A/B
  async endABTest(id: number, winningVariant: string) {
    const response = await api.post(`/internal/feature-flags/${id}/end-ab-test`, {
      winning_variant: winningVariant
    });
    return response.data;
  },

  // Configuration du rollout progressif
  async setupProgressiveRollout(id: number, rolloutConfig: {
    start_percentage: number;
    end_percentage: number;
    increment_percentage: number;
    increment_interval_hours: number;
    success_threshold: number;
  }) {
    const response = await api.post(`/internal/feature-flags/${id}/progressive-rollout`, rolloutConfig);
    return response.data;
  },

  // Pause/reprendre le rollout progressif
  async pauseRollout(id: number) {
    const response = await api.post(`/internal/feature-flags/${id}/pause-rollout`);
    return response.data;
  },

  async resumeRollout(id: number) {
    const response = await api.post(`/internal/feature-flags/${id}/resume-rollout`);
    return response.data;
  },

  // Obtenir les dépendances d'un flag
  async getFlagDependencies(id: number) {
    const response = await api.get(`/internal/feature-flags/${id}/dependencies`);
    return response.data;
  },

  // Valider les dépendances avant activation
  async validateDependencies(id: number) {
    const response = await api.post(`/internal/feature-flags/${id}/validate-dependencies`);
    return response.data;
  },

  // Obtenir les flags liés (qui dépendent de ce flag)
  async getRelatedFlags(id: number) {
    const response = await api.get(`/internal/feature-flags/${id}/related`);
    return response.data;
  },

  // Simulation d'impact d'un changement de flag
  async simulateImpact(id: number, newStatus: 'enabled' | 'disabled', rolloutPercentage?: number) {
    const response = await api.post(`/internal/feature-flags/${id}/simulate`, {
      status: newStatus,
      rollout_percentage: rolloutPercentage
    });
    return response.data;
  },

  // Exporter les configurations des flags
  async exportFlags(filters: FeatureFlagFilters = {}, format: 'json' | 'yaml' = 'json') {
    const response = await api.get('/internal/feature-flags/export', {
      params: { ...filters, format },
      responseType: 'blob'
    });
    return response.data;
  },

  // Importer des flags depuis un fichier
  async importFlags(file: File, overwrite = false) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('overwrite', overwrite.toString());
    
    const response = await api.post('/internal/feature-flags/import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },

  // Synchroniser avec le code source
  async syncWithCode() {
    const response = await api.post('/internal/feature-flags/sync-code');
    return response.data;
  },

  // Obtenir les flags obsolètes
  async getObsoleteFlags(days = 30) {
    const response = await api.get('/internal/feature-flags/obsolete', {
      params: { days }
    });
    return response.data;
  },

  // Nettoyer les flags obsolètes
  async cleanupObsoleteFlags(flagIds: number[]) {
    const response = await api.post('/internal/feature-flags/cleanup', {
      flag_ids: flagIds
    });
    return response.data;
  },

  // Obtenir les recommandations d'optimisation
  async getOptimizationRecommendations() {
    const response = await api.get('/internal/feature-flags/optimization-recommendations');
    return response.data;
  },

  // Configuration des alertes
  async setupAlerts(id: number, alertConfig: {
    error_threshold: number;
    performance_threshold: number;
    usage_threshold: number;
    alert_channels: string[];
  }) {
    const response = await api.post(`/internal/feature-flags/${id}/alerts`, alertConfig);
    return response.data;
  },

  // Obtenir les alertes actives
  async getActiveAlerts(id?: number) {
    const params: any = {};
    if (id) params.flag_id = id;
    
    const response = await api.get('/internal/feature-flags/alerts', { params });
    return response.data;
  }
};

export default featureFlagsService;