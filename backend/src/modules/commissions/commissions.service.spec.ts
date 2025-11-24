import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { CommissionsService } from './commissions.service';
import { Commission, CommissionStatus } from '../../entities/commission.entity';
import { Booking, BookingStatus } from '../../entities/booking.entity';
import { Partner, PartnerStatus } from '../../entities/partner.entity';
import { AuditService } from '../audit/audit.service';

describe('CommissionsService', () => {
  let service: CommissionsService;
  let commissionRepository: Repository<Commission>;
  let bookingRepository: Repository<Booking>;
  let partnerRepository: Repository<Partner>;
  let auditService: AuditService;

  const mockPartner: Partner = {
    id: 'partner-1',
    companyName: 'Garage Test',
    email: 'garage@test.com',
    phone: '+33612345678',
    address: '15 Rue Test',
    city: 'Paris',
    postalCode: '75001',
    latitude: 48.8566,
    longitude: 2.3522,
    commissionRate: 10,
    description: 'Test garage',
    siretNumber: '12345678901234',
    insuranceDocument: null,
    rating: 4.5,
    totalReviews: 10,
    status: PartnerStatus.APPROVED,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: undefined,
    type: null,
    isApproved: () => true,
    canOfferServices: () => true,
  } as any;

  const mockBooking: Booking = {
    id: 'booking-1',
    partnerId: 'partner-1',
    tenantId: 1,
    vehicleId: 'vehicle-1',
    driverId: null,
    serviceId: 'service-1',
    scheduledDate: new Date('2025-10-20'),
    scheduledTime: '14:00',
    endTime: '16:00',
    status: BookingStatus.COMPLETED,
    price: 100,
    commissionAmount: 10,
    customerNotes: null,
    partnerNotes: null,
    rejectionReason: null,
    cancellationReason: null,
    confirmedAt: new Date(),
    completedAt: new Date(),
    paidAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: undefined,
    partner: mockPartner,
  } as any;

  const mockCommission: Commission = {
    id: 'commission-1',
    partnerId: 'partner-1',
    bookingId: 'booking-1',
    amount: 10,
    status: CommissionStatus.PENDING,
    paidAt: null,
    paymentReference: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: undefined,
    partner: mockPartner,
    booking: mockBooking,
    canBePaid: () => true,
    isPending: () => true,
    isPaid: () => false,
  } as Commission;

  const mockRepositories = {
    commissionRepository: {
      create: jest.fn(),
      save: jest.fn(),
      find: jest.fn(),
      findOne: jest.fn(),
      count: jest.fn(),
      createQueryBuilder: jest.fn(),
    },
    bookingRepository: {
      findOne: jest.fn(),
    },
    partnerRepository: {
      findOne: jest.fn(),
    },
  };

  const mockAuditService = {
    create: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CommissionsService,
        {
          provide: getRepositoryToken(Commission),
          useValue: mockRepositories.commissionRepository,
        },
        {
          provide: getRepositoryToken(Booking),
          useValue: mockRepositories.bookingRepository,
        },
        {
          provide: getRepositoryToken(Partner),
          useValue: mockRepositories.partnerRepository,
        },
        {
          provide: AuditService,
          useValue: mockAuditService,
        },
      ],
    }).compile();

    service = module.get<CommissionsService>(CommissionsService);
    commissionRepository = module.get<Repository<Commission>>(
      getRepositoryToken(Commission),
    );
    bookingRepository = module.get<Repository<Booking>>(
      getRepositoryToken(Booking),
    );
    partnerRepository = module.get<Repository<Partner>>(
      getRepositoryToken(Partner),
    );
    auditService = module.get<AuditService>(AuditService);

    // Reset mocks
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createFromBooking', () => {
    it('should create commission with correct amount (100€ × 10% = 10€)', async () => {
      mockRepositories.commissionRepository.findOne.mockResolvedValue(null);
      mockRepositories.partnerRepository.findOne.mockResolvedValue(mockPartner);
      mockRepositories.commissionRepository.create.mockReturnValue(
        mockCommission,
      );
      mockRepositories.commissionRepository.save.mockResolvedValue(
        mockCommission,
      );

      const result = await service.createFromBooking(mockBooking);

      expect(result).toEqual(mockCommission);
      expect(commissionRepository.create).toHaveBeenCalledWith({
        partnerId: 'partner-1',
        bookingId: 'booking-1',
        amount: 10, // 100 × 10 / 100 = 10
        status: CommissionStatus.PENDING,
      });
      expect(commissionRepository.save).toHaveBeenCalledWith(mockCommission);
    });

    it('should throw ConflictException if commission already exists for booking', async () => {
      mockRepositories.commissionRepository.findOne.mockResolvedValue(
        mockCommission,
      );

      await expect(service.createFromBooking(mockBooking)).rejects.toThrow(
        ConflictException,
      );
      await expect(service.createFromBooking(mockBooking)).rejects.toThrow(
        'Commission already exists for booking booking-1',
      );
    });

    it('should throw NotFoundException if partner not found', async () => {
      mockRepositories.commissionRepository.findOne.mockResolvedValue(null);
      mockRepositories.partnerRepository.findOne.mockResolvedValue(null);

      await expect(service.createFromBooking(mockBooking)).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.createFromBooking(mockBooking)).rejects.toThrow(
        'Partner not found',
      );
    });
  });

  describe('findAll', () => {
    it('should return paginated commissions', async () => {
      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getCount: jest.fn().mockResolvedValue(1),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([mockCommission]),
      };

      mockRepositories.commissionRepository.createQueryBuilder.mockReturnValue(
        mockQueryBuilder,
      );
      mockRepositories.commissionRepository.count.mockResolvedValue(1);
      mockRepositories.commissionRepository.find.mockResolvedValue([mockCommission]);

      const result = await service.findAll({ page: 1, limit: 20 });

      expect(result.data).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(20);
      expect(result.totalPages).toBe(1);
    });

    it('should filter by partnerId', async () => {
      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getCount: jest.fn().mockResolvedValue(1),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([mockCommission]),
      };

      mockRepositories.commissionRepository.createQueryBuilder.mockReturnValue(
        mockQueryBuilder,
      );
      mockRepositories.commissionRepository.count.mockResolvedValue(1);
      mockRepositories.commissionRepository.find.mockResolvedValue([mockCommission]);

      const result = await service.findAll({ partnerId: 'partner-1', page: 1, limit: 20 });

      // Verify where clause includes partnerId
      expect(mockRepositories.commissionRepository.find).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ partnerId: 'partner-1' }),
        }),
      );
      expect(result.data).toHaveLength(1);
    });

    it('should filter by status', async () => {
      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getCount: jest.fn().mockResolvedValue(1),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([mockCommission]),
      };

      mockRepositories.commissionRepository.createQueryBuilder.mockReturnValue(
        mockQueryBuilder,
      );
      mockRepositories.commissionRepository.count.mockResolvedValue(1);
      mockRepositories.commissionRepository.find.mockResolvedValue([mockCommission]);

      const result = await service.findAll({
        status: CommissionStatus.PENDING,
        page: 1,
        limit: 20,
      });

      // Verify where clause includes status
      expect(mockRepositories.commissionRepository.find).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ status: CommissionStatus.PENDING }),
        }),
      );
      expect(result.data).toHaveLength(1);
    });
  });

  describe('findOne', () => {
    it('should return commission by id', async () => {
      mockRepositories.commissionRepository.findOne.mockResolvedValue(
        mockCommission,
      );

      const result = await service.findOne('commission-1');

      expect(result).toEqual(mockCommission);
      expect(commissionRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'commission-1' },
        relations: [
          'partner',
          'booking',
          'booking.tenant',
          'booking.vehicle',
          'booking.service',
        ],
      });
    });

    it('should throw NotFoundException if commission not found', async () => {
      mockRepositories.commissionRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('non-existent')).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.findOne('non-existent')).rejects.toThrow(
        'Commission with ID non-existent not found',
      );
    });

    it('should filter by partnerId when provided', async () => {
      mockRepositories.commissionRepository.findOne.mockResolvedValue(
        mockCommission,
      );

      await service.findOne('commission-1', 'partner-1');

      expect(commissionRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'commission-1', partnerId: 'partner-1' },
        relations: [
          'partner',
          'booking',
          'booking.tenant',
          'booking.vehicle',
          'booking.service',
        ],
      });
    });
  });

  describe('markAsPaid', () => {
    it('should mark commission as paid with payment reference', async () => {
      const pendingCommission = { ...mockCommission };
      mockRepositories.commissionRepository.findOne.mockResolvedValue(
        pendingCommission,
      );
      mockRepositories.commissionRepository.save.mockResolvedValue({
        ...pendingCommission,
        status: CommissionStatus.PAID,
        paidAt: new Date(),
        paymentReference: 'BANK_TRANSFER_001',
      });

      const result = await service.markAsPaid(
        'commission-1',
        { paymentReference: 'BANK_TRANSFER_001' },
        'user-1',
      );

      expect(result.status).toBe(CommissionStatus.PAID);
      expect(result.paymentReference).toBe('BANK_TRANSFER_001');
      expect(result.paidAt).toBeDefined();
      expect(auditService.create).toHaveBeenCalled();
    });

    it('should throw BadRequestException if commission already paid', async () => {
      const paidCommission = {
        ...mockCommission,
        status: CommissionStatus.PAID,
        canBePaid: () => false,
      };
      mockRepositories.commissionRepository.findOne.mockResolvedValue(
        paidCommission,
      );

      await expect(
        service.markAsPaid(
          'commission-1',
          { paymentReference: 'REF' },
          'user-1',
        ),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('getTotalByPartner', () => {
    it('should return correct totals grouped by status', async () => {
      const mockQueryBuilder = {
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValue([
          { status: 'pending', totalAmount: '100.50', count: '5' },
          { status: 'paid', totalAmount: '250.00', count: '10' },
        ]),
      };

      mockRepositories.commissionRepository.createQueryBuilder.mockReturnValue(
        mockQueryBuilder,
      );

      const result = await service.getTotalByPartner('partner-1');

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        status: 'pending',
        totalAmount: 100.5,
        count: 5,
      });
      expect(result[1]).toEqual({
        status: 'paid',
        totalAmount: 250,
        count: 10,
      });
    });
  });

  describe('getPendingCommissions', () => {
    it('should return all pending commissions', async () => {
      mockRepositories.commissionRepository.find.mockResolvedValue([
        mockCommission,
      ]);

      const result = await service.getPendingCommissions();

      expect(result).toEqual([mockCommission]);
      expect(commissionRepository.find).toHaveBeenCalledWith({
        where: { status: CommissionStatus.PENDING },
        relations: ['partner', 'booking'],
        order: { createdAt: 'DESC' },
      });
    });
  });

  describe('exportToExcel', () => {
    it('should generate Excel buffer with commission data', async () => {
      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([mockCommission]),
      };

      mockRepositories.commissionRepository.createQueryBuilder.mockReturnValue(
        mockQueryBuilder,
      );

      const result = await service.exportToExcel({ page: 1, limit: 20 });

      expect(result).toBeInstanceOf(Buffer);
      expect(result.length).toBeGreaterThan(0);
    });
  });
});
