import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { TenantsService } from '../modules/tenants/tenants.service';

@Injectable()
export class SubscriptionGuard implements CanActivate {
  private readonly logger = new Logger(SubscriptionGuard.name);

  constructor(private tenantsService: TenantsService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new UnauthorizedException('User not authenticated');
    }

    if (!user.tenantId) {
      throw new UnauthorizedException('Tenant not found');
    }

    const canAccess = await this.tenantsService.canAccess(user.tenantId);

    if (!canAccess) {
      this.logger.warn(`Access denied for tenant ${user.tenantId} - subscription expired or inactive`);
      throw new ForbiddenException(
        'Your subscription has expired. Please update your payment method.',
      );
    }

    return true;
  }
}
