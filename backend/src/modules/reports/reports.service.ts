import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as path from 'path';
import { Report, ReportStatus } from '../../entities/report.entity';
import { Vehicle } from '../../entities/vehicle.entity';
import { Driver } from '../../entities/driver.entity';
import { User, UserRole } from '../../entities/user.entity';
import { CreateReportDto } from './dto/create-report.dto';
import { UpdateReportDto } from './dto/update-report.dto';
import { ReportFilterDto } from './dto/report-filter.dto';
import { ReportResponseDto, ReportListResponseDto } from './dto/report-response.dto';
import { EmailQueueService } from '../notifications/email-queue.service';
import { AuditService } from '../audit/audit.service';
import { AuditAction } from '../../entities/audit-log.entity';

@Injectable()
export class ReportsService {
  private readonly logger = new Logger(ReportsService.name);

  constructor(
    @InjectRepository(Report)
    private reportRepository: Repository<Report>,
    @InjectRepository(Vehicle)
    private vehicleRepository: Repository<Vehicle>,
    @InjectRepository(Driver)
    private driverRepository: Repository<Driver>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private emailQueueService: EmailQueueService,
    private auditService: AuditService,
  ) {}

  async create(
    createReportDto: CreateReportDto,
    driverId: string,
    tenantId: number,
  ): Promise<Report> {
    // Validate vehicle exists and belongs to tenant
    const vehicle = await this.vehicleRepository.findOne({
      where: { id: createReportDto.vehicleId, tenantId },
    });

    if (!vehicle) {
      throw new NotFoundException('Vehicle not found or does not belong to your organization');
    }

    // Validate driver exists and belongs to tenant
    const driver = await this.driverRepository.findOne({
      where: { id: driverId, tenantId },
    });

    if (!driver) {
      throw new NotFoundException('Driver not found');
    }

    // Create report
    const report = this.reportRepository.create({
      ...createReportDto,
      driverId,
      tenantId,
      status: ReportStatus.OPEN,
    });

    const savedReport = await this.reportRepository.save(report);

    // Log audit
    await this.auditService.create({
      userId: driverId,
      tenantId,
      action: AuditAction.CREATE,
      entityType: 'report',
      entityId: savedReport.id,
      newValue: {
        type: createReportDto.type,
        description: createReportDto.description,
        vehicleId: createReportDto.vehicleId,
      },
    });

    // Send email notification to tenant admins
    await this.sendReportCreatedNotification(savedReport, driver, vehicle, tenantId);

    this.logger.log(`Report ${savedReport.id} created by driver ${driverId} for vehicle ${vehicle.registration}`);

    return savedReport;
  }

  async findAll(
    tenantId: number,
    filters: ReportFilterDto,
  ): Promise<ReportListResponseDto> {
    const { page = 1, limit = 10, type, status, vehicleId, driverId } = filters;
    const skip = (page - 1) * limit;

    const query = this.reportRepository
      .createQueryBuilder('report')
      .leftJoinAndSelect('report.vehicle', 'vehicle')
      .leftJoinAndSelect('report.driver', 'driver')
      .leftJoinAndSelect('report.acknowledgedByUser', 'acknowledgedBy')
      .leftJoinAndSelect('report.resolvedByUser', 'resolvedBy')
      .where('report.tenant_id = :tenantId', { tenantId });

    if (type) {
      query.andWhere('report.type = :type', { type });
    }

    if (status) {
      query.andWhere('report.status = :status', { status });
    }

    if (vehicleId) {
      query.andWhere('report.vehicle_id = :vehicleId', { vehicleId });
    }

    if (driverId) {
      query.andWhere('report.driver_id = :driverId', { driverId });
    }

    query
      .orderBy('report.created_at', 'DESC')
      .skip(skip)
      .take(limit);

    const [reports, total] = await query.getManyAndCount();

    const data = reports.map((report) => this.mapToResponseDto(report));

    return {
      data,
      total,
      page,
      limit,
    };
  }

  async findOne(id: string, tenantId: number): Promise<Report> {
    const report = await this.reportRepository.findOne({
      where: { id, tenantId },
      relations: ['vehicle', 'driver', 'acknowledgedByUser', 'resolvedByUser'],
    });

    if (!report) {
      throw new NotFoundException('Report not found');
    }

    return report;
  }

