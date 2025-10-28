import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tenant, TenantStatus } from '../../entities/tenant.entity';
import { User } from '../../entities/user.entity';
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
    @InjectRepository(User)
    private userRepository: Repository<User>,
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

    // 1. Créer le tenant en DB avec statut ACTIVE par défaut
    const tenant = this.tenantsRepository.create({
      ...createTenantDto,
      status: TenantStatus.ACTIVE,
      subscriptionStatus: 'active',
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

  /**
   * Find tenant by user ID
   * Used for GET /tenants/me endpoint
   */
  async findByUserId(userId: string): Promise<any> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user || !user.tenantId) {
      throw new NotFoundException('User not found or not associated with a tenant');
    }

    const tenant = await this.tenantsRepository.findOne({
      where: { id: user.tenantId },
    });

    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }

    // Retourner uniquement les champs nécessaires pour TenantMeResponseDto
    return {
      id: tenant.id,
      name: tenant.name,
      email: tenant.email,
      address: tenant.address,
      phone: tenant.phone,
      createdAt: tenant.createdAt,
    };
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

  async remove(id: number): Promise<{ message: string }> {
    const tenant = await this.tenantsRepository.findOne({
      where: { id },
    });

    if (!tenant) {
      throw new NotFoundException(`Tenant #${id} non trouvé`);
    }

    // Annuler la subscription active du tenant
    const activeSubscription = await this.subscriptionRepository.findOne({
      where: { tenantId: id, status: SubscriptionStatus.ACTIVE },
    });

    if (activeSubscription) {
      activeSubscription.status = SubscriptionStatus.CANCELED;
      activeSubscription.canceledAt = new Date();
      await this.subscriptionRepository.save(activeSubscription);
      this.logger.log(`Subscription du tenant #${id} annulée`);
    }

    // Soft delete du tenant (TypeORM gère automatiquement avec @DeleteDateColumn)
    await this.tenantsRepository.softRemove(tenant);

    this.logger.log(`Tenant #${id} désactivé (soft delete)`);
    return { message: `Tenant ${tenant.name} désactivé avec succès` };
  }

  async restore(id: number): Promise<Tenant> {
    const tenant = await this.tenantsRepository.findOne({
      where: { id },
      withDeleted: true, // Inclure les soft deleted
    });

    if (!tenant) {
      throw new NotFoundException(`Tenant #${id} non trouvé`);
    }

    if (!tenant.deletedAt) {
      throw new BadRequestException(`Tenant #${id} n'est pas désactivé`);
    }

    // Réactiver la subscription annulée
    const canceledSubscription = await this.subscriptionRepository.findOne({
      where: { tenantId: id, status: SubscriptionStatus.CANCELED },
      order: { canceledAt: 'DESC' }, // Prendre la plus récente
    });

    if (canceledSubscription) {
      canceledSubscription.status = SubscriptionStatus.ACTIVE;
      // Note: canceledAt garde sa valeur historique pour traçabilité
      // Prolonger la période
      const now = new Date();
      canceledSubscription.currentPeriodStart = now;
      canceledSubscription.currentPeriodEnd = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // +30 jours
      await this.subscriptionRepository.save(canceledSubscription);
      this.logger.log(`Subscription du tenant #${id} réactivée`);
    }

    await this.tenantsRepository.restore(id);
    this.logger.log(`Tenant #${id} réactivé`);

    return this.findOne(id);
  }

  async updateTenantStatus(id: number, isActive: boolean): Promise<Tenant> {
    const tenant = await this.findOne(id);

    tenant.status = isActive ? TenantStatus.ACTIVE : TenantStatus.CANCELLED;
    await this.tenantsRepository.save(tenant);

    this.logger.log(`Tenant #${id} ${isActive ? 'activé' : 'désactivé'}`);
    return tenant;
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
      createdAt: tenant.createdAt,
    };
  }

  /**
   * Vérifier si un tenant peut accéder au système
   */
  async canAccess(tenantId: number): Promise<boolean> {
    const tenant = await this.findOne(tenantId);
    return this.stripeService.isActive(tenant);
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
