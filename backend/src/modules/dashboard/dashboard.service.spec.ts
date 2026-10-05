import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DashboardService } from './dashboard.service';
import { Vehicle, VehicleStatus } from '../../entities/vehicle.entity';
import { Driver, DriverStatus } from '../../entities/driver.entity';
import {
  Maintenance,
  MaintenanceStatus,
  MaintenanceType,
} from '../maintenance/entities/maintenance.entity';
import { Tenant } from '../../entities/tenant.entity';
import { Subscription } from '../../entities/subscription.entity';
import { User } from '../../entities/user.entity';
import { DocumentsService } from '../../documents/documents.service';
import { ServiceUnavailableException } from '@nestjs/common';

describe('DashboardService', () => {
  let service: DashboardService;
  let vehicleRepository: Repository<Vehicle>;
  let driverRepository: Repository<Driver>;
  let maintenanceRepository: Repository<Maintenance>;

  const mockVehicleRepository = {
    count: jest.fn(),
    find: jest.fn(),
  };

  const mockDriverRepository = {
    count: jest.fn(),
    find: jest.fn(),
  };

  const mockMaintenanceRepository = {
    count: jest.fn(),
    find: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  const mockTenantRepository = {
    count: jest.fn(),
    find: jest.fn(),
  };

  const mockSubscriptionRepository = {
    count: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  const mockUserRepository = {
    count: jest.fn(),
    find: jest.fn(),
  };

  const mockDocumentsService = {
    getTenantStorageUsage: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DashboardService,
        {
          provide: DocumentsService,
          useValue: mockDocumentsService,
        },
        {
          provide: getRepositoryToken(Vehicle),
          useValue: mockVehicleRepository,
        },
        {
          provide: getRepositoryToken(Driver),
          useValue: mockDriverRepository,
        },
        {
          provide: getRepositoryToken(Maintenance),
          useValue: mockMaintenanceRepository,
        },
        {
          provide: getRepositoryToken(Tenant),
          useValue: mockTenantRepository,
        },
        {
          provide: getRepositoryToken(Subscription),
          useValue: mockSubscriptionRepository,
        },
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
      ],
    }).compile();

    service = module.get<DashboardService>(DashboardService);
    vehicleRepository = module.get<Repository<Vehicle>>(
      getRepositoryToken(Vehicle),
    );
    driverRepository = module.get<Repository<Driver>>(
      getRepositoryToken(Driver),
    );
    maintenanceRepository = module.get<Repository<Maintenance>>(
      getRepositoryToken(Maintenance),
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getInternalAnalytics', () => {
    const previousEnvironment = {
      internalUrl: process.env.UMAMI_INTERNAL_URL,
      adminPassword: process.env.UMAMI_ADMIN_PASSWORD,
      websiteId: process.env.UMAMI_WEBSITE_ID,
    };
    const originalFetch = global.fetch;

    beforeEach(() => {
      process.env.UMAMI_INTERNAL_URL = 'http://umami:3000';
      process.env.UMAMI_ADMIN_PASSWORD = 'secret-test';
      process.env.UMAMI_WEBSITE_ID = 'website-test';
    });

    afterEach(() => {
      global.fetch = originalFetch;

      for (const [key, value] of Object.entries({
        UMAMI_INTERNAL_URL: previousEnvironment.internalUrl,
        UMAMI_ADMIN_PASSWORD: previousEnvironment.adminPassword,
        UMAMI_WEBSITE_ID: previousEnvironment.websiteId,
      })) {
        if (value === undefined) {
          delete process.env[key];
        } else {
          process.env[key] = value;
        }
      }
    });

    it('agrège les statistiques et la série quotidienne sans exposer les identifiants Umami', async () => {
      const fetchMock = jest
        .fn()
        .mockResolvedValueOnce({
          ok: true,
          json: jest.fn().mockResolvedValue({ token: 'token-test' }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: jest.fn().mockResolvedValue({
            pageviews: { value: 12 },
            visitors: { value: 8 },
            visits: { value: 10 },
            bounces: { value: 4 },
          }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: jest.fn().mockResolvedValue({
            pageviews: [{ x: '2026-10-05T00:00:00Z', y: 12 }],
            sessions: [{ x: '2026-10-05T00:00:00Z', y: 10 }],
          }),
        });
      global.fetch = fetchMock as typeof fetch;

      const result = await (service as any).getInternalAnalytics(30);

      expect(result).toEqual({
        periodDays: 30,
        pageviews: 12,
        visitors: 8,
        visits: 10,
        bounces: 4,
        bounceRate: 40,
        timeline: [
          {
            date: '2026-10-05T00:00:00Z',
            pageviews: 12,
            sessions: 10,
          },
        ],
      });
      expect(fetchMock).toHaveBeenNthCalledWith(
        1,
        'http://umami:3000/api/auth/login',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({
            username: 'admin',
            password: 'secret-test',
          }),
        }),
      );
      expect(JSON.stringify(result)).not.toContain('secret-test');
      expect(JSON.stringify(result)).not.toContain('token-test');
    });

    it('refuse proprement une configuration Umami incomplète', async () => {
      delete process.env.UMAMI_ADMIN_PASSWORD;

      await expect(
        (service as any).getInternalAnalytics(30),
      ).rejects.toBeInstanceOf(ServiceUnavailableException);
    });

    it('normalise une indisponibilité Umami sans divulguer sa réponse', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        status: 401,
        json: jest.fn().mockResolvedValue({ error: 'secret upstream error' }),
      }) as typeof fetch;

      await expect(
        (service as any).getInternalAnalytics(30),
      ).rejects.toThrow('Analytics temporairement indisponible');
    });
  });

  describe('getOverview', () => {
    it('should return dashboard overview with all stats', async () => {
      const tenantId = 1;
      mockVehicleRepository.count.mockResolvedValueOnce(10); // total vehicles
      mockDriverRepository.count.mockResolvedValueOnce(5); // total drivers
      mockMaintenanceRepository.count.mockResolvedValueOnce(15); // total maintenances
      mockVehicleRepository.count.mockResolvedValueOnce(7); // active vehicles
      mockDriverRepository.count.mockResolvedValueOnce(4); // active drivers
      mockMaintenanceRepository.count.mockResolvedValueOnce(3); // upcoming maintenances

      mockVehicleRepository.find.mockResolvedValue([
        { purchasePrice: 20000, purchaseDate: new Date('2020-01-01') },
        { purchasePrice: 30000, purchaseDate: new Date('2021-01-01') },
      ]);

      const result = await service.getOverview(tenantId);

      expect(result).toEqual({
        totalVehicles: 10,
        totalDrivers: 5,
        totalMaintenances: 15,
        activeVehicles: 7,
        activeDrivers: 4,
        upcomingMaintenances: 3,
        totalFleetValue: 50000,
        avgVehicleAge: expect.any(Number),
      });
    });
  });

  describe('getFleetStatus', () => {
    it('should return fleet status breakdown', async () => {
      const tenantId = 1;
      mockVehicleRepository.find.mockResolvedValue([
        { status: VehicleStatus.AVAILABLE },
        { status: VehicleStatus.AVAILABLE },
        { status: VehicleStatus.IN_USE },
        { status: VehicleStatus.MAINTENANCE },
        { status: VehicleStatus.OUT_OF_SERVICE },
      ]);

      const result = await service.getFleetStatus(tenantId);

      expect(result).toEqual({
        available: 2,
        inUse: 1,
        maintenance: 1,
        outOfService: 1,
        total: 5,
        utilizationRate: 20, // 1/5 = 20%
      });
    });

    it('should handle empty fleet', async () => {
      mockVehicleRepository.find.mockResolvedValue([]);

      const result = await service.getFleetStatus(1);

      expect(result.total).toBe(0);
      expect(result.utilizationRate).toBe(0);
    });
  });

  describe('getSubscriptionUsage', () => {
    it('reports tenant storage converted to megabytes for an active plan', async () => {
      mockDocumentsService.getTenantStorageUsage.mockResolvedValue(1.5 * 1024 * 1024);
      mockSubscriptionRepository.findOne.mockResolvedValue({
        plan: {
          name: 'Pro',
          maxVehicles: 20,
          maxDrivers: 10,
          maxStorageMb: 100,
        },
      });
      mockVehicleRepository.count.mockResolvedValue(5);
      mockDriverRepository.count.mockResolvedValue(2);

      const result = await service.getSubscriptionUsage(42);

      expect(mockDocumentsService.getTenantStorageUsage).toHaveBeenCalledWith(42);
      expect(result.storageUsedMB).toBe(1.5);
      expect(result.storageQuotaMB).toBe(100);
      expect(result.usagePercentage.storage).toBe(1.5);
    });

    it('keeps actual tenant storage visible when there is no subscription', async () => {
      mockDocumentsService.getTenantStorageUsage.mockResolvedValue(2 * 1024 * 1024);
      mockSubscriptionRepository.findOne.mockResolvedValue(null);
      mockVehicleRepository.count.mockResolvedValue(1);
      mockDriverRepository.count.mockResolvedValue(0);

      const result = await service.getSubscriptionUsage(42);

      expect(result.storageUsedMB).toBe(2);
      expect(result.storageQuotaMB).toBe(0);
    });
  });

  describe('getCostAnalysis', () => {
    it('should return cost analysis with monthly and type breakdowns', async () => {
      const tenantId = 1;
      const now = new Date();

      mockMaintenanceRepository.find.mockResolvedValue([
        {
          actualCost: 100,
          type: MaintenanceType.OIL_CHANGE,
          createdAt: now,
          status: MaintenanceStatus.COMPLETED,
        },
        {
          actualCost: 200,
          type: MaintenanceType.PREVENTIVE,
          createdAt: now,
          status: MaintenanceStatus.COMPLETED,
        },
      ]);

      mockVehicleRepository.find.mockResolvedValue([
        { purchasePrice: 20000 },
        { purchasePrice: 30000 },
      ]);

      const result = await service.getCostAnalysis(tenantId);

      expect(result.totalMaintenanceCost).toBe(300);
      expect(result.totalFleetPurchaseValue).toBe(50000);
      expect(result.avgMaintenanceCostPerVehicle).toBe(150);
      expect(result.costsByType).toHaveLength(2);
      expect(result.monthlyMaintenanceCosts).toBeDefined();
    });
  });

  describe('getUpcomingAlerts', () => {
    it('should return alerts for expiring licenses', async () => {
      const tenantId = 1;
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 15);

      mockDriverRepository.find.mockResolvedValue([
        {
          id: '1',
          firstName: 'John',
          lastName: 'Doe',
          licenseExpiryDate: futureDate,
          medicalCertificateExpiryDate: null,
        },
      ]);

      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([]),
      };

      mockMaintenanceRepository.createQueryBuilder.mockReturnValue(
        mockQueryBuilder,
      );

      const result = await service.getUpcomingAlerts(tenantId);

      expect(result.length).toBeGreaterThan(0);
      expect(result[0].type).toBe('license_expiring');
      expect(result[0].entityType).toBe('driver');
    });

    it('should return alerts for upcoming maintenance', async () => {
      const tenantId = 1;
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 5);

      mockDriverRepository.find.mockResolvedValue([]);

      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([
          {
            id: '1',
            type: MaintenanceType.OIL_CHANGE,
            scheduledDate: futureDate,
            status: MaintenanceStatus.SCHEDULED,
            vehicle: { registration: 'ABC-123' },
          },
        ]),
      };

      mockMaintenanceRepository.createQueryBuilder.mockReturnValue(
        mockQueryBuilder,
      );

      const result = await service.getUpcomingAlerts(tenantId);

      expect(result.length).toBeGreaterThan(0);
      expect(result[0].type).toBe('maintenance_due');
    });
  });

  describe('getMaintenanceStats', () => {
    it('should return maintenance statistics', async () => {
      const tenantId = 1;
      const scheduledDate = new Date('2024-01-01');
      const completedDate = new Date('2024-01-03');

      mockMaintenanceRepository.find.mockResolvedValue([
        {
          status: MaintenanceStatus.COMPLETED,
          actualCost: 100,
          type: MaintenanceType.OIL_CHANGE,
          scheduledDate,
          completedDate,
        },
        {
          status: MaintenanceStatus.COMPLETED,
          actualCost: 200,
          type: MaintenanceType.OIL_CHANGE,
          scheduledDate,
          completedDate,
        },
        {
          status: MaintenanceStatus.SCHEDULED,
          actualCost: 150,
          type: MaintenanceType.PREVENTIVE,
          scheduledDate,
          completedDate: null,
        },
      ]);

      const result = await service.getMaintenanceStats(tenantId);

      expect(result.totalCompleted).toBe(2);
      expect(result.totalScheduled).toBe(1);
      expect(result.totalCost).toBe(450);
      expect(result.avgCost).toBe(150);
      expect(result.mostCommonType).toBe(MaintenanceType.OIL_CHANGE);
      expect(result.avgDaysToComplete).toBeGreaterThan(0);
    });
  });

  describe('getDriverStats', () => {
    it('should return driver statistics', async () => {
      const tenantId = 1;
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 20);

      mockDriverRepository.find.mockResolvedValue([
        {
          id: '1',
          status: DriverStatus.ACTIVE,
          licenseExpiryDate: futureDate,
          vehicles: [{ id: '1' }],
        },
        {
          id: '2',
          status: DriverStatus.ACTIVE,
          licenseExpiryDate: futureDate,
          vehicles: [],
        },
        {
          id: '3',
          status: DriverStatus.ON_LEAVE,
          licenseExpiryDate: new Date('2030-01-01'),
          vehicles: [],
        },
      ]);

      const result = await service.getDriverStats(tenantId);

      expect(result.totalActive).toBe(2);
      expect(result.totalOnLeave).toBe(1);
      expect(result.total).toBe(3);
      expect(result.driversWithVehicles).toBe(1);
      expect(result.driversWithoutVehicles).toBe(2);
      expect(result.driversWithExpiringSoon).toBe(2);
    });

    it('should handle no drivers', async () => {
      mockDriverRepository.find.mockResolvedValue([]);

      const result = await service.getDriverStats(1);

      expect(result.total).toBe(0);
      expect(result.totalActive).toBe(0);
    });
  });
});
