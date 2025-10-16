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
import { PartnerUser, PartnerUserRole } from '../../entities/partner-user.entity';
import { PartnerService } from '../../entities/partner-service.entity';
import { CreatePartnerDto } from './dto/create-partner.dto';
import { UpdatePartnerDto } from './dto/update-partner.dto';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { EmailQueueService } from '../notifications/email-queue.service';

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
  ) {}

  async create(createPartnerDto: CreatePartnerDto): Promise<Partner> {
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
      throw new ConflictException('A partner user with this email already exists');
    }

    // Check SIRET uniqueness
    const existingSiret = await this.partnerRepository.findOne({
      where: { siretNumber: createPartnerDto.siretNumber },
    });

    if (existingSiret) {
      throw new ConflictException('Partner with this SIRET number already exists');
    }

    // Transaction: Create Partner + PartnerUser owner
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

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

      await queryRunner.commitTransaction();

      this.logger.log(`Partner ${partner.companyName} registered successfully`);

      // Send welcome email (async)
      await this.emailQueueService.queuePartnerWelcomeEmail(
        createPartnerDto.ownerEmail,
        createPartnerDto.ownerFirstName,
        createPartnerDto.companyName,
      );

      return partner;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error('Failed to create partner', error);
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async findAll(): Promise<Partner[]> {
    return this.partnerRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Partner> {
    const partner = await this.partnerRepository.findOne({
      where: { id },
    });

    if (!partner) {
      throw new NotFoundException(`Partner with ID ${id} not found`);
    }

    return partner;
  }

  async update(id: string, updatePartnerDto: UpdatePartnerDto): Promise<Partner> {
    const partner = await this.findOne(id);

    Object.assign(partner, updatePartnerDto);

    return this.partnerRepository.save(partner);
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

  async updateCommissionRate(id: string, commissionRate: number): Promise<Partner> {
    if (commissionRate < 0 || commissionRate > 100) {
      throw new BadRequestException('Commission rate must be between 0 and 100');
    }

    const partner = await this.findOne(id);
    partner.commissionRate = commissionRate;

    return this.partnerRepository.save(partner);
  }

  // Service CRUD operations
  async addService(partnerId: string, createServiceDto: CreateServiceDto): Promise<PartnerService> {
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

  async updateService(serviceId: string, updateServiceDto: UpdateServiceDto): Promise<PartnerService> {
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
}
