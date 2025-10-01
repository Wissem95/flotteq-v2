import { Injectable, Inject, Logger } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import Stripe from 'stripe';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tenant } from '../entities/tenant.entity';
import stripeConfig from '../config/stripe.config';

@Injectable()
export class StripeService {
  private stripe: Stripe;
  private readonly logger = new Logger(StripeService.name);

  constructor(
    @Inject(stripeConfig.KEY)
    private config: ConfigType<typeof stripeConfig>,
    @InjectRepository(Tenant)
    private tenantRepository: Repository<Tenant>,
  ) {
    this.stripe = new Stripe(this.config.secretKey, {
      apiVersion: '2025-09-30.clover',
    });
  }

  /**
   * Créer un customer Stripe lors de l'inscription tenant
   */
  async createCustomer(tenant: Tenant, email: string): Promise<string> {
    try {
      const customer = await this.stripe.customers.create({
        email,
        name: tenant.name,
        metadata: {
          tenantId: tenant.id.toString(),
        },
      });

      this.logger.log(`Stripe customer created: ${customer.id} for tenant ${tenant.id}`);
      return customer.id;
    } catch (error) {
      this.logger.error(`Failed to create Stripe customer for tenant ${tenant.id}`, error);
      throw error;
    }
  }

  /**
   * Créer une subscription avec période d'essai de 14 jours
   */
  async createSubscription(customerId: string, priceId: string): Promise<Stripe.Subscription> {
    try {
      const subscription = await this.stripe.subscriptions.create({
        customer: customerId,
        items: [{ price: priceId }],
        trial_period_days: this.config.trialDays,
        payment_behavior: 'default_incomplete',
        payment_settings: {
          save_default_payment_method: 'on_subscription',
        },
        expand: ['latest_invoice.payment_intent'],
      });

      this.logger.log(`Stripe subscription created: ${subscription.id} for customer ${customerId}`);
      return subscription;
    } catch (error) {
      this.logger.error(`Failed to create subscription for customer ${customerId}`, error);
      throw error;
    }
  }

  /**
   * Récupérer le statut d'une subscription
   */
  async getSubscriptionStatus(subscriptionId: string): Promise<string> {
    try {
      const subscription = await this.stripe.subscriptions.retrieve(subscriptionId);
      return subscription.status;
    } catch (error) {
      this.logger.error(`Failed to get subscription status for ${subscriptionId}`, error);
      throw error;
    }
  }

  /**
   * Annuler une subscription
   */
  async cancelSubscription(subscriptionId: string): Promise<void> {
    try {
      await this.stripe.subscriptions.cancel(subscriptionId);
      this.logger.log(`Subscription cancelled: ${subscriptionId}`);
    } catch (error) {
      this.logger.error(`Failed to cancel subscription ${subscriptionId}`, error);
      throw error;
    }
  }

  /**
   * Créer un portal client pour gérer l'abonnement
   */
  async createPortalSession(customerId: string, returnUrl: string): Promise<string> {
    try {
      const session = await this.stripe.billingPortal.sessions.create({
        customer: customerId,
        return_url: returnUrl,
      });

      return session.url;
    } catch (error) {
      this.logger.error(`Failed to create portal session for customer ${customerId}`, error);
      throw error;
    }
  }

  /**
   * Vérifier si un tenant est en période d'essai
   */
  isTrial(tenant: Tenant): boolean {
    if (tenant.subscriptionStatus !== 'trial') {
      return false;
    }

    if (!tenant.trialEndsAt) {
      return false;
    }

    return new Date() < new Date(tenant.trialEndsAt);
  }

  /**
   * Vérifier si un tenant a un abonnement actif
   */
  isActive(tenant: Tenant): boolean {
    return tenant.subscriptionStatus === 'active' || this.isTrial(tenant);
  }

  /**
   * Handler pour les webhooks Stripe
   */
  async handleWebhook(signature: string, payload: Buffer): Promise<void> {
    let event: Stripe.Event;

    try {
      event = this.stripe.webhooks.constructEvent(
        payload,
        signature,
        this.config.webhookSecret,
      );
    } catch (error) {
      this.logger.error('Webhook signature verification failed', error);
      throw error;
    }

    this.logger.log(`Processing webhook event: ${event.type}`);

    try {
      switch (event.type) {
        case 'customer.subscription.created':
          await this.handleSubscriptionCreated(event.data.object as Stripe.Subscription);
          break;

        case 'customer.subscription.updated':
          await this.handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
          break;

        case 'customer.subscription.deleted':
          await this.handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
          break;

        case 'invoice.payment_succeeded':
          await this.handlePaymentSucceeded(event.data.object as Stripe.Invoice);
          break;

        case 'invoice.payment_failed':
          await this.handlePaymentFailed(event.data.object as Stripe.Invoice);
          break;

        case 'customer.subscription.trial_will_end':
          await this.handleTrialWillEnd(event.data.object as Stripe.Subscription);
          break;

        default:
          this.logger.log(`Unhandled event type: ${event.type}`);
      }
    } catch (error) {
      this.logger.error(`Error processing webhook event ${event.type}`, error);
      throw error;
    }
  }

