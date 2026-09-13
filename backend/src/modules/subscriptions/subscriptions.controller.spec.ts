import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tenant } from '../../entities/tenant.entity';
import { StripeService } from '../../stripe/stripe.service';
import { SubscriptionsController } from './subscriptions.controller';
import { SubscriptionsService } from './subscriptions.service';

describe('SubscriptionsController', () => {
  let controller: SubscriptionsController;
  let tenantRepository: Repository<Tenant>;

  const mockSubscriptionsService = {};
  const mockStripeService = {
    getInvoice: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SubscriptionsController],
      providers: [
        {
          provide: SubscriptionsService,
          useValue: mockSubscriptionsService,
        },
        {
          provide: StripeService,
          useValue: mockStripeService,
        },
        {
          provide: getRepositoryToken(Tenant),
          useValue: {
            findOne: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<SubscriptionsController>(SubscriptionsController);
    tenantRepository = module.get<Repository<Tenant>>(
      getRepositoryToken(Tenant),
    );
  });

  describe('downloadInvoice', () => {
    it('refuse le téléchargement d’une facture appartenant à un autre customer Stripe', async () => {
      jest.spyOn(tenantRepository, 'findOne').mockResolvedValue({
        id: 42,
        stripeCustomerId: 'cus_tenant',
      } as Tenant);
      mockStripeService.getInvoice.mockResolvedValue({
        id: 'in_other_tenant',
        customer: 'cus_other',
        amountPaid: 1200,
        currency: 'eur',
        status: 'paid',
        pdfUrl: 'https://pay.stripe.com/invoices/other.pdf',
        number: 'F-2026-001',
        created: new Date('2026-09-13T00:00:00.000Z'),
      });
      const response = { redirect: jest.fn() } as any;

      await expect(
        controller.downloadInvoice(
          { user: { tenantId: 42 } },
          'in_other_tenant',
          response,
        ),
      ).rejects.toThrow(NotFoundException);

      expect(response.redirect).not.toHaveBeenCalled();
    });
  });

  describe('createCheckoutSession', () => {
    it('refuse de créer un second abonnement Stripe pour un tenant déjà abonné', async () => {
      jest.spyOn(tenantRepository, 'findOne').mockResolvedValue({
        id: 42,
        email: 'tenant@example.com',
        stripeCustomerId: 'cus_tenant',
        stripeSubscriptionId: 'sub_existing',
      } as Tenant);

      await expect(
        controller.createCheckoutSession(
          { user: { tenantId: 42 } },
          { planId: 2 },
        ),
      ).rejects.toThrow(
        new BadRequestException(
          'Use the customer portal to change an existing subscription',
        ),
      );
    });
  });
});
