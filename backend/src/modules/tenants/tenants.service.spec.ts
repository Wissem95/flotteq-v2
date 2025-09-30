import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TenantsService } from './tenants.service';
import { Tenant, TenantStatus } from '../../entities/tenant.entity';
import { ConflictException, NotFoundException } from '@nestjs/common';

describe('TenantsService', () => {
  let service: TenantsService;
  let repository: Repository<Tenant>;

  const mockTenant: Partial<Tenant> = {
    id: 1,
    name: 'Test Company',
    email: 'test@company.com',
    status: TenantStatus.TRIAL,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TenantsService,
        {
          provide: getRepositoryToken(Tenant),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<TenantsService>(TenantsService);
    repository = module.get<Repository<Tenant>>(getRepositoryToken(Tenant));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new tenant with TRIAL status', async () => {
      const createDto = {
        name: 'New Company',
        email: 'new@company.com',
      };

      mockRepository.findOne.mockResolvedValue(null);
      mockRepository.create.mockReturnValue(mockTenant);
      mockRepository.save.mockResolvedValue(mockTenant);

      const result = await service.create(createDto);

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: [{ email: createDto.email }, { name: createDto.name }],
      });
      expect(mockRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          ...createDto,
          status: TenantStatus.TRIAL,
        }),
      );
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

      await service.create(createDto);

      expect(mockRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          status: TenantStatus.TRIAL,
          trialEndsAt: expect.any(Date),
        }),
      );
    });
  });

  describe('findAll', () => {
    it('should return an array of tenants', async () => {
      const mockTenants = [mockTenant, { ...mockTenant, id: 2 }];
      mockRepository.find.mockResolvedValue(mockTenants);

      const result = await service.findAll();

      expect(mockRepository.find).toHaveBeenCalledWith({
        relations: ['users'],
        order: { createdAt: 'DESC' },
      });
      expect(result).toEqual(mockTenants);
    });
  });

  describe('findOne', () => {
    it('should return a tenant with all relations', async () => {
      mockRepository.findOne.mockResolvedValue(mockTenant);

      const result = await service.findOne(1);

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: ['users', 'vehicles', 'drivers'],
      });
      expect(result).toEqual(mockTenant);
    });

    it('should throw NotFoundException if tenant not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

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
      mockRepository.findOne.mockResolvedValue(mockTenant);
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
      mockRepository.findOne
        .mockResolvedValueOnce(mockTenant)
        .mockResolvedValueOnce(anotherTenant);

      await expect(service.update(1, updateDto)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('updateStatus', () => {
    it('should update tenant status', async () => {
      const updatedTenant = { ...mockTenant, status: TenantStatus.ACTIVE };
      mockRepository.findOne.mockResolvedValue(mockTenant);
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
});
