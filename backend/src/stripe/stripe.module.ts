import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { StripeService } from './stripe.service';
import { StripeController } from './stripe.controller';
import { Tenant } from '../entities/tenant.entity';
import { SubscriptionPlan } from '../entities/subscription-plan.entity';
import { Subscription } from '../entities/subscription.entity';
import stripeConfig from '../config/stripe.config';

@Module({
  imports: [
    TypeOrmModule.forFeature([Tenant, SubscriptionPlan, Subscription]),
    ConfigModule.forFeature(stripeConfig),
  ],
  controllers: [StripeController],
  providers: [StripeService],
  exports: [StripeService],
})
export class StripeModule {}
