import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { IS_PUBLIC_KEY } from '../../common/decorators/public.decorator';

@Injectable()
export class TenantGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Check if route is marked as public
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request>();
    const path = request.url;
    const user = (request as any).user; // Maintenant disponible grâce à JwtAuthGuard

    // Routes publiques (pas d'auth requise)
    const publicRoutes = ['/health', '/api/docs'];
    if (publicRoutes.some((r) => path.startsWith(r))) {
      return true;
    }

    // Super admins → skip tenant restrictions (accès global à tous les tenants)
    console.log('🔍 TenantGuard - User:', {
      email: user?.email,
      tenantId: user?.tenantId,
      role: user?.role,
      check: user?.tenantId === 1 && ['super_admin', 'support'].includes(user?.role)
    });

    if (
      user &&
      user.tenantId === 1 &&
      ['super_admin', 'support'].includes(user.role)
    ) {
      // Supprimer tenantId complètement pour accès global
      delete (request as any).tenantId;
      (request as any).isSuperAdmin = true;
      console.log('✅ Super admin détecté - isSuperAdmin = true');
      return true;
    }

    // Partners → skip tenant restrictions (ils ont partnerId au lieu de tenantId)
    if (user && user.type === 'partner' && user.partnerId) {
      (request as any).isPartner = true;
      (request as any).partnerId = user.partnerId;
      return true;
    }

    // Vérifier tenantId pour les autres (tenants normaux)
    if (!user || !user.tenantId) {
      throw new ForbiddenException('Tenant ID is required');
    }

    // Store tenantId in request for use by other components (convertir en number)
    (request as any).tenantId =
      parseInt((request as any).tenantId) || user.tenantId;

    return true;
  }
}
