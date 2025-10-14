import { Module, Global } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SubscriptionsService } from './subscriptions.service';
import { SubscriptionsController } from './subscriptions.controller';
import { Subscription } from '../../entities/subscription.entity';
import { SubscriptionPlan } from '../../entities/subscription-plan.entity';
import { Tenant } from '../../entities/tenant.entity';
import { SubscriptionLimitGuard } from '../../common/guards/subscription-limit.guard';
import { StripeModule } from '../../stripe/stripe.module';

@Global()
@Module({
  imports: [
    TypeOrmModule.forFeature([Subscription, SubscriptionPlan, Tenant]),
    StripeModule,
  ],
  controllers: [SubscriptionsController],
  providers: [SubscriptionsService, SubscriptionLimitGuard],
  exports: [SubscriptionsService, SubscriptionLimitGuard],
})
export class SubscriptionsModule {}
