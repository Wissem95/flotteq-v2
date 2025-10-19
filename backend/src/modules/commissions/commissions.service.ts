import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThanOrEqual, LessThanOrEqual, Between } from 'typeorm';
import * as ExcelJS from 'exceljs';
import { Commission, CommissionStatus } from '../../entities/commission.entity';
import { Booking } from '../../entities/booking.entity';
import { Partner } from '../../entities/partner.entity';
import { CommissionFilterDto } from './dto/commission-filter.dto';
import { CommissionResponseDto, CommissionListResponseDto, CommissionTotalDto } from './dto/commission-response.dto';
import { MarkPaidDto } from './dto/mark-paid.dto';
import { AuditService } from '../audit/audit.service';
import { AuditAction } from '../../entities/audit-log.entity';

@Injectable()
export class CommissionsService {
  private readonly logger = new Logger(CommissionsService.name);

  constructor(
    @InjectRepository(Commission)
    private commissionRepository: Repository<Commission>,
    @InjectRepository(Booking)
    private bookingRepository: Repository<Booking>,
    @InjectRepository(Partner)
    private partnerRepository: Repository<Partner>,
    private auditService: AuditService,
  ) {}

  /**
   * Create commission from completed booking
   */
  async createFromBooking(booking: Booking): Promise<Commission> {
    // Check if commission already exists for this booking
    const existingCommission = await this.commissionRepository.findOne({
      where: { bookingId: booking.id },
    });

    if (existingCommission) {
      throw new ConflictException(`Commission already exists for booking ${booking.id}`);
    }

    // Load partner to get commission rate
    const partner = await this.partnerRepository.findOne({
      where: { id: booking.partnerId },
    });

    if (!partner) {
      throw new NotFoundException('Partner not found');
    }

    // Calculate commission amount
    const amount = (Number(booking.price) * Number(partner.commissionRate)) / 100;

    // Create commission
    const commission = this.commissionRepository.create({
      partnerId: booking.partnerId,
      bookingId: booking.id,
      amount,
      status: CommissionStatus.PENDING,
    });

    const savedCommission = await this.commissionRepository.save(commission);

    this.logger.log(
      `Commission ${savedCommission.id} created for booking ${booking.id}. Amount: ${amount}€`,
    );

    return savedCommission;
  }

  /**
   * Find all commissions with filters
   */
  async findAll(
    filters: CommissionFilterDto,
    partnerId?: string,
  ): Promise<CommissionListResponseDto> {
    const { status, startDate, endDate, page = 1, limit = 20 } = filters;

    const query = this.commissionRepository
      .createQueryBuilder('commission')
      .leftJoinAndSelect('commission.partner', 'partner')
      .leftJoinAndSelect('commission.booking', 'booking')
      .leftJoinAndSelect('booking.tenant', 'tenant')       // Nécessaire pour booking.tenant.name
      .leftJoinAndSelect('booking.vehicle', 'vehicle')     // Utile pour infos véhicule
      .leftJoinAndSelect('booking.service', 'service');    // Utile pour infos service

    // Filter by partnerId (from filters or current partner)
    if (filters.partnerId) {
      query.andWhere('commission.partner_id = :partnerId', { partnerId: filters.partnerId });
    } else if (partnerId) {
      query.andWhere('commission.partner_id = :partnerId', { partnerId });
    }

    if (status) {
      query.andWhere('commission.status = :status', { status });
    }

    if (startDate && endDate) {
      query.andWhere('commission.created_at BETWEEN :startDate AND :endDate', {
        startDate: new Date(startDate),
        endDate: new Date(endDate),
      });
    } else if (startDate) {
      query.andWhere('commission.created_at >= :startDate', { startDate: new Date(startDate) });
    } else if (endDate) {
      query.andWhere('commission.created_at <= :endDate', { endDate: new Date(endDate) });
    }

    query.orderBy('commission.created_at', 'DESC');

    const total = await query.getCount();
    const totalPages = Math.ceil(total / limit);

    query.skip((page - 1) * limit).take(limit);

    const commissions = await query.getMany();

    const data: CommissionResponseDto[] = commissions.map((commission) =>
      this.toResponseDto(commission),
    );

    return {
      data,
      total,
      page,
      limit,
      totalPages,
    };
  }

  /**
   * Find one commission by ID
   */
  async findOne(id: string, partnerId?: string): Promise<Commission> {
    const query: any = { id };

    if (partnerId) {
      query.partnerId = partnerId;
    }

    const commission = await this.commissionRepository.findOne({
      where: query,
      relations: ['partner', 'booking'],
    });

    if (!commission) {
      throw new NotFoundException(`Commission with ID ${id} not found`);
    }

    return commission;
  }

  /**
   * Mark commission as paid (Admin only)
   */
  async markAsPaid(id: string, markPaidDto: MarkPaidDto, userId: string): Promise<Commission> {
    const commission = await this.findOne(id);

    if (!commission.canBePaid()) {
      throw new BadRequestException(`Commission cannot be marked as paid. Current status: ${commission.status}`);
    }

    const oldStatus = commission.status;

    commission.status = CommissionStatus.PAID;
    commission.paidAt = new Date();
    commission.paymentReference = markPaidDto.paymentReference;

    const updatedCommission = await this.commissionRepository.save(commission);

    // Log audit
    await this.auditService.create({
      userId,
      tenantId: 0, // Admin action, no specific tenant
      action: AuditAction.UPDATE,
      entityType: 'commission',
      entityId: commission.id,
      oldValue: { status: oldStatus },
      newValue: {
        status: CommissionStatus.PAID,
        paymentReference: markPaidDto.paymentReference,
        paidAt: commission.paidAt,
      },
    });

    this.logger.log(
      `Commission ${id} marked as paid. Reference: ${markPaidDto.paymentReference}`,
    );

    return updatedCommission;
  }

