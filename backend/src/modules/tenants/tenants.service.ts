import {
  Injectable,
  NotFoundException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tenant, TenantStatus } from '../../entities/tenant.entity';
import { Subscription, SubscriptionStatus } from '../../entities/subscription.entity';
import { Document } from '../../entities/document.entity';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { UpdateTenantDto } from './dto/update-tenant.dto';
import { UpdateStorageQuotaDto, StorageUsageResponseDto } from './dto/update-storage-quota.dto';
import { StripeService } from '../../stripe/stripe.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class TenantsService {
  private readonly logger = new Logger(TenantsService.name);

  constructor(
    @InjectRepository(Tenant)
    private tenantsRepository: Repository<Tenant>,
    @InjectRepository(Subscription)
    private subscriptionRepository: Repository<Subscription>,
    @InjectRepository(Document)
    private documentsRepository: Repository<Document>,
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

  async findAll(query?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
  }) {
    const page = query?.page || 1;
    const limit = query?.limit || 10;
    const search = query?.search || '';
    const status = query?.status;

    // Construire la requête avec QueryBuilder pour plus de flexibilité
    const queryBuilder = this.tenantsRepository
      .createQueryBuilder('tenant')
      .leftJoinAndSelect('tenant.users', 'users')
      .orderBy('tenant.createdAt', 'DESC');

    // Recherche par nom, email ou ville
    if (search && search.trim() !== '') {
      queryBuilder.where(
        '(LOWER(tenant.name) LIKE LOWER(:search) OR LOWER(tenant.email) LIKE LOWER(:search) OR LOWER(tenant.city) LIKE LOWER(:search))',
        { search: `%${search}%` },
      );
    }

    // Filtrer par status si fourni
    if (status) {
      queryBuilder.andWhere('tenant.status = :status', { status });
    }

    // Pagination
    const skip = (page - 1) * limit;
    queryBuilder.skip(skip).take(limit);

    // Exécuter la requête
    const [data, total] = await queryBuilder.getManyAndCount();

    return {
      data,
      total,
      page,
      limit,
    };
  }

  async findOne(id: number): Promise<Tenant> {
    const tenant = await this.tenantsRepository
      .createQueryBuilder('tenant')
      .leftJoinAndSelect('tenant.users', 'users')
      .leftJoinAndSelect('tenant.vehicles', 'vehicles')
      .leftJoinAndSelect('tenant.drivers', 'drivers')
      .leftJoinAndSelect('tenant.plan', 'plan')
      .where('tenant.id = :id', { id })
      .getOne();

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

  /**
   * Changer le plan d'un tenant
   * Réinitialise automatiquement le quota personnalisé pour utiliser celui du nouveau plan
   */
  async changePlan(tenantId: number, newPlanId: number): Promise<Tenant> {
    this.logger.log(`Changing plan for tenant ${tenantId} to plan ${newPlanId}`);

    // Vérifier que le tenant existe
    const tenant = await this.tenantsRepository.findOne({
      where: { id: tenantId },
      relations: ['plan'],
    });

    if (!tenant) {
      throw new NotFoundException(`Tenant #${tenantId} not found`);
    }

    // Obtenir l'ancien et le nouveau plan pour logging
    const oldPlanId = tenant.planId;
    const oldCustomQuota = tenant.customStorageQuotaMb;

    // Mettre à jour le plan ET réinitialiser le quota personnalisé
    // Le quota personnalisé est remis à NULL pour utiliser celui du nouveau plan
    await this.tenantsRepository.update(tenantId, {
      planId: newPlanId,
      customStorageQuotaMb: undefined, // Reset quota personnalisé lors du changement de plan
    });

    this.logger.log(`Updated tenant ${tenantId}: plan ${oldPlanId} → ${newPlanId}, custom quota ${oldCustomQuota} → null (will use plan quota)`);

    // Mettre à jour aussi la subscription active du tenant
    const updateResult = await this.subscriptionRepository.update(
      { tenantId, status: SubscriptionStatus.ACTIVE },
      { planId: newPlanId }
    );

    if (updateResult.affected && updateResult.affected > 0) {
      this.logger.log(`Updated ${updateResult.affected} subscription(s) with new plan ${newPlanId}`);
    }

    this.logger.log(`Successfully changed plan for tenant ${tenantId} to plan ${newPlanId}`);

    // Retourner avec les relations
    const updatedTenant = await this.tenantsRepository.findOne({
      where: { id: tenantId },
      relations: ['plan', 'users', 'vehicles', 'drivers'],
    });

    if (!updatedTenant) {
      throw new NotFoundException(`Tenant #${tenantId} not found after update`);
    }

    return updatedTenant;
  }

  /**
   * Met à jour le quota de stockage personnalisé d'un tenant
   * Réservé aux SUPER_ADMIN
   */
  async updateStorageQuota(
    tenantId: number,
    dto: UpdateStorageQuotaDto,
  ): Promise<Tenant> {
    const tenant = await this.findOne(tenantId);

    // Mettre à jour le quota personnalisé
    tenant.customStorageQuotaMb = dto.customStorageQuotaMb;
    await this.tenantsRepository.save(tenant);

    this.logger.log(
      `Quota de stockage mis à jour pour tenant #${tenantId}: ${dto.customStorageQuotaMb}MB`,
    );

    return this.findOne(tenantId);
  }

  /**
   * Récupère l'usage de stockage détaillé d'un tenant
   */
  async getStorageUsage(tenantId: number): Promise<StorageUsageResponseDto> {
    const tenant = await this.findOne(tenantId);

    if (!tenant.plan) {
      throw new NotFoundException(`Le tenant #${tenantId} n'a pas de plan associé`);
    }

    // Calculer l'usage actuel
    const usageResult = await this.documentsRepository
      .createQueryBuilder('document')
      .select('SUM(document.size)', 'totalBytes')
      .addSelect('COUNT(document.id)', 'fileCount')
      .where('document.tenantId = :tenantId', { tenantId })
      .andWhere('document.deletedAt IS NULL')
      .getRawOne();

    const usedBytes = parseInt(usageResult?.totalBytes || '0', 10);
    const usedMb = usedBytes / 1024 / 1024;
    const fileCount = parseInt(usageResult?.fileCount || '0', 10);

    // Quota effectif = custom si défini, sinon celui du plan
    const effectiveQuotaMb = tenant.customStorageQuotaMb || tenant.plan.maxStorageMb;
    const availableMb = Math.max(0, effectiveQuotaMb - usedMb);
    const usagePercent = effectiveQuotaMb > 0
      ? (usedMb / effectiveQuotaMb) * 100
      : 0;

    return {
      tenantName: tenant.name,
      planName: tenant.plan.name,
      planQuotaMb: tenant.plan.maxStorageMb,
      customQuotaMb: tenant.customStorageQuotaMb,
      effectiveQuotaMb,
      usedMb: parseFloat(usedMb.toFixed(2)),
      availableMb: parseFloat(availableMb.toFixed(2)),
      usagePercent: parseFloat(usagePercent.toFixed(2)),
      fileCount,
    };
  }
}
