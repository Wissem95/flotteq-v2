import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StripeController } from './stripe.controller';
import { StripeService } from './stripe.service';
import { Tenant } from '../entities/tenant.entity';

describe('StripeController', () => {
  let controller: StripeController;
  let stripeService: StripeService;
  let tenantRepository: Repository<Tenant>;

  const mockStripeService = {
    handleWebhook: jest.fn(),
    createPortalSession: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StripeController],
      providers: [
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

    controller = module.get<StripeController>(StripeController);
    stripeService = module.get<StripeService>(StripeService);
    tenantRepository = module.get<Repository<Tenant>>(
      getRepositoryToken(Tenant),
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('handleWebhook', () => {
    it('should process webhook successfully', async () => {
      const mockRequest: any = {
        rawBody: Buffer.from('test_payload'),
        body: {},
      };

      mockStripeService.handleWebhook.mockResolvedValue(undefined);

      const result = await controller.handleWebhook(
        'test_signature',
        mockRequest,
      );

      expect(result).toEqual({ received: true });
      expect(mockStripeService.handleWebhook).toHaveBeenCalledWith(
        'test_signature',
        Buffer.from('test_payload'),
      );
    });

    it('should throw BadRequestException if signature is missing', async () => {
      const mockRequest: any = {
        rawBody: Buffer.from('test_payload'),
      };

      await expect(controller.handleWebhook('', mockRequest)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException if webhook processing fails', async () => {
      const mockRequest: any = {
        rawBody: Buffer.from('test_payload'),
      };

      mockStripeService.handleWebhook.mockRejectedValue(
        new Error('Processing error'),
      );

      await expect(
        controller.handleWebhook('test_signature', mockRequest),
      ).rejects.toThrow(BadRequestException);
    });

    it('should use request body if rawBody is not available', async () => {
      const mockRequest: any = {
        body: { test: 'data' },
      };

      mockStripeService.handleWebhook.mockResolvedValue(undefined);

      const result = await controller.handleWebhook(
        'test_signature',
        mockRequest,
      );

      expect(result).toEqual({ received: true });
      expect(mockStripeService.handleWebhook).toHaveBeenCalledWith(
        'test_signature',
        Buffer.from(JSON.stringify({ test: 'data' })),
      );
    });
  });

  describe('createPortalSession', () => {
    it('should create a portal session successfully', async () => {
      const mockRequest: any = {
        user: {
          tenantId: 1,
        },
      };

      jest.spyOn(tenantRepository, 'findOne').mockResolvedValue({
        stripeCustomerId: 'cus_test_123',
      } as Tenant);

      mockStripeService.createPortalSession.mockResolvedValue(
        'https://billing.stripe.com/session_123',
      );

      const result = await controller.createPortalSession(mockRequest);

      expect(result).toEqual({ url: 'https://billing.stripe.com/session_123' });
      expect(mockStripeService.createPortalSession).toHaveBeenCalledWith(
        'cus_test_123',
        expect.stringContaining('/billing'),
      );
    });

    it('should throw BadRequestException if tenant has no Stripe customer', async () => {
      const mockRequest: any = {
        user: {
          tenantId: 1,
        },
      };

      jest.spyOn(tenantRepository, 'findOne').mockResolvedValue({
        stripeCustomerId: null,
      } as unknown as Tenant);

      await expect(controller.createPortalSession(mockRequest)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException if tenant is missing', async () => {
      const mockRequest: any = {
        user: {
          tenantId: 1,
        },
      };

      jest.spyOn(tenantRepository, 'findOne').mockResolvedValue(null);

      await expect(controller.createPortalSession(mockRequest)).rejects.toThrow(
        BadRequestException,
      );
    });
  });
});
