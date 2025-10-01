// services/subscriptionService.ts - Service de gestion des abonnements côté tenant
import { api } from "@/lib/api";

// === INTERFACES ===

export interface SubscriptionPlan {
  id: number;
  name: string;
  description: string;
  price: number;
  currency: string;
  billing_cycle: 'monthly' | 'yearly';
  features: string[];
  limits: Record<string, number>;
  is_popular: boolean;
  formatted_price: string;
}

export interface CurrentSubscription {
  id: number;
  plan: SubscriptionPlan;
  status: 'active' | 'inactive';
  start_date: string;
  end_date: string;
  trial_ends_at: string | null;
  auto_renew: boolean;
  is_trial: boolean;
  days_remaining: number | null;
}

export interface SubscriptionHistory {
  id: number;
  plan_name: string;
  price: number;
  currency: string;
  billing_cycle: 'monthly' | 'yearly';
  status: 'active' | 'inactive';
  start_date: string;
  end_date: string;
  trial_ends_at: string | null;
  cancelled_at: string | null;
  cancellation_reason: string | null;
  created_at: string;
}

export interface SubscribeData {
  subscription_id: number;
  billing_cycle: 'monthly' | 'yearly';
  auto_renew?: boolean;
  trial_days?: number;
}

export interface CancelSubscriptionData {
  reason?: string;
  cancel_at_period_end?: boolean;
}

export interface FeatureAccessResponse {
  feature: string;
  has_access: boolean;
}

// === SERVICE FUNCTIONS ===

/**
 * Get all available subscription plans
 */
export const getAvailablePlans = async (): Promise<SubscriptionPlan[]> => {
  try {
    const response = await api.get('/tenant/subscription/plans');
    
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to fetch subscription plans');
    }
    
    return response.data.data;
  } catch (error) {
    console.error('Error fetching subscription plans:', error);
    throw error;
  }
};

/**
 * Get current active subscription
 */
export const getCurrentSubscription = async (): Promise<CurrentSubscription | null> => {
  try {
    const response = await api.get('/tenant/subscription/current');
    
    if (!response.data.success) {
      if (response.data.message?.includes('No active subscription')) {
        return null; // No subscription is normal
      }
      throw new Error(response.data.message || 'Failed to fetch current subscription');
    }
    
    return response.data.data;
  } catch (error) {
    console.error('Error fetching current subscription:', error);
    throw error;
  }
};

/**
 * Subscribe to a plan
 */
export const subscribeToPlan = async (subscriptionData: SubscribeData) => {
  try {
    const response = await api.post('/tenant/subscription/subscribe', subscriptionData);
    
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to subscribe to plan');
    }
    
    return response.data.data;
  } catch (error) {
    console.error('Error subscribing to plan:', error);
    throw error;
  }
};

/**
 * Cancel current subscription
 */
export const cancelSubscription = async (cancelData: CancelSubscriptionData = {}) => {
  try {
    const response = await api.post('/tenant/subscription/cancel', cancelData);
    
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to cancel subscription');
    }
    
    return response.data.data;
  } catch (error) {
    console.error('Error cancelling subscription:', error);
    throw error;
  }
};

/**
 * Get subscription history
 */
export const getSubscriptionHistory = async (): Promise<SubscriptionHistory[]> => {
  try {
    const response = await api.get('/tenant/subscription/history');
    
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to fetch subscription history');
    }
    
    return response.data.data;
  } catch (error) {
    console.error('Error fetching subscription history:', error);
    throw error;
  }
};

/**
 * Check if tenant has access to a specific feature
 */
export const checkFeatureAccess = async (feature: string): Promise<FeatureAccessResponse> => {
  try {
    const response = await api.get(`/tenant/subscription/feature/${encodeURIComponent(feature)}/check`);
    
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to check feature access');
    }
    
    return response.data.data;
  } catch (error) {
    console.error(`Error checking access for feature '${feature}':`, error);
    throw error;
  }
};

// === UTILITY FUNCTIONS ===

/**
 * Check if current subscription is active
 */
export const isSubscriptionActive = async (): Promise<boolean> => {
  try {
    const currentSubscription = await getCurrentSubscription();
    return currentSubscription !== null && currentSubscription.status === 'active';
  } catch (error) {
    console.error('Error checking if subscription is active:', error);
    return false;
  }
};

/**
 * Get subscription status for display purposes
 */
export const getSubscriptionStatus = async () => {
  try {
    const currentSubscription = await getCurrentSubscription();
    
    if (!currentSubscription) {
      return {
        hasSubscription: false,
        status: 'none',
        message: 'No active subscription',
        needsSubscription: true
      };
    }
    
    const now = new Date();
    const endDate = new Date(currentSubscription.end_date);
    const daysRemaining = currentSubscription.days_remaining;
    
    if (currentSubscription.is_trial) {
      if (daysRemaining && daysRemaining > 0) {
        return {
          hasSubscription: true,
          status: 'trial',
          message: `Trial period - ${daysRemaining} days remaining`,
          needsSubscription: false,
          daysRemaining
        };
      } else {
        return {
          hasSubscription: false,
          status: 'trial_expired',
          message: 'Trial period has expired',
          needsSubscription: true
        };
      }
    }
    
    if (currentSubscription.status === 'active') {
      if (daysRemaining && daysRemaining <= 7) {
        return {
          hasSubscription: true,
          status: 'expiring_soon',
          message: `Subscription expires in ${daysRemaining} days`,
          needsSubscription: false,
          daysRemaining
        };
      }
      
      return {
        hasSubscription: true,
        status: 'active',
        message: 'Subscription is active',
        needsSubscription: false,
        daysRemaining
      };
    }
    
    return {
      hasSubscription: false,
      status: 'expired',
      message: 'Subscription has expired',
      needsSubscription: true
    };
    
  } catch (error) {
    console.error('Error getting subscription status:', error);
    return {
      hasSubscription: false,
      status: 'error',
      message: 'Unable to check subscription status',
      needsSubscription: true
    };
  }
};

/**
 * Format subscription price for display
 */
export const formatSubscriptionPrice = (plan: SubscriptionPlan): string => {
  const price = plan.price;
  const currency = plan.currency;
  const cycle = plan.billing_cycle;
  
  const formatter = new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: currency
  });
  
  const formattedPrice = formatter.format(price);
  const cycleText = cycle === 'monthly' ? '/mois' : '/an';
  
  return `${formattedPrice}${cycleText}`;
};

/**
 * Handle subscription-related API errors
 */
export const handleSubscriptionError = (error: any) => {
  if (error.response?.status === 402) {
    const data = error.response.data;
    
    if (data.subscription_required) {
      return {
        type: 'subscription_required',
        message: data.message,
        actionRequired: data.action_required,
        tenant: data.tenant
      };
    }
    
    if (data.subscription_expired) {
      return {
        type: 'subscription_expired',
        message: data.message,
        expiredAt: data.expired_at,
        planName: data.plan_name,
        tenant: data.tenant
      };
    }
    
    if (data.trial_expired) {
      return {
        type: 'trial_expired',
        message: data.message,
        trialEndedAt: data.trial_ended_at,
        tenant: data.tenant
      };
    }
  }
  
  return {
    type: 'generic_error',
    message: error.response?.data?.message || error.message || 'An unknown error occurred'
  };
};

/**
 * Check if user needs to select a subscription plan
 */
export const needsSubscriptionSelection = async (): Promise<{needsSelection: boolean, reason?: string}> => {
  try {
    const status = await getSubscriptionStatus();
    
    return {
      needsSelection: status.needsSubscription,
      reason: status.message
    };
  } catch (error) {
    return {
      needsSelection: true,
      reason: 'Unable to verify subscription status'
    };
  }
};