import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Request } from 'express';

@Injectable()
export class TenantGuard implements CanActivate {
  constructor() {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();

    // Skip tenant validation for certain routes
    const skipRoutes = ['/api/auth', '/auth', '/health', '/api/docs'];
    const isSkippedRoute = skipRoutes.some(route => request.path.startsWith(route));

    if (isSkippedRoute) {
      return true;
    }

    const tenantId = request.tenantId;

    if (!tenantId) {
      throw new ForbiddenException('Tenant ID is required');
    }

    // Limite à 10 chiffres maximum (supporte jusqu'à 9,999,999,999)
    if (tenantId.length > 10) {
      throw new ForbiddenException('Invalid tenant ID format');
    }

    // Validation stricte du format
    if (!/^[1-9]\d*$/.test(tenantId)) {
      throw new ForbiddenException('Invalid tenant ID format');
    }

    // Conversion sûre en nombre
    const tenantIdNumber = parseInt(tenantId, 10);

    // Vérification supplémentaire
    if (isNaN(tenantIdNumber) || tenantIdNumber <= 0) {
      throw new ForbiddenException('Invalid tenant ID');
    }

    // TODO: Vérifier dans la DB que le tenant existe et est actif
    // const tenant = await this.prisma.tenant.findUnique({
    //   where: {
    //     id: tenantIdNumber,
    //     isActive: true
    //   }
    // });

    // if (!tenant) {
    //   throw new ForbiddenException('Tenant not found or inactive');
    // }

    // // Check tenant permissions/status
    // if (tenant.status !== 'ACTIVE') {
    //   throw new ForbiddenException('Tenant account is not active');
    // }

    // // Store full tenant object in request for later use
    // request.tenant = tenant;

    return true;
  }
}