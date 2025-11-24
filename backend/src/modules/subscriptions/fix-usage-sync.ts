import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Subscription } from '../../entities/subscription.entity';
import { Vehicle } from '../../entities/vehicle.entity';
import { User } from '../../entities/user.entity';
import { Driver } from '../../entities/driver.entity';

/**
 * Script pour synchroniser les usages réels avec les subscriptions
 * À exécuter manuellement ou via cron
 */
@Injectable()
export class FixUsageSync {
  constructor(
    @InjectRepository(Subscription)
    private subscriptionRepo: Repository<Subscription>,
    @InjectRepository(Vehicle)
    private vehicleRepo: Repository<Vehicle>,
    @InjectRepository(User)
    private userRepo: Repository<User>,
    @InjectRepository(Driver)
    private driverRepo: Repository<Driver>,
  ) {}

  async syncAllSubscriptions() {
    const subscriptions = await this.subscriptionRepo.find({
      where: { status: 'active' as any },
    });

    for (const subscription of subscriptions) {
      await this.syncSubscription(subscription.tenantId);
    }
  }

  async syncSubscription(tenantId: number) {
    const subscription = await this.subscriptionRepo.findOne({
      where: { tenantId, status: 'active' as any },
    });

    if (!subscription) {
      console.log(`No active subscription for tenant ${tenantId}`);
      return;
    }

    // Compter les ressources réelles
    const vehicleCount = await this.vehicleRepo.count({
      where: { tenantId },
    });

    const userCount = await this.userRepo.count({
      where: { tenantId },
    });

    const driverCount = await this.driverRepo.count({
      where: { tenantId },
    });

    // Mettre à jour l'usage
    subscription.usage = {
      vehicles: vehicleCount,
      users: userCount,
      drivers: driverCount,
    };

    await this.subscriptionRepo.save(subscription);

    console.log(
      `Synced subscription for tenant ${tenantId}:`,
      subscription.usage,
    );
  }
}
