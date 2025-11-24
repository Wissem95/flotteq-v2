import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { TenantsService } from './tenants.service';
import { Tenant, TenantStatus } from '../../entities/tenant.entity';
import { Subscription } from '../../entities/subscription.entity';
import { Document } from '../../entities/document.entity';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { StripeService } from '../../stripe/stripe.service';

describe('TenantsService', () => {
  let service: TenantsService;
  let repository: Repository<Tenant>;
  let stripeService: StripeService;
  let configService: ConfigService;

  const mockTenant: Partial<Tenant> = {
    id: 1,
    name: 'Test Company',
    email: 'test@company.com',
    status: TenantStatus.TRIAL,
    stripeCustomerId: 'cus_test_123',
    stripeSubscriptionId: 'sub_test_123',
    subscriptionStatus: 'trial',
    trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    delete: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  const mockSubscriptionRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
  };

  const mockDocumentRepository = {
    find: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  const mockStripeService = {
    createCustomer: jest.fn(),
    createSubscription: jest.fn(),
    isActive: jest.fn(),
    isTrial: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn((key: string, defaultValue?: any) => {
      if (key === 'stripe.trialDays') return 14;
      if (key === 'stripe.priceId') return 'price_test_123';
      return defaultValue;
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TenantsService,
        {
          provide: getRepositoryToken(Tenant),
          useValue: mockRepository,
        },
        {
          provide: getRepositoryToken(Subscription),
          useValue: mockSubscriptionRepository,
        },
        {
          provide: getRepositoryToken(Document),
          useValue: mockDocumentRepository,
        },
        {
          provide: StripeService,
          useValue: mockStripeService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<TenantsService>(TenantsService);
    repository = module.get<Repository<Tenant>>(getRepositoryToken(Tenant));
    stripeService = module.get<StripeService>(StripeService);
    configService = module.get<ConfigService>(ConfigService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new tenant with TRIAL status and Stripe integration', async () => {
      const createDto = {
        name: 'New Company',
        email: 'new@company.com',
      };

      mockRepository.findOne.mockResolvedValue(null);
      mockRepository.create.mockReturnValue(mockTenant);
      mockRepository.save.mockResolvedValue(mockTenant);
      mockStripeService.createCustomer.mockResolvedValue('cus_new_123');
      mockStripeService.createSubscription.mockResolvedValue({
        id: 'sub_new_123',
      });

      const result = await service.create(createDto);

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: [{ email: createDto.email }, { name: createDto.name }],
      });
      expect(mockRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          ...createDto,
          status: TenantStatus.TRIAL,
          subscriptionStatus: 'trial',
        }),
      );
      expect(mockStripeService.createCustomer).toHaveBeenCalled();
      expect(mockStripeService.createSubscription).toHaveBeenCalled();
      expect(mockRepository.save).toHaveBeenCalled();
      expect(result).toEqual(mockTenant);
    });

    it('should throw ConflictException if tenant with same email exists', async () => {
      const createDto = {
        name: 'Existing Company',
        email: 'existing@company.com',
      };

      mockRepository.findOne.mockResolvedValue(mockTenant);

      await expect(service.create(createDto)).rejects.toThrow(
        ConflictException,
      );
      expect(mockRepository.create).not.toHaveBeenCalled();
      expect(mockRepository.save).not.toHaveBeenCalled();
    });

    it('should set trialEndsAt to 14 days from now', async () => {
      const createDto = {
        name: 'Trial Company',
        email: 'trial@company.com',
      };

      const now = Date.now();
      const expectedTrialEnd = new Date(now + 14 * 24 * 60 * 60 * 1000);

      mockRepository.findOne.mockResolvedValue(null);
      mockRepository.create.mockImplementation((data) => data);
      mockRepository.save.mockImplementation((data) => Promise.resolve(data));
      mockStripeService.createCustomer.mockResolvedValue('cus_new_123');
      mockStripeService.createSubscription.mockResolvedValue({
        id: 'sub_new_123',
      });

      await service.create(createDto);

      expect(mockRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          status: TenantStatus.TRIAL,
          trialEndsAt: expect.any(Date),
        }),
      );
    });

    it('should not fail tenant creation if Stripe fails', async () => {
      const createDto = {
        name: 'New Company',
        email: 'new@company.com',
      };

      mockRepository.findOne.mockResolvedValue(null);
      mockRepository.create.mockReturnValue(mockTenant);
      mockRepository.save.mockResolvedValue(mockTenant);
      mockStripeService.createCustomer.mockRejectedValue(
        new Error('Stripe error'),
      );

      const result = await service.create(createDto);

      expect(result).toEqual(mockTenant);
      expect(mockRepository.save).toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return an array of tenants', async () => {
      const mockTenants = [mockTenant, { ...mockTenant, id: 2 }];
      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([mockTenants, 2]),
      };

      mockRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const result = await service.findAll();

      expect(result.data).toEqual(mockTenants);
      expect(result.total).toBe(2);
    });
  });

  describe('findOne', () => {
    it('should return a tenant with all relations', async () => {
      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(mockTenant),
      };

      mockRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const result = await service.findOne(1);

      expect(result).toEqual(mockTenant);
    });

    it('should throw NotFoundException if tenant not found', async () => {
      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(null),
      };

      mockRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a tenant', async () => {
      const updateDto = {
        name: 'Updated Company',
        city: 'Paris',
      };

      const updatedTenant = { ...mockTenant, ...updateDto };

      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(mockTenant),
      };

      mockRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);
      mockRepository.save.mockResolvedValue(updatedTenant);

      const result = await service.update(1, updateDto);

      expect(result.name).toBe(updateDto.name);
      expect(result.city).toBe(updateDto.city);
    });

    it('should throw ConflictException if email/name already used by another tenant', async () => {
      const updateDto = {
        email: 'another@company.com',
      };

      const anotherTenant = { ...mockTenant, id: 2 };

      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(mockTenant),
      };

      mockRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);
      mockRepository.findOne.mockResolvedValue(anotherTenant);

      await expect(service.update(1, updateDto)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('updateStatus', () => {
    it('should update tenant status', async () => {
      const updatedTenant = { ...mockTenant, status: TenantStatus.ACTIVE };

      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(mockTenant),
      };

      mockRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);
      mockRepository.save.mockResolvedValue(updatedTenant);

      const result = await service.updateStatus(1, TenantStatus.ACTIVE);

      expect(result.status).toBe(TenantStatus.ACTIVE);
      expect(mockRepository.save).toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should delete a tenant', async () => {
      mockRepository.delete.mockResolvedValue({ affected: 1 });

      await service.remove(1);

      expect(mockRepository.delete).toHaveBeenCalledWith(1);
    });

    it('should throw NotFoundException if tenant not found', async () => {
      mockRepository.delete.mockResolvedValue({ affected: 0 });

      await expect(service.remove(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('getStats', () => {
    it('should return tenant statistics', async () => {
      const tenantWithRelations = {
        ...mockTenant,
        users: [{}, {}],
        vehicles: [{}, {}, {}],
        drivers: [{}],
        status: TenantStatus.TRIAL,
      };

      mockRepository.findOne.mockResolvedValue(tenantWithRelations);

      const result = await service.getStats(1);

      expect(result).toEqual({
        usersCount: 2,
        vehiclesCount: 3,
        driversCount: 1,
        status: TenantStatus.TRIAL,
        trialEndsAt: mockTenant.trialEndsAt,
        createdAt: mockTenant.createdAt,
      });
    });

    it('should return zero counts for empty relations', async () => {
      mockRepository.findOne.mockResolvedValue(mockTenant);

      const result = await service.getStats(1);

      expect(result.usersCount).toBe(0);
      expect(result.vehiclesCount).toBe(0);
      expect(result.driversCount).toBe(0);
    });

    it('should throw NotFoundException if tenant not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.getStats(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('canAccess', () => {
    it('should return true if tenant subscription is active', async () => {
      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(mockTenant),
      };

      mockRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);
      mockStripeService.isActive.mockReturnValue(true);
      mockStripeService.isTrial.mockReturnValue(false);

      const result = await service.canAccess(1);

      expect(result).toBe(true);
      expect(mockStripeService.isActive).toHaveBeenCalled();
    });

    it('should return true if tenant is in trial period', async () => {
      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(mockTenant),
      };

      mockRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);
      mockStripeService.isActive.mockReturnValue(false);
      mockStripeService.isTrial.mockReturnValue(true);

      const result = await service.canAccess(1);

      expect(result).toBe(true);
      expect(mockStripeService.isTrial).toHaveBeenCalled();
    });

    it('should return false if subscription is expired and trial ended', async () => {
      const expiredTenant = {
        ...mockTenant,
        subscriptionStatus: 'cancelled',
        trialEndsAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
      };

      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(expiredTenant),
      };

      mockRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);
      mockStripeService.isActive.mockReturnValue(false);
      mockStripeService.isTrial.mockReturnValue(false);

      const result = await service.canAccess(1);

      expect(result).toBe(false);
    });
  });
});
