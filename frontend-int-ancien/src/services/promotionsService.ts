import { api } from '@/lib/api';

export interface Promotion {
  id: number;
  name: string;
  code: string;
  description: string;
  type: 'discount' | 'trial' | 'bonus';
  discount_type: 'fixed' | 'percentage';
  discount_value: number;
  discount_percentage: number;
  max_discount_amount: number;
  min_purchase_amount: number;
  applies_to: string;
  applicable_plans: string[];
  applicable_tenants: number[];
  applicable_categories: string[];
  excluded_items: string[];
  start_date: string;
  end_date: string;
  usage_limit_total: number;
  usage_limit_per_user: number;
  usage_limit_per_tenant: number;
  current_usage_count: number;
  requires_code: boolean;
  auto_apply: boolean;
  stackable: boolean;
  priority: number;
  conditions: any[];
  target_audience: any[];
  new_users_only: boolean;
  existing_users_only: boolean;
  first_purchase_only: boolean;
  recurring_discount: boolean;
  recurring_duration_months: number;
  trial_extension_days: number;
  referral_required: boolean;
  referral_bonus: number;
  display_banner: boolean;
  banner_text: string;
  banner_image: string;
  email_template: string;
  terms_and_conditions: string;
  is_active: boolean;
  is_featured: boolean;
  created_by: number;
  approved_by: number;
  approved_at: string;
  analytics_data: any;
  conversion_rate: number;
  total_revenue_generated: number;
  total_discount_given: number;
  metadata: any;
  created_at: string;
  updated_at: string;
  created_by_user?: {
    id: number;
    first_name: string;
    last_name: string;
  };
  approved_by_user?: {
    id: number;
    first_name: string;
    last_name: string;
  };
}

export interface PromotionFilters {
  status?: 'active' | 'inactive';
  type?: string;
  featured?: boolean;
  search?: string;
  per_page?: number;
  page?: number;
}

export interface PromotionStats {
  total_promotions: number;
  active_promotions: number;
  total_usage: number;
  total_revenue: number;
  total_discount: number;
  top_promotions: Array<{
    name: string;
    code: string;
    current_usage_count: number;
    total_revenue_generated: number;
  }>;
}

export interface PromotionValidation {
  valid: boolean;
  promotion?: Promotion;
  discount?: number;
  final_amount?: number;
  message?: string;
}

export const promotionsService = {
  // Récupérer toutes les promotions avec filtres
  async getPromotions(filters: PromotionFilters = {}) {
    const response = await api.get('/internal/promotions', { params: filters });
    return response.data;
  },

  // Créer une nouvelle promotion
  async createPromotion(data: Partial<Promotion>) {
    const response = await api.post('/internal/promotions', data);
    return response.data;
  },

  // Récupérer une promotion spécifique
  async getPromotion(id: number) {
    const response = await api.get(`/internal/promotions/${id}`);
    return response.data;
  },

  // Mettre à jour une promotion
  async updatePromotion(id: number, data: Partial<Promotion>) {
    const response = await api.put(`/internal/promotions/${id}`, data);
    return response.data;
  },

  // Supprimer une promotion
  async deletePromotion(id: number) {
    const response = await api.delete(`/internal/promotions/${id}`);
    return response.data;
  },

  // Activer une promotion
  async activatePromotion(id: number) {
    const response = await api.post(`/internal/promotions/${id}/activate`);
    return response.data;
  },

  // Désactiver une promotion
  async deactivatePromotion(id: number) {
    const response = await api.post(`/internal/promotions/${id}/deactivate`);
    return response.data;
  },

  // Obtenir les statistiques des promotions
  async getStatistics(startDate?: string, endDate?: string): Promise<PromotionStats> {
    const params: any = {};
    if (startDate) params.start_date = startDate;
    if (endDate) params.end_date = endDate;
    
    const response = await api.get('/internal/promotions/statistics', { params });
    return response.data;
  },

  // Valider un code promo
  async validateCode(code: string, userId: number, tenantId?: number, amount?: number): Promise<PromotionValidation> {
    const response = await api.post('/internal/promotions/validate-code', {
      code,
      user_id: userId,
      tenant_id: tenantId,
      amount
    });
    return response.data;
  },

  // Exporter les promotions
  async exportPromotions(filters: PromotionFilters = {}) {
    const response = await api.get('/internal/promotions/export', { 
      params: filters,
      responseType: 'blob'
    });
    return response.data;
  },

  // Dupliquer une promotion
  async duplicatePromotion(id: number, newName: string, newCode: string) {
    const promotion = await this.getPromotion(id);
    
    // Supprimer les champs non duplicables
    delete promotion.id;
    delete promotion.created_at;
    delete promotion.updated_at;
    delete promotion.created_by;
    delete promotion.approved_by;
    delete promotion.approved_at;
    
    // Modifier les données pour la duplication
    promotion.name = newName;
    promotion.code = newCode;
    promotion.is_active = false; // Nouvelle promotion toujours inactive
    promotion.current_usage_count = 0;
    promotion.total_revenue_generated = 0;
    promotion.total_discount_given = 0;
    promotion.conversion_rate = 0;
    
    return this.createPromotion(promotion);
  },

  // Test A/B d'une promotion
  async setupABTest(promotionId: number, variants: Array<{
    name: string;
    percentage: number;
    changes: Partial<Promotion>;
  }>) {
    const response = await api.post(`/internal/promotions/${promotionId}/ab-test`, {
      variants
    });
    return response.data;
  },

  // Obtenir les résultats A/B test
  async getABTestResults(promotionId: number) {
    const response = await api.get(`/internal/promotions/${promotionId}/ab-results`);
    return response.data;
  },

  // Prévisualiser l'impact d'une promotion
  async previewImpact(data: Partial<Promotion>) {
    const response = await api.post('/internal/promotions/preview-impact', data);
    return response.data;
  },

  // Obtenir les promotions similaires
  async getSimilarPromotions(promotionId: number) {
    const response = await api.get(`/internal/promotions/${promotionId}/similar`);
    return response.data;
  },

  // Approuver une promotion
  async approvePromotion(id: number, notes?: string) {
    const response = await api.post(`/internal/promotions/${id}/approve`, { notes });
    return response.data;
  },

  // Rejeter une promotion
  async rejectPromotion(id: number, reason: string) {
    const response = await api.post(`/internal/promotions/${id}/reject`, { reason });
    return response.data;
  }
};

export default promotionsService;