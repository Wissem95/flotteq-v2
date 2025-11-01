import api from '@/config/api';

export interface SubscriptionPlan {
  id: number;
  name: string;
  price: number;
  maxVehicles: number;
  maxUsers: number;
  maxDrivers: number;
  trialDays: number;
  isActive: boolean;
}

export const subscriptionsService = {
  async getPlans(): Promise<SubscriptionPlan[]> {
    const response = await api.get<SubscriptionPlan[]>('/subscriptions/plans');
    return response.data;
  },
};
