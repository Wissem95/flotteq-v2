import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Availability } from '../../entities/availability.entity';
import { Unavailability } from '../../entities/unavailability.entity';
import { Partner } from '../../entities/partner.entity';
import { Booking, BookingStatus } from '../../entities/booking.entity';
import { SetAvailabilityDto } from './dto/set-availability.dto';
import { UpdateAvailabilityDto } from './dto/update-availability.dto';
import { AddUnavailabilityDto } from './dto/add-unavailability.dto';
import { AvailableSlotsQueryDto } from './dto/available-slots-query.dto';
import {
  AvailableSlotDto,
  AvailableSlotsResponseDto,
} from './dto/available-slot-response.dto';
import {
  AvailabilityResponseDto,
  UnavailabilityResponseDto,
} from './dto/availability-response.dto';
import { AuditService } from '../audit/audit.service';
import { AuditAction } from '../../entities/audit-log.entity';

@Injectable()
export class AvailabilitiesService {
  private readonly logger = new Logger(AvailabilitiesService.name);

  constructor(
    @InjectRepository(Availability)
    private availabilityRepository: Repository<Availability>,
    @InjectRepository(Unavailability)
    private unavailabilityRepository: Repository<Unavailability>,
    @InjectRepository(Partner)
    private partnerRepository: Repository<Partner>,
    @InjectRepository(Booking)
    private bookingRepository: Repository<Booking>,
    private auditService: AuditService,
  ) {}

  // ==================== AVAILABILITY CRUD ====================

  async setAvailability(
    partnerId: string,
    dto: SetAvailabilityDto,
    userId: string,
  ): Promise<Availability> {
    // Validate partner exists
    const partner = await this.partnerRepository.findOne({
      where: { id: partnerId },
    });

    if (!partner) {
      throw new NotFoundException('Partner not found');
    }

    // Validate time range
    if (dto.startTime >= dto.endTime) {
      throw new BadRequestException('End time must be after start time');
    }

    // Check if availability already exists for this day
    const existing = await this.availabilityRepository.findOne({
      where: { partnerId, dayOfWeek: dto.dayOfWeek },
    });

    if (existing) {
      throw new ConflictException(
        `Availability already exists for this day. Use PATCH /availabilities/${existing.id} to update.`,
      );
    }

    // Create availability
    const availability = this.availabilityRepository.create({
      partnerId,
      dayOfWeek: dto.dayOfWeek,
      startTime: dto.startTime,
      endTime: dto.endTime,
      slotDuration: dto.slotDuration,
    });

    const saved = await this.availabilityRepository.save(availability);

    // Log audit (use 0 for tenantId since this is a partner action)
    await this.auditService.create({
      userId,
      tenantId: 0,
      action: AuditAction.CREATE,
      entityType: 'availability',
      entityId: saved.id,
      newValue: { partnerId, dayOfWeek: dto.dayOfWeek },
    });

    this.logger.log(
      `Availability created for partner ${partnerId} on ${saved.getDayName()}`,
    );

    return saved;
  }

  async updateAvailability(
    id: string,
    partnerId: string,
    dto: UpdateAvailabilityDto,
    userId: string,
  ): Promise<Availability> {
    const availability = await this.availabilityRepository.findOne({
      where: { id, partnerId },
    });

    if (!availability) {
      throw new NotFoundException('Availability not found');
    }

    const oldValue = { ...availability };

    // Update fields if provided
    if (dto.startTime !== undefined) {
      availability.startTime = dto.startTime;
    }
    if (dto.endTime !== undefined) {
      availability.endTime = dto.endTime;
    }
    if (dto.slotDuration !== undefined) {
      availability.slotDuration = dto.slotDuration;
    }

    // Validate time range
    if (availability.startTime >= availability.endTime) {
      throw new BadRequestException('End time must be after start time');
    }

    const updated = await this.availabilityRepository.save(availability);

    // Log audit (use 0 for tenantId since this is a partner action)
    await this.auditService.create({
      userId,
      tenantId: 0,
      action: AuditAction.UPDATE,
      entityType: 'availability',
      entityId: id,
      oldValue: {
        startTime: oldValue.startTime,
        endTime: oldValue.endTime,
        slotDuration: oldValue.slotDuration,
      },
      newValue: {
        startTime: updated.startTime,
        endTime: updated.endTime,
        slotDuration: updated.slotDuration,
      },
    });

    this.logger.log(`Availability ${id} updated for partner ${partnerId}`);

    return updated;
  }

