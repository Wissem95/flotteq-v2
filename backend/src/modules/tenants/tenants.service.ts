import {
  Injectable,
  NotFoundException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tenant, TenantStatus } from '../../entities/tenant.entity';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { UpdateTenantDto } from './dto/update-tenant.dto';

@Injectable()
export class TenantsService {
  private readonly logger = new Logger(TenantsService.name);

  constructor(
    @InjectRepository(Tenant)
    private tenantsRepository: Repository<Tenant>,
  ) {}

  async create(createTenantDto: CreateTenantDto): Promise<Tenant> {
    this.logger.log(
      `Tentative de création d'un tenant: ${createTenantDto.name}`,
    );

    // Vérifier l'unicité de l'email et du nom
    const existing = await this.tenantsRepository.findOne({
      where: [
        { email: createTenantDto.email },
        { name: createTenantDto.name },
      ],
    });

    if (existing) {
      throw new ConflictException(
        'Un tenant avec cet email ou ce nom existe déjà',
      );
    }

    // Créer le tenant avec statut TRIAL par défaut
    const tenant = this.tenantsRepository.create({
      ...createTenantDto,
      status: TenantStatus.TRIAL,
      trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 jours
    });

    const savedTenant = await this.tenantsRepository.save(tenant);
    this.logger.log(`Tenant créé avec succès: #${savedTenant.id}`);

    return savedTenant;
  }

  async findAll(): Promise<Tenant[]> {
    return await this.tenantsRepository.find({
      relations: ['users'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: number): Promise<Tenant> {
    const tenant = await this.tenantsRepository.findOne({
      where: { id },
      relations: ['users', 'vehicles', 'drivers'],
    });

    if (!tenant) {
      throw new NotFoundException(`Tenant #${id} non trouvé`);
    }

    return tenant;
  }

  async update(id: number, updateTenantDto: UpdateTenantDto): Promise<Tenant> {
    const tenant = await this.findOne(id);

    // Vérifier l'unicité si email ou nom modifié
    if (updateTenantDto.email || updateTenantDto.name) {
      const existing = await this.tenantsRepository.findOne({
        where: [
          { email: updateTenantDto.email },
          { name: updateTenantDto.name },
        ],
      });

      if (existing && existing.id !== id) {
        throw new ConflictException(
          'Un autre tenant avec cet email ou ce nom existe déjà',
        );
      }
    }

    Object.assign(tenant, updateTenantDto);
    const updatedTenant = await this.tenantsRepository.save(tenant);

    this.logger.log(`Tenant #${id} mis à jour`);
    return updatedTenant;
  }

  async updateStatus(id: number, status: TenantStatus): Promise<Tenant> {
    const tenant = await this.findOne(id);
    tenant.status = status;

    const updatedTenant = await this.tenantsRepository.save(tenant);
    this.logger.log(`Statut du tenant #${id} changé en ${status}`);

    return updatedTenant;
  }

  async remove(id: number): Promise<void> {
    const result = await this.tenantsRepository.delete(id);

    if (result.affected === 0) {
      throw new NotFoundException(`Tenant #${id} non trouvé`);
    }

    this.logger.log(`Tenant #${id} supprimé`);
  }

  async getStats(tenantId: number) {
    const tenant = await this.tenantsRepository.findOne({
      where: { id: tenantId },
      relations: ['users', 'vehicles', 'drivers'],
    });

    if (!tenant) {
      throw new NotFoundException(`Tenant #${tenantId} non trouvé`);
    }

    return {
      usersCount: tenant.users?.length || 0,
      vehiclesCount: tenant.vehicles?.length || 0,
      driversCount: tenant.drivers?.length || 0,
      status: tenant.status,
      trialEndsAt: tenant.trialEndsAt,
      createdAt: tenant.createdAt,
    };
  }
}