  async findByDriver(driverId: string, tenantId: number): Promise<Report[]> {
    return this.reportRepository.find({
      where: { driverId, tenantId },
      relations: ['vehicle', 'acknowledgedByUser', 'resolvedByUser'],
      order: { createdAt: 'DESC' },
    });
  }

  async acknowledge(id: string, userId: string, tenantId: number): Promise<Report> {
    const report = await this.findOne(id, tenantId);

    if (!report.canBeAcknowledged()) {
      throw new BadRequestException('Report cannot be acknowledged in its current status');
    }

    report.status = ReportStatus.ACKNOWLEDGED;
    report.acknowledgedAt = new Date();
    report.acknowledgedBy = userId;

    const updated = await this.reportRepository.save(report);

    // Log audit
    await this.auditService.create({
      userId,
      tenantId,
      action: AuditAction.UPDATE,
      entityType: 'report',
      entityId: id,
      newValue: {
        status: ReportStatus.ACKNOWLEDGED,
        acknowledgedAt: updated.acknowledgedAt,
      },
    });

    this.logger.log(`Report ${id} acknowledged by user ${userId}`);

    return updated;
  }

  async resolve(
    id: string,
    userId: string,
    tenantId: number,
    resolutionNotes?: string,
  ): Promise<Report> {
    const report = await this.findOne(id, tenantId);

    if (!report.canBeResolved()) {
      throw new BadRequestException('Report cannot be resolved in its current status');
    }

    report.status = ReportStatus.RESOLVED;
    report.resolvedAt = new Date();
    report.resolvedBy = userId;
    if (resolutionNotes) {
      report.resolutionNotes = resolutionNotes;
    }

    const updated = await this.reportRepository.save(report);

    // Log audit
    await this.auditService.create({
      userId,
      tenantId,
      action: AuditAction.UPDATE,
      entityType: 'report',
      entityId: id,
      newValue: {
        status: ReportStatus.RESOLVED,
        resolvedAt: updated.resolvedAt,
        resolutionNotes,
      },
    });

    this.logger.log(`Report ${id} resolved by user ${userId}`);

    return updated;
  }

  async update(
    id: string,
    updateReportDto: UpdateReportDto,
    userId: string,
    tenantId: number,
  ): Promise<Report> {
    const report = await this.findOne(id, tenantId);

    if (updateReportDto.status === ReportStatus.ACKNOWLEDGED) {
      return this.acknowledge(id, userId, tenantId);
    }

    if (updateReportDto.status === ReportStatus.RESOLVED) {
      return this.resolve(id, userId, tenantId, updateReportDto.resolutionNotes);
    }

    // Update other fields
    Object.assign(report, updateReportDto);
    const updated = await this.reportRepository.save(report);

    // Log audit
    await this.auditService.create({
      userId,
      tenantId,
      action: AuditAction.UPDATE,
      entityType: 'report',
      entityId: id,
      newValue: updateReportDto,
    });

    return updated;
  }

  async uploadPhotos(
    id: string,
    photos: string[],
    tenantId: number,
  ): Promise<Report> {
    const report = await this.findOne(id, tenantId);

    report.photos = photos;
    return this.reportRepository.save(report);
  }

