import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

/**
 * Decorator to extract the tenant ID from the request
 * Usage: getTenantInfo(@TenantId() tenantId: string)
 */
export const TenantId = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): string | undefined => {
    const request = ctx.switchToHttp().getRequest<Request>();
    return request.tenantId;
  },
);

/**
 * Decorator to extract the full tenant object from the request
 * Usage: getTenantInfo(@CurrentTenant() tenant: any)
 */
export const CurrentTenant = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): any => {
    const request = ctx.switchToHttp().getRequest<Request>();
    return request.tenant;
  },
);

/**
 * Decorator to extract tenant context (both ID and object)
 * Usage: getTenantInfo(@TenantContext() context: { tenantId?: string; tenant?: any })
 */
export const TenantContext = createParamDecorator(
  (
    data: unknown,
    ctx: ExecutionContext,
  ): { tenantId?: string; tenant?: any } => {
    const request = ctx.switchToHttp().getRequest<Request>();
    return {
      tenantId: request.tenantId,
      tenant: request.tenant,
    };
  },
);
