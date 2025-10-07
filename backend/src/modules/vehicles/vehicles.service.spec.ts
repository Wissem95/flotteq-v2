import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import { VehiclesService } from './vehicles.service';
import { Vehicle, VehicleStatus } from '../../entities/vehicle.entity';
import { Document, DocumentEntityType } from '../../entities/document.entity';
import { Maintenance, MaintenanceStatus } from '../maintenance/entities/maintenance.entity';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';

describe('VehiclesService', () => {
  let service: VehiclesService;
  let repository: Repository<Vehicle>;
  let documentRepository: Repository<Document>;
  let maintenanceRepository: Repository<Maintenance>;

  const mockVehicle: Vehicle = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    registration: 'AB-123-CD',
    brand: 'Renault',
    model: 'Clio',
    year: 2020,
    initialMileage: 45000,
    currentKm: 50000,
    status: VehicleStatus.AVAILABLE,
    vin: 'VF1RFD00123456789',
    color: 'Bleu',
    purchaseDate: new Date('2020-01-15'),
    purchasePrice: 15000.5,
    photos: null,
    tenantId: 1,
    assignedDriverId: null,
    assignedDriver: null,
    tenant: null,
    documents: [],
    maintenances: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  } as any;

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
    count: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  const mockDocumentRepository = {
    find: jest.fn(),
  };

  const mockMaintenanceRepository = {
    find: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VehiclesService,
        {
          provide: getRepositoryToken(Vehicle),
          useValue: mockRepository,
        },
        {
          provide: getRepositoryToken(Document),
          useValue: mockDocumentRepository,
        },
        {
          provide: getRepositoryToken(Maintenance),
          useValue: mockMaintenanceRepository,
        },
      ],
    }).compile();

    service = module.get<VehiclesService>(VehiclesService);
    repository = module.get<Repository<Vehicle>>(getRepositoryToken(Vehicle));
    documentRepository = module.get<Repository<Document>>(getRepositoryToken(Document));
    maintenanceRepository = module.get<Repository<Maintenance>>(getRepositoryToken(Maintenance));

    // Reset all mocks before each test
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const createDto: CreateVehicleDto = {
      registration: 'AB-123-CD',
      brand: 'Renault',
      model: 'Clio',
      year: 2020,
      vin: 'VF1RFD00123456789',
      color: 'Bleu',
    };

    it('should create a vehicle successfully', async () => {
      mockRepository.findOne.mockResolvedValue(null);
      mockRepository.create.mockReturnValue(mockVehicle);
      mockRepository.save.mockResolvedValue(mockVehicle);

      const result = await service.create(createDto, 1);

      expect(result).toEqual(mockVehicle);
      expect(mockRepository.findOne).toHaveBeenCalledTimes(2); // Check registration and VIN
      expect(mockRepository.create).toHaveBeenCalledWith({
        ...createDto,
        tenantId: 1,
      });
      expect(mockRepository.save).toHaveBeenCalledWith(mockVehicle);
    });

    it('should throw ConflictException if registration exists', async () => {
      mockRepository.findOne.mockResolvedValue(mockVehicle);

      await expect(service.create(createDto, 1)).rejects.toThrow(
        ConflictException,
      );
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: {
          registration: createDto.registration,
          tenantId: 1,
        },
      });
    });

    it('should throw ConflictException if VIN exists', async () => {
      mockRepository.findOne
        .mockResolvedValueOnce(null) // Registration check passes
        .mockResolvedValueOnce(mockVehicle); // VIN check fails

      await expect(service.create(createDto, 1)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('findAll', () => {
    const mockQueryBuilder = {
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      getManyAndCount: jest.fn(),
    };

    beforeEach(() => {
      mockRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);
    });

    it('should return paginated vehicles', async () => {
      const vehicles = [mockVehicle];
      mockQueryBuilder.getManyAndCount.mockResolvedValue([vehicles, 1]);

      const result = await service.findAll({ page: 1, limit: 10 }, 1);

      expect(result).toEqual({
        data: vehicles,
        total: 1,
        page: 1,
        limit: 10,
      });
      expect(mockRepository.createQueryBuilder).toHaveBeenCalledWith('vehicle');
      expect(mockQueryBuilder.where).toHaveBeenCalledWith(
        'vehicle.tenantId = :tenantId',
        { tenantId: 1 },
      );
    });

    it('should apply status filter', async () => {
      mockQueryBuilder.getManyAndCount.mockResolvedValue([[mockVehicle], 1]);

      await service.findAll(
        { status: VehicleStatus.AVAILABLE, page: 1, limit: 10 },
        1,
      );

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'vehicle.status = :status',
        { status: VehicleStatus.AVAILABLE },
      );
    });

    it('should apply brand filter with ILIKE', async () => {
      mockQueryBuilder.getManyAndCount.mockResolvedValue([[mockVehicle], 1]);

      await service.findAll({ brand: 'Renault', page: 1, limit: 10 }, 1);

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'vehicle.brand ILIKE :brand',
        { brand: '%Renault%' },
      );
    });
  });

  describe('findOne', () => {
    it('should return a vehicle by id', async () => {
      mockRepository.findOne.mockResolvedValue(mockVehicle);

      const result = await service.findOne(mockVehicle.id, 1);

      expect(result).toEqual(mockVehicle);
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: mockVehicle.id, tenantId: 1 },
      });
    });

    it('should throw NotFoundException if vehicle not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('non-existent-id', 1)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    const updateDto: UpdateVehicleDto = {
      currentKm: 60000,
      status: VehicleStatus.IN_USE,
    };

    it('should update a vehicle successfully', async () => {
      const updatedVehicle = { ...mockVehicle, ...updateDto };
      mockRepository.findOne.mockResolvedValue(mockVehicle);
      mockRepository.save.mockResolvedValue(updatedVehicle);

      const result = await service.update(mockVehicle.id, updateDto, 1);

      expect(result).toEqual(updatedVehicle);
      expect(mockRepository.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException if vehicle not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(
        service.update('non-existent-id', updateDto, 1),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ConflictException if new registration exists', async () => {
      const updateWithRegistration: UpdateVehicleDto = {
        registration: 'NEW-REG',
      };
      mockRepository.findOne
        .mockResolvedValueOnce(mockVehicle) // findOne for the vehicle
        .mockResolvedValueOnce({ ...mockVehicle, id: 'different-id' }); // Check new registration

      await expect(
        service.update(mockVehicle.id, updateWithRegistration, 1),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('remove', () => {
    it('should remove a vehicle successfully', async () => {
      mockRepository.findOne.mockResolvedValue(mockVehicle);
      mockRepository.remove.mockResolvedValue(mockVehicle);

      await service.remove(mockVehicle.id, 1);

      expect(mockRepository.remove).toHaveBeenCalledWith(mockVehicle);
    });

    it('should throw NotFoundException if vehicle not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.remove('non-existent-id', 1)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('count', () => {
    it('should return the count of vehicles for a tenant', async () => {
      mockRepository.count.mockResolvedValue(5);

      const result = await service.count(1);

      expect(result).toBe(5);
      expect(mockRepository.count).toHaveBeenCalledWith({
        where: { tenantId: 1 },
      });
    });
  });

  describe('getTimeline', () => {
    it('should return vehicle timeline with maintenances and documents', async () => {
      const mockMaintenances = [
        {
          id: 'maint-1',
          scheduledDate: new Date('2024-01-15'),
          type: 'oil_change',
          description: 'Vidange',
          status: MaintenanceStatus.COMPLETED,
          cost: 150,
        },
      ];

      const mockDocuments = [
        {
          id: 'doc-1',
          createdAt: new Date('2024-01-10'),
          fileName: 'facture.pdf',
          fileUrl: '/uploads/doc.pdf',
          mimeType: 'application/pdf',
        },
      ];

      mockRepository.findOne.mockResolvedValue(mockVehicle);
      mockMaintenanceRepository.find.mockResolvedValue(mockMaintenances);
      mockDocumentRepository.find.mockResolvedValue(mockDocuments);

      const result = await service.getTimeline(mockVehicle.id, 1);

      expect(result.vehicleId).toBe(mockVehicle.id);
      expect(result.items.length).toBeGreaterThanOrEqual(2); // At least maintenance + document + creation
      expect(mockMaintenanceRepository.find).toHaveBeenCalled();
      expect(mockDocumentRepository.find).toHaveBeenCalled();
    });

    it('should return empty timeline if no events', async () => {
      mockRepository.findOne.mockResolvedValue(mockVehicle);
      mockMaintenanceRepository.find.mockResolvedValue([]);
      mockDocumentRepository.find.mockResolvedValue([]);

      const result = await service.getTimeline(mockVehicle.id, 1);

      expect(result.items.length).toBe(1); // Only creation event
      expect(result.items[0].type).toBe('creation');
    });

    it('should throw NotFoundException if vehicle not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.getTimeline('invalid-id', 1)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getCostAnalysis', () => {
    it('should return cost analysis with maintenances', async () => {
      const mockMaintenances = [
        {
          id: 'maint-1',
          type: 'oil_change',
          cost: 150,
          status: MaintenanceStatus.COMPLETED,
        },
        {
          id: 'maint-2',
          type: 'tire_change',
          cost: 400,
          status: MaintenanceStatus.COMPLETED,
        },
      ];

      mockRepository.findOne.mockResolvedValue(mockVehicle);
      mockMaintenanceRepository.find.mockResolvedValue(mockMaintenances);

      const result = await service.getCostAnalysis(mockVehicle.id, 1);

      expect(result.vehicleId).toBe(mockVehicle.id);
      expect(result.totalMaintenanceCost).toBe(550);
      expect(result.totalMaintenanceCount).toBe(2);
      expect(result.averageMaintenanceCost).toBe(275);
      expect(result.totalOwnershipCost).toBe(15000.5 + 550);
      expect(result.costsByType).toHaveLength(2);
    });

    it('should return zero costs if no maintenances', async () => {
      mockRepository.findOne.mockResolvedValue(mockVehicle);
      mockMaintenanceRepository.find.mockResolvedValue([]);

      const result = await service.getCostAnalysis(mockVehicle.id, 1);

      expect(result.totalMaintenanceCost).toBe(0);
      expect(result.totalMaintenanceCount).toBe(0);
      expect(result.averageMaintenanceCost).toBe(0);
      expect(result.totalOwnershipCost).toBe(15000.5);
    });

    it('should calculate cost per km correctly', async () => {
      mockRepository.findOne.mockResolvedValue(mockVehicle);
      mockMaintenanceRepository.find.mockResolvedValue([]);

      const result = await service.getCostAnalysis(mockVehicle.id, 1);

      // currentKm (50000) - initialMileage (45000) = 5000 km
      // totalOwnershipCost (15000.5) / 5000 = 3.0001
      expect(result.costPerKm).toBeCloseTo(3.0001, 2);
    });
  });

  describe('uploadPhotos', () => {
    it('should reject if no files provided', async () => {
      mockRepository.findOne.mockResolvedValue(mockVehicle);

      await expect(
        service.uploadPhotos(mockVehicle.id, [], 1),
      ).rejects.toThrow(BadRequestException);
    });

    it('should reject if limit exceeded', async () => {
      const vehicleWith10Photos = {
        ...mockVehicle,
        photos: Array(10).fill('/uploads/photo.jpg'),
      };
      mockRepository.findOne.mockResolvedValue(vehicleWith10Photos);

      const mockFiles = [{ buffer: Buffer.from('test') }] as any[];

      await expect(
        service.uploadPhotos(mockVehicle.id, mockFiles, 1),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('deletePhoto', () => {
    it('should throw NotFoundException if no photos', async () => {
      mockRepository.findOne.mockResolvedValue(mockVehicle);

      await expect(
        service.deletePhoto(mockVehicle.id, '/uploads/photo.jpg', 1),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException if photo not found', async () => {
      const vehicleWithPhotos = {
        ...mockVehicle,
        photos: ['/uploads/photo1.jpg'],
      };
      mockRepository.findOne.mockResolvedValue(vehicleWithPhotos);

      await expect(
        service.deletePhoto(mockVehicle.id, '/uploads/other.jpg', 1),
      ).rejects.toThrow(NotFoundException);
    });
  });
});