  async setMultipleAvailabilities(
    partnerId: string,
    dtos: SetAvailabilityDto[],
    userId: string,
  ): Promise<Availability[]> {
    // Validate partner exists
    const partner = await this.partnerRepository.findOne({
      where: { id: partnerId },
    });

    if (!partner) {
      throw new NotFoundException('Partner not found');
    }

    // Validate all DTOs
    for (const dto of dtos) {
      if (dto.startTime >= dto.endTime) {
        throw new BadRequestException(
          `Invalid time range for day ${dto.dayOfWeek}: End time must be after start time`,
        );
      }
    }

    // Check for duplicates in the request
    const dayOfWeeks = dtos.map((d) => d.dayOfWeek);
    const uniqueDays = new Set(dayOfWeeks);
    if (dayOfWeeks.length !== uniqueDays.size) {
      throw new BadRequestException('Duplicate day of week in request');
    }

    // Get existing availabilities
    const existing = await this.availabilityRepository.find({
      where: { partnerId },
    });

    const existingMap = new Map(existing.map((a) => [a.dayOfWeek, a]));

    // Prepare availabilities for upsert (update existing or create new)
    const availabilities = dtos.map((dto) => {
      const existingAvail = existingMap.get(dto.dayOfWeek);

      if (existingAvail) {
        // UPDATE: Merge with existing entity
        return this.availabilityRepository.create({
          ...existingAvail,
          startTime: dto.startTime,
          endTime: dto.endTime,
          slotDuration: dto.slotDuration,
        });
      } else {
        // CREATE: New entity
        return this.availabilityRepository.create({
          partnerId,
          dayOfWeek: dto.dayOfWeek,
          startTime: dto.startTime,
          endTime: dto.endTime,
          slotDuration: dto.slotDuration,
        });
      }
    });

    const saved = await this.availabilityRepository.save(availabilities);

    // Log audit (use 0 for tenantId since this is a partner action)
    await this.auditService.create({
      userId,
      tenantId: 0,
      action: AuditAction.CREATE,
      entityType: 'availability',
      entityId: 'bulk',
      newValue: { partnerId, count: saved.length },
    });

    this.logger.log(
      `${saved.length} availabilities upserted for partner ${partnerId}`,
    );

    return saved;
  }

  async removeAvailability(
    id: string,
    partnerId: string,
    userId: string,
  ): Promise<void> {
    const availability = await this.availabilityRepository.findOne({
      where: { id, partnerId },
    });

    if (!availability) {
      throw new NotFoundException('Availability not found');
    }

    await this.availabilityRepository.softRemove(availability);

    // Log audit (use 0 for tenantId since this is a partner action)
    await this.auditService.create({
      userId,
      tenantId: 0,
      action: AuditAction.DELETE,
      entityType: 'availability',
      entityId: id,
      oldValue: { dayOfWeek: availability.dayOfWeek },
    });

    this.logger.log(`Availability ${id} deleted for partner ${partnerId}`);
  }

  async getAllAvailabilities(
    partnerId: string,
  ): Promise<AvailabilityResponseDto[]> {
    const availabilities = await this.availabilityRepository.find({
      where: { partnerId },
      order: { dayOfWeek: 'ASC' },
    });

    return availabilities.map((a) => this.toAvailabilityResponseDto(a));
  }

  async findOne(id: string, partnerId: string): Promise<Availability> {
    const availability = await this.availabilityRepository.findOne({
      where: { id, partnerId },
    });

    if (!availability) {
      throw new NotFoundException('Availability not found');
    }

    return availability;
  }

  // ==================== UNAVAILABILITY CRUD ====================

