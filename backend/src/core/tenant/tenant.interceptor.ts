import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { Request } from 'express';

/**
 * Global interceptor that ensures tenant context is available for all requests
 * This interceptor can be used to modify responses or add additional tenant-specific logic
 */
@Injectable()
export class TenantInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<Request>();

    // You can add tenant-specific logging here
    if (request.tenantId) {
      console.log(`Request for tenant: ${request.tenantId}`);
    }

    // Pass through to the next handler
    return next.handle();
  }
}
