import { Test, TestingModule } from '@nestjs/testing';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { ForbiddenException } from '@nestjs/common';

describe('DashboardController', () => {
  let controller: DashboardController;
  let service: DashboardService;

  const mockDashboardService = {
    getInternalStats: jest.fn(),
    getInternalRevenue: jest.fn(),
    getInternalSubscriptions: jest.fn(),
    getInternalActivity: jest.fn(),
    getRecentTenants: jest.fn(),
    getOverview: jest.fn(),
    getFleetStatus: jest.fn(),
    getCostAnalysis: jest.fn(),
    getUpcomingAlerts: jest.fn(),
    getMaintenanceStats: jest.fn(),
    getDriverStats: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DashboardController],
      providers: [
        {
          provide: DashboardService,
          useValue: mockDashboardService,
        },
      ],
    }).compile();

    controller = module.get<DashboardController>(DashboardController);
    service = module.get<DashboardService>(DashboardService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Internal Routes', () => {
    it('should return internal stats', async () => {
      const mockStats = {
        totalTenants: 10,
        activeTenants: 8,
        trialTenants: 2,
        cancelledTenants: 0,
        totalVehicles: 50,
        totalDrivers: 30,
        totalUsers: 40,
        mrr: 1500,
        arr: 18000,
        churnRate: 0,
        averageRevenuePerTenant: 187.5,
      };

      mockDashboardService.getInternalStats.mockResolvedValue(mockStats);

      const result = await controller.getInternalStats();

      expect(result).toEqual(mockStats);
      expect(service.getInternalStats).toHaveBeenCalled();
    });

    it('should return internal revenue', async () => {
      const mockRevenue = {
        mrr: 1500,
        arr: 18000,
        revenueByPlan: [
          { plan: 'Starter', count: 5, revenue: 500 },
          { plan: 'Pro', count: 3, revenue: 1000 },
        ],
        revenueEvolution: [
          { month: '2025-09', mrr: 1500, newMrr: 200, churnedMrr: 0 },
        ],
      };

      mockDashboardService.getInternalRevenue.mockResolvedValue(mockRevenue);

      const result = await controller.getInternalRevenue();

      expect(result).toEqual(mockRevenue);
      expect(service.getInternalRevenue).toHaveBeenCalled();
    });

    it('should return internal subscriptions', async () => {
      const mockSubscriptions = {
        planDistribution: [
          { plan: 'Starter', count: 5, percentage: 62 },
          { plan: 'Pro', count: 3, percentage: 38 },
        ],
        activeSubscriptions: 7,
        trialSubscriptions: 1,
        cancelledThisMonth: 0,
        upgradedThisMonth: 0,
      };

      mockDashboardService.getInternalSubscriptions.mockResolvedValue(
        mockSubscriptions,
      );

      const result = await controller.getInternalSubscriptions();

      expect(result).toEqual(mockSubscriptions);
      expect(service.getInternalSubscriptions).toHaveBeenCalled();
    });

    it('should return internal activity', async () => {
      const mockActivity = [
        {
          id: 'tenant-created-1',
          type: 'TENANT_CREATED' as const,
          tenantId: 1,
          tenantName: 'Test Tenant',
          description: 'Nouveau tenant inscrit : Test Tenant',
          createdAt: new Date('2025-09-30'),
        },
      ];

      mockDashboardService.getInternalActivity.mockResolvedValue(mockActivity);

      const result = await controller.getInternalActivity();

      expect(result).toEqual(mockActivity);
      expect(service.getInternalActivity).toHaveBeenCalled();
    });

    it('should return recent tenants with limit', async () => {
      const mockTenants = [
        {
          id: 1,
          name: 'Tenant 1',
          email: 'test@test.com',
          status: 'active',
          createdAt: new Date('2025-09-20'),
          plan: { name: 'Starter', price: 100 },
          vehiclesCount: 5,
          usersCount: 3,
          daysActive: 10,
        },
      ];

      mockDashboardService.getRecentTenants.mockResolvedValue(mockTenants);

      const result = await controller.getInternalRecentTenants(5);

      expect(result).toEqual(mockTenants);
      expect(service.getRecentTenants).toHaveBeenCalledWith(5);
    });

    it('should use default limit of 5 for recent tenants', async () => {
      mockDashboardService.getRecentTenants.mockResolvedValue([]);

      await controller.getInternalRecentTenants(5);

      expect(service.getRecentTenants).toHaveBeenCalledWith(5);
    });
  });

  describe('Tenant Routes', () => {
    it('should return tenant overview with tenantId from JWT', async () => {
      const mockReq = {
        user: { id: 1, tenantId: 2, role: 'tenant_admin' },
      };

      const mockOverview = {
        totalVehicles: 5,
        totalDrivers: 3,
        totalMaintenances: 10,
        activeVehicles: 4,
        activeDrivers: 2,
        upcomingMaintenances: 2,
        totalFleetValue: 50000,
        avgVehicleAge: 2.5,
      };

      mockDashboardService.getOverview.mockResolvedValue(mockOverview);

      const result = await controller.getTenantOverview(mockReq);

      expect(result).toEqual(mockOverview);
      expect(service.getOverview).toHaveBeenCalledWith(2);
    });

    it('should return fleet status for tenant', async () => {
      const mockReq = {
        user: { id: 1, tenantId: 2, role: 'tenant_admin' },
      };

      const mockFleetStatus = {
        available: 3,
        inUse: 2,
        maintenance: 1,
        outOfService: 0,
        total: 6,
        utilizationRate: 33,
      };

      mockDashboardService.getFleetStatus.mockResolvedValue(mockFleetStatus);

      const result = await controller.getTenantFleetStatus(mockReq);

      expect(result).toEqual(mockFleetStatus);
      expect(service.getFleetStatus).toHaveBeenCalledWith(2);
    });

    it('should return cost analysis for tenant', async () => {
      const mockReq = {
        user: { id: 1, tenantId: 2, role: 'tenant_admin' },
      };

      const mockCosts = {
        totalMaintenanceCost: 5000,
        totalFleetPurchaseValue: 100000,
        avgMaintenanceCostPerVehicle: 1000,
        monthlyMaintenanceCosts: [],
        costsByType: [],
        lastMonthTotal: 400,
        currentMonthTotal: 600,
      };

      mockDashboardService.getCostAnalysis.mockResolvedValue(mockCosts);

      const result = await controller.getTenantCosts(mockReq);

      expect(result).toEqual(mockCosts);
      expect(service.getCostAnalysis).toHaveBeenCalledWith(2);
    });

    it('should return alerts for tenant', async () => {
      const mockReq = {
        user: { id: 1, tenantId: 2, role: 'tenant_admin' },
      };

      const mockAlerts = [
        {
          id: 'license-1',
          type: 'LICENSE_EXPIRING' as const,
          severity: 'HIGH' as const,
          title: 'License Expiring',
          message: 'License expires soon',
          entityId: 1,
          entityType: 'driver' as const,
          dueDate: new Date('2025-10-15'),
          daysUntilDue: 13,
        },
      ];

      mockDashboardService.getUpcomingAlerts.mockResolvedValue(mockAlerts);

      const result = await controller.getTenantAlerts(mockReq);

      expect(result).toEqual(mockAlerts);
      expect(service.getUpcomingAlerts).toHaveBeenCalledWith(2);
    });

    it('should return maintenance stats for tenant', async () => {
      const mockReq = {
        user: { id: 1, tenantId: 2, role: 'tenant_admin' },
      };

      const mockStats = {
        totalCompleted: 8,
        totalScheduled: 2,
        totalInProgress: 1,
        totalCancelled: 0,
        avgCost: 500,
        totalCost: 5000,
        mostCommonType: 'Oil Change',
        avgDaysToComplete: 2.5,
      };

      mockDashboardService.getMaintenanceStats.mockResolvedValue(mockStats);

      const result = await controller.getTenantMaintenanceStats(mockReq);

      expect(result).toEqual(mockStats);
      expect(service.getMaintenanceStats).toHaveBeenCalledWith(2);
    });

    it('should return driver stats for tenant', async () => {
      const mockReq = {
        user: { id: 1, tenantId: 2, role: 'tenant_admin' },
      };

      const mockStats = {
        totalActive: 5,
        totalInactive: 1,
        totalSuspended: 0,
        totalOnLeave: 0,
        total: 6,
        driversWithExpiringSoon: 2,
        driversWithVehicles: 4,
        driversWithoutVehicles: 2,
      };

      mockDashboardService.getDriverStats.mockResolvedValue(mockStats);

      const result = await controller.getTenantDriverStats(mockReq);

      expect(result).toEqual(mockStats);
      expect(service.getDriverStats).toHaveBeenCalledWith(2);
    });
  });
});
