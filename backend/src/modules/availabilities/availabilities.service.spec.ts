import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { AvailabilitiesService } from './availabilities.service';
import { Availability } from '../../entities/availability.entity';
import { Unavailability } from '../../entities/unavailability.entity';
import { Partner, PartnerStatus } from '../../entities/partner.entity';
import { Booking, BookingStatus } from '../../entities/booking.entity';
import { AuditService } from '../audit/audit.service';
import { SetAvailabilityDto } from './dto/set-availability.dto';
import { UpdateAvailabilityDto } from './dto/update-availability.dto';
import { AddUnavailabilityDto } from './dto/add-unavailability.dto';
import { AvailableSlotsQueryDto } from './dto/available-slots-query.dto';

describe('AvailabilitiesService', () => {
  let service: AvailabilitiesService;
  let availabilityRepository: Repository<Availability>;
  let unavailabilityRepository: Repository<Unavailability>;
  let partnerRepository: Repository<Partner>;
  let bookingRepository: Repository<Booking>;
  let auditService: AuditService;

  const mockPartner: Partner = {
    id: 'partner-123',
    companyName: 'Test Garage',
    email: 'test@garage.com',
    status: PartnerStatus.APPROVED,
    canOfferServices: () => true,
  } as any;

  const mockAvailability: Availability = {
    id: 'avail-123',
    partnerId: 'partner-123',
    dayOfWeek: 1, // Monday
    startTime: '09:00',
    endTime: '18:00',
    slotDuration: 30,
    createdAt: new Date(),
    updatedAt: new Date(),
    getDayName: () => 'Monday',
    getTotalSlots: () => 18,
    isValidTimeRange: () => true,
  } as Availability;

  const mockRepositories = {
    availabilityRepository: {
      create: jest.fn(),
      save: jest.fn(),
      find: jest.fn(),
      findOne: jest.fn(),
      softRemove: jest.fn(),
    },
    unavailabilityRepository: {
      create: jest.fn(),
      save: jest.fn(),
      find: jest.fn(),
      findOne: jest.fn(),
      softRemove: jest.fn(),
    },
    partnerRepository: {
      findOne: jest.fn(),
    },
    bookingRepository: {
      find: jest.fn(),
    },
  };

  const mockAuditService = {
    create: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AvailabilitiesService,
        {
          provide: getRepositoryToken(Availability),
          useValue: mockRepositories.availabilityRepository,
        },
        {
          provide: getRepositoryToken(Unavailability),
          useValue: mockRepositories.unavailabilityRepository,
        },
        {
          provide: getRepositoryToken(Partner),
          useValue: mockRepositories.partnerRepository,
        },
        {
          provide: getRepositoryToken(Booking),
          useValue: mockRepositories.bookingRepository,
        },
        {
          provide: AuditService,
          useValue: mockAuditService,
        },
      ],
    }).compile();

    service = module.get<AvailabilitiesService>(AvailabilitiesService);
    availabilityRepository = module.get<Repository<Availability>>(
      getRepositoryToken(Availability),
    );
    unavailabilityRepository = module.get<Repository<Unavailability>>(
      getRepositoryToken(Unavailability),
    );
    partnerRepository = module.get<Repository<Partner>>(
      getRepositoryToken(Partner),
    );
    bookingRepository = module.get<Repository<Booking>>(
      getRepositoryToken(Booking),
    );
    auditService = module.get<AuditService>(AuditService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // ==================== AVAILABILITY CRUD TESTS (6 tests) ====================

  describe('setAvailability', () => {
    const dto: SetAvailabilityDto = {
      dayOfWeek: 1,
      startTime: '09:00',
      endTime: '18:00',
      slotDuration: 30,
    };

    it('should create availability successfully', async () => {
      mockRepositories.partnerRepository.findOne.mockResolvedValue(mockPartner);
      mockRepositories.availabilityRepository.findOne.mockResolvedValue(null);
      mockRepositories.availabilityRepository.create.mockReturnValue(
        mockAvailability,
      );
      mockRepositories.availabilityRepository.save.mockResolvedValue(
        mockAvailability,
      );

      const result = await service.setAvailability(
        'partner-123',
        dto,
        'user-1',
      );

      expect(result).toEqual(mockAvailability);
      expect(mockRepositories.availabilityRepository.create).toHaveBeenCalled();
      expect(mockRepositories.availabilityRepository.save).toHaveBeenCalled();
      expect(mockAuditService.create).toHaveBeenCalled();
    });

    it('should throw NotFoundException if partner not found', async () => {
      mockRepositories.partnerRepository.findOne.mockResolvedValue(null);

      await expect(
        service.setAvailability('partner-123', dto, 'user-1'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if endTime <= startTime', async () => {
      const invalidDto = { ...dto, startTime: '18:00', endTime: '09:00' };
      mockRepositories.partnerRepository.findOne.mockResolvedValue(mockPartner);

      await expect(
        service.setAvailability('partner-123', invalidDto, 'user-1'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw ConflictException if availability already exists', async () => {
      mockRepositories.partnerRepository.findOne.mockResolvedValue(mockPartner);
      mockRepositories.availabilityRepository.findOne.mockResolvedValue(
        mockAvailability,
      );

      await expect(
        service.setAvailability('partner-123', dto, 'user-1'),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('updateAvailability', () => {
    const updateDto: UpdateAvailabilityDto = {
      endTime: '19:00',
      slotDuration: 60,
    };

    it('should update availability successfully', async () => {
      const updatedAvailability = {
        ...mockAvailability,
        endTime: '19:00',
        slotDuration: 60,
      };
      mockRepositories.availabilityRepository.findOne.mockResolvedValue(
        mockAvailability,
      );
      mockRepositories.availabilityRepository.save.mockResolvedValue(
        updatedAvailability,
      );

      const result = await service.updateAvailability(
        'avail-123',
        'partner-123',
        updateDto,
        'user-1',
      );

      expect(result.endTime).toBe('19:00');
      expect(result.slotDuration).toBe(60);
      expect(mockAuditService.create).toHaveBeenCalled();
    });

    it('should throw NotFoundException if availability not found', async () => {
      mockRepositories.availabilityRepository.findOne.mockResolvedValue(null);

      await expect(
        service.updateAvailability(
          'avail-123',
          'partner-123',
          updateDto,
          'user-1',
        ),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('setMultipleAvailabilities', () => {
    const bulkDtos: SetAvailabilityDto[] = [
      { dayOfWeek: 1, startTime: '09:00', endTime: '18:00', slotDuration: 30 },
      { dayOfWeek: 2, startTime: '09:00', endTime: '18:00', slotDuration: 30 },
      { dayOfWeek: 3, startTime: '09:00', endTime: '18:00', slotDuration: 30 },
    ];

    it('should create multiple availabilities successfully', async () => {
      mockRepositories.partnerRepository.findOne.mockResolvedValue(mockPartner);
      mockRepositories.availabilityRepository.find.mockResolvedValue([]);
      mockRepositories.availabilityRepository.create.mockImplementation(
        (dto) => dto,
      );
      mockRepositories.availabilityRepository.save.mockResolvedValue(bulkDtos);

      const result = await service.setMultipleAvailabilities(
        'partner-123',
        bulkDtos,
        'user-1',
      );

      expect(result).toHaveLength(3);
      expect(mockAuditService.create).toHaveBeenCalled();
    });

    it('should throw ConflictException if some days already have availabilities', async () => {
      const existingAvail = { ...mockAvailability, dayOfWeek: 1 };
      mockRepositories.partnerRepository.findOne.mockResolvedValue(mockPartner);
      mockRepositories.availabilityRepository.find.mockResolvedValue([
        existingAvail,
      ]);

      await expect(
        service.setMultipleAvailabilities('partner-123', bulkDtos, 'user-1'),
      ).rejects.toThrow(ConflictException);
    });

    it('should throw BadRequestException if duplicate days in request', async () => {
      const duplicateDtos = [
        {
          dayOfWeek: 1,
          startTime: '09:00',
          endTime: '18:00',
          slotDuration: 30,
        },
        {
          dayOfWeek: 1,
          startTime: '10:00',
          endTime: '17:00',
          slotDuration: 30,
        },
      ];
      mockRepositories.partnerRepository.findOne.mockResolvedValue(mockPartner);

      await expect(
        service.setMultipleAvailabilities(
          'partner-123',
          duplicateDtos,
          'user-1',
        ),
      ).rejects.toThrow(BadRequestException);
    });
  });

  // ==================== SLOT GENERATION ALGORITHM TESTS (8 tests) ====================

  describe('getAvailableSlots - Basic Generation', () => {
    const query: AvailableSlotsQueryDto = {
      date: '2025-12-01', // Monday
      duration: 30,
      advanceNoticeHours: 0, // Disable for testing
    };

    it('should generate slots with 30min duration', async () => {
      mockRepositories.partnerRepository.findOne.mockResolvedValue(mockPartner);
      mockRepositories.availabilityRepository.findOne.mockResolvedValue(
        mockAvailability,
      );
      mockRepositories.bookingRepository.find.mockResolvedValue([]);
      mockRepositories.unavailabilityRepository.find.mockResolvedValue([]);

      const result = await service.getAvailableSlots('partner-123', query);

      expect(result.slots.length).toBeGreaterThan(0);
      expect(result.slots[0].time).toBe('09:00');
      expect(result.slots[0].endTime).toBe('09:30');
      expect(result.slots[0].available).toBe(true);
      expect(result.availableCount).toBeGreaterThan(0);
    });

    it('should generate slots with 60min duration', async () => {
      const query60 = { ...query, duration: 60 };
      mockRepositories.partnerRepository.findOne.mockResolvedValue(mockPartner);
      mockRepositories.availabilityRepository.findOne.mockResolvedValue(
        mockAvailability,
      );
      mockRepositories.bookingRepository.find.mockResolvedValue([]);
      mockRepositories.unavailabilityRepository.find.mockResolvedValue([]);

      const result = await service.getAvailableSlots('partner-123', query60);

      expect(result.slots[0].time).toBe('09:00');
      expect(result.slots[0].endTime).toBe('10:00');
      expect(result.duration).toBe(60);
    });

    it('should generate slots with 15min duration', async () => {
      const avail15 = { ...mockAvailability, slotDuration: 15 };
      const query15 = { ...query, duration: 15 };
      mockRepositories.partnerRepository.findOne.mockResolvedValue(mockPartner);
      mockRepositories.availabilityRepository.findOne.mockResolvedValue(
        avail15,
      );
      mockRepositories.bookingRepository.find.mockResolvedValue([]);
      mockRepositories.unavailabilityRepository.find.mockResolvedValue([]);

      const result = await service.getAvailableSlots('partner-123', query15);

      expect(result.slots[0].time).toBe('09:00');
      expect(result.slots[0].endTime).toBe('09:15');
      expect(result.slots.length).toBeGreaterThan(18); // More slots with 15min
    });
  });

  describe('getAvailableSlots - Exclude Bookings', () => {
    const query: AvailableSlotsQueryDto = {
      date: '2025-12-01',
      duration: 30,
      advanceNoticeHours: 0,
    };

    it('should exclude confirmed booking slots', async () => {
      const booking: Booking = {
        id: 'booking-1',
        partnerId: 'partner-123',
        scheduledDate: new Date('2025-12-01'),
        scheduledTime: '10:00',
        endTime: '11:00',
        status: BookingStatus.CONFIRMED,
      } as Booking;

      mockRepositories.partnerRepository.findOne.mockResolvedValue(mockPartner);
      mockRepositories.availabilityRepository.findOne.mockResolvedValue(
        mockAvailability,
      );
      mockRepositories.bookingRepository.find.mockResolvedValue([booking]);
      mockRepositories.unavailabilityRepository.find.mockResolvedValue([]);

      const result = await service.getAvailableSlots('partner-123', query);

      const slot1000 = result.slots.find((s) => s.time === '10:00');
      const slot1030 = result.slots.find((s) => s.time === '10:30');

      expect(slot1000?.available).toBe(false);
      expect(slot1000?.reason).toBe('Already booked');
      // slot1030 overlaps with booking (10:00-11:00), so it should also be unavailable if it exists
      if (slot1030) {
        expect(slot1030.available).toBe(false);
      }
    });

    it('should exclude in_progress booking slots', async () => {
      const booking: Booking = {
        id: 'booking-2',
        partnerId: 'partner-123',
        scheduledDate: new Date('2025-12-01'),
        scheduledTime: '14:00',
        endTime: '15:00',
        status: BookingStatus.IN_PROGRESS,
      } as Booking;

      mockRepositories.partnerRepository.findOne.mockResolvedValue(mockPartner);
      mockRepositories.availabilityRepository.findOne.mockResolvedValue(
        mockAvailability,
      );
      mockRepositories.bookingRepository.find.mockResolvedValue([booking]);
      mockRepositories.unavailabilityRepository.find.mockResolvedValue([]);

      const result = await service.getAvailableSlots('partner-123', query);

      const slot1400 = result.slots.find((s) => s.time === '14:00');
      expect(slot1400?.available).toBe(false);
    });
  });

  describe('getAvailableSlots - Exclude Unavailabilities', () => {
    const query: AvailableSlotsQueryDto = {
      date: '2025-12-01',
      duration: 30,
      advanceNoticeHours: 0,
    };

    it('should exclude full day unavailability', async () => {
      const unavail = {
        id: 'unavail-1',
        partnerId: 'partner-123',
        date: new Date('2025-12-01'),
        reason: 'Holiday',
        isFullDay: true,
        startTime: null,
        endTime: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        blocksTimeSlot: () => true,
        overlapsTimeRange: () => true,
      } as any as Unavailability;

      mockRepositories.partnerRepository.findOne.mockResolvedValue(mockPartner);
      mockRepositories.availabilityRepository.findOne.mockResolvedValue(
        mockAvailability,
      );
      mockRepositories.bookingRepository.find.mockResolvedValue([]);
      mockRepositories.unavailabilityRepository.find.mockResolvedValue([
        unavail,
      ]);

      const result = await service.getAvailableSlots('partner-123', query);

      expect(result.availableCount).toBe(0);
      expect(result.unavailableCount).toBe(result.slots.length);
      expect(result.slots[0].reason).toBe('Holiday');
    });

    it('should exclude partial unavailability', async () => {
      const unavail = {
        id: 'unavail-2',
        partnerId: 'partner-123',
        date: new Date('2025-12-01'),
        reason: 'Lunch break',
        isFullDay: false,
        startTime: '12:00',
        endTime: '13:00',
        createdAt: new Date(),
        updatedAt: new Date(),
        blocksTimeSlot: (time: string) => time >= '12:00' && time < '13:00',
        overlapsTimeRange: (start: string, end: string) =>
          start < '13:00' && '12:00' < end,
      } as any as Unavailability;

      mockRepositories.partnerRepository.findOne.mockResolvedValue(mockPartner);
      mockRepositories.availabilityRepository.findOne.mockResolvedValue(
        mockAvailability,
      );
      mockRepositories.bookingRepository.find.mockResolvedValue([]);
      mockRepositories.unavailabilityRepository.find.mockResolvedValue([
        unavail,
      ]);

      const result = await service.getAvailableSlots('partner-123', query);

      const slot1200 = result.slots.find((s) => s.time === '12:00');
      const slot1230 = result.slots.find((s) => s.time === '12:30');
      const slot1300 = result.slots.find((s) => s.time === '13:00');

      expect(slot1200?.available).toBe(false);
      // slot1230 overlaps with lunch (12:00-13:00) if it exists
      if (slot1230) {
        expect(slot1230.available).toBe(false);
      }
      // slot1300 is after lunch and should be available
      if (slot1300) {
        expect(slot1300.available).toBe(true);
      }
    });

    it('should handle multiple unavailabilities', async () => {
      const unavails = [
        {
          id: 'unavail-3',
          partnerId: 'partner-123',
          date: new Date('2025-12-01'),
          reason: 'Meeting',
          isFullDay: false,
          startTime: '10:00',
          endTime: '11:00',
          createdAt: new Date(),
          updatedAt: new Date(),
          overlapsTimeRange: (start: string, end: string) =>
            start < '11:00' && '10:00' < end,
        } as any as Unavailability,
        {
          id: 'unavail-4',
          partnerId: 'partner-123',
          date: new Date('2025-12-01'),
          reason: 'Break',
          isFullDay: false,
          startTime: '15:00',
          endTime: '16:00',
          createdAt: new Date(),
          updatedAt: new Date(),
          overlapsTimeRange: (start: string, end: string) =>
            start < '16:00' && '15:00' < end,
        } as any as Unavailability,
      ];

      mockRepositories.partnerRepository.findOne.mockResolvedValue(mockPartner);
      mockRepositories.availabilityRepository.findOne.mockResolvedValue(
        mockAvailability,
      );
      mockRepositories.bookingRepository.find.mockResolvedValue([]);
      mockRepositories.unavailabilityRepository.find.mockResolvedValue(
        unavails,
      );

      const result = await service.getAvailableSlots('partner-123', query);

      const slot1000 = result.slots.find((s) => s.time === '10:00');
      const slot1500 = result.slots.find((s) => s.time === '15:00');

      expect(slot1000?.available).toBe(false);
      expect(slot1000?.reason).toBe('Meeting');
      expect(slot1500?.available).toBe(false);
      expect(slot1500?.reason).toBe('Break');
    });
  });

  describe('getAvailableSlots - Edge Cases', () => {
    it('should return empty slots if no availability for day', async () => {
      const query: AvailableSlotsQueryDto = {
        date: '2025-12-07', // Sunday (no availability)
        duration: 30,
      };

      mockRepositories.partnerRepository.findOne.mockResolvedValue(mockPartner);
      mockRepositories.availabilityRepository.findOne.mockResolvedValue(null);

      const result = await service.getAvailableSlots('partner-123', query);

      expect(result.slots).toEqual([]);
      expect(result.availableCount).toBe(0);
    });

    it('should handle boundary times (00:00 start)', async () => {
      const avail24h = {
        ...mockAvailability,
        startTime: '00:00',
        endTime: '23:59',
      };
      const query: AvailableSlotsQueryDto = {
        date: '2025-12-01',
        duration: 60,
        advanceNoticeHours: 0,
      };

      mockRepositories.partnerRepository.findOne.mockResolvedValue(mockPartner);
      mockRepositories.availabilityRepository.findOne.mockResolvedValue(
        avail24h,
      );
      mockRepositories.bookingRepository.find.mockResolvedValue([]);
      mockRepositories.unavailabilityRepository.find.mockResolvedValue([]);

      const result = await service.getAvailableSlots('partner-123', query);

      expect(result.slots[0].time).toBe('00:00');
      expect(result.slots.length).toBeGreaterThan(20);
    });

    it('should handle advance notice filtering', async () => {
      const query: AvailableSlotsQueryDto = {
        date: new Date().toISOString().split('T')[0], // Today
        duration: 30,
        advanceNoticeHours: 24,
      };

      mockRepositories.partnerRepository.findOne.mockResolvedValue(mockPartner);
      mockRepositories.availabilityRepository.findOne.mockResolvedValue(
        mockAvailability,
      );
      mockRepositories.bookingRepository.find.mockResolvedValue([]);
      mockRepositories.unavailabilityRepository.find.mockResolvedValue([]);

      const result = await service.getAvailableSlots('partner-123', query);

      // All slots should be unavailable due to 24h notice
      expect(result.availableCount).toBe(0);
      result.slots.forEach((slot) => {
        expect(slot.available).toBe(false);
        expect(slot.reason).toBe('Insufficient advance notice');
      });
    });
  });

  // ==================== UNAVAILABILITY TESTS (2 tests) ====================

  describe('addUnavailability', () => {
    const dto: AddUnavailabilityDto = {
      date: '2025-12-25',
      reason: 'Christmas',
      isFullDay: true,
    };

    it('should add unavailability successfully', async () => {
      const mockUnavail = {
        id: 'unavail-new',
        partnerId: 'partner-123',
        date: new Date('2025-12-25'),
        reason: 'Christmas',
        isFullDay: true,
        startTime: null,
        endTime: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any as Unavailability;

      mockRepositories.partnerRepository.findOne.mockResolvedValue(mockPartner);
      mockRepositories.unavailabilityRepository.create.mockReturnValue(
        mockUnavail,
      );
      mockRepositories.unavailabilityRepository.save.mockResolvedValue(
        mockUnavail,
      );

      const result = await service.addUnavailability(
        'partner-123',
        dto,
        'user-1',
      );

      expect(result).toEqual(mockUnavail);
      expect(mockAuditService.create).toHaveBeenCalled();
    });

    it('should throw BadRequestException for past date', async () => {
      const pastDto = { ...dto, date: '2020-01-01' };
      mockRepositories.partnerRepository.findOne.mockResolvedValue(mockPartner);

      await expect(
        service.addUnavailability('partner-123', pastDto, 'user-1'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should validate partial unavailability requires times', async () => {
      const partialDto = { ...dto, isFullDay: false };
      mockRepositories.partnerRepository.findOne.mockResolvedValue(mockPartner);

      await expect(
        service.addUnavailability('partner-123', partialDto, 'user-1'),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('removeUnavailability', () => {
    it('should remove unavailability successfully', async () => {
      const mockUnavail = {
        id: 'unavail-123',
        partnerId: 'partner-123',
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any as Unavailability;

      mockRepositories.unavailabilityRepository.findOne.mockResolvedValue(
        mockUnavail,
      );
      mockRepositories.unavailabilityRepository.softRemove.mockResolvedValue(
        mockUnavail,
      );

      await service.removeUnavailability(
        'unavail-123',
        'partner-123',
        'user-1',
      );

      expect(
        mockRepositories.unavailabilityRepository.softRemove,
      ).toHaveBeenCalledWith(mockUnavail);
      expect(mockAuditService.create).toHaveBeenCalled();
    });
  });
});
