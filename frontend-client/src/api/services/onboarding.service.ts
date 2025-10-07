import api from '@/config/api';
import type { OnboardingData } from '@/types/onboarding.types';

export const onboardingService = {
  async completeOnboarding(data: OnboardingData): Promise<{ message: string }> {
    const response = await api.post('/onboarding/complete', data);
    return response.data;
  },

  async skipOnboarding(): Promise<{ message: string }> {
    const response = await api.post('/onboarding/skip');
    return response.data;
  },
};
