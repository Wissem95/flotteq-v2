import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { SubscriptionsService } from '../../modules/subscriptions/subscriptions.service';

export const CheckLimit = Reflector.createDecorator<string>();

@Injectable()
export class SubscriptionLimitGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private subscriptionsService: SubscriptionsService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const resource = this.reflector.get(CheckLimit, context.getHandler());
    if (!resource) return true;

    const request = context.switchToHttp().getRequest();
    const tenantId = request.tenantId || request.user?.tenantId;

    if (!tenantId) return false;

    // Vérifier et enforcer la limite
    await this.subscriptionsService.enforceLimit(+tenantId, resource as any);

    return true;
  }
}
