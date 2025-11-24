import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditService } from '../audit.service';
import { AuditLog, AuditAction } from '../../../entities/audit-log.entity';
import { CreateAuditLogDto } from '../dto/create-audit-log.dto';
import { AuditLogFilterDto } from '../dto/audit-log-filter.dto';

describe('AuditService', () => {
  let service: AuditService;
  let repository: Repository<AuditLog>;

  const mockQueryBuilder = {
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    take: jest.fn().mockReturnThis(),
    getManyAndCount: jest.fn(),
  };

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    createQueryBuilder: jest.fn(() => mockQueryBuilder),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuditService,
        {
          provide: getRepositoryToken(AuditLog),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<AuditService>(AuditService);
    repository = module.get<Repository<AuditLog>>(getRepositoryToken(AuditLog));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create an audit log', async () => {
      const createDto: CreateAuditLogDto = {
        tenantId: 1,
        userId: 'user-123',
        action: AuditAction.CREATE,
        entityType: 'Vehicle',
        entityId: 'vehicle-123',
        newValue: { brand: 'Toyota', model: 'Corolla' },
        metadata: { ip: '127.0.0.1' },
      };

      const expectedAuditLog = {
        id: 1,
        ...createDto,
        createdAt: expect.any(Date),
      };

      mockRepository.create.mockReturnValue(expectedAuditLog);
      mockRepository.save.mockResolvedValue(expectedAuditLog);

      const result = await service.create(createDto);

      expect(mockRepository.create).toHaveBeenCalledWith({
        ...createDto,
        createdAt: expect.any(Date),
      });
      expect(mockRepository.save).toHaveBeenCalled();
      expect(result).toEqual(expectedAuditLog);
    });

    it('should handle errors gracefully', async () => {
      const createDto: CreateAuditLogDto = {
        tenantId: 1,
        userId: 'user-123',
        action: AuditAction.CREATE,
        entityType: 'Vehicle',
      };

      mockRepository.create.mockReturnValue(createDto);
      mockRepository.save.mockRejectedValue(new Error('Database error'));

      await expect(service.create(createDto)).rejects.toThrow('Database error');
    });
  });

  describe('findAll', () => {
    it('should return paginated audit logs for a tenant', async () => {
      const tenantId = 1;
      const filters: AuditLogFilterDto = { page: 1, limit: 50 };

      const mockData = [
        { id: 1, tenantId, action: AuditAction.CREATE, entityType: 'Vehicle' },
        { id: 2, tenantId, action: AuditAction.UPDATE, entityType: 'Driver' },
      ];

      mockQueryBuilder.getManyAndCount.mockResolvedValue([mockData, 2]);

      const result = await service.findAll(tenantId, filters);

      expect(result).toEqual({
        data: mockData,
        total: 2,
        page: 1,
        totalPages: 1,
      });
      expect(mockQueryBuilder.where).toHaveBeenCalledWith(
        'audit.tenant_id = :tenantId',
        { tenantId },
      );
    });

    it('should filter by userId', async () => {
      const tenantId = 1;
      const filters: AuditLogFilterDto = {
        userId: 'user-123',
        page: 1,
        limit: 50,
      };

      mockQueryBuilder.getManyAndCount.mockResolvedValue([[], 0]);

      await service.findAll(tenantId, filters);

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'audit.user_id = :userId',
        { userId: 'user-123' },
      );
    });

    it('should filter by entityType', async () => {
      const tenantId = 1;
      const filters: AuditLogFilterDto = {
        entityType: 'Vehicle',
        page: 1,
        limit: 50,
      };

      mockQueryBuilder.getManyAndCount.mockResolvedValue([[], 0]);

      await service.findAll(tenantId, filters);

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'audit.entity_type = :entityType',
        {
          entityType: 'Vehicle',
        },
      );
    });

    it('should filter by entityId', async () => {
      const tenantId = 1;
      const filters: AuditLogFilterDto = {
        entityId: 'vehicle-123',
        page: 1,
        limit: 50,
      };

      mockQueryBuilder.getManyAndCount.mockResolvedValue([[], 0]);

      await service.findAll(tenantId, filters);

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'audit.entity_id = :entityId',
        {
          entityId: 'vehicle-123',
        },
      );
    });

    it('should filter by action', async () => {
      const tenantId = 1;
      const filters: AuditLogFilterDto = {
        action: AuditAction.DELETE,
        page: 1,
        limit: 50,
      };

      mockQueryBuilder.getManyAndCount.mockResolvedValue([[], 0]);

      await service.findAll(tenantId, filters);

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'audit.action = :action',
        { action: AuditAction.DELETE },
      );
    });

    it('should filter by date range', async () => {
      const tenantId = 1;
      const filters: AuditLogFilterDto = {
        startDate: '2025-01-01',
        endDate: '2025-12-31',
        page: 1,
        limit: 50,
      };

      mockQueryBuilder.getManyAndCount.mockResolvedValue([[], 0]);

      await service.findAll(tenantId, filters);

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'audit.created_at BETWEEN :startDate AND :endDate',
        {
          startDate: '2025-01-01',
          endDate: '2025-12-31',
        },
      );
    });

    it('should calculate total pages correctly', async () => {
      const tenantId = 1;
      const filters: AuditLogFilterDto = { page: 1, limit: 10 };

      const mockData = Array(25).fill({
        id: 1,
        tenantId,
        action: AuditAction.CREATE,
      });

      mockQueryBuilder.getManyAndCount.mockResolvedValue([mockData, 25]);

      const result = await service.findAll(tenantId, filters);

      expect(result.totalPages).toBe(3); // 25 items / 10 per page = 3 pages
    });

    it('should handle pagination correctly', async () => {
      const tenantId = 1;
      const filters: AuditLogFilterDto = { page: 2, limit: 10 };

      mockQueryBuilder.getManyAndCount.mockResolvedValue([[], 0]);

      await service.findAll(tenantId, filters);

      expect(mockQueryBuilder.skip).toHaveBeenCalledWith(10); // (page-1) * limit = 10
      expect(mockQueryBuilder.take).toHaveBeenCalledWith(10);
    });
  });

  describe('findByEntity', () => {
    it('should return audit logs for a specific entity', async () => {
      const tenantId = 1;
      const entityType = 'Vehicle';
      const entityId = 'vehicle-123';

      const mockData = [
        { id: 1, tenantId, entityType, entityId, action: AuditAction.CREATE },
        { id: 2, tenantId, entityType, entityId, action: AuditAction.UPDATE },
      ];

      mockRepository.find.mockResolvedValue(mockData);

      const result = await service.findByEntity(tenantId, entityType, entityId);

      expect(mockRepository.find).toHaveBeenCalledWith({
        where: { tenantId, entityType, entityId },
        relations: ['user'],
        order: { createdAt: 'DESC' },
      });
      expect(result).toEqual(mockData);
    });

    it('should return empty array if no logs found', async () => {
      const tenantId = 1;
      const entityType = 'Vehicle';
      const entityId = 'non-existent';

      mockRepository.find.mockResolvedValue([]);

      const result = await service.findByEntity(tenantId, entityType, entityId);

      expect(result).toEqual([]);
    });
  });
});
