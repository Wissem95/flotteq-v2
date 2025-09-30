import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { MaintenanceService } from './maintenance.service';
import { Maintenance, MaintenanceStatus, MaintenanceType } from './entities/maintenance.entity';
import { CreateMaintenanceDto } from './dto/create-maintenance.dto';
import { UpdateMaintenanceDto } from './dto/update-maintenance.dto';

describe('MaintenanceService', () => {
  let service: MaintenanceService;
  let repository: Repository<Maintenance>;

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

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
    query: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MaintenanceService,
        {
          provide: getRepositoryToken(Maintenance),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<MaintenanceService>(MaintenanceService);
    repository = module.get<Repository<Maintenance>>(getRepositoryToken(Maintenance));

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new maintenance', async () => {
      const createDto: CreateMaintenanceDto = {
        vehicleId: 'vehicle-1',
        type: MaintenanceType.PREVENTIVE,
        description: 'Routine checkup',
        scheduledDate: '2025-10-15',
        cost: 150.0,
        performedBy: 'Garage ABC',
        nextMaintenanceKm: 15000,
      };

      mockRepository.create.mockReturnValue(mockMaintenance);
      mockRepository.save.mockResolvedValue(mockMaintenance);

      const result = await service.create(createDto, 1);

      expect(result).toEqual(mockMaintenance);
      expect(mockRepository.create).toHaveBeenCalledWith({
        ...createDto,
        tenantId: 1,
        scheduledDate: new Date(createDto.scheduledDate),
      });
      expect(mockRepository.save).toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return all maintenances for a tenant', async () => {
      mockRepository.find.mockResolvedValue([mockMaintenance]);

      const result = await service.findAll(1);

      expect(result).toEqual([mockMaintenance]);
      expect(mockRepository.find).toHaveBeenCalledWith({
        where: { tenantId: 1 },
        relations: ['vehicle'],
        order: { scheduledDate: 'DESC' },
      });
    });
  });

  describe('findOne', () => {
    it('should return a single maintenance', async () => {
      mockRepository.findOne.mockResolvedValue(mockMaintenance);

      const result = await service.findOne(mockMaintenance.id, 1);

      expect(result).toEqual(mockMaintenance);
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: mockMaintenance.id, tenantId: 1 },
        relations: ['vehicle'],
      });
    });

    it('should throw NotFoundException if maintenance not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('non-existent', 1)).rejects.toThrow(NotFoundException);
    });
  });

  describe('findByVehicle', () => {
    it('should return maintenances for a specific vehicle', async () => {
      mockRepository.find.mockResolvedValue([mockMaintenance]);

      const result = await service.findByVehicle('vehicle-1', 1);

      expect(result).toEqual([mockMaintenance]);
      expect(mockRepository.find).toHaveBeenCalledWith({
        where: { vehicleId: 'vehicle-1', tenantId: 1 },
        order: { scheduledDate: 'DESC' },
      });
    });
  });

  describe('update', () => {
    it('should update a maintenance', async () => {
      const updateDto: UpdateMaintenanceDto = {
        status: MaintenanceStatus.COMPLETED,
        completedDate: '2025-10-14',
        cost: 175.0,
      };

      mockRepository.findOne.mockResolvedValue(mockMaintenance);
      mockRepository.save.mockResolvedValue({ ...mockMaintenance, ...updateDto });

      const result = await service.update(mockMaintenance.id, updateDto, 1);

      expect(mockRepository.save).toHaveBeenCalled();
      expect(result.status).toEqual(MaintenanceStatus.COMPLETED);
    });

    it('should throw NotFoundException if maintenance not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.update('non-existent', {}, 1)).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should remove a maintenance', async () => {
      mockRepository.findOne.mockResolvedValue(mockMaintenance);
      mockRepository.remove.mockResolvedValue(mockMaintenance);

      await service.remove(mockMaintenance.id, 1);

      expect(mockRepository.remove).toHaveBeenCalledWith(mockMaintenance);
    });

    it('should throw NotFoundException if maintenance not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.remove('non-existent', 1)).rejects.toThrow(NotFoundException);
    });
  });

  describe('getUpcomingMaintenances', () => {
    it('should return upcoming maintenances within specified days', async () => {
      mockRepository.find.mockResolvedValue([mockMaintenance]);

      const result = await service.getUpcomingMaintenances(1, 7);

      expect(result).toHaveLength(1);
      expect(result[0]).toHaveProperty('maintenanceId');
      expect(result[0]).toHaveProperty('daysUntil');
      expect(result[0]).toHaveProperty('alertReason');
    });

    it('should return empty array if no upcoming maintenances', async () => {
      mockRepository.find.mockResolvedValue([]);

      const result = await service.getUpcomingMaintenances(1, 7);

      expect(result).toEqual([]);
    });
  });

  describe('getCostSummaryByVehicle', () => {
    it('should return cost summary for a vehicle', async () => {
      const mockQueryBuilder = {
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getRawOne: jest.fn().mockResolvedValue({
          totalCost: '500.00',
          maintenanceCount: '3',
          averageCost: '166.67',
        }),
      };

      mockRepository.createQueryBuilder = jest.fn().mockReturnValue(mockQueryBuilder);

      const result = await service.getCostSummaryByVehicle('vehicle-1', 1);

      expect(result.vehicleId).toBe('vehicle-1');
      expect(result.totalCost).toBe(500.0);
      expect(result.maintenanceCount).toBe(3);
      expect(result.averageCost).toBe(166.67);
    });
  });

  describe('getTotalCostsByTenant', () => {
    it('should return total costs for a tenant', async () => {
      const mockQueryBuilder = {
        select: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getRawOne: jest.fn().mockResolvedValue({ total: '1200.00' }),
      };

      mockRepository.createQueryBuilder = jest.fn().mockReturnValue(mockQueryBuilder);

      const result = await service.getTotalCostsByTenant(1);

      expect(result).toBe(1200.0);
    });

    it('should return 0 if no completed maintenances', async () => {
      const mockQueryBuilder = {
        select: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getRawOne: jest.fn().mockResolvedValue({ total: null }),
      };

      mockRepository.createQueryBuilder = jest.fn().mockReturnValue(mockQueryBuilder);

      const result = await service.getTotalCostsByTenant(1);

      expect(result).toBe(0);
    });
  });
});