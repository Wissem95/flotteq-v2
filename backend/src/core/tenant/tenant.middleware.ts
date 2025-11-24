import {
  Injectable,
  NestMiddleware,
  BadRequestException,
} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

declare global {
  namespace Express {
    interface Request {
      tenantId?: string;
      tenant?: any;
    }
  }
}

@Injectable()
export class TenantMiddleware implements NestMiddleware {
  constructor() {}

  // Validation stricte : ID doit être un nombre positif sans zéros en tête
  private isValidTenantId(id: string): boolean {
    // Limite à 10 chiffres maximum (supporte jusqu'à 9,999,999,999)
    if (!id || id.length === 0 || id.length > 10) {
      return false;
    }
    // Accepte uniquement : 1, 2, 123, 999, etc.
    // Rejette : 01, 001, 123abc, -1, 0, abc, vide
    return /^[1-9]\d*$/.test(id);
  }

  async use(req: Request, res: Response, next: NextFunction) {
    // Skip tenant validation for auth routes, health checks, internal admin routes, and public subscription plans
    const path = req.baseUrl + req.path; // Chemin complet incluant le préfixe global
    const skipRoutes = [
      '/auth',
      '/health',
      '/api/docs',
      '/api/tenants',
      '/api/partners',
      '/api/partners/auth',
      '/api/dashboard/internal',
      '/api/subscriptions/plans', // Public pour l'inscription
      '/api/stripe/webhook', // Webhook Stripe (validation via signature)
    ];

    // Check if this is a public GET request to availabilities endpoints
    // Match patterns: GET /api/availabilities/{uuid} or GET /api/availabilities/{uuid}/slots
    const isAvailabilitiesGetRequest =
      path.startsWith('/api/availabilities/') && req.method === 'GET';

    const isSkippedRoute =
      skipRoutes.some((route) => path.startsWith(route)) ||
      isAvailabilitiesGetRequest;

    if (isSkippedRoute) {
      return next();
    }

    // Check if request has a partner JWT token (Authorization header with type=partner)
    const authHeader = req.headers['authorization'] as string;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      try {
        // Decode JWT without verification to check the type field
        const payload = JSON.parse(
          Buffer.from(token.split('.')[1], 'base64').toString(),
        );
        if (payload.type === 'partner' && payload.partnerId) {
          // This is a partner request, skip tenantId requirement
          return next();
        }
      } catch (e) {
        // Invalid token format, continue with normal validation
      }
    }

    const tenantId = req.headers['x-tenant-id'] as string;

    if (!tenantId) {
      throw new BadRequestException('X-Tenant-ID header is required');
    }

    // Validation stricte du format
    if (!this.isValidTenantId(tenantId)) {
      throw new BadRequestException('Invalid tenant ID format');
    }

    // Store tenant information in request
    req.tenantId = tenantId;

    // Optional: Fetch full tenant object if needed
    // const tenant = await this.prisma.tenant.findUnique({
    //   where: { id: parseInt(tenantId) }
    // });

    // if (!tenant || !tenant.isActive) {
    //   throw new BadRequestException('Invalid or inactive tenant');
    // }

    // req.tenant = tenant;

    next();
  }
}
