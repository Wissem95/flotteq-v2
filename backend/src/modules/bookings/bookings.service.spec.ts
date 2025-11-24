import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { Booking, BookingStatus } from '../../entities/booking.entity';
import { Partner, PartnerStatus } from '../../entities/partner.entity';
import { PartnerService } from '../../entities/partner-service.entity';
import { Vehicle } from '../../entities/vehicle.entity';
import { EmailQueueService } from '../notifications/email-queue.service';
import { AuditService } from '../audit/audit.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { RescheduleBookingDto } from './dto/reschedule-booking.dto';

describe('BookingsService', () => {
  let service: BookingsService;
  let bookingRepository: Repository<Booking>;
  let partnerRepository: Repository<Partner>;
  let partnerServiceRepository: Repository<PartnerService>;
  let vehicleRepository: Repository<Vehicle>;
  let emailQueueService: EmailQueueService;
  let auditService: AuditService;

  const mockBooking: Booking = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    partnerId: 'partner-1',
    tenantId: 1,
    vehicleId: 'vehicle-1',
    driverId: null,
    serviceId: 'service-1',
    scheduledDate: new Date('2025-10-20'),
    scheduledTime: '14:00',
    endTime: '16:00',
    status: BookingStatus.PENDING,
    price: 89.99,
    commissionAmount: 0,
    customerNotes: 'Check brakes',
    partnerNotes: null,
    rejectionReason: null,
    cancellationReason: null,
    confirmedAt: null,
    completedAt: null,
    paidAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: undefined,
    partner: {
      id: 'partner-1',
      companyName: 'Garage Test',
      email: 'garage@test.com',
      status: PartnerStatus.APPROVED,
      commissionRate: 10,
      canOfferServices: () => true,
    } as any,
    service: {
      id: 'service-1',
      name: 'Oil Change',
      price: 89.99,
      isBookable: () => true,
    } as any,
    vehicle: {
      id: 'vehicle-1',
      registration: 'ABC-123',
      tenantId: 1,
    } as any,
    driver: null,
    tenant: {
      id: 1,
      name: 'Test Company',
      email: 'test@company.com',
    } as any,
    canBeConfirmed: () => true,
    canBeRejected: () => true,
    canBeStarted: () => false,
    canBeCompleted: () => false,
    canBeCancelled: () => true,
    canBeRescheduled: () => true,
    isPaid: () => false,
  } as Booking;

  const mockRepositories = {
    bookingRepository: {
      create: jest.fn(),
      save: jest.fn(),
      find: jest.fn(),
      findOne: jest.fn(),
      softRemove: jest.fn(),
      createQueryBuilder: jest.fn(),
    },
    partnerRepository: {
      findOne: jest.fn(),
    },
    partnerServiceRepository: {
      findOne: jest.fn(),
    },
    vehicleRepository: {
      findOne: jest.fn(),
    },
  };

  const mockEmailQueueService = {
    queuePartnerBookingNew: jest.fn(),
    queuePartnerBookingCancelled: jest.fn(),
    queueBookingConfirmed: jest.fn(),
    queueBookingRejected: jest.fn(),
    queueBookingCompleted: jest.fn(),
  };

  const mockAuditService = {
    create: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BookingsService,
        {
          provide: getRepositoryToken(Booking),
          useValue: mockRepositories.bookingRepository,
        },
        {
          provide: getRepositoryToken(Partner),
          useValue: mockRepositories.partnerRepository,
        },
        {
          provide: getRepositoryToken(PartnerService),
          useValue: mockRepositories.partnerServiceRepository,
        },
        {
          provide: getRepositoryToken(Vehicle),
          useValue: mockRepositories.vehicleRepository,
        },
        {
          provide: EmailQueueService,
          useValue: mockEmailQueueService,
        },
        {
          provide: AuditService,
          useValue: mockAuditService,
        },
      ],
    }).compile();

    service = module.get<BookingsService>(BookingsService);
    bookingRepository = module.get<Repository<Booking>>(
      getRepositoryToken(Booking),
    );
    partnerRepository = module.get<Repository<Partner>>(
      getRepositoryToken(Partner),
    );
    partnerServiceRepository = module.get<Repository<PartnerService>>(
      getRepositoryToken(PartnerService),
    );
    vehicleRepository = module.get<Repository<Vehicle>>(
      getRepositoryToken(Vehicle),
    );
    emailQueueService = module.get<EmailQueueService>(EmailQueueService);
    auditService = module.get<AuditService>(AuditService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const createDto: CreateBookingDto = {
      partnerId: 'partner-1',
      vehicleId: 'vehicle-1',
      serviceId: 'service-1',
      scheduledDate: '2025-10-20',
      scheduledTime: '14:00',
      endTime: '16:00',
      customerNotes: 'Check brakes',
    };

    it('should create a booking successfully', async () => {
      mockRepositories.partnerRepository.findOne.mockResolvedValue(
        mockBooking.partner,
      );
      mockRepositories.partnerServiceRepository.findOne.mockResolvedValue(
        mockBooking.service,
      );
      mockRepositories.vehicleRepository.findOne.mockResolvedValue(
        mockBooking.vehicle,
      );
      mockRepositories.bookingRepository.create.mockReturnValue(mockBooking);
      mockRepositories.bookingRepository.save.mockResolvedValue(mockBooking);

      const result = await service.create(createDto, 1, 'user-1');

      expect(result).toEqual(mockBooking);
      expect(mockRepositories.bookingRepository.create).toHaveBeenCalled();
      expect(mockRepositories.bookingRepository.save).toHaveBeenCalled();
      expect(mockAuditService.create).toHaveBeenCalled();
      expect(mockEmailQueueService.queuePartnerBookingNew).toHaveBeenCalled();
    });

    it('should throw NotFoundException if partner not found', async () => {
      mockRepositories.partnerRepository.findOne.mockResolvedValue(null);

      await expect(service.create(createDto, 1, 'user-1')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw BadRequestException if partner is not approved', async () => {
      const unapprovedPartner = {
        ...mockBooking.partner,
        canOfferServices: () => false,
      };
      mockRepositories.partnerRepository.findOne.mockResolvedValue(
        unapprovedPartner,
      );

      await expect(service.create(createDto, 1, 'user-1')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw NotFoundException if service not found', async () => {
      mockRepositories.partnerRepository.findOne.mockResolvedValue(
        mockBooking.partner,
      );
      mockRepositories.partnerServiceRepository.findOne.mockResolvedValue(null);

      await expect(service.create(createDto, 1, 'user-1')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw BadRequestException if service is not bookable', async () => {
      const inactiveService = {
        ...mockBooking.service,
        isBookable: () => false,
      };
      mockRepositories.partnerRepository.findOne.mockResolvedValue(
        mockBooking.partner,
      );
      mockRepositories.partnerServiceRepository.findOne.mockResolvedValue(
        inactiveService,
      );

      await expect(service.create(createDto, 1, 'user-1')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw NotFoundException if vehicle not found', async () => {
      mockRepositories.partnerRepository.findOne.mockResolvedValue(
        mockBooking.partner,
      );
      mockRepositories.partnerServiceRepository.findOne.mockResolvedValue(
        mockBooking.service,
      );
      mockRepositories.vehicleRepository.findOne.mockResolvedValue(null);

      await expect(service.create(createDto, 1, 'user-1')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw BadRequestException if scheduled date is in the past', async () => {
      const pastDto = { ...createDto, scheduledDate: '2020-01-01' };
      mockRepositories.partnerRepository.findOne.mockResolvedValue(
        mockBooking.partner,
      );
      mockRepositories.partnerServiceRepository.findOne.mockResolvedValue(
        mockBooking.service,
      );
      mockRepositories.vehicleRepository.findOne.mockResolvedValue(
        mockBooking.vehicle,
      );

      await expect(service.create(pastDto, 1, 'user-1')).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('findOne', () => {
    it('should return a booking by id', async () => {
      mockRepositories.bookingRepository.findOne.mockResolvedValue(mockBooking);

      const result = await service.findOne(
        '123e4567-e89b-12d3-a456-426614174000',
        1,
      );

      expect(result).toEqual(mockBooking);
      expect(mockRepositories.bookingRepository.findOne).toHaveBeenCalledWith({
        where: { id: '123e4567-e89b-12d3-a456-426614174000', tenantId: 1 },
        relations: ['partner', 'service', 'vehicle', 'driver'],
      });
    });

    it('should throw NotFoundException if booking not found', async () => {
      mockRepositories.bookingRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('nonexistent-id', 1)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('confirm', () => {
    it('should confirm a booking successfully', async () => {
      const pendingBooking = { ...mockBooking, canBeConfirmed: () => true };
      mockRepositories.bookingRepository.findOne.mockResolvedValue(
        pendingBooking,
      );
      mockRepositories.bookingRepository.save.mockResolvedValue({
        ...pendingBooking,
        status: BookingStatus.CONFIRMED,
        confirmedAt: new Date(),
      });

      const result = await service.confirm(
        '123e4567-e89b-12d3-a456-426614174000',
        'partner-1',
        'user-1',
      );

      expect(result.status).toBe(BookingStatus.CONFIRMED);
      expect(result.confirmedAt).toBeDefined();
      expect(mockAuditService.create).toHaveBeenCalled();
      expect(mockEmailQueueService.queueBookingConfirmed).toHaveBeenCalled();
    });

    it('should throw NotFoundException if booking not found', async () => {
      mockRepositories.bookingRepository.findOne.mockResolvedValue(null);

      await expect(
        service.confirm('nonexistent-id', 'partner-1', 'user-1'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if booking cannot be confirmed', async () => {
      const completedBooking = {
        ...mockBooking,
        status: BookingStatus.COMPLETED,
        canBeConfirmed: () => false,
      };
      mockRepositories.bookingRepository.findOne.mockResolvedValue(
        completedBooking,
      );

      await expect(
        service.confirm(
          '123e4567-e89b-12d3-a456-426614174000',
          'partner-1',
          'user-1',
        ),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('reject', () => {
    it('should reject a booking successfully', async () => {
      const pendingBooking = { ...mockBooking, canBeRejected: () => true };
      mockRepositories.bookingRepository.findOne.mockResolvedValue(
        pendingBooking,
      );
      mockRepositories.bookingRepository.save.mockResolvedValue({
        ...pendingBooking,
        status: BookingStatus.REJECTED,
        rejectionReason: 'Not available',
      });

      const result = await service.reject(
        '123e4567-e89b-12d3-a456-426614174000',
        'partner-1',
        'Not available',
        'user-1',
      );

      expect(result.status).toBe(BookingStatus.REJECTED);
      expect(result.rejectionReason).toBe('Not available');
      expect(mockAuditService.create).toHaveBeenCalled();
      expect(mockEmailQueueService.queueBookingRejected).toHaveBeenCalled();
    });

    it('should throw BadRequestException if booking cannot be rejected', async () => {
      const completedBooking = {
        ...mockBooking,
        status: BookingStatus.COMPLETED,
        canBeRejected: () => false,
      };
      mockRepositories.bookingRepository.findOne.mockResolvedValue(
        completedBooking,
      );

      await expect(
        service.reject(
          '123e4567-e89b-12d3-a456-426614174000',
          'partner-1',
          'Reason',
          'user-1',
        ),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('reschedule', () => {
    const rescheduleDto: RescheduleBookingDto = {
      scheduledDate: '2025-11-01',
      scheduledTime: '10:00',
      endTime: '12:00',
    };

    it('should reschedule a booking successfully', async () => {
      const bookingToReschedule = {
        ...mockBooking,
        canBeRescheduled: () => true,
      };
      mockRepositories.bookingRepository.findOne.mockResolvedValue(
        bookingToReschedule,
      );
      mockRepositories.bookingRepository.save.mockResolvedValue({
        ...bookingToReschedule,
        scheduledDate: new Date('2025-11-01'),
        scheduledTime: '10:00',
        endTime: '12:00',
      });

      const result = await service.reschedule(
        '123e4567-e89b-12d3-a456-426614174000',
        rescheduleDto,
        1,
        'user-1',
      );

      expect(result.scheduledTime).toBe('10:00');
      expect(mockAuditService.create).toHaveBeenCalled();
    });

    it('should throw BadRequestException if booking cannot be rescheduled', async () => {
      const completedBooking = {
        ...mockBooking,
        status: BookingStatus.COMPLETED,
        canBeRescheduled: () => false,
      };
      mockRepositories.bookingRepository.findOne.mockResolvedValue(
        completedBooking,
      );

      await expect(
        service.reschedule(
          '123e4567-e89b-12d3-a456-426614174000',
          rescheduleDto,
          1,
          'user-1',
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if new scheduled date is in the past', async () => {
      const bookingToReschedule = {
        ...mockBooking,
        canBeRescheduled: () => true,
      };
      const pastDto = { ...rescheduleDto, scheduledDate: '2020-01-01' };
      mockRepositories.bookingRepository.findOne.mockResolvedValue(
        bookingToReschedule,
      );

      await expect(
        service.reschedule(
          '123e4567-e89b-12d3-a456-426614174000',
          pastDto,
          1,
          'user-1',
        ),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('startWork', () => {
    it('should start work on a booking successfully', async () => {
      const confirmedBooking = {
        ...mockBooking,
        status: BookingStatus.CONFIRMED,
        canBeStarted: () => true,
      };
      mockRepositories.bookingRepository.findOne.mockResolvedValue(
        confirmedBooking,
      );
      mockRepositories.bookingRepository.save.mockResolvedValue({
        ...confirmedBooking,
        status: BookingStatus.IN_PROGRESS,
      });

      const result = await service.startWork(
        '123e4567-e89b-12d3-a456-426614174000',
        'partner-1',
        'user-1',
      );

      expect(result.status).toBe(BookingStatus.IN_PROGRESS);
      expect(mockAuditService.create).toHaveBeenCalled();
    });

    it('should throw BadRequestException if booking cannot be started', async () => {
      const pendingBooking = {
        ...mockBooking,
        status: BookingStatus.PENDING,
        canBeStarted: () => false,
      };
      mockRepositories.bookingRepository.findOne.mockResolvedValue(
        pendingBooking,
      );

      await expect(
        service.startWork(
          '123e4567-e89b-12d3-a456-426614174000',
          'partner-1',
          'user-1',
        ),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('complete', () => {
    it('should complete a booking successfully and calculate commission', async () => {
      const inProgressBooking = {
        ...mockBooking,
        status: BookingStatus.IN_PROGRESS,
        canBeCompleted: () => true,
        partner: {
          ...mockBooking.partner,
          commissionRate: 10,
        },
      };
      mockRepositories.bookingRepository.findOne.mockResolvedValue(
        inProgressBooking,
      );
      mockRepositories.bookingRepository.save.mockResolvedValue({
        ...inProgressBooking,
        status: BookingStatus.COMPLETED,
        completedAt: new Date(),
        commissionAmount: 8.99, // 89.99 * 10 / 100
        partnerNotes: 'Work completed',
      });

      const result = await service.complete(
        '123e4567-e89b-12d3-a456-426614174000',
        'partner-1',
        'Work completed',
        'user-1',
      );

      expect(result.status).toBe(BookingStatus.COMPLETED);
      expect(result.completedAt).toBeDefined();
      expect(result.commissionAmount).toBe(8.99);
      expect(mockAuditService.create).toHaveBeenCalled();
      expect(mockEmailQueueService.queueBookingCompleted).toHaveBeenCalled();
    });

    it('should throw BadRequestException if booking cannot be completed', async () => {
      const pendingBooking = {
        ...mockBooking,
        status: BookingStatus.PENDING,
        canBeCompleted: () => false,
      };
      mockRepositories.bookingRepository.findOne.mockResolvedValue(
        pendingBooking,
      );

      await expect(
        service.complete(
          '123e4567-e89b-12d3-a456-426614174000',
          'partner-1',
          'Notes',
          'user-1',
        ),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('cancel', () => {
    it('should cancel a booking successfully', async () => {
      const bookingToCancel = { ...mockBooking, canBeCancelled: () => true };
      mockRepositories.bookingRepository.findOne.mockResolvedValue(
        bookingToCancel,
      );
      mockRepositories.bookingRepository.save.mockResolvedValue({
        ...bookingToCancel,
        status: BookingStatus.CANCELLED,
        cancellationReason: 'Customer request',
      });

      const result = await service.cancel(
        '123e4567-e89b-12d3-a456-426614174000',
        'Customer request',
        1,
        'user-1',
      );

      expect(result.status).toBe(BookingStatus.CANCELLED);
      expect(result.cancellationReason).toBe('Customer request');
      expect(mockAuditService.create).toHaveBeenCalled();
      expect(
        mockEmailQueueService.queuePartnerBookingCancelled,
      ).toHaveBeenCalled();
    });

    it('should throw BadRequestException if booking cannot be cancelled', async () => {
      const completedBooking = {
        ...mockBooking,
        status: BookingStatus.COMPLETED,
        canBeCancelled: () => false,
      };
      mockRepositories.bookingRepository.findOne.mockResolvedValue(
        completedBooking,
      );

      await expect(
        service.cancel(
          '123e4567-e89b-12d3-a456-426614174000',
          'Reason',
          1,
          'user-1',
        ),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('findUpcoming', () => {
    it('should return upcoming confirmed bookings', async () => {
      const upcomingBookings = [mockBooking];
      mockRepositories.bookingRepository.find.mockResolvedValue(
        upcomingBookings,
      );

      const result = await service.findUpcoming(1, 7);

      expect(result).toEqual(upcomingBookings);
      expect(mockRepositories.bookingRepository.find).toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should soft delete a booking', async () => {
      mockRepositories.bookingRepository.findOne.mockResolvedValue(mockBooking);
      mockRepositories.bookingRepository.softRemove.mockResolvedValue(
        mockBooking,
      );

      await service.remove('123e4567-e89b-12d3-a456-426614174000', 1);

      expect(
        mockRepositories.bookingRepository.softRemove,
      ).toHaveBeenCalledWith(mockBooking);
    });
  });
});
