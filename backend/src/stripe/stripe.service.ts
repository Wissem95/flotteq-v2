import { Injectable, Inject, Logger } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { ConfigType } from '@nestjs/config';
import Stripe from 'stripe';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tenant } from '../entities/tenant.entity';
import { SubscriptionPlan } from '../entities/subscription-plan.entity';
import { Subscription } from '../entities/subscription.entity';
import stripeConfig from '../config/stripe.config';

@Injectable()
export class StripeService {
  public stripe: Stripe;
  private readonly logger = new Logger(StripeService.name);

  constructor(
    @Inject(stripeConfig.KEY)
    private config: ConfigType<typeof stripeConfig>,
    @InjectRepository(Tenant)
    private tenantRepository: Repository<Tenant>,
    @InjectRepository(SubscriptionPlan)
    private subscriptionPlanRepository: Repository<SubscriptionPlan>,
    @InjectRepository(Subscription)
    private subscriptionRepository: Repository<Subscription>,
    private moduleRef: ModuleRef,
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

      this.logger.log(
        `Stripe customer created: ${customer.id} for tenant ${tenant.id}`,
      );
      return customer.id;
    } catch (error) {
      this.logger.error(
        `Failed to create Stripe customer for tenant ${tenant.id}`,
        error,
      );
      throw error;
    }
  }

  /**
   * Créer une subscription active immédiatement
   */
  async createSubscription(
    customerId: string,
    priceId: string,
  ): Promise<Stripe.Subscription> {
    try {
      const subscription = await this.stripe.subscriptions.create({
        customer: customerId,
        items: [{ price: priceId }],
        payment_behavior: 'default_incomplete',
        payment_settings: {
          save_default_payment_method: 'on_subscription',
        },
        expand: ['latest_invoice.payment_intent'],
      });

      this.logger.log(
        `Stripe subscription created: ${subscription.id} for customer ${customerId}`,
      );
      return subscription;
    } catch (error) {
      this.logger.error(
        `Failed to create subscription for customer ${customerId}`,
        error,
      );
      throw error;
    }
  }

  /**
   * Récupérer le statut d'une subscription
   */
  async getSubscriptionStatus(subscriptionId: string): Promise<string> {
    try {
      const subscription =
        await this.stripe.subscriptions.retrieve(subscriptionId);
      return subscription.status;
    } catch (error) {
      this.logger.error(
        `Failed to get subscription status for ${subscriptionId}`,
        error,
      );
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
      this.logger.error(
        `Failed to cancel subscription ${subscriptionId}`,
        error,
      );
      throw error;
    }
  }

  /**
   * Créer un portal client pour gérer l'abonnement
   */
  async createPortalSession(
    customerId: string,
    returnUrl: string,
  ): Promise<string> {
    try {
      const session = await this.stripe.billingPortal.sessions.create({
        customer: customerId,
        return_url: returnUrl,
      });

      return session.url;
    } catch (error) {
      this.logger.error(
        `Failed to create portal session for customer ${customerId}`,
        error,
      );
      throw error;
    }
  }

  /**
   * Vérifier si un tenant a un abonnement actif
   */
  isActive(tenant: Tenant): boolean {
    return tenant.subscriptionStatus === 'active';
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
        case 'checkout.session.completed':
          await this.handleCheckoutCompleted(
            event.data.object as Stripe.Checkout.Session,
          );
          break;

        case 'customer.subscription.created':
          await this.handleSubscriptionCreated(
            event.data.object as Stripe.Subscription,
          );
          break;

        case 'customer.subscription.updated':
          await this.handleSubscriptionUpdated(
            event.data.object as Stripe.Subscription,
          );
          break;

        case 'customer.subscription.deleted':
          await this.handleSubscriptionDeleted(
            event.data.object as Stripe.Subscription,
          );
          break;

        case 'invoice.payment_succeeded':
          await this.handlePaymentSucceeded(
            event.data.object as Stripe.Invoice,
          );
          break;

        case 'invoice.payment_failed':
          await this.handlePaymentFailed(event.data.object as Stripe.Invoice);
          break;

        case 'payment_intent.succeeded':
          await this.handlePaymentIntentSucceeded(event);
          break;

        case 'account.updated':
          await this.handleAccountUpdated(event);
          break;

        default:
          this.logger.log(`Unhandled event type: ${event.type}`);
      }
    } catch (error) {
      this.logger.error(`Error processing webhook event ${event.type}`, error);
      throw error;
    }
  }

  /**
   * Handler pour checkout.session.completed
   * Déclenché après un paiement réussi via Checkout
   */
  private async handleCheckoutCompleted(
    session: Stripe.Checkout.Session,
  ): Promise<void> {
    this.logger.log(`Checkout completed: ${session.id}`);

    const customerId = session.customer as string;
    const subscriptionId = session.subscription as string;

    if (!customerId || !subscriptionId) {
      this.logger.warn(
        `Missing customer or subscription in checkout session ${session.id}`,
      );
      return;
    }

    const tenant = await this.findTenantByCustomerId(customerId);

    if (!tenant) {
      this.logger.warn(`Tenant not found for customer ${customerId}`);
      return;
    }

    // Récupérer les détails de la subscription depuis Stripe
    try {
      const subscription = await this.stripe.subscriptions.retrieve(
        subscriptionId,
        {
          expand: ['items.data.price'],
        },
      );

      // Récupérer le price_id de la subscription
      const priceId = subscription.items.data[0]?.price?.id;

      if (priceId) {
        // Trouver le plan correspondant au price_id
        const plan = await this.subscriptionPlanRepository.findOne({
          where: { stripePriceId: priceId },
        });

        if (plan) {
          tenant.planId = plan.id;
          this.logger.log(
            `Plan ${plan.name} (ID: ${plan.id}) assigned to tenant ${tenant.id}`,
          );

          // Mettre à jour la subscription dans la table subscriptions
          const dbSubscription = await this.subscriptionRepository.findOne({
            where: { tenantId: tenant.id },
          });

          if (dbSubscription) {
            dbSubscription.planId = plan.id;
            dbSubscription.stripeSubscriptionId = subscription.id;
            dbSubscription.status = 'active' as any;
            await this.subscriptionRepository.save(dbSubscription);
            this.logger.log(
              `Subscription in DB updated with plan ${plan.name} for tenant ${tenant.id}`,
            );
          } else {
            this.logger.warn(
              `No subscription found in DB for tenant ${tenant.id}`,
            );
          }
        } else {
          this.logger.warn(`No plan found for price ${priceId}`);
        }
      }

      tenant.stripeSubscriptionId = subscription.id;
      tenant.subscriptionStatus = subscription.status as any;
      tenant.subscriptionStartedAt = new Date(subscription.created * 1000);

      await this.tenantRepository.save(tenant);
      this.logger.log(
        `Checkout completed - Subscription activated for tenant ${tenant.id}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to retrieve subscription ${subscriptionId} after checkout`,
        error,
      );
    }
  }

  private async handleSubscriptionCreated(
    subscription: Stripe.Subscription,
  ): Promise<void> {
    const customerId = subscription.customer as string;
    const tenant = await this.findTenantByCustomerId(customerId);

    if (!tenant) {
      this.logger.warn(`Tenant not found for customer ${customerId}`);
      return;
    }

    tenant.stripeSubscriptionId = subscription.id;
    tenant.subscriptionStatus = subscription.status as any;
    tenant.subscriptionStartedAt = new Date(subscription.created * 1000);

    await this.tenantRepository.save(tenant);
    this.logger.log(`Subscription created for tenant ${tenant.id}`);
  }

  private async handleSubscriptionUpdated(
    subscription: Stripe.Subscription,
  ): Promise<void> {
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
    this.logger.log(
      `Subscription updated for tenant ${tenant.id}: ${subscription.status}`,
    );
  }

  private async handleSubscriptionDeleted(
    subscription: Stripe.Subscription,
  ): Promise<void> {
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
    this.logger.log(
      `Payment failed for tenant ${tenant.id}, status set to past_due`,
    );
  }

  private async findTenantByCustomerId(
    customerId: string,
  ): Promise<Tenant | null> {
    return this.tenantRepository.findOne({
      where: { stripeCustomerId: customerId },
    });
  }

  private async findTenantBySubscriptionId(
    subscriptionId: string,
  ): Promise<Tenant | null> {
    return this.tenantRepository.findOne({
      where: { stripeSubscriptionId: subscriptionId },
    });
  }

  /**
   * Créer une session Checkout pour upgrade de plan
   */
  async createCheckoutSession(
    customerId: string,
    priceId: string,
    successUrl: string,
    cancelUrl: string,
  ): Promise<string> {
    try {
      const session = await this.stripe.checkout.sessions.create({
        customer: customerId,
        payment_method_types: ['card'],
        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
        mode: 'subscription',
        success_url: successUrl,
        cancel_url: cancelUrl,
        allow_promotion_codes: true,
      });

      this.logger.log(
        `Checkout session created: ${session.id} for customer ${customerId}`,
      );
      return session.url || '';
    } catch (error) {
      this.logger.error(
        `Failed to create checkout session for customer ${customerId}`,
        error,
      );
      throw error;
    }
  }

  /**
   * Récupérer la liste des factures d'un client
   */
  async getInvoices(customerId: string, limit: number = 100): Promise<any[]> {
    try {
      const invoices = await this.stripe.invoices.list({
        customer: customerId,
        limit,
      });

      return invoices.data.map((inv) => ({
        id: inv.id,
        amountPaid: inv.amount_paid,
        currency: inv.currency,
        status: inv.status,
        pdfUrl: inv.invoice_pdf,
        number: inv.number,
        created: new Date(inv.created * 1000),
        periodStart: inv.period_start
          ? new Date(inv.period_start * 1000)
          : null,
        periodEnd: inv.period_end ? new Date(inv.period_end * 1000) : null,
      }));
    } catch (error) {
      this.logger.error(
        `Failed to get invoices for customer ${customerId}`,
        error,
      );
      return [];
    }
  }

  /**
   * Récupérer une facture spécifique
   */
  async getInvoice(invoiceId: string): Promise<any> {
    try {
      const invoice = await this.stripe.invoices.retrieve(invoiceId);
      return {
        id: invoice.id,
        amountPaid: invoice.amount_paid,
        currency: invoice.currency,
        status: invoice.status,
        pdfUrl: invoice.invoice_pdf,
        number: invoice.number,
        created: new Date(invoice.created * 1000),
      };
    } catch (error) {
      this.logger.error(`Failed to get invoice ${invoiceId}`, error);
      throw error;
    }
  }

  /**
   * Récupérer la méthode de paiement par défaut d'un client
   */
  async getPaymentMethod(customerId: string): Promise<any | null> {
    try {
      const customer = await this.stripe.customers.retrieve(customerId);

      if (!customer || customer.deleted) {
        return null;
      }

      const defaultPaymentMethodId =
        customer.invoice_settings?.default_payment_method;

      if (!defaultPaymentMethodId) {
        return null;
      }

      const paymentMethod = await this.stripe.paymentMethods.retrieve(
        defaultPaymentMethodId as string,
      );

      if (paymentMethod.type === 'card' && paymentMethod.card) {
        return {
          id: paymentMethod.id,
          brand: paymentMethod.card.brand,
          last4: paymentMethod.card.last4,
          expMonth: paymentMethod.card.exp_month,
          expYear: paymentMethod.card.exp_year,
        };
      }

      return null;
    } catch (error) {
      this.logger.error(
        `Failed to get payment method for customer ${customerId}`,
        error,
      );
      return null;
    }
  }

  /**
   * Handler pour payment_intent.succeeded (Bookings Payment)
   */
  private async handlePaymentIntentSucceeded(
    event: Stripe.Event,
  ): Promise<void> {
    const paymentIntent = event.data.object as Stripe.PaymentIntent;

    const type = paymentIntent.metadata?.type;
    const bookingId = paymentIntent.metadata?.bookingId;

    if (type !== 'booking_payment' || !bookingId) {
      this.logger.log('PaymentIntent without booking metadata, skipping');
      return;
    }

    try {
      // Utiliser ModuleRef pour éviter circular dependency
      const { BookingsPaymentService } = await import(
        '../modules/bookings/bookings-payment.service'
      );
      const bookingsPaymentService = this.moduleRef.get(
        BookingsPaymentService,
        { strict: false },
      );

      await bookingsPaymentService.handlePaymentSuccess(paymentIntent.id);

      this.logger.log(`✅ Booking ${bookingId} payment processed successfully`);
    } catch (error) {
      this.logger.error(
        `Error processing payment for booking ${bookingId}:`,
        error,
      );
      throw error;
    }
  }

  /**
   * Handler pour account.updated (Stripe Connect Partner Onboarding)
   */
  private async handleAccountUpdated(event: Stripe.Event): Promise<void> {
    const account = event.data.object as Stripe.Account;
    const partnerId = account.metadata?.partnerId;

    if (!partnerId) {
      this.logger.log('Account updated without partnerId metadata, skipping');
      return;
    }

    const completed = account.charges_enabled && account.payouts_enabled;

    this.logger.log(
      `Partner ${partnerId} Stripe account updated. Charges: ${account.charges_enabled}, Payouts: ${account.payouts_enabled}, Completed: ${completed}`,
    );

    // Optionnel : Mettre à jour partner en DB si nécessaire
    // Pour l'instant, le statut est vérifié à la demande via getStripeOnboardingStatus
  }
}
