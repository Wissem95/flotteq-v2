import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { SubscriptionsService } from './subscriptions.service';
import { Subscription } from '../../entities/subscription.entity';
import { SubscriptionPlan } from '../../entities/subscription-plan.entity';
import { Tenant } from '../../entities/tenant.entity';
import { ForbiddenException, BadRequestException } from '@nestjs/common';

describe('SubscriptionsService', () => {
  let service: SubscriptionsService;

  const mockPlan = {
    id: 1,
    name: 'Freemium',
    price: 0,
    maxVehicles: 2,
    maxUsers: 1,
    maxDrivers: 2,
    trialDays: 0,
    features: ['basic_dashboard'],
  };

  const mockSubscription = {
    id: 'sub-123',
    tenantId: 1,
    planId: 1,
    plan: mockPlan,
    status: 'active',
    usage: { vehicles: 1, users: 1, drivers: 1 },
  };

  const mockRepositories = {
    subscriptionRepo: {
      create: jest.fn(),
      save: jest.fn(),
      findOne: jest.fn(),
      find: jest.fn(),
      count: jest.fn(),
    },
    planRepo: {
      create: jest.fn(),
      save: jest.fn(),
      find: jest.fn(),
      findOne: jest.fn(),
      delete: jest.fn(),
    },
    tenantRepo: {
      findOne: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SubscriptionsService,
        {
          provide: getRepositoryToken(Subscription),
          useValue: mockRepositories.subscriptionRepo,
        },
        {
          provide: getRepositoryToken(SubscriptionPlan),
          useValue: mockRepositories.planRepo,
        },
        {
          provide: getRepositoryToken(Tenant),
          useValue: mockRepositories.tenantRepo,
        },
      ],
    }).compile();

    service = module.get<SubscriptionsService>(SubscriptionsService);
  });

  describe('checkLimit', () => {
    it('should return true when under limit', async () => {
      mockRepositories.subscriptionRepo.findOne.mockResolvedValue(
        mockSubscription,
      );

      const result = await service.checkLimit(1, 'vehicles');
      expect(result).toBe(true); // 1 < 2
    });

    it('should return false when at limit', async () => {
      const fullSubscription = {
        ...mockSubscription,
        usage: { vehicles: 2, users: 1, drivers: 2 },
      };
      mockRepositories.subscriptionRepo.findOne.mockResolvedValue(
        fullSubscription,
      );

      const result = await service.checkLimit(1, 'vehicles');
      expect(result).toBe(false); // 2 >= 2
    });

    it('should return true for unlimited (-1)', async () => {
      const unlimitedPlan = { ...mockPlan, maxVehicles: -1 };
      const subscription = { ...mockSubscription, plan: unlimitedPlan };
      mockRepositories.subscriptionRepo.findOne.mockResolvedValue(subscription);

      const result = await service.checkLimit(1, 'vehicles');
      expect(result).toBe(true);
    });
  });

  describe('enforceLimit', () => {
    it('should throw ForbiddenException when limit reached', async () => {
      const fullSubscription = {
        ...mockSubscription,
        usage: { vehicles: 2, users: 1, drivers: 2 },
      };
      mockRepositories.subscriptionRepo.findOne.mockResolvedValue(
        fullSubscription,
      );

      await expect(service.enforceLimit(1, 'vehicles')).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('should not throw when under limit', async () => {
      mockRepositories.subscriptionRepo.findOne.mockResolvedValue(
        mockSubscription,
      );

      await expect(service.enforceLimit(1, 'vehicles')).resolves.not.toThrow();
    });
  });

  describe('plans management', () => {
    it('should not delete plan with active subscriptions', async () => {
      mockRepositories.planRepo.findOne.mockResolvedValue(mockPlan);
      mockRepositories.subscriptionRepo.count.mockResolvedValue(3);

      await expect(service.deletePlan(1)).rejects.toThrow(BadRequestException);
    });

    it('should delete plan without subscriptions', async () => {
      mockRepositories.planRepo.findOne.mockResolvedValue(mockPlan);
      mockRepositories.subscriptionRepo.count.mockResolvedValue(0);
      mockRepositories.planRepo.delete.mockResolvedValue({ affected: 1 });

      await expect(service.deletePlan(1)).resolves.not.toThrow();
    });
  });
});
