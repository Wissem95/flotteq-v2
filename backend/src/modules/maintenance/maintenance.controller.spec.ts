import { Test, TestingModule } from '@nestjs/testing';
import { MaintenanceController } from './maintenance.controller';
import { MaintenanceService } from './maintenance.service';
import { Maintenance, MaintenanceStatus, MaintenanceType } from './entities/maintenance.entity';
import { CreateMaintenanceDto } from './dto/create-maintenance.dto';
import { UpdateMaintenanceDto } from './dto/update-maintenance.dto';

describe('MaintenanceController', () => {
  let controller: MaintenanceController;
  let service: MaintenanceService;

  const mockMaintenance: Maintenance = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    vehicleId: 'vehicle-1',
    type: MaintenanceType.PREVENTIVE,
    description: 'Routine checkup',
    scheduledDate: new Date('2025-10-15'),
    completedDate: null,
    status: MaintenanceStatus.SCHEDULED,
    cost: 150.0,
    performedBy: 'Garage ABC',
    nextMaintenanceKm: 15000,
    tenantId: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
    vehicle: {
      id: 'vehicle-1',
      registration: 'ABC123',
      currentKm: 10000,
    } as any,
  };

  const mockMaintenanceService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    findByVehicle: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    getUpcomingMaintenances: jest.fn(),
    getMaintenancesByKmAlert: jest.fn(),
    getCostSummaryByVehicle: jest.fn(),
    getTotalCostsByTenant: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MaintenanceController],
      providers: [
        {
          provide: MaintenanceService,
          useValue: mockMaintenanceService,
        },
      ],
    }).compile();

    controller = module.get<MaintenanceController>(MaintenanceController);
    service = module.get<MaintenanceService>(MaintenanceService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a new maintenance', async () => {
      const createDto: CreateMaintenanceDto = {
        vehicleId: 'vehicle-1',
        type: MaintenanceType.PREVENTIVE,
        description: 'Routine checkup',
        scheduledDate: '2025-10-15',
        cost: 150.0,
      };

      mockMaintenanceService.create.mockResolvedValue(mockMaintenance);

      const result = await controller.create(createDto, 1);

      expect(result).toEqual(mockMaintenance);
      expect(service.create).toHaveBeenCalledWith(createDto, 1);
    });
  });

  describe('findAll', () => {
    it('should return all maintenances for tenant', async () => {
      mockMaintenanceService.findAll.mockResolvedValue([mockMaintenance]);

      const result = await controller.findAll(1);

      expect(result).toEqual([mockMaintenance]);
      expect(service.findAll).toHaveBeenCalledWith(1);
    });
  });

  describe('findOne', () => {
    it('should return a single maintenance', async () => {
      mockMaintenanceService.findOne.mockResolvedValue(mockMaintenance);

      const result = await controller.findOne(mockMaintenance.id, 1);

      expect(result).toEqual(mockMaintenance);
      expect(service.findOne).toHaveBeenCalledWith(mockMaintenance.id, 1);
    });
  });

  describe('findByVehicle', () => {
    it('should return maintenances for a specific vehicle', async () => {
      mockMaintenanceService.findByVehicle.mockResolvedValue([mockMaintenance]);

      const result = await controller.findByVehicle('vehicle-1', 1);

      expect(result).toEqual([mockMaintenance]);
      expect(service.findByVehicle).toHaveBeenCalledWith('vehicle-1', 1);
    });
  });

  describe('update', () => {
    it('should update a maintenance', async () => {
      const updateDto: UpdateMaintenanceDto = {
        status: MaintenanceStatus.COMPLETED,
        completedDate: '2025-10-14',
      };

      const updatedMaintenance = { ...mockMaintenance, ...updateDto };
      mockMaintenanceService.update.mockResolvedValue(updatedMaintenance);

      const result = await controller.update(mockMaintenance.id, updateDto, 1);

      expect(result.status).toEqual(MaintenanceStatus.COMPLETED);
      expect(service.update).toHaveBeenCalledWith(mockMaintenance.id, updateDto, 1);
    });
  });

  describe('remove', () => {
    it('should remove a maintenance', async () => {
      mockMaintenanceService.remove.mockResolvedValue(undefined);

      await controller.remove(mockMaintenance.id, 1);

      expect(service.remove).toHaveBeenCalledWith(mockMaintenance.id, 1);
    });
  });

  describe('getUpcomingAlerts', () => {
    it('should return upcoming maintenance alerts', async () => {
      const mockAlerts = [
        {
          maintenanceId: mockMaintenance.id,
          vehicleRegistration: 'ABC123',
          type: MaintenanceType.PREVENTIVE,
          scheduledDate: new Date('2025-10-15'),
          daysUntil: 5,
          alertReason: 'Maintenance in 5 days',
        },
      ];

      mockMaintenanceService.getUpcomingMaintenances.mockResolvedValue(mockAlerts);

      const result = await controller.getUpcomingAlerts(1);

      expect(result).toEqual(mockAlerts);
      expect(service.getUpcomingMaintenances).toHaveBeenCalledWith(1, 7);
    });

    it('should accept custom daysAhead parameter', async () => {
      mockMaintenanceService.getUpcomingMaintenances.mockResolvedValue([]);

      await controller.getUpcomingAlerts(1, 14);

      expect(service.getUpcomingMaintenances).toHaveBeenCalledWith(1, 14);
    });
  });

  describe('getKmAlerts', () => {
    it('should return km-based maintenance alerts', async () => {
      const mockKmAlerts = [
        {
          maintenanceId: mockMaintenance.id,
          vehicleRegistration: 'ABC123',
          type: MaintenanceType.PREVENTIVE,
          scheduledDate: new Date('2025-10-15'),
          daysUntil: 0,
          alertReason: 'Vehicle at 14500km, maintenance scheduled at 15000km',
        },
      ];

      mockMaintenanceService.getMaintenancesByKmAlert.mockResolvedValue(mockKmAlerts);

      const result = await controller.getKmAlerts(1);

      expect(result).toEqual(mockKmAlerts);
      expect(service.getMaintenancesByKmAlert).toHaveBeenCalledWith(1);
    });
  });

  describe('getTotalCosts', () => {
    it('should return total maintenance costs', async () => {
      mockMaintenanceService.getTotalCostsByTenant.mockResolvedValue(1500.0);

      const result = await controller.getTotalCosts(1);

      expect(result).toBe(1500.0);
      expect(service.getTotalCostsByTenant).toHaveBeenCalledWith(1);
    });
  });

  describe('getVehicleCostSummary', () => {
    it('should return cost summary for a vehicle', async () => {
      const mockSummary = {
        vehicleId: 'vehicle-1',
        totalCost: 500.0,
        maintenanceCount: 3,
        averageCost: 166.67,
      };

      mockMaintenanceService.getCostSummaryByVehicle.mockResolvedValue(mockSummary);

      const result = await controller.getVehicleCostSummary('vehicle-1', 1);

      expect(result).toEqual(mockSummary);
      expect(service.getCostSummaryByVehicle).toHaveBeenCalledWith('vehicle-1', 1);
    });
  });
});