  /**
   * Get total commissions by partner
   */
  async getTotalByPartner(
    partnerId: string,
    startDate?: string,
    endDate?: string,
  ): Promise<CommissionTotalDto[]> {
    const query = this.commissionRepository
      .createQueryBuilder('commission')
      .select('commission.status', 'status')
      .addSelect('SUM(commission.amount)', 'totalAmount')
      .addSelect('COUNT(commission.id)', 'count')
      .where('commission.partner_id = :partnerId', { partnerId });

    if (startDate && endDate) {
      query.andWhere('commission.created_at BETWEEN :startDate AND :endDate', {
        startDate: new Date(startDate),
        endDate: new Date(endDate),
      });
    } else if (startDate) {
      query.andWhere('commission.created_at >= :startDate', { startDate: new Date(startDate) });
    } else if (endDate) {
      query.andWhere('commission.created_at <= :endDate', { endDate: new Date(endDate) });
    }

    query.groupBy('commission.status');

    const results = await query.getRawMany();

    return results.map((result) => ({
      status: result.status,
      totalAmount: parseFloat(result.totalAmount) || 0,
      count: parseInt(result.count) || 0,
    }));
  }

  /**
   * Get pending commissions (Admin only)
   */
  async getPendingCommissions(): Promise<Commission[]> {
    return this.commissionRepository.find({
      where: { status: CommissionStatus.PENDING },
      relations: ['partner', 'booking'],
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Export commissions to Excel
   */
  async exportToExcel(filters: CommissionFilterDto, partnerId?: string): Promise<Buffer> {
    // Get all commissions without pagination
    const query = this.commissionRepository
      .createQueryBuilder('commission')
      .leftJoinAndSelect('commission.partner', 'partner')
      .leftJoinAndSelect('commission.booking', 'booking')
      .leftJoinAndSelect('booking.tenant', 'tenant')       // Nécessaire pour booking.tenant.name
      .leftJoinAndSelect('booking.vehicle', 'vehicle')     // Utile pour infos véhicule
      .leftJoinAndSelect('booking.service', 'service');    // Utile pour infos service

    if (filters.partnerId) {
      query.andWhere('commission.partner_id = :partnerId', { partnerId: filters.partnerId });
    } else if (partnerId) {
      query.andWhere('commission.partner_id = :partnerId', { partnerId });
    }

    if (filters.status) {
      query.andWhere('commission.status = :status', { status: filters.status });
    }

    if (filters.startDate && filters.endDate) {
      query.andWhere('commission.created_at BETWEEN :startDate AND :endDate', {
        startDate: new Date(filters.startDate),
        endDate: new Date(filters.endDate),
      });
    } else if (filters.startDate) {
      query.andWhere('commission.created_at >= :startDate', {
        startDate: new Date(filters.startDate),
      });
    } else if (filters.endDate) {
      query.andWhere('commission.created_at <= :endDate', {
        endDate: new Date(filters.endDate),
      });
    }

    query.orderBy('commission.created_at', 'DESC');

    const commissions = await query.getMany();

    // Create Excel workbook
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Commissions');

    // Define columns
    worksheet.columns = [
      { header: 'Date', key: 'date', width: 12 },
      { header: 'Partner', key: 'partner', width: 30 },
      { header: 'Booking ID', key: 'booking', width: 38 },
      { header: 'Amount (EUR)', key: 'amount', width: 15 },
      { header: 'Status', key: 'status', width: 12 },
      { header: 'Paid At', key: 'paidAt', width: 20 },
      { header: 'Payment Reference', key: 'reference', width: 30 },
    ];

    // Style header row
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' },
    };

    // Add data rows
    commissions.forEach((commission) => {
      worksheet.addRow({
        date: commission.createdAt.toISOString().split('T')[0],
        partner: commission.partner?.companyName || 'Unknown',
        booking: commission.bookingId,
        amount: Number(commission.amount).toFixed(2),
        status: commission.status,
        paidAt: commission.paidAt ? commission.paidAt.toISOString().replace('T', ' ').substring(0, 19) : '',
        reference: commission.paymentReference || '',
      });
    });

    // Add totals row
    const totalAmount = commissions.reduce((sum, c) => sum + Number(c.amount), 0);
    worksheet.addRow({});
    const totalRow = worksheet.addRow({
      date: '',
      partner: '',
      booking: 'TOTAL',
      amount: totalAmount.toFixed(2),
      status: '',
      paidAt: '',
      reference: '',
    });
    totalRow.font = { bold: true };

    // Generate buffer
    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }

  /**
   * Convert Commission entity to response DTO
   */
  private toResponseDto(commission: Commission): CommissionResponseDto {
    return {
      id: commission.id,
      partnerId: commission.partnerId,
      partnerName: commission.partner?.companyName || 'Unknown',
      bookingId: commission.bookingId,
      bookingReference: commission.booking?.id || commission.bookingId,
      amount: Number(commission.amount),
      status: commission.status,
      paidAt: commission.paidAt,
      paymentReference: commission.paymentReference,
      createdAt: commission.createdAt,
      updatedAt: commission.updatedAt,
    };
  }
}
