import { Module, Global } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User } from '../../entities/user.entity';
import { SubscriptionsModule } from '../subscriptions/subscriptions.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { RolesGuard } from '../../common/guards/roles.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';

@Global()
@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    SubscriptionsModule,
    NotificationsModule,
  ],
  controllers: [UsersController],
  providers: [UsersService, RolesGuard, TenantGuard],
  exports: [UsersService, RolesGuard, TenantGuard],
})
export class UsersModule {}
