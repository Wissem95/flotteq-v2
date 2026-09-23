import {
  Injectable,
  ConflictException,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Partner, PartnerStatus } from '../../entities/partner.entity';
import {
  PartnerUser,
  PartnerUserRole,
} from '../../entities/partner-user.entity';
import { PartnerService } from '../../entities/partner-service.entity';
import { CreatePartnerDto } from './dto/create-partner.dto';
import { UpdatePartnerDto } from './dto/update-partner.dto';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { GetPartnersQueryDto } from './dto/get-partners-query.dto';
import { EmailQueueService } from '../notifications/email-queue.service';
import { StripeService } from '../../stripe/stripe.service';
import {
  PartnerDocument,
  PartnerDocumentType,
  PartnerDocumentVerificationStatus,
} from '../../entities/partner-document.entity';
import { basename, join, resolve } from 'path';
import { mkdir, rm, writeFile } from 'fs/promises';
import { randomUUID } from 'crypto';

@Injectable()
export class PartnersService {
  private readonly logger = new Logger(PartnersService.name);

  constructor(
    @InjectRepository(Partner)
    private partnerRepository: Repository<Partner>,
    @InjectRepository(PartnerUser)
    private partnerUserRepository: Repository<PartnerUser>,
    @InjectRepository(PartnerService)
    private partnerServiceRepository: Repository<PartnerService>,
    private emailQueueService: EmailQueueService,
    private dataSource: DataSource,
    private stripeService: StripeService,
  ) {}

  async create(
    createPartnerDto: CreatePartnerDto,
    uploadedFiles: Express.Multer.File[] = [],
    documentType?: PartnerDocumentType,
  ): Promise<Partner> {
    // Check email uniqueness BEFORE transaction
    const existingPartner = await this.partnerRepository.findOne({
      where: { email: createPartnerDto.email },
    });

    if (existingPartner) {
      throw new ConflictException('Partner with this email already exists');
    }

    const existingPartnerUser = await this.partnerUserRepository.findOne({
      where: { email: createPartnerDto.ownerEmail },
    });

    if (existingPartnerUser) {
      throw new ConflictException(
        'A partner user with this email already exists',
      );
    }

    // Check SIRET uniqueness
    const existingSiret = await this.partnerRepository.findOne({
      where: { siretNumber: createPartnerDto.siretNumber },
    });

    if (existingSiret) {
      throw new ConflictException(
        'Partner with this SIRET number already exists',
      );
    }

    // Transaction: Create Partner + PartnerUser owner
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    const createdFilePaths: string[] = [];

    try {
      // Create partner
      const partner = queryRunner.manager.create(Partner, {
        companyName: createPartnerDto.companyName,
        type: createPartnerDto.type,
        email: createPartnerDto.email,
        phone: createPartnerDto.phone,
        address: createPartnerDto.address,
        city: createPartnerDto.city,
        postalCode: createPartnerDto.postalCode,
        latitude: createPartnerDto.latitude,
        longitude: createPartnerDto.longitude,
        description: createPartnerDto.description,
        siretNumber: createPartnerDto.siretNumber,
        status: PartnerStatus.PENDING,
      });
      await queryRunner.manager.save(partner);

      // Create owner user
      const partnerUser = queryRunner.manager.create(PartnerUser, {
        partnerId: partner.id,
        email: createPartnerDto.ownerEmail,
        password: createPartnerDto.ownerPassword, // Will be hashed by entity hook
        firstName: createPartnerDto.ownerFirstName,
        lastName: createPartnerDto.ownerLastName,
        role: PartnerUserRole.OWNER,
        isActive: true,
      });
      await queryRunner.manager.save(partnerUser);

      if (uploadedFiles.length > 0 && !documentType) {
        throw new BadRequestException('Le type de justificatif est requis');
      }

      for (const file of uploadedFiles) {
        this.validatePartnerDocument(file);
        const partnerDocumentsDirectory = resolve(
          process.cwd(),
          'uploads',
          'partners',
          partner.id,
        );
        await mkdir(partnerDocumentsDirectory, {
          recursive: true,
          mode: 0o700,
        });

        const safeOriginalName = basename(file.originalname)
          .replace(/[^a-zA-Z0-9._-]/g, '_')
          .slice(-180);
        const storedName = `${randomUUID()}-${safeOriginalName || 'document'}`;
        const filePath = join(partnerDocumentsDirectory, storedName);
        createdFilePaths.push(filePath);
        await writeFile(filePath, file.buffer, { flag: 'wx', mode: 0o600 });

        const partnerDocument = queryRunner.manager.create(PartnerDocument, {
          partnerId: partner.id,
          uploadedByPartnerUserId: partnerUser.id,
          fileName: safeOriginalName || 'document',
          filePath,
          mimeType: file.mimetype,
          size: file.size,
          documentType,
          verificationStatus: PartnerDocumentVerificationStatus.PENDING,
        });
        await queryRunner.manager.save(partnerDocument);
      }

      await queryRunner.commitTransaction();

      this.logger.log(`Partner ${partner.companyName} registered successfully`);

      // Send welcome email (async)
      try {
        await this.emailQueueService.queuePartnerWelcomeEmail(
          createPartnerDto.ownerEmail,
          createPartnerDto.ownerFirstName,
          createPartnerDto.companyName,
        );
      } catch (error) {
        this.logger.warn(
          `Partner created but welcome email could not be queued: ${error instanceof Error ? error.message : 'unknown error'}`,
        );
      }

      return partner;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      await Promise.allSettled(
        createdFilePaths.map((filePath) => rm(filePath, { force: true })),
      );
      this.logger.error('Failed to create partner', error);
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  private validatePartnerDocument(file: Express.Multer.File): void {
    const allowedSignatures: Record<string, (buffer: Buffer) => boolean> = {
      'application/pdf': (buffer) =>
        buffer.subarray(0, 5).toString() === '%PDF-',
      'image/jpeg': (buffer) =>
        buffer.length >= 3 &&
        buffer[0] === 0xff &&
        buffer[1] === 0xd8 &&
        buffer[2] === 0xff,
      'image/png': (buffer) =>
        buffer.length >= 8 &&
        buffer
          .subarray(0, 8)
          .equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])),
    };

