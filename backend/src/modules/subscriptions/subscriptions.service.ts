import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  Subscription,
  SubscriptionStatus,
} from '../../entities/subscription.entity';
import { SubscriptionPlan } from '../../entities/subscription-plan.entity';
import { Tenant } from '../../entities/tenant.entity';
import { CreatePlanDto } from './dto/create-plan.dto';
import { UpdatePlanDto } from './dto/update-plan.dto';

@Injectable()
export class SubscriptionsService {
  constructor(
    @InjectRepository(Subscription)
    private subscriptionRepo: Repository<Subscription>,
    @InjectRepository(SubscriptionPlan)
    private planRepo: Repository<SubscriptionPlan>,
    @InjectRepository(Tenant)
    private tenantRepo: Repository<Tenant>,
  ) {}

  // ========== GESTION DES PLANS ==========
  async createPlan(dto: CreatePlanDto): Promise<SubscriptionPlan> {
    const plan = this.planRepo.create(dto);
    return await this.planRepo.save(plan);
  }

  async getPlans(activeOnly = true): Promise<SubscriptionPlan[]> {
    const where = activeOnly ? { isActive: true } : {};
    return await this.planRepo.find({
      where,
      order: { price: 'ASC' },
    });
  }

  async getPlan(id: number): Promise<SubscriptionPlan> {
    const plan = await this.planRepo.findOne({ where: { id } });
    if (!plan) {
      throw new NotFoundException(`Plan #${id} non trouvé`);
    }
    return plan;
  }

  async updatePlan(id: number, dto: UpdatePlanDto): Promise<SubscriptionPlan> {
    const plan = await this.getPlan(id);
    Object.assign(plan, dto);
    return await this.planRepo.save(plan);
  }

  async deletePlan(id: number): Promise<void> {
    const plan = await this.getPlan(id);

    // Vérifier qu'aucun abonnement n'utilise ce plan
    const subscriptionsCount = await this.subscriptionRepo.count({
      where: { planId: id },
    });

    if (subscriptionsCount > 0) {
      throw new BadRequestException(
        `Impossible de supprimer ce plan : ${subscriptionsCount} abonnements l'utilisent`,
      );
    }

    await this.planRepo.delete(id);
  }

  // ========== GESTION DES ABONNEMENTS ==========
  async createSubscription(
    tenantId: number,
    planId: number,
  ): Promise<Subscription> {
    const plan = await this.getPlan(planId);
    const tenant = await this.tenantRepo.findOne({ where: { id: tenantId } });

    if (!tenant) {
      throw new NotFoundException(`Tenant #${tenantId} non trouvé`);
    }

    // Vérifier qu'il n'y a pas déjà un abonnement actif
    const existing = await this.subscriptionRepo.findOne({
      where: {
        tenantId,
        status: SubscriptionStatus.ACTIVE,
      },
    });

    if (existing) {
      throw new BadRequestException('Ce tenant a déjà un abonnement actif');
    }

    // Créer l'abonnement actif immédiatement (pas de période d'essai)
    const subscriptionData: any = {
      tenantId,
      planId,
      status: SubscriptionStatus.ACTIVE,
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      usage: {
        vehicles: 0,
        users: 0,
        drivers: 0,
      },
    };

    const subscription = this.subscriptionRepo.create(subscriptionData);
    const saved = await this.subscriptionRepo.save(subscription);
    return Array.isArray(saved) ? saved[0] : saved;
  }

  async getCurrentSubscription(tenantId: number): Promise<Subscription> {
    const subscription = await this.subscriptionRepo.findOne({
      where: {
        tenantId,
        status: SubscriptionStatus.ACTIVE,
      },
      relations: ['plan'],
    });

    if (!subscription) {
      // Chercher si en trial
      // Plus de période d'essai - chercher l'abonnement actif
      const trial = await this.subscriptionRepo.findOne({
        where: {
          tenantId,
          status: SubscriptionStatus.ACTIVE,
        },
        relations: ['plan'],
      });

      if (trial) return trial;

      // Si pas d'abonnement, créer automatiquement un Freemium
      const freemiumPlan = await this.planRepo.findOne({
        where: { name: 'Freemium', price: 0 },
      });

      if (freemiumPlan) {
        return await this.createSubscription(tenantId, freemiumPlan.id);
      }

      throw new NotFoundException('Aucun abonnement actif pour ce tenant');
    }

    return subscription;
  }

  async updateUsage(
    tenantId: number,
    resource: 'vehicles' | 'users' | 'drivers',
    delta: number,
  ): Promise<void> {
    const subscription = await this.getCurrentSubscription(tenantId);

    if (!subscription.usage) {
      subscription.usage = { vehicles: 0, users: 0, drivers: 0 };
    }

    subscription.usage[resource] = Math.max(
      0,
      (subscription.usage[resource] || 0) + delta,
    );

    await this.subscriptionRepo.save(subscription);
  }

