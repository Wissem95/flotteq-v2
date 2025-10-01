import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { StripeController } from './stripe.controller';
import { StripeService } from './stripe.service';

describe('StripeController', () => {
  let controller: StripeController;
  let stripeService: StripeService;

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
      ],
    }).compile();

    controller = module.get<StripeController>(StripeController);
    stripeService = module.get<StripeService>(StripeService);
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

      const result = await controller.handleWebhook('test_signature', mockRequest);

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

      await expect(
        controller.handleWebhook('', mockRequest),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if webhook processing fails', async () => {
      const mockRequest: any = {
        rawBody: Buffer.from('test_payload'),
      };

      mockStripeService.handleWebhook.mockRejectedValue(new Error('Processing error'));

      await expect(
        controller.handleWebhook('test_signature', mockRequest),
      ).rejects.toThrow(BadRequestException);
    });

    it('should use request body if rawBody is not available', async () => {
      const mockRequest: any = {
        body: { test: 'data' },
      };

      mockStripeService.handleWebhook.mockResolvedValue(undefined);

      const result = await controller.handleWebhook('test_signature', mockRequest);

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
          tenant: {
            stripeCustomerId: 'cus_test_123',
          },
        },
      };

      mockStripeService.createPortalSession.mockResolvedValue(
        'https://billing.stripe.com/session_123',
      );

      const result = await controller.createPortalSession(mockRequest);

      expect(result).toEqual({ url: 'https://billing.stripe.com/session_123' });
      expect(mockStripeService.createPortalSession).toHaveBeenCalledWith(
        'cus_test_123',
        expect.stringContaining('/settings/billing'),
      );
    });

    it('should throw BadRequestException if tenant has no Stripe customer', async () => {
      const mockRequest: any = {
        user: {
          tenant: {
            stripeCustomerId: null,
          },
        },
      };

      await expect(
        controller.createPortalSession(mockRequest),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if tenant is missing', async () => {
      const mockRequest: any = {
        user: {
          tenant: null,
        },
      };

      await expect(
        controller.createPortalSession(mockRequest),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
