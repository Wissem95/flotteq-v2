import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Logger,
} from '@nestjs/common';

@Injectable()
export class SuperAdminGuard implements CanActivate {
  private readonly logger = new Logger(SuperAdminGuard.name);

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    // Vérifier que l'user est SUPER_ADMIN ou SUPPORT de FlotteQ (tenantId = 1)
    const isFlotteQAdmin =
      user.tenantId === 1 &&
      ['super_admin', 'support'].includes(user.role);

    if (!isFlotteQAdmin) {
      this.logger.warn(
        `Access denied to internal endpoint for user ${user.id} (tenant ${user.tenantId}, role ${user.role})`,
      );
      throw new ForbiddenException(
        'This endpoint is restricted to FlotteQ administrators',
      );
    }

    return true;
  }
}
