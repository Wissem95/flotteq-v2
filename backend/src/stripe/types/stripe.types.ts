export enum SubscriptionStatus {
  TRIAL = 'trial',
  ACTIVE = 'active',
  PAST_DUE = 'past_due',
  CANCELLED = 'cancelled',
  INCOMPLETE = 'incomplete',
}

export interface StripeConfig {
  secretKey: string;
  webhookSecret: string;
  priceId: string;
  trialDays: number;
}
