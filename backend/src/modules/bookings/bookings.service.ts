import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, LessThanOrEqual, MoreThanOrEqual } from 'typeorm';
import { Booking, BookingStatus } from '../../entities/booking.entity';
import { Partner, PartnerStatus } from '../../entities/partner.entity';
import { PartnerService } from '../../entities/partner-service.entity';
import { Vehicle } from '../../entities/vehicle.entity';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';
import { RescheduleBookingDto } from './dto/reschedule-booking.dto';
import { BookingFilterDto } from './dto/booking-filter.dto';
import { BookingResponseDto, BookingListResponseDto } from './dto/booking-response.dto';
import { EmailQueueService } from '../notifications/email-queue.service';
import { AuditService } from '../audit/audit.service';
import { AuditAction } from '../../entities/audit-log.entity';
import { CommissionsService } from '../commissions/commissions.service';

@Injectable()
export class BookingsService {
  private readonly logger = new Logger(BookingsService.name);

  constructor(
    @InjectRepository(Booking)
    private bookingRepository: Repository<Booking>,
    @InjectRepository(Partner)
    private partnerRepository: Repository<Partner>,
    @InjectRepository(PartnerService)
    private partnerServiceRepository: Repository<PartnerService>,
    @InjectRepository(Vehicle)
    private vehicleRepository: Repository<Vehicle>,
    private emailQueueService: EmailQueueService,
    private auditService: AuditService,
    private commissionsService: CommissionsService,
  ) {}

