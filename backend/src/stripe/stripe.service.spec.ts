import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StripeService } from './stripe.service';
import { Tenant, TenantStatus } from '../entities/tenant.entity';
import stripeConfig from '../config/stripe.config';
import Stripe from 'stripe';

describe('StripeService', () => {
  let service: StripeService;
  let tenantRepository: Repository<Tenant>;
  let stripeMock: any;

  const mockConfig = {
    secretKey: 'sk_test_123',
    webhookSecret: 'whsec_test_123',
    priceId: 'price_test_123',
    trialDays: 14,
  };

  const mockTenant = {
    id: 1,
    name: 'Test Tenant',
    email: 'test@example.com',
    phone: 'test-phone',
    address: 'test-address',
    city: 'test-city',
    postalCode: 'test-postal',
    country: 'test-country',
    status: TenantStatus.TRIAL,
    stripeCustomerId: 'cus_test_123',
    stripeSubscriptionId: 'sub_test_123',
    subscriptionStatus: 'trial',
    trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    subscriptionStartedAt: new Date(),
    subscriptionEndedAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
    storageUsedBytes: '0',
    planId: 1,
    plan: {} as any,
    users: [],
    vehicles: [],
    drivers: [],
  } as unknown as Tenant;

  beforeEach(async () => {
    stripeMock = {
      customers: {
        create: jest.fn(),
      },
      subscriptions: {
        create: jest.fn(),
        retrieve: jest.fn(),
        cancel: jest.fn(),
      },
      billingPortal: {
        sessions: {
          create: jest.fn(),
        },
      },
      webhooks: {
        constructEvent: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StripeService,
        {
          provide: stripeConfig.KEY,
          useValue: mockConfig,
        },
        {
          provide: getRepositoryToken(Tenant),
          useValue: {
            findOne: jest.fn(),
            save: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<StripeService>(StripeService);
    tenantRepository = module.get<Repository<Tenant>>(
      getRepositoryToken(Tenant),
    );

    // Mock Stripe instance
    (service as any).stripe = stripeMock;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createCustomer', () => {
    it('should create a Stripe customer', async () => {
      const mockCustomer = { id: 'cus_new_123' };
      stripeMock.customers.create.mockResolvedValue(mockCustomer);

      const result = await service.createCustomer(
        mockTenant,
        'test@example.com',
      );

      expect(result).toBe('cus_new_123');
      expect(stripeMock.customers.create).toHaveBeenCalledWith({
        email: 'test@example.com',
        name: 'Test Tenant',
        metadata: {
          tenantId: '1',
        },
      });
    });

    it('should throw error if customer creation fails', async () => {
      stripeMock.customers.create.mockRejectedValue(new Error('Stripe error'));

      await expect(
        service.createCustomer(mockTenant, 'test@example.com'),
      ).rejects.toThrow('Stripe error');
    });
  });

  describe('createSubscription', () => {
    it('should create a subscription with trial', async () => {
      const mockSubscription = {
        id: 'sub_new_123',
        status: 'trialing',
      };
      stripeMock.subscriptions.create.mockResolvedValue(mockSubscription);

      const result = await service.createSubscription(
        'cus_test_123',
        'price_test_123',
      );

      expect(result).toEqual(mockSubscription);
      expect(stripeMock.subscriptions.create).toHaveBeenCalledWith({
        customer: 'cus_test_123',
        items: [{ price: 'price_test_123' }],
        trial_period_days: 14,
        payment_behavior: 'default_incomplete',
        payment_settings: {
          save_default_payment_method: 'on_subscription',
        },
        expand: ['latest_invoice.payment_intent'],
      });
    });
  });

  describe('getSubscriptionStatus', () => {
    it('should return subscription status', async () => {
      stripeMock.subscriptions.retrieve.mockResolvedValue({ status: 'active' });

      const result = await service.getSubscriptionStatus('sub_test_123');

      expect(result).toBe('active');
      expect(stripeMock.subscriptions.retrieve).toHaveBeenCalledWith(
        'sub_test_123',
      );
    });
  });

  describe('cancelSubscription', () => {
    it('should cancel a subscription', async () => {
      stripeMock.subscriptions.cancel.mockResolvedValue({ status: 'canceled' });

      await service.cancelSubscription('sub_test_123');

      expect(stripeMock.subscriptions.cancel).toHaveBeenCalledWith(
        'sub_test_123',
      );
    });
  });

  describe('createPortalSession', () => {
    it('should create a portal session', async () => {
      const mockSession = { url: 'https://billing.stripe.com/session_123' };
      stripeMock.billingPortal.sessions.create.mockResolvedValue(mockSession);

      const result = await service.createPortalSession(
        'cus_test_123',
        'https://example.com/return',
      );

      expect(result).toBe('https://billing.stripe.com/session_123');
      expect(stripeMock.billingPortal.sessions.create).toHaveBeenCalledWith({
        customer: 'cus_test_123',
        return_url: 'https://example.com/return',
      });
    });
  });

  describe('isTrial', () => {
    it('should return true if tenant is in trial and trial not ended', () => {
      const tenant = { ...mockTenant, subscriptionStatus: 'trial' };
      expect(service.isTrial(tenant)).toBe(true);
    });

    it('should return false if tenant is not in trial status', () => {
      const tenant = { ...mockTenant, subscriptionStatus: 'active' };
      expect(service.isTrial(tenant)).toBe(false);
    });

    it('should return false if trial has ended', () => {
      const tenant = {
        ...mockTenant,
        subscriptionStatus: 'trial',
        trialEndsAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
      };
      expect(service.isTrial(tenant)).toBe(false);
    });

    it('should return false if trialEndsAt is null', () => {
      const tenant = {
        ...mockTenant,
        subscriptionStatus: 'trial',
        trialEndsAt: null as any,
      };
      expect(service.isTrial(tenant)).toBe(false);
    });
  });

  describe('isActive', () => {
    it('should return true if subscription status is active', () => {
      const tenant = { ...mockTenant, subscriptionStatus: 'active' };
      expect(service.isActive(tenant)).toBe(true);
    });

    it('should return true if tenant is in valid trial', () => {
      const tenant = { ...mockTenant, subscriptionStatus: 'trial' };
      expect(service.isActive(tenant)).toBe(true);
    });

    it('should return false if subscription is cancelled', () => {
      const tenant = { ...mockTenant, subscriptionStatus: 'cancelled' };
      expect(service.isActive(tenant)).toBe(false);
    });
  });

  describe('handleWebhook', () => {
    it('should verify webhook signature and process event', async () => {
      const mockEvent: Stripe.Event = {
        id: 'evt_test_123',
        object: 'event',
        api_version: '2024-09-30.acacia',
        created: Date.now(),
        data: {
          object: {
            id: 'sub_test_123',
            customer: 'cus_test_123',
            status: 'active',
            created: Date.now(),
          } as any,
        },
        livemode: false,
        pending_webhooks: 0,
        request: null,
        type: 'customer.subscription.created',
      };

      stripeMock.webhooks.constructEvent.mockReturnValue(mockEvent);
      jest.spyOn(tenantRepository, 'findOne').mockResolvedValue(mockTenant);
      jest.spyOn(tenantRepository, 'save').mockResolvedValue(mockTenant);

      await service.handleWebhook(
        'test_signature',
        Buffer.from('test_payload'),
      );

      expect(stripeMock.webhooks.constructEvent).toHaveBeenCalledWith(
        Buffer.from('test_payload'),
        'test_signature',
        mockConfig.webhookSecret,
      );
    });

    it('should throw error if signature verification fails', async () => {
      stripeMock.webhooks.constructEvent.mockImplementation(() => {
        throw new Error('Invalid signature');
      });

      await expect(
        service.handleWebhook('invalid_signature', Buffer.from('test_payload')),
      ).rejects.toThrow('Invalid signature');
    });
  });

  describe('webhook event handlers', () => {
    beforeEach(() => {
      jest.spyOn(tenantRepository, 'findOne').mockResolvedValue(mockTenant);
      jest.spyOn(tenantRepository, 'save').mockResolvedValue(mockTenant);
    });

    it('should handle customer.subscription.updated event', async () => {
      const mockEvent: Stripe.Event = {
        id: 'evt_test_123',
        object: 'event',
        api_version: '2024-09-30.acacia',
        created: Date.now(),
        data: {
          object: {
            id: 'sub_test_123',
            customer: 'cus_test_123',
            status: 'active',
            canceled_at: null,
          } as any,
        },
        livemode: false,
        pending_webhooks: 0,
        request: null,
        type: 'customer.subscription.updated',
      };

      stripeMock.webhooks.constructEvent.mockReturnValue(mockEvent);

      await service.handleWebhook(
        'test_signature',
        Buffer.from('test_payload'),
      );

      expect(tenantRepository.save).toHaveBeenCalled();
    });

    it('should handle invoice.payment_failed event', async () => {
      const mockEvent: Stripe.Event = {
        id: 'evt_test_123',
        object: 'event',
        api_version: '2024-09-30.acacia',
        created: Date.now(),
        data: {
          object: {
            id: 'in_test_123',
            customer: 'cus_test_123',
          } as any,
        },
        livemode: false,
        pending_webhooks: 0,
        request: null,
        type: 'invoice.payment_failed',
      };

      stripeMock.webhooks.constructEvent.mockReturnValue(mockEvent);

      await service.handleWebhook(
        'test_signature',
        Buffer.from('test_payload'),
      );

      expect(tenantRepository.save).toHaveBeenCalled();
    });
  });
});
