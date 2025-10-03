import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '../../entities/user.entity';

@Injectable()
export class TenantGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const path = request.route?.path || request.url;

    // Skip public routes (auth, health, docs)
    const publicRoutes = ['/auth', '/health', '/api/docs'];
    if (publicRoutes.some(route => path.startsWith(route))) {
      return true;
    }

    const user = request.user;

    // Si pas d'user, la route nécessite probablement JwtAuthGuard
    // On laisse passer, JwtAuthGuard bloquera si nécessaire
    if (!user) {
      return true;
    }

    if (!user.tenantId) {
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
