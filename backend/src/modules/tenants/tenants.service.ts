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
import { StripeService } from '../../stripe/stripe.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class TenantsService {
  private readonly logger = new Logger(TenantsService.name);

  constructor(
    @InjectRepository(Tenant)
    private tenantsRepository: Repository<Tenant>,
    private stripeService: StripeService,
    private configService: ConfigService,
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

    const trialDays = this.configService.get<number>('stripe.trialDays', 14);

    // 1. Créer le tenant en DB avec statut TRIAL par défaut
    const tenant = this.tenantsRepository.create({
      ...createTenantDto,
      status: TenantStatus.TRIAL,
      subscriptionStatus: 'trial',
      trialEndsAt: new Date(Date.now() + trialDays * 24 * 60 * 60 * 1000),
    });

    const savedTenant = await this.tenantsRepository.save(tenant);
    this.logger.log(`Tenant créé avec succès: #${savedTenant.id}`);

    // 2. Créer le customer Stripe
    try {
      const stripeCustomerId = await this.stripeService.createCustomer(
        savedTenant,
        createTenantDto.email,
      );

      // 3. Mettre à jour le tenant avec le stripeCustomerId
      savedTenant.stripeCustomerId = stripeCustomerId;
      await this.tenantsRepository.save(savedTenant);

      // 4. Créer la subscription avec trial
      const priceId = this.configService.get<string>('stripe.priceId');
      if (priceId) {
        const subscription = await this.stripeService.createSubscription(
          stripeCustomerId,
          priceId,
        );

        savedTenant.stripeSubscriptionId = subscription.id;
        await this.tenantsRepository.save(savedTenant);
        this.logger.log(`Stripe subscription created for tenant #${savedTenant.id}`);
      } else {
        this.logger.warn('STRIPE_PRICE_ID not configured, skipping subscription creation');
      }
    } catch (error) {
      this.logger.error(`Failed to create Stripe resources for tenant #${savedTenant.id}`, error);
      // Don't fail tenant creation if Stripe fails, but log the error
    }

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

  /**
   * Vérifier si un tenant peut accéder au système
   */
  async canAccess(tenantId: number): Promise<boolean> {
    const tenant = await this.findOne(tenantId);
    return this.stripeService.isActive(tenant) || this.stripeService.isTrial(tenant);
  }
}