    const isAllowed =
      Buffer.isBuffer(file.buffer) &&
      file.size === file.buffer.length &&
      allowedSignatures[file.mimetype]?.(file.buffer);
    if (!isAllowed || file.size > 5 * 1024 * 1024) {
      throw new BadRequestException(
        'Le justificatif doit être un PDF, JPG ou PNG valide de 5 Mo maximum',
      );
    }
  }

  async findAll(query?: GetPartnersQueryDto): Promise<{
    data: Partner[];
    total: number;
    page: number;
    limit: number;
  }> {
    const page = query?.page || 1;
    const limit = query?.limit || 10;
    const skip = (page - 1) * limit;

    const queryBuilder = this.partnerRepository.createQueryBuilder('partner');

    // Search filter
    if (query?.search) {
      queryBuilder.where(
        '(partner.companyName ILIKE :search OR partner.email ILIKE :search)',
        { search: `%${query.search}%` },
      );
    }

    // Type filter
    if (query?.type) {
      queryBuilder.andWhere('partner.type = :type', { type: query.type });
    }

    // Status filter
    if (query?.status) {
      queryBuilder.andWhere('partner.status = :status', {
        status: query.status,
      });
    }

    // City filter
    if (query?.city) {
      queryBuilder.andWhere('partner.city ILIKE :city', {
        city: `%${query.city}%`,
      });
    }

    // Order and pagination
    queryBuilder.orderBy('partner.createdAt', 'DESC').skip(skip).take(limit);

    const [data, total] = await queryBuilder.getManyAndCount();

    return {
      data,
      total,
      page,
      limit,
    };
  }

  async findOne(id: string): Promise<Partner> {
    const partner = await this.partnerRepository.findOne({
      where: { id },
      relations: ['services'],
    });

    if (!partner) {
      throw new NotFoundException(`Partner with ID ${id} not found`);
    }

    return partner;
  }

  async update(
    id: string,
    updatePartnerDto: UpdatePartnerDto,
  ): Promise<Partner> {
    const partner = await this.findOne(id);

    Object.assign(partner, updatePartnerDto);

    return this.partnerRepository.save(partner);
  }

  async remove(id: string): Promise<void> {
    const partner = await this.findOne(id);
    await this.partnerRepository.softRemove(partner);
  }

  async approvePartner(id: string): Promise<Partner> {
    const partner = await this.findOne(id);

    if (partner.status === PartnerStatus.APPROVED) {
      throw new BadRequestException('Partner is already approved');
    }

    partner.status = PartnerStatus.APPROVED;
    await this.partnerRepository.save(partner);

    this.logger.log(`Partner ${partner.companyName} approved`);

    // Get partner owner to send email
    const ownerUser = await this.partnerUserRepository.findOne({
      where: { partnerId: id, role: PartnerUserRole.OWNER },
    });

    if (ownerUser) {
      await this.emailQueueService.queuePartnerApprovedEmail(
        ownerUser.email,
        ownerUser.firstName,
        partner.companyName,
      );
    }

    return partner;
  }

  async rejectPartner(id: string, reason?: string): Promise<Partner> {
    const partner = await this.findOne(id);

    if (partner.status === PartnerStatus.REJECTED) {
      throw new BadRequestException('Partner is already rejected');
    }

    partner.status = PartnerStatus.REJECTED;
    await this.partnerRepository.save(partner);

    this.logger.log(`Partner ${partner.companyName} rejected`);

    // Get partner owner to send email
    const ownerUser = await this.partnerUserRepository.findOne({
      where: { partnerId: id, role: PartnerUserRole.OWNER },
    });

    if (ownerUser) {
      await this.emailQueueService.queuePartnerRejectedEmail(
        ownerUser.email,
        ownerUser.firstName,
        partner.companyName,
        reason || 'Non spécifiée',
      );
    }

    return partner;
  }

  async suspendPartner(id: string): Promise<Partner> {
    const partner = await this.findOne(id);

    partner.status = PartnerStatus.SUSPENDED;
    await this.partnerRepository.save(partner);

    this.logger.log(`Partner ${partner.companyName} suspended`);

    return partner;
  }

  async updateCommissionRate(
    id: string,
    commissionRate: number,
  ): Promise<Partner> {
    if (commissionRate < 0 || commissionRate > 100) {
      throw new BadRequestException(
        'Commission rate must be between 0 and 100',
      );
    }

    const partner = await this.findOne(id);
    partner.commissionRate = commissionRate;

    return this.partnerRepository.save(partner);
  }

  // Service CRUD operations
  async addService(
    partnerId: string,
    createServiceDto: CreateServiceDto,
  ): Promise<PartnerService> {
    const partner = await this.findOne(partnerId);

    if (!partner.isApproved()) {
      throw new BadRequestException('Only approved partners can add services');
    }

    const service = this.partnerServiceRepository.create({
      partnerId,
      ...createServiceDto,
    });

    return this.partnerServiceRepository.save(service);
  }

  async updateService(
    serviceId: string,
    updateServiceDto: UpdateServiceDto,
  ): Promise<PartnerService> {
    const service = await this.partnerServiceRepository.findOne({
      where: { id: serviceId },
    });

    if (!service) {
      throw new NotFoundException(`Service with ID ${serviceId} not found`);
    }

    Object.assign(service, updateServiceDto);

    return this.partnerServiceRepository.save(service);
  }

  async removeService(serviceId: string): Promise<void> {
    const service = await this.partnerServiceRepository.findOne({
      where: { id: serviceId },
    });

    if (!service) {
      throw new NotFoundException(`Service with ID ${serviceId} not found`);
    }

    await this.partnerServiceRepository.softDelete(serviceId);
  }

  async getPartnerServices(partnerId: string): Promise<PartnerService[]> {
    return this.partnerServiceRepository.find({
      where: { partnerId, isActive: true },
      order: { name: 'ASC' },
    });
  }

  /**
   * Créer un compte Stripe Connect pour le partner
   */
  async createStripeConnectAccount(
    partnerId: string,
  ): Promise<{ url: string }> {
    const partner = await this.partnerRepository.findOne({
      where: { id: partnerId },
    });

    if (!partner) {
      throw new NotFoundException('Partner not found');
    }

    if (partner.stripeAccountId) {
      throw new BadRequestException('Stripe account already exists');
    }

    // Créer compte Stripe Connect (Express type)
    const account = await this.stripeService.stripe.accounts.create({
      type: 'express',
      country: 'FR',
      email: partner.email,
      capabilities: {
        transfers: { requested: true },
      },
      business_profile: {
        name: partner.companyName,
        support_email: partner.email,
      },
      metadata: {
        partnerId: partner.id,
        partnerType: partner.type,
      },
    });

    // Sauvegarder stripeAccountId
    partner.stripeAccountId = account.id;
    await this.partnerRepository.save(partner);

    this.logger.log(
      `Stripe Connect account created for partner ${partnerId}: ${account.id}`,
    );

    // Créer lien d'onboarding
    const frontendUrl =
      process.env.PARTNER_FRONTEND_URL || 'http://localhost:5175';

    const accountLink = await this.stripeService.stripe.accountLinks.create({
      account: account.id,
      refresh_url: `${frontendUrl}/settings?stripe=refresh`,
      return_url: `${frontendUrl}/settings?stripe=success`,
      type: 'account_onboarding',
    });

    return { url: accountLink.url };
  }

  /**
   * Vérifier le statut d'onboarding Stripe du partner
   */
  async getStripeOnboardingStatus(partnerId: string): Promise<{
    completed: boolean;
    accountId?: string;
    chargesEnabled?: boolean;
    payoutsEnabled?: boolean;
  }> {
    const partner = await this.partnerRepository.findOne({
      where: { id: partnerId },
    });

    if (!partner) {
      throw new NotFoundException('Partner not found');
    }

    if (!partner.stripeAccountId) {
      return { completed: false };
    }

    // Récupérer infos compte Stripe
    const account = await this.stripeService.stripe.accounts.retrieve(
      partner.stripeAccountId,
    );

    const completed = account.charges_enabled && account.payouts_enabled;

    // Mettre à jour statut en DB si changé
    if (completed !== partner.stripeOnboardingCompleted) {
      partner.stripeOnboardingCompleted = completed;
      await this.partnerRepository.save(partner);
    }

    return {
      completed,
      accountId: partner.stripeAccountId,
      chargesEnabled: account.charges_enabled,
      payoutsEnabled: account.payouts_enabled,
    };
  }

  /**
   * Créer un nouveau lien d'onboarding (si expiré)
   */
  async refreshStripeOnboardingLink(
    partnerId: string,
  ): Promise<{ url: string }> {
    const partner = await this.partnerRepository.findOne({
      where: { id: partnerId },
    });

    if (!partner?.stripeAccountId) {
      throw new BadRequestException('No Stripe account found');
    }

    const frontendUrl =
      process.env.PARTNER_FRONTEND_URL || 'http://localhost:5175';

    const accountLink = await this.stripeService.stripe.accountLinks.create({
      account: partner.stripeAccountId,
      refresh_url: `${frontendUrl}/settings?stripe=refresh`,
      return_url: `${frontendUrl}/settings?stripe=success`,
      type: 'account_onboarding',
    });

    return { url: accountLink.url };
  }
}