  async create(createBookingDto: CreateBookingDto, tenantId: number, userId: string): Promise<Booking> {
    // Validate partner is approved
    const partner = await this.partnerRepository.findOne({
      where: { id: createBookingDto.partnerId },
    });

    if (!partner) {
      throw new NotFoundException('Partner not found');
    }

    if (!partner.canOfferServices()) {
      throw new BadRequestException('Partner is not approved or has been suspended');
    }

    // Validate service exists and is active
    const service = await this.partnerServiceRepository.findOne({
      where: { id: createBookingDto.serviceId, partnerId: createBookingDto.partnerId },
    });

    if (!service) {
      throw new NotFoundException('Service not found');
    }

    if (!service.isBookable()) {
      throw new BadRequestException('Service is not available for booking');
    }

    // Validate vehicle belongs to tenant
    const vehicle = await this.vehicleRepository.findOne({
      where: { id: createBookingDto.vehicleId, tenantId },
    });

    if (!vehicle) {
      throw new NotFoundException('Vehicle not found or does not belong to your organization');
    }

    // Validate scheduled date is in the future
    const scheduledDate = new Date(createBookingDto.scheduledDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (scheduledDate < today) {
      throw new BadRequestException('Scheduled date must be in the future');
    }

    // Create booking
    const booking = this.bookingRepository.create({
      partnerId: createBookingDto.partnerId,
      tenantId,
      vehicleId: createBookingDto.vehicleId,
      driverId: createBookingDto.driverId || null,
      serviceId: createBookingDto.serviceId,
      scheduledDate,
      scheduledTime: createBookingDto.scheduledTime,
      endTime: createBookingDto.endTime,
      price: service.price,
      customerNotes: createBookingDto.customerNotes || null,
      status: BookingStatus.PENDING,
    });

    const savedBooking = await this.bookingRepository.save(booking);

    // Log audit
    await this.auditService.create({
      userId,
      tenantId,
      action: AuditAction.CREATE,
      entityType: 'booking',
      entityId: savedBooking.id,
      newValue: { status: BookingStatus.PENDING },
    });

    // Queue email notification to partner
    await this.emailQueueService.queuePartnerBookingNew(
      partner.email,
      partner.companyName,
      {
        bookingId: savedBooking.id,
        serviceName: service.name,
        scheduledDate: createBookingDto.scheduledDate,
        scheduledTime: createBookingDto.scheduledTime,
        vehicleRegistration: vehicle.registration,
      },
    );

    this.logger.log(`Booking ${savedBooking.id} created for partner ${partner.companyName}`);

    return savedBooking;
  }

  async findAll(tenantId: number, filters: BookingFilterDto): Promise<BookingListResponseDto> {
    const { partnerId, vehicleId, driverId, status, startDate, endDate, page = 1, limit = 20 } = filters;

    const query = this.bookingRepository
      .createQueryBuilder('booking')
      .leftJoinAndSelect('booking.partner', 'partner')
      .leftJoinAndSelect('booking.service', 'service')
      .leftJoinAndSelect('booking.vehicle', 'vehicle')
      .leftJoinAndSelect('booking.driver', 'driver')
      .where('booking.tenant_id = :tenantId', { tenantId });

    if (partnerId) {
      query.andWhere('booking.partner_id = :partnerId', { partnerId });
    }

    if (vehicleId) {
      query.andWhere('booking.vehicle_id = :vehicleId', { vehicleId });
    }

    if (driverId) {
      query.andWhere('booking.driver_id = :driverId', { driverId });
    }

    if (status) {
      query.andWhere('booking.status = :status', { status });
    }

    if (startDate && endDate) {
      query.andWhere('booking.scheduled_date BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      });
    } else if (startDate) {
      query.andWhere('booking.scheduled_date >= :startDate', { startDate });
    } else if (endDate) {
      query.andWhere('booking.scheduled_date <= :endDate', { endDate });
    }

    query.orderBy('booking.scheduled_date', 'DESC');

    const total = await query.getCount();
    const totalPages = Math.ceil(total / limit);

    query.skip((page - 1) * limit).take(limit);

    const bookings = await query.getMany();

    const data: BookingResponseDto[] = bookings.map((booking) => this.toResponseDto(booking));

    return {
      data,
      total,
      page,
      limit,
      totalPages,
    };
  }

  async findOne(id: string, tenantId: number): Promise<Booking> {
    const booking = await this.bookingRepository.findOne({
      where: { id, tenantId },
      relations: ['partner', 'service', 'vehicle', 'driver'],
    });

    if (!booking) {
      throw new NotFoundException(`Booking with ID ${id} not found`);
    }

    return booking;
  }

  async findByPartner(partnerId: string, filters: BookingFilterDto): Promise<BookingListResponseDto> {
    const { status, startDate, endDate, page = 1, limit = 20 } = filters;

    const query = this.bookingRepository
      .createQueryBuilder('booking')
      .leftJoinAndSelect('booking.service', 'service')
      .leftJoinAndSelect('booking.vehicle', 'vehicle')
      .leftJoinAndSelect('booking.driver', 'driver')
      .leftJoin('booking.tenant', 'tenant')
      .addSelect(['tenant.id', 'tenant.name', 'tenant.email'])
      .where('booking.partner_id = :partnerId', { partnerId });

    if (status) {
      query.andWhere('booking.status = :status', { status });
    }

    if (startDate && endDate) {
      query.andWhere('booking.scheduled_date BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      });
    }

    const total = await query.getCount();
    const totalPages = Math.ceil(total / limit);

    query
      .orderBy('booking.scheduledDate', 'DESC')  // Property name (camelCase)
      .addOrderBy('booking.scheduledTime', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const bookings = await query.getMany();

    const data: BookingResponseDto[] = bookings.map((booking) => this.toResponseDto(booking));

    return {
      data,
      total,
      page,
      limit,
      totalPages,
    };
  }

  async findUpcoming(tenantId: number, days: number = 7): Promise<Booking[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const futureDate = new Date(today);
    futureDate.setDate(today.getDate() + days);

    return this.bookingRepository.find({
      where: {
        tenantId,
        scheduledDate: Between(today, futureDate),
        status: BookingStatus.CONFIRMED,
      },
      relations: ['partner', 'service', 'vehicle'],
      order: { scheduledDate: 'ASC' },
    });
  }

  async confirm(id: string, partnerId: string, userId: string): Promise<Booking> {
    const booking = await this.bookingRepository.findOne({
      where: { id, partnerId },
      relations: ['partner', 'service', 'vehicle', 'tenant'],
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    if (!booking.canBeConfirmed()) {
      throw new BadRequestException(`Booking cannot be confirmed in status: ${booking.status}`);
    }

    booking.status = BookingStatus.CONFIRMED;
    booking.confirmedAt = new Date();

    const updatedBooking = await this.bookingRepository.save(booking);

    // Log audit
    await this.auditService.create({
      userId,
      tenantId: booking.tenantId,
      action: AuditAction.UPDATE,
      entityType: 'booking',
      entityId: booking.id,
      oldValue: { status: BookingStatus.PENDING },
      newValue: { status: BookingStatus.CONFIRMED },
    });

    // Queue email notification to tenant
    await this.emailQueueService.queueBookingConfirmed(
      booking.tenant.email,
      booking.tenant.name,
      {
        bookingId: booking.id,
        partnerName: booking.partner.companyName,
        serviceName: booking.service.name,
        scheduledDate: booking.scheduledDate,
        scheduledTime: booking.scheduledTime,
      },
    );

    this.logger.log(`Booking ${id} confirmed by partner ${partnerId}`);

    return updatedBooking;
  }

  async reject(id: string, partnerId: string, reason: string, userId: string): Promise<Booking> {
    const booking = await this.bookingRepository.findOne({
      where: { id, partnerId },
      relations: ['partner', 'service', 'vehicle', 'tenant'],
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    if (!booking.canBeRejected()) {
      throw new BadRequestException(`Booking cannot be rejected in status: ${booking.status}`);
    }

    booking.status = BookingStatus.REJECTED;
    booking.rejectionReason = reason;

    const updatedBooking = await this.bookingRepository.save(booking);

    // Log audit
    await this.auditService.create({
      userId,
      tenantId: booking.tenantId,
      action: AuditAction.UPDATE,
      entityType: 'booking',
      entityId: booking.id,
      oldValue: { status: BookingStatus.PENDING },
      newValue: { status: BookingStatus.REJECTED, reason },
    });

    // Queue email notification to tenant
    await this.emailQueueService.queueBookingRejected(
      booking.tenant.email,
      booking.tenant.name,
      {
        bookingId: booking.id,
        partnerName: booking.partner.companyName,
        serviceName: booking.service.name,
        reason,
      },
    );

    this.logger.log(`Booking ${id} rejected by partner ${partnerId}`);

    return updatedBooking;
  }

  async reschedule(
    id: string,
    rescheduleDto: RescheduleBookingDto,
    tenantId: number,
    userId: string,
  ): Promise<Booking> {
    const booking = await this.findOne(id, tenantId);

    if (!booking.canBeRescheduled()) {
      throw new BadRequestException(`Booking cannot be rescheduled in status: ${booking.status}`);
    }

    // Validate new scheduled date is in the future
    const newScheduledDate = new Date(rescheduleDto.scheduledDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (newScheduledDate < today) {
      throw new BadRequestException('New scheduled date must be in the future');
    }

    const oldDate = booking.scheduledDate;
    const oldTime = booking.scheduledTime;

    booking.scheduledDate = newScheduledDate;
    booking.scheduledTime = rescheduleDto.scheduledTime;
    booking.endTime = rescheduleDto.endTime;

    const updatedBooking = await this.bookingRepository.save(booking);

    // Log audit
    await this.auditService.create({
      userId,
      tenantId,
      action: AuditAction.UPDATE,
      entityType: 'booking',
      entityId: booking.id,
      oldValue: {
        scheduledDate: oldDate,
        scheduledTime: oldTime,
      },
      newValue: {
        scheduledDate: rescheduleDto.scheduledDate,
        scheduledTime: rescheduleDto.scheduledTime,
      },
    });

    this.logger.log(`Booking ${id} rescheduled to ${rescheduleDto.scheduledDate} ${rescheduleDto.scheduledTime}`);

    return updatedBooking;
  }

  async startWork(id: string, partnerId: string, userId: string): Promise<Booking> {
    const booking = await this.bookingRepository.findOne({
      where: { id, partnerId },
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    if (!booking.canBeStarted()) {
      throw new BadRequestException(`Booking cannot be started in status: ${booking.status}`);
    }

    booking.status = BookingStatus.IN_PROGRESS;

    const updatedBooking = await this.bookingRepository.save(booking);

    // Log audit
    await this.auditService.create({
      userId,
      tenantId: booking.tenantId,
      action: AuditAction.UPDATE,
      entityType: 'booking',
      entityId: booking.id,
      oldValue: { status: BookingStatus.CONFIRMED },
      newValue: { status: BookingStatus.IN_PROGRESS },
    });

    this.logger.log(`Booking ${id} started by partner ${partnerId}`);

    return updatedBooking;
  }

  async complete(id: string, partnerId: string, partnerNotes: string, userId: string): Promise<Booking> {
    const booking = await this.bookingRepository.findOne({
      where: { id, partnerId },
      relations: ['partner', 'service', 'tenant'],
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    if (!booking.canBeCompleted()) {
      throw new BadRequestException(`Booking cannot be completed in status: ${booking.status}`);
    }

    // Calculate commission
    const commissionAmount = (booking.price * booking.partner.commissionRate) / 100;

    booking.status = BookingStatus.COMPLETED;
    booking.completedAt = new Date();
    booking.partnerNotes = partnerNotes;
    booking.commissionAmount = commissionAmount;

    const updatedBooking = await this.bookingRepository.save(booking);

    // Log audit
    await this.auditService.create({
      userId,
      tenantId: booking.tenantId,
      action: AuditAction.UPDATE,
      entityType: 'booking',
      entityId: booking.id,
      oldValue: { status: BookingStatus.IN_PROGRESS },
      newValue: {
        status: BookingStatus.COMPLETED,
        commissionAmount,
      },
    });

    // Queue email notification to tenant
    await this.emailQueueService.queueBookingCompleted(
      booking.tenant.email,
      booking.tenant.name,
      {
        bookingId: booking.id,
        partnerName: booking.partner.companyName,
        serviceName: booking.service.name,
        price: booking.price,
        notes: partnerNotes,
      },
    );

    this.logger.log(`Booking ${id} completed by partner ${partnerId}. Commission: ${commissionAmount}€`);

    // Create commission record
    try {
      await this.commissionsService.createFromBooking(updatedBooking);
      this.logger.log(`Commission created for booking ${id}`);
    } catch (error) {
      this.logger.error(`Failed to create commission for booking ${id}`, error);
      // Don't fail the booking completion if commission creation fails
      // This can be handled manually later
    }

    return updatedBooking;
  }

  async cancel(id: string, reason: string, tenantId: number, userId: string): Promise<Booking> {
    const booking = await this.findOne(id, tenantId);

    if (!booking.canBeCancelled()) {
      throw new BadRequestException(`Booking cannot be cancelled in status: ${booking.status}`);
    }

    booking.status = BookingStatus.CANCELLED;
    booking.cancellationReason = reason;

    const updatedBooking = await this.bookingRepository.save(booking);

    // Log audit
    await this.auditService.create({
      userId,
      tenantId,
      action: AuditAction.UPDATE,
      entityType: 'booking',
      entityId: booking.id,
      oldValue: { status: booking.status },
      newValue: { status: BookingStatus.CANCELLED, reason },
    });

    // Queue email notification to partner
    await this.emailQueueService.queuePartnerBookingCancelled(
      booking.partner.email,
      booking.partner.companyName,
      {
        bookingId: booking.id,
        serviceName: booking.service.name,
        reason,
      },
    );

    this.logger.log(`Booking ${id} cancelled by tenant ${tenantId}`);

    return updatedBooking;
  }

  async update(id: string, updateDto: UpdateBookingDto, tenantId: number): Promise<Booking> {
    const booking = await this.findOne(id, tenantId);

    Object.assign(booking, updateDto);

    return this.bookingRepository.save(booking);
  }

  async remove(id: string, tenantId: number): Promise<void> {
    const booking = await this.findOne(id, tenantId);
    await this.bookingRepository.softRemove(booking);
    this.logger.log(`Booking ${id} soft deleted`);
  }

  private toResponseDto(booking: Booking): BookingResponseDto {
    return {
      id: booking.id,
      partnerId: booking.partnerId,
      partnerName: booking.partner?.companyName || 'Unknown',
      tenantId: booking.tenantId,
      tenantName: booking.tenant?.name || 'Unknown',
      tenantEmail: booking.tenant?.email || null,
      vehicleId: booking.vehicleId,
      vehicleRegistration: booking.vehicle?.registration || 'Unknown',
      driverId: booking.driverId,
      driverName: booking.driver ? `${booking.driver.firstName} ${booking.driver.lastName}` : null,
      serviceId: booking.serviceId,
      serviceName: booking.service?.name || 'Unknown',
      serviceDescription: booking.service?.description || null,
      scheduledDate: booking.scheduledDate,
      scheduledTime: booking.scheduledTime,
      endTime: booking.endTime,
      status: booking.status,
      price: booking.price,
      commissionAmount: booking.commissionAmount,
      customerNotes: booking.customerNotes,
      partnerNotes: booking.partnerNotes,
      rejectionReason: booking.rejectionReason,
      cancellationReason: booking.cancellationReason,
      confirmedAt: booking.confirmedAt,
      completedAt: booking.completedAt,
      paidAt: booking.paidAt,
      createdAt: booking.createdAt,
      updatedAt: booking.updatedAt,
    };
  }
}