  async addUnavailability(
    partnerId: string,
    dto: AddUnavailabilityDto,
    userId: string,
  ): Promise<Unavailability> {
    // Validate partner exists
    const partner = await this.partnerRepository.findOne({
      where: { id: partnerId },
    });

    if (!partner) {
      throw new NotFoundException('Partner not found');
    }

    // Validate partial unavailability
    if (!dto.isFullDay) {
      if (!dto.startTime || !dto.endTime) {
        throw new BadRequestException(
          'startTime and endTime are required for partial unavailability',
        );
      }
      if (dto.startTime >= dto.endTime) {
        throw new BadRequestException('End time must be after start time');
      }
    }

    // Validate date is not in the past
    const targetDate = new Date(dto.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (targetDate < today) {
      throw new BadRequestException(
        'Cannot create unavailability for past dates',
      );
    }

    // Create unavailability
    const unavailability = this.unavailabilityRepository.create({
      partnerId,
      date: targetDate,
      reason: dto.reason,
      isFullDay: dto.isFullDay,
      startTime: dto.isFullDay ? null : dto.startTime,
      endTime: dto.isFullDay ? null : dto.endTime,
    });

    const saved = await this.unavailabilityRepository.save(unavailability);

    // Log audit (use 0 for tenantId since this is a partner action)
    await this.auditService.create({
      userId,
      tenantId: 0,
      action: AuditAction.CREATE,
      entityType: 'unavailability',
      entityId: saved.id,
      newValue: { partnerId, date: dto.date },
    });

    this.logger.log(
      `Unavailability created for partner ${partnerId} on ${dto.date}`,
    );

    return saved;
  }

  async updateUnavailability(
    id: string,
    partnerId: string,
    dto: AddUnavailabilityDto | any, // Accept both Add and Update DTOs
    userId: string,
  ): Promise<UnavailabilityResponseDto> {
    const unavailability = await this.unavailabilityRepository.findOne({
      where: { id, partnerId },
    });

    if (!unavailability) {
      throw new NotFoundException('Unavailability not found');
    }

    // Store old values for audit
    const oldValue = {
      date: unavailability.date,
      reason: unavailability.reason,
      isFullDay: unavailability.isFullDay,
      startTime: unavailability.startTime,
      endTime: unavailability.endTime,
    };

    // Update fields
    unavailability.date = new Date(dto.date);
    unavailability.reason = dto.reason;
    unavailability.isFullDay = dto.isFullDay;
    unavailability.startTime = dto.isFullDay ? null : dto.startTime || null;
    unavailability.endTime = dto.isFullDay ? null : dto.endTime || null;

    const updated = await this.unavailabilityRepository.save(unavailability);

    // Log audit (use 0 for tenantId since this is a partner action)
    await this.auditService.create({
      userId,
      tenantId: 0,
      action: AuditAction.UPDATE,
      entityType: 'unavailability',
      entityId: id,
      oldValue,
      newValue: {
        date: dto.date,
        reason: dto.reason,
        isFullDay: dto.isFullDay,
        startTime: dto.startTime,
        endTime: dto.endTime,
      },
    });

    this.logger.log(`Unavailability ${id} updated for partner ${partnerId}`);

    return {
      id: updated.id,
      partnerId: updated.partnerId,
      date: updated.date,
      reason: updated.reason,
      isFullDay: updated.isFullDay,
      startTime: updated.startTime,
      endTime: updated.endTime,
      createdAt: updated.createdAt.toISOString(),
      updatedAt: updated.updatedAt.toISOString(),
    };
  }

  async removeUnavailability(
    id: string,
    partnerId: string,
    userId: string,
  ): Promise<void> {
    const unavailability = await this.unavailabilityRepository.findOne({
      where: { id, partnerId },
    });

    if (!unavailability) {
      throw new NotFoundException('Unavailability not found');
    }

    await this.unavailabilityRepository.softRemove(unavailability);

    // Log audit (use 0 for tenantId since this is a partner action)
    await this.auditService.create({
      userId,
      tenantId: 0,
      action: AuditAction.DELETE,
      entityType: 'unavailability',
      entityId: id,
      oldValue: { date: unavailability.date },
    });

    this.logger.log(`Unavailability ${id} deleted for partner ${partnerId}`);
  }

  async getUnavailabilities(
    partnerId: string,
    startDate?: string,
    endDate?: string,
  ): Promise<UnavailabilityResponseDto[]> {
    const query: any = { partnerId };

    if (startDate && endDate) {
      query.date = Between(new Date(startDate), new Date(endDate));
    } else if (startDate) {
      query.date = Between(new Date(startDate), new Date('2100-12-31'));
    }

    const unavailabilities = await this.unavailabilityRepository.find({
      where: query,
      order: { date: 'ASC' },
    });

    return unavailabilities.map((u) => this.toUnavailabilityResponseDto(u));
  }

  // ==================== SLOT GENERATION ALGORITHM ====================

  async getAvailableSlots(
    partnerId: string,
    query: AvailableSlotsQueryDto,
  ): Promise<AvailableSlotsResponseDto> {
    const { date, duration, advanceNoticeHours = 24 } = query;

    // Validate partner exists
    const partner = await this.partnerRepository.findOne({
      where: { id: partnerId },
    });

    if (!partner) {
      throw new NotFoundException('Partner not found');
    }

    // Get day of week (0-6)
    const targetDate = new Date(date);
    const dayOfWeek = targetDate.getDay();

    // Get availability for this day
    const availability = await this.availabilityRepository.findOne({
      where: { partnerId, dayOfWeek },
    });

    if (!availability) {
      return {
        date,
        duration,
        slots: [],
        availableCount: 0,
        unavailableCount: 0,
      };
    }

    // Generate all possible slots
    const allSlots = this.generateTimeSlots(
      availability.startTime,
      availability.endTime,
      availability.slotDuration,
      duration,
    );

    // Get existing bookings for this day
    const bookings = await this.bookingRepository.find({
      where: {
        partnerId,
        scheduledDate: targetDate,
        status: Between(BookingStatus.CONFIRMED, BookingStatus.IN_PROGRESS),
      },
    });

    // Get unavailabilities for this day
    const unavailabilities = await this.unavailabilityRepository.find({
      where: {
        partnerId,
        date: targetDate,
      },
    });

    // Check each slot
    const now = new Date();
    const minAdvanceTime = new Date(
      now.getTime() + advanceNoticeHours * 60 * 60 * 1000,
    );

    const slotsWithAvailability: AvailableSlotDto[] = allSlots.map((slot) => {
      const slotDateTime = this.parseDateTime(date, slot.time);
      const slotEndDateTime = this.parseDateTime(date, slot.endTime);

      // Check if slot is in the past or within advance notice period
      if (slotDateTime < minAdvanceTime) {
        return {
          ...slot,
          available: false,
          reason: 'Insufficient advance notice',
        };
      }

      // Check unavailabilities
      const blockedByUnavailability = unavailabilities.find((unavail) =>
        this.isSlotBlockedByUnavailability(slot.time, slot.endTime, unavail),
      );

      if (blockedByUnavailability) {
        return {
          ...slot,
          available: false,
          reason: blockedByUnavailability.reason,
        };
      }

      // Check bookings
      const overlappingBooking = bookings.find((booking) =>
        this.isSlotOverlappingBooking(slot.time, slot.endTime, booking),
      );

      if (overlappingBooking) {
        return {
          ...slot,
          available: false,
          reason: 'Already booked',
        };
      }

      return {
        ...slot,
        available: true,
      };
    });

    const availableCount = slotsWithAvailability.filter(
      (s) => s.available,
    ).length;
    const unavailableCount = slotsWithAvailability.length - availableCount;

    return {
      date,
      duration,
      slots: slotsWithAvailability,
      availableCount,
      unavailableCount,
    };
  }

  // ==================== HELPER METHODS ====================

  private generateTimeSlots(
    startTime: string,
    endTime: string,
    slotDuration: number,
    serviceDuration: number,
  ): Array<{ time: string; endTime: string }> {
    const slots: Array<{ time: string; endTime: string }> = [];

    const [startHour, startMinute] = startTime.split(':').map(Number);
    const [endHour, endMinute] = endTime.split(':').map(Number);

    let currentMinutes = startHour * 60 + startMinute;
    const endMinutes = endHour * 60 + endMinute;

    while (currentMinutes + serviceDuration <= endMinutes) {
      const slotStartTime = this.minutesToTime(currentMinutes);
      const slotEndTime = this.minutesToTime(currentMinutes + serviceDuration);

      slots.push({
        time: slotStartTime,
        endTime: slotEndTime,
      });

      currentMinutes += slotDuration;
    }

    return slots;
  }

  private minutesToTime(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  }

  private parseDateTime(date: string, time: string): Date {
    return new Date(`${date}T${time}:00`);
  }

  private isSlotBlockedByUnavailability(
    slotStart: string,
    slotEnd: string,
    unavailability: Unavailability,
  ): boolean {
    if (unavailability.isFullDay) {
      return true;
    }

    if (!unavailability.startTime || !unavailability.endTime) {
      return false;
    }

    // Check if ranges overlap
    return (
      unavailability.startTime < slotEnd && slotStart < unavailability.endTime
    );
  }

  private isSlotOverlappingBooking(
    slotStart: string,
    slotEnd: string,
    booking: Booking,
  ): boolean {
    // Check if time ranges overlap
    return booking.scheduledTime < slotEnd && slotStart < booking.endTime;
  }

  private toAvailabilityResponseDto(
    availability: Availability,
  ): AvailabilityResponseDto {
    return {
      id: availability.id,
      partnerId: availability.partnerId,
      dayOfWeek: availability.dayOfWeek,
      dayName: availability.getDayName(),
      startTime: availability.startTime,
      endTime: availability.endTime,
      slotDuration: availability.slotDuration,
      totalSlots: availability.getTotalSlots(),
      createdAt: availability.createdAt.toISOString(),
      updatedAt: availability.updatedAt.toISOString(),
    };
  }

  private toUnavailabilityResponseDto(
    unavailability: Unavailability,
  ): UnavailabilityResponseDto {
    return {
      id: unavailability.id,
      partnerId: unavailability.partnerId,
      date: unavailability.date,
      reason: unavailability.reason,
      isFullDay: unavailability.isFullDay,
      startTime: unavailability.startTime,
      endTime: unavailability.endTime,
      createdAt: unavailability.createdAt.toISOString(),
      updatedAt: unavailability.updatedAt.toISOString(),
    };
  }
}
