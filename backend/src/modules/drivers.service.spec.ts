import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { DriversService } from './drivers.service';
import { Driver, DriverStatus } from '../entities/driver.entity';
import { Vehicle, VehicleStatus } from '../entities/vehicle.entity';

describe('DriversService', () => {
  let service: DriversService;
  let driverRepository: Repository<Driver>;
  let vehicleRepository: Repository<Vehicle>;
  let mockRequest: any;

  const mockDriver: Driver = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    firstName: 'Pierre',
    lastName: 'Dupont',
    email: 'pierre.dupont@test.com',
    phone: '+33612345678',
    licenseNumber: 'FR123456789',
    licenseExpiryDate: new Date('2026-12-31'),
    medicalCertificateExpiryDate: new Date('2026-06-30'),
    birthDate: new Date('1985-03-15'),
    status: DriverStatus.ACTIVE,
    address: '123 Rue Test',
    city: 'Paris',
    postalCode: '75001',
    emergencyContact: 'Marie Dupont',
    emergencyPhone: '+33698765432',
    notes: 'Test driver',
    tenantId: 1,
    vehicles: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  } as any;

  const mockVehicle: Vehicle = {
    id: 'a624b50e-b25c-4cbb-b100-5cb744d74b42',
    registration: 'AB-123-CD',
    brand: 'Renault',
    model: 'Kangoo',
    year: 2022,
    initialMileage: 0,
    currentKm: 15000,
    status: VehicleStatus.AVAILABLE,
    vin: 'VF1FC000123456789',
    color: 'Blanc',
    purchaseDate: new Date('2022-01-15'),
    purchasePrice: 25000,
    assignedDriverId: null,
    assignedDriver: null,
    tenant: null,
    tenantId: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  } as any;

  beforeEach(async () => {
    mockRequest = { tenantId: 1 };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DriversService,
        {
          provide: getRepositoryToken(Driver),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            findOne: jest.fn(),
            findAndCount: jest.fn(),
            find: jest.fn(),
            remove: jest.fn(),
            count: jest.fn(),
            createQueryBuilder: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Vehicle),
          useValue: {
            findOne: jest.fn(),
            find: jest.fn(),
            save: jest.fn(),
            count: jest.fn(),
          },
        },
        {
          provide: REQUEST,
          useValue: mockRequest,
        },
      ],
    }).compile();

    service = module.get<DriversService>(DriversService);
    driverRepository = module.get<Repository<Driver>>(getRepositoryToken(Driver));
    vehicleRepository = module.get<Repository<Vehicle>>(getRepositoryToken(Vehicle));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const createDriverDto = {
      firstName: 'Pierre',
      lastName: 'Dupont',
      email: 'pierre.dupont@test.com',
      phone: '+33612345678',
      licenseNumber: 'FR123456789',
      licenseExpiryDate: '2026-12-31',
    };

    it('should create a driver successfully', async () => {
      jest.spyOn(driverRepository, 'findOne').mockResolvedValue(null);
      jest.spyOn(driverRepository, 'create').mockReturnValue(mockDriver);
      jest.spyOn(driverRepository, 'save').mockResolvedValue(mockDriver);

      const result = await service.create(createDriverDto);

      expect(result).toEqual(mockDriver);
      expect(driverRepository.create).toHaveBeenCalledWith({ ...createDriverDto, tenantId: 1 });
    });

    it('should throw error if email already exists', async () => {
      jest.spyOn(driverRepository, 'findOne').mockResolvedValue(mockDriver);

      await expect(service.create(createDriverDto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('findAll', () => {
    it('should return paginated drivers', async () => {
      const drivers = [mockDriver];
      jest.spyOn(driverRepository, 'findAndCount').mockResolvedValue([drivers, 1]);

      const result = await service.findAll(1, 10);

      expect(result).toEqual({
        data: drivers,
        total: 1,
        page: 1,
        limit: 10,
      });
    });

    it('should filter by status', async () => {
      const drivers = [mockDriver];
      jest.spyOn(driverRepository, 'findAndCount').mockResolvedValue([drivers, 1]);

      await service.findAll(1, 10, DriverStatus.ACTIVE);

      expect(driverRepository.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { tenantId: 1, status: DriverStatus.ACTIVE },
        }),
      );
    });
  });

  describe('findOne', () => {
    it('should return a driver', async () => {
      jest.spyOn(driverRepository, 'findOne').mockResolvedValue(mockDriver);

      const result = await service.findOne(mockDriver.id);

      expect(result).toEqual(mockDriver);
    });

    it('should throw NotFoundException if driver not found', async () => {
      jest.spyOn(driverRepository, 'findOne').mockResolvedValue(null);

      await expect(service.findOne('invalid-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('assignVehicle', () => {
    it('should assign vehicle to driver successfully', async () => {
      jest.spyOn(driverRepository, 'findOne').mockResolvedValue(mockDriver);
      jest.spyOn(vehicleRepository, 'findOne').mockResolvedValue(mockVehicle);
      jest.spyOn(vehicleRepository, 'save').mockResolvedValue({ ...mockVehicle, assignedDriverId: mockDriver.id });

      const result = await service.assignVehicle(mockDriver.id, mockVehicle.id);

      expect(vehicleRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          assignedDriverId: mockDriver.id,
          status: VehicleStatus.IN_USE,
        }),
      );
    });

    it('should throw error if driver license is expired', async () => {
      const expiredDriver = { ...mockDriver, licenseExpiryDate: new Date('2020-01-01') };
      jest.spyOn(driverRepository, 'findOne').mockResolvedValue(expiredDriver);

      await expect(service.assignVehicle(mockDriver.id, mockVehicle.id)).rejects.toThrow(BadRequestException);
    });

    it('should throw error if vehicle already assigned', async () => {
      const assignedVehicle = { ...mockVehicle, assignedDriverId: 'another-driver-id' };
      jest.spyOn(driverRepository, 'findOne').mockResolvedValue(mockDriver);
      jest.spyOn(vehicleRepository, 'findOne').mockResolvedValue(assignedVehicle);

      await expect(service.assignVehicle(mockDriver.id, mockVehicle.id)).rejects.toThrow(BadRequestException);
    });
  });

  describe('unassignVehicle', () => {
    it('should unassign vehicle from driver', async () => {
      const assignedVehicle = { ...mockVehicle, assignedDriverId: mockDriver.id };
      jest.spyOn(driverRepository, 'findOne').mockResolvedValue(mockDriver);
      jest.spyOn(vehicleRepository, 'findOne').mockResolvedValue(assignedVehicle);
      jest.spyOn(vehicleRepository, 'save').mockResolvedValue({ ...assignedVehicle, assignedDriverId: null });

      const result = await service.unassignVehicle(mockDriver.id, mockVehicle.id);

      expect(vehicleRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          assignedDriverId: null,
          status: VehicleStatus.AVAILABLE,
        }),
      );
    });

    it('should throw error if vehicle not assigned to driver', async () => {
      const unassignedVehicle = { ...mockVehicle, assignedDriverId: null };
      jest.spyOn(driverRepository, 'findOne').mockResolvedValue(mockDriver);
      jest.spyOn(vehicleRepository, 'findOne').mockResolvedValue(unassignedVehicle as any);

      await expect(service.unassignVehicle(mockDriver.id, mockVehicle.id)).rejects.toThrow(BadRequestException);
    });
  });

  describe('remove', () => {
    it('should remove driver if no vehicles assigned', async () => {
      jest.spyOn(driverRepository, 'findOne').mockResolvedValue(mockDriver);
      jest.spyOn(vehicleRepository, 'count').mockResolvedValue(0);
      jest.spyOn(driverRepository, 'remove').mockResolvedValue(mockDriver);

      await service.remove(mockDriver.id);

      expect(driverRepository.remove).toHaveBeenCalledWith(mockDriver);
    });

    it('should throw error if driver has assigned vehicles', async () => {
      jest.spyOn(driverRepository, 'findOne').mockResolvedValue(mockDriver);
      jest.spyOn(vehicleRepository, 'count').mockResolvedValue(1);

      await expect(service.remove(mockDriver.id)).rejects.toThrow(BadRequestException);
    });
  });

  describe('getExpiringLicenses', () => {
    it('should return drivers with expiring licenses', async () => {
      const queryBuilder: any = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([mockDriver]),
      };

      jest.spyOn(driverRepository, 'createQueryBuilder').mockReturnValue(queryBuilder);

      const result = await service.getExpiringLicenses(30);

      expect(result).toEqual([mockDriver]);
      expect(queryBuilder.getMany).toHaveBeenCalled();
    });
  });

  describe('getAvailableDrivers', () => {
    it('should return drivers without assigned vehicles', async () => {
      jest.spyOn(driverRepository, 'find').mockResolvedValue([mockDriver]);

      const result = await service.getAvailableDrivers();

      expect(result).toEqual([mockDriver]);
    });
  });

  describe('tenant isolation', () => {
    it('should throw error if tenantId is missing', async () => {
      mockRequest.tenantId = undefined;

      await expect(service.findAll()).rejects.toThrow(BadRequestException);
    });
  });
});