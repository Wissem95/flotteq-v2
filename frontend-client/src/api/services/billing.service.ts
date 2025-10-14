import api from '@/config/api';

export interface Invoice {
  id: string;
  amountPaid: number;
  currency: string;
  status: string;
  pdfUrl: string;
  number: string;
  created: string;
  periodStart?: string;
  periodEnd?: string;
}

export interface PaymentMethod {
  id: string;
  brand: string;
  last4: string;
  expMonth: number;
  expYear: number;
}

export interface SubscriptionStats {
  plan: {
    name: string;
    price: number;
    features: string[];
    trialDays: number;
  };
  usage: {
    vehicles: {
      current: number;
      limit: number | string;
      percentage: number;
    };
    users: {
      current: number;
      limit: number | string;
      percentage: number;
    };
    drivers: {
      current: number;
      limit: number | string;
      percentage: number;
    };
  };
  status: string;
  currentPeriodEnd: string;
}

export const billingService = {
  /**
   * Get current subscription stats
   */
  async getSubscriptionStats(): Promise<SubscriptionStats> {
    const response = await api.get<SubscriptionStats>('/subscriptions/stats');
    return response.data;
  },

  /**
   * Create Stripe checkout session for plan upgrade
   */
  async createCheckoutSession(planId: number): Promise<{ url: string }> {
    const response = await api.post<{ url: string }>('/subscriptions/create-checkout-session', {
      planId,
    });
    return response.data;
  },

  /**
   * Get invoice history
   */
  async getInvoices(): Promise<Invoice[]> {
    const response = await api.get<Invoice[]>('/subscriptions/invoices');
    return response.data;
  },

  /**
   * Download invoice PDF
   */
  downloadInvoice(invoiceId: string): void {
    const baseUrl = api.defaults.baseURL || 'http://localhost:3000/api';
    const url = `${baseUrl}/subscriptions/invoices/${invoiceId}/download`;

    // Open in new tab - backend will redirect to Stripe PDF
    window.open(url, '_blank');
  },

  /**
   * Get current payment method
   */
  async getPaymentMethod(): Promise<PaymentMethod | null> {
    const response = await api.get<PaymentMethod | null>('/subscriptions/payment-method');
    return response.data;
  },

  /**
   * Open Stripe Customer Portal for payment method management
   */
  async openCustomerPortal(): Promise<void> {
    const response = await api.post<{ url: string }>('/stripe/create-portal-session');
    if (response.data.url) {
      window.location.href = response.data.url;
    }
  },
};