  async addPhotos(
    reportId: string,
    files: Express.Multer.File[],
    driverId: string,
    tenantId: number,
  ): Promise<Report> {
    // Vérifier que le report existe et appartient au driver
    const report = await this.reportRepository.findOne({
      where: { id: reportId, driverId, tenantId },
    });

    if (!report) {
      throw new NotFoundException('Report not found or does not belong to you');
    }

    if (!files || files.length === 0) {
      throw new BadRequestException('No files provided');
    }

    // Limite de 5 photos par report
    const currentPhotos = report.photos || [];
    if (currentPhotos.length + files.length > 5) {
      throw new BadRequestException(
        `Maximum 5 photos par signalement. Actuellement: ${currentPhotos.length}`,
      );
    }

    const uploadDir = path.join(process.cwd(), 'uploads', 'reports', reportId);

    // Créer le dossier s'il n'existe pas
    const fs = require('fs').promises;
    try {
      await fs.mkdir(uploadDir, { recursive: true });
    } catch (error) {
      this.logger.error(`Failed to create upload directory: ${uploadDir}`, error);
      throw new BadRequestException('Erreur lors de la création du dossier upload');
    }

    const photoUrls: string[] = [];
    const sharp = require('sharp');

    // Traiter chaque fichier avec Sharp
    for (const file of files) {
      try {
        const filename = `${Date.now()}-${Math.random().toString(36).substring(7)}.webp`;
        const filepath = path.join(uploadDir, filename);

        // Redimensionner l'image (max 1920x1080)
        await sharp(file.buffer)
          .resize(1920, 1080, {
            fit: 'inside',
            withoutEnlargement: true,
          })
          .webp({ quality: 85 })
          .toFile(filepath);

        // URL relative pour stockage en DB
        const photoUrl = `/uploads/reports/${reportId}/${filename}`;
        photoUrls.push(photoUrl);

        this.logger.log(`Photo uploaded for report ${reportId}: ${photoUrl}`);
      } catch (error) {
        this.logger.error(`Failed to process photo for report ${reportId}`, error);
        throw new BadRequestException('Erreur lors du traitement de la photo');
      }
    }

    // Ajouter les nouvelles URLs aux photos existantes
    report.photos = [...currentPhotos, ...photoUrls];
    const updated = await this.reportRepository.save(report);

    // Log audit
    await this.auditService.create({
      userId: driverId,
      tenantId,
      action: AuditAction.UPDATE,
      entityType: 'report',
      entityId: reportId,
      newValue: {
        photosAdded: photoUrls.length,
      },
    });

    return updated;
  }

  private async sendReportCreatedNotification(
    report: Report,
    driver: Driver,
    vehicle: Vehicle,
    tenantId: number,
  ): Promise<void> {
    try {
      // Get tenant admin emails
      const admins = await this.userRepository.find({
        where: { tenantId, role: UserRole.TENANT_ADMIN, isActive: true },
      });

      const adminEmails = admins.map((admin) => admin.email);

      if (adminEmails.length === 0) {
        this.logger.warn(`No admin emails found for tenant ${tenantId}`);
        return;
      }

      // Queue emails to all tenant admins
      await this.emailQueueService.queueGenericEmail({
        to: adminEmails,
        subject: `🚨 Nouveau signalement véhicule ${vehicle.registration}`,
        template: 'report-created',
        context: {
          reportId: report.id,
          reportType: report.type,
          description: report.description,
          notes: report.notes || 'N/A',
          driverName: `${driver.firstName} ${driver.lastName}`,
          vehicleRegistration: vehicle.registration,
          vehicleBrand: vehicle.brand,
          vehicleModel: vehicle.model,
          createdAt: report.createdAt.toLocaleString('fr-FR'),
        },
        priority: 2, // High priority for critical reports
      });
    } catch (error) {
      this.logger.error('Failed to send report created notification', error);
    }
  }

  private mapToResponseDto(report: Report): ReportResponseDto {
    return {
      id: report.id,
      vehicleId: report.vehicleId,
      vehicleRegistration: report.vehicle?.registration,
      driverId: report.driverId,
      driverName: report.driver ? `${report.driver.firstName} ${report.driver.lastName}` : undefined,
      type: report.type,
      description: report.description,
      notes: report.notes,
      status: report.status,
      photos: report.photos,
      acknowledgedAt: report.acknowledgedAt,
      acknowledgedBy: report.acknowledgedBy,
      acknowledgedByName: report.acknowledgedByUser
        ? `${report.acknowledgedByUser.firstName} ${report.acknowledgedByUser.lastName}`
        : null,
      resolvedAt: report.resolvedAt,
      resolvedBy: report.resolvedBy,
      resolvedByName: report.resolvedByUser
        ? `${report.resolvedByUser.firstName} ${report.resolvedByUser.lastName}`
        : null,
      resolutionNotes: report.resolutionNotes,
      createdAt: report.createdAt,
      updatedAt: report.updatedAt,
    };
  }
}
