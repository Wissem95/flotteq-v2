import { apiClient } from '../httpClient';
import type {
  SubscriptionPlan,
  Subscription,
  SubscriptionStats,
  CreatePlanDto,
  UpdatePlanDto,
} from '../types/subscription.types';

export const subscriptionsApi = {
  // Plans
  getPlans: async (): Promise<SubscriptionPlan[]> => {
    const response = await apiClient.get<SubscriptionPlan[]>('/subscriptions/plans');
    return response.data;
  },

  getPlan: async (id: number): Promise<SubscriptionPlan> => {
    const response = await apiClient.get<SubscriptionPlan>(`/api/subscriptions/plans/${id}`);
    return response.data;
  },

  createPlan: async (data: CreatePlanDto): Promise<SubscriptionPlan> => {
    const response = await apiClient.post<SubscriptionPlan>('/subscriptions/plans', data);
    return response.data;
  },

  updatePlan: async (id: number, data: UpdatePlanDto): Promise<SubscriptionPlan> => {
    const response = await apiClient.patch<SubscriptionPlan>(`/api/subscriptions/plans/${id}`, data);
    return response.data;
  },

  deletePlan: async (id: number): Promise<void> => {
    await apiClient.delete(`/api/subscriptions/plans/${id}`);
  },

  // Subscriptions
  getAllSubscriptions: async (): Promise<Subscription[]> => {
    const response = await apiClient.get<Subscription[]>('/subscriptions');
    return response.data;
  },

  getStats: async (): Promise<SubscriptionStats> => {
    const response = await apiClient.get<SubscriptionStats>('/subscriptions/stats');
    return response.data;
  },
};
