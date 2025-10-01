import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { UserRole } from '../../entities/user.entity';

@Injectable()
export class TenantGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || !user.tenantId) {
      throw new ForbiddenException('Tenant ID manquant');
    }

    // Les super admins et support peuvent tout voir
    if ([UserRole.SUPER_ADMIN, UserRole.SUPPORT].includes(user.role)) {
      return true;
    }

    // Pour les routes avec un paramètre tenantId
    const paramTenantId = request.params.tenantId;
    if (paramTenantId && parseInt(paramTenantId) !== user.tenantId) {
      throw new ForbiddenException('Accès non autorisé à ce tenant');
    }

    // Pour les routes avec un body contenant tenantId
    const bodyTenantId = request.body?.tenantId;
    if (bodyTenantId && bodyTenantId !== user.tenantId) {
      throw new ForbiddenException('Vous ne pouvez créer que pour votre tenant');
    }

    // Injecter le tenantId dans la request pour faciliter l'accès
    request.tenantId = user.tenantId;

    return true;
  }
}