  async checkLimit(
    tenantId: number,
    resource: 'vehicles' | 'users' | 'drivers',
  ): Promise<boolean> {
    try {
      const subscription = await this.getCurrentSubscription(tenantId);
      const plan = subscription.plan;

      const usage = subscription.usage?.[resource] || 0;
      const limitKey =
        `max${resource.charAt(0).toUpperCase() + resource.slice(1)}` as keyof SubscriptionPlan;
      const limit = plan[limitKey] as number;

      // -1 signifie illimité
      if (limit === -1) return true;

      return usage < limit;
    } catch {
      // Pas d'abonnement = limites du plan Freemium
      return false;
    }
  }

  async enforceLimit(
    tenantId: number,
    resource: 'vehicles' | 'users' | 'drivers',
  ): Promise<void> {
    const canAdd = await this.checkLimit(tenantId, resource);

    if (!canAdd) {
      const subscription = await this.getCurrentSubscription(tenantId);
      const plan = subscription.plan;
      const limitKey =
        `max${resource.charAt(0).toUpperCase() + resource.slice(1)}` as keyof SubscriptionPlan;
      const limit = plan[limitKey] as number;

      throw new ForbiddenException({
        message:
          `Limite atteinte : vous avez atteint la limite de ${limit} ${resource} pour votre plan ${plan.name}. ` +
          `Veuillez upgrader votre abonnement pour continuer.`,
        error: 'Forbidden',
        statusCode: 403,
        code: 'LIMIT_REACHED',
      });
    }
  }

  async changePlan(tenantId: number, newPlanId: number): Promise<Subscription> {
    const subscription = await this.getCurrentSubscription(tenantId);
    const newPlan = await this.getPlan(newPlanId);

    // Vérifier que le nouveau plan peut accueillir l'usage actuel
    const usage = subscription.usage;

    if (newPlan.maxVehicles !== -1 && usage.vehicles > newPlan.maxVehicles) {
      throw new BadRequestException(
        `Impossible de passer au plan ${newPlan.name} : vous avez ${usage.vehicles} véhicules mais la limite est ${newPlan.maxVehicles}`,
      );
    }

    if (newPlan.maxUsers !== -1 && usage.users > newPlan.maxUsers) {
      throw new BadRequestException(
        `Impossible de passer au plan ${newPlan.name} : vous avez ${usage.users} utilisateurs mais la limite est ${newPlan.maxUsers}`,
      );
    }

    subscription.planId = newPlanId;
    subscription.plan = newPlan;

    // Garder le statut actif (pas de période d'essai)

    return await this.subscriptionRepo.save(subscription);
  }

  async cancelSubscription(tenantId: number): Promise<Subscription> {
    const subscription = await this.getCurrentSubscription(tenantId);

    subscription.status = SubscriptionStatus.CANCELED;
    subscription.canceledAt = new Date();

    return await this.subscriptionRepo.save(subscription);
  }

  async getSubscriptionStats(tenantId: number) {
    const subscription = await this.getCurrentSubscription(tenantId);
    const plan = subscription.plan;

    return {
      plan: {
        name: plan.name,
        price: plan.price,
        features: plan.features,
        trialDays: plan.trialDays,
      },
      usage: {
        vehicles: {
          current: subscription.usage?.vehicles || 0,
          limit: plan.maxVehicles === -1 ? 'Illimité' : plan.maxVehicles,
          percentage:
            plan.maxVehicles === -1
              ? 0
              : ((subscription.usage?.vehicles || 0) / plan.maxVehicles) * 100,
        },
        users: {
          current: subscription.usage?.users || 0,
          limit: plan.maxUsers === -1 ? 'Illimité' : plan.maxUsers,
          percentage:
            plan.maxUsers === -1
              ? 0
              : ((subscription.usage?.users || 0) / plan.maxUsers) * 100,
        },
        drivers: {
          current: subscription.usage?.drivers || 0,
          limit: plan.maxDrivers === -1 ? 'Illimité' : plan.maxDrivers,
          percentage:
            plan.maxDrivers === -1
              ? 0
              : ((subscription.usage?.drivers || 0) / plan.maxDrivers) * 100,
        },
      },
      status: subscription.status,
      currentPeriodEnd: subscription.currentPeriodEnd,
    };
  }

  async getAllSubscriptions(): Promise<Subscription[]> {
    // Retourner uniquement les subscriptions actives de tenants non supprimés
    const subscriptions = await this.subscriptionRepo.find({
      relations: ['plan', 'tenant'],
      where: {
        status: SubscriptionStatus.ACTIVE,
      },
      order: { createdAt: 'DESC' },
    });

    // Filtrer pour exclure les tenants supprimés (soft deleted)
    return subscriptions.filter((sub) => sub.tenant && !sub.tenant.deletedAt);
  }
}
