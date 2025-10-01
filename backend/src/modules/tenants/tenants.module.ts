import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TenantsService } from './tenants.service';
import { TenantsController } from './tenants.controller';
import { Tenant } from '../../entities/tenant.entity';
import { StripeModule } from '../../stripe/stripe.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Tenant]),
    StripeModule,
  ],
  providers: [TenantsService],
  controllers: [TenantsController],
  exports: [TenantsService],
})
export class TenantsModule {}
