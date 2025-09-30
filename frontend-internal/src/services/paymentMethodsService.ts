import { api } from '@/lib/api';

export interface PaymentMethod {
  id: number;
  name: string;
  code: string;
  type: 'card' | 'bank_transfer' | 'wallet' | 'crypto' | 'other';
  provider: string;
  gateway: string;
  gateway_config: any;
  api_keys: any;
  webhook_url: string;
  webhook_secret: string;
  supported_currencies: string[];
  supported_countries: string[];
  min_amount: number;
  max_amount: number;
  transaction_fee_fixed: number;
  transaction_fee_percentage: number;
  settlement_delay_days: number;
  instant_payment: boolean;
  recurring_payment: boolean;
  refund_supported: boolean;
  partial_refund_supported: boolean;
  auto_capture: boolean;
  requires_3ds: boolean;
  requires_verification: boolean;
  verification_fields: string[];
  display_name: string;
  description: string;
  icon_url: string;
  position: number;
  is_default: boolean;
  is_active: boolean;
  is_test_mode: boolean;
  test_credentials: any;
  sandbox_url: string;
  production_url: string;
  success_url: string;
  cancel_url: string;
  notification_url: string;
  available_for_tenants: number[];
  available_for_plans: string[];
  excluded_countries: string[];
  risk_level: 'low' | 'medium' | 'high';
  fraud_detection: boolean;
  compliance_requirements: string[];
  documentation_url: string;
  support_email: string;
  integration_status: 'pending' | 'in_progress' | 'completed' | 'failed';
  last_tested_at: string;
  metadata: any;
  created_at: string;
  updated_at: string;
}

export interface PaymentMethodFilters {
  active?: boolean;
  type?: string;
  provider?: string;
  supports_recurring?: boolean;
  supports_refund?: boolean;
  search?: string;
  per_page?: number;
  page?: number;
}

export interface PaymentMethodStats {
  total_methods: number;
  active_methods: number;
  method_usage: Array<{
    name: string;
    code: string;
    transactions_count: number;
    total_amount: number;
  }>;
}

export interface AvailableMethodsParams {
  tenant_id?: number;
  plan_id?: string;
  amount?: number;
  currency?: string;
  country?: string;
}