  private async handleSubscriptionCreated(subscription: Stripe.Subscription): Promise<void> {
    const customerId = subscription.customer as string;
    const tenant = await this.findTenantByCustomerId(customerId);

    if (!tenant) {
      this.logger.warn(`Tenant not found for customer ${customerId}`);
      return;
    }

    tenant.stripeSubscriptionId = subscription.id;
    tenant.subscriptionStatus = subscription.status as any;
    tenant.subscriptionStartedAt = new Date(subscription.created * 1000);

    if (subscription.trial_end) {
      tenant.trialEndsAt = new Date(subscription.trial_end * 1000);
    }

    await this.tenantRepository.save(tenant);
    this.logger.log(`Subscription created for tenant ${tenant.id}`);
  }

  private async handleSubscriptionUpdated(subscription: Stripe.Subscription): Promise<void> {
    const tenant = await this.findTenantBySubscriptionId(subscription.id);

    if (!tenant) {
      this.logger.warn(`Tenant not found for subscription ${subscription.id}`);
      return;
    }

    tenant.subscriptionStatus = subscription.status as any;

    if (subscription.canceled_at) {
      tenant.subscriptionEndedAt = new Date(subscription.canceled_at * 1000);
    }

    await this.tenantRepository.save(tenant);
    this.logger.log(`Subscription updated for tenant ${tenant.id}: ${subscription.status}`);
  }

  private async handleSubscriptionDeleted(subscription: Stripe.Subscription): Promise<void> {
    const tenant = await this.findTenantBySubscriptionId(subscription.id);

    if (!tenant) {
      this.logger.warn(`Tenant not found for subscription ${subscription.id}`);
      return;
    }

    tenant.subscriptionStatus = 'cancelled';
    tenant.subscriptionEndedAt = new Date();

    await this.tenantRepository.save(tenant);
    this.logger.log(`Subscription cancelled for tenant ${tenant.id}`);
  }

  private async handlePaymentSucceeded(invoice: Stripe.Invoice): Promise<void> {
    const customerId = invoice.customer as string;
    const tenant = await this.findTenantByCustomerId(customerId);

    if (!tenant) {
      this.logger.warn(`Tenant not found for customer ${customerId}`);
      return;
    }

    // Ensure subscription is active after payment
    if (tenant.subscriptionStatus !== 'active') {
      tenant.subscriptionStatus = 'active';
      await this.tenantRepository.save(tenant);
      this.logger.log(`Payment succeeded, tenant ${tenant.id} set to active`);
    }
  }

  private async handlePaymentFailed(invoice: Stripe.Invoice): Promise<void> {
    const customerId = invoice.customer as string;
    const tenant = await this.findTenantByCustomerId(customerId);

    if (!tenant) {
      this.logger.warn(`Tenant not found for customer ${customerId}`);
      return;
    }

    tenant.subscriptionStatus = 'past_due';
    await this.tenantRepository.save(tenant);
    this.logger.log(`Payment failed for tenant ${tenant.id}, status set to past_due`);
  }

  private async handleTrialWillEnd(subscription: Stripe.Subscription): Promise<void> {
    const tenant = await this.findTenantBySubscriptionId(subscription.id);

    if (!tenant) {
      this.logger.warn(`Tenant not found for subscription ${subscription.id}`);
      return;
    }

    this.logger.log(`Trial will end for tenant ${tenant.id} on ${new Date(subscription.trial_end! * 1000)}`);
    // Here you could send a notification email to the tenant
  }

  private async findTenantByCustomerId(customerId: string): Promise<Tenant | null> {
    return this.tenantRepository.findOne({
      where: { stripeCustomerId: customerId },
    });
  }

  private async findTenantBySubscriptionId(subscriptionId: string): Promise<Tenant | null> {
    return this.tenantRepository.findOne({
      where: { stripeSubscriptionId: subscriptionId },
    });
  }
}