export const paymentMethodsService = {
  // Récupérer toutes les méthodes de paiement avec filtres
  async getPaymentMethods(filters: PaymentMethodFilters = {}) {
    const response = await api.get('/internal/payment-methods', { params: filters });
    return response.data;
  },

  // Créer une nouvelle méthode de paiement
  async createPaymentMethod(data: Partial<PaymentMethod>) {
    const response = await api.post('/internal/payment-methods', data);
    return response.data;
  },

  // Récupérer une méthode de paiement spécifique
  async getPaymentMethod(id: number) {
    const response = await api.get(`/internal/payment-methods/${id}`);
    return response.data;
  },

  // Mettre à jour une méthode de paiement
  async updatePaymentMethod(id: number, data: Partial<PaymentMethod>) {
    const response = await api.put(`/internal/payment-methods/${id}`, data);
    return response.data;
  },

  // Supprimer une méthode de paiement
  async deletePaymentMethod(id: number) {
    const response = await api.delete(`/internal/payment-methods/${id}`);
    return response.data;
  },

  // Tester la connexion d'une méthode
  async testConnection(id: number) {
    const response = await api.post(`/internal/payment-methods/${id}/test`);
    return response.data;
  },

  // Activer/désactiver une méthode
  async toggleStatus(id: number) {
    const response = await api.post(`/internal/payment-methods/${id}/toggle`);
    return response.data;
  },

  // Définir comme méthode par défaut
  async setAsDefault(id: number) {
    const response = await api.post(`/internal/payment-methods/${id}/set-default`);
    return response.data;
  },

  // Obtenir les statistiques des méthodes de paiement
  async getStatistics(startDate?: string, endDate?: string): Promise<PaymentMethodStats> {
    const params: any = {};
    if (startDate) params.start_date = startDate;
    if (endDate) params.end_date = endDate;
    
    const response = await api.get('/internal/payment-methods/statistics', { params });
    return response.data;
  },

  // Obtenir les méthodes disponibles selon les critères
  async getAvailableMethods(params: AvailableMethodsParams = {}) {
    const response = await api.get('/internal/payment-methods/available', { params });
    return response.data;
  },

  // Valider la configuration d'une méthode
  async validateConfiguration(data: Partial<PaymentMethod>) {
    const response = await api.post('/internal/payment-methods/validate-config', data);
    return response.data;
  },

  // Synchroniser avec le gateway
  async syncWithGateway(id: number) {
    const response = await api.post(`/internal/payment-methods/${id}/sync`);
    return response.data;
  },

  // Obtenir les logs d'une méthode
  async getMethodLogs(id: number, filters?: {
    start_date?: string;
    end_date?: string;
    level?: 'info' | 'warning' | 'error';
  }) {
    const response = await api.get(`/internal/payment-methods/${id}/logs`, { params: filters });
    return response.data;
  },

  // Calculer les frais pour un montant
  async calculateFees(id: number, amount: number, currency = 'EUR') {
    const response = await api.post(`/internal/payment-methods/${id}/calculate-fees`, {
      amount,
      currency
    });
    return response.data;
  },

  // Tester un paiement (sandbox)
  async testPayment(id: number, amount: number, currency = 'EUR') {
    const response = await api.post(`/internal/payment-methods/${id}/test-payment`, {
      amount,
      currency,
      test_mode: true
    });
    return response.data;
  },

  // Obtenir les devises supportées par provider
  async getSupportedCurrencies(provider: string) {
    const response = await api.get(`/internal/payment-methods/currencies/${provider}`);
    return response.data;
  },

  // Obtenir les pays supportés par provider
  async getSupportedCountries(provider: string) {
    const response = await api.get(`/internal/payment-methods/countries/${provider}`);
    return response.data;
  },

  // Configurer les webhooks
  async configureWebhooks(id: number, webhookConfig: {
    events: string[];
    url: string;
    secret: string;
  }) {
    const response = await api.post(`/internal/payment-methods/${id}/webhooks`, webhookConfig);
    return response.data;
  },

  // Tester les webhooks
  async testWebhooks(id: number) {
    const response = await api.post(`/internal/payment-methods/${id}/webhooks/test`);
    return response.data;
  },

  // Obtenir les métriques de performance
  async getPerformanceMetrics(id: number, period = '30d') {
    const response = await api.get(`/internal/payment-methods/${id}/metrics`, {
      params: { period }
    });
    return response.data;
  },

  // Comparer les méthodes
  async compareMethodsPerformance(methodIds: number[], period = '30d') {
    const response = await api.post('/internal/payment-methods/compare', {
      method_ids: methodIds,
      period
    });
    return response.data;
  },

  // Obtenir les templates de configuration
  async getConfigurationTemplate(provider: string) {
    const response = await api.get(`/internal/payment-methods/templates/${provider}`);
    return response.data;
  },

  // Vérifier les prérequis d'intégration
  async checkIntegrationRequirements(provider: string) {
    const response = await api.get(`/internal/payment-methods/requirements/${provider}`);
    return response.data;
  },

  // Exporter les données des méthodes
  async exportData(filters: PaymentMethodFilters = {}) {
    const response = await api.get('/internal/payment-methods/export', {
      params: filters,
      responseType: 'blob'
    });
    return response.data;
  },

  // Importer des méthodes (bulk)
  async importMethods(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await api.post('/internal/payment-methods/import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },

  // Obtenir l'historique des modifications
  async getAuditLog(id: number) {
    const response = await api.get(`/internal/payment-methods/${id}/audit`);
    return response.data;
  }
};

export default paymentMethodsService;