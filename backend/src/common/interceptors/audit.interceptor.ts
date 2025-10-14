import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AuditService } from '../../modules/audit/audit.service';
import { AUDITABLE_KEY, AuditableOptions } from '../decorators/auditable.decorator';
import { AuditAction } from '../../entities/audit-log.entity';

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  private readonly logger = new Logger(AuditInterceptor.name);

  constructor(
    private readonly reflector: Reflector,
    private readonly auditService: AuditService,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const auditableOptions = this.reflector.get<AuditableOptions>(
      AUDITABLE_KEY,
      context.getHandler(),
    );

    if (!auditableOptions) {
      return next.handle();
    }

    const request = context.switchToHttp().getRequest();
    const { user, body, params, method, ip, headers } = request;

    if (!user) {
      return next.handle();
    }

    const tenantId = user.tenantId;
    const userId = user.id;
    const entityType = auditableOptions.entityType;

    let action: AuditAction;
    if (auditableOptions.action) {
      action = auditableOptions.action;
    } else {
      action = this.mapMethodToAction(method);
    }

    return next.handle().pipe(
      tap(async (data) => {
        try {
          const entityId = params?.id || data?.id;

          await this.auditService.create({
            tenantId,
            userId,
            action,
            entityType,
            entityId,
            oldValue: action === AuditAction.UPDATE || action === AuditAction.DELETE ? body : undefined,
            newValue: action === AuditAction.CREATE || action === AuditAction.UPDATE ? data : undefined,
            metadata: {
              ip,
              userAgent: headers['user-agent'],
              route: request.url,
              method,
            },
          });
        } catch (error) {
          this.logger.error('Failed to create audit log', error);
          // Don't fail the request if audit logging fails
        }
      }),
    );
  }

  private mapMethodToAction(method: string): AuditAction {
    switch (method.toUpperCase()) {
      case 'POST':
        return AuditAction.CREATE;
      case 'PUT':
      case 'PATCH':
        return AuditAction.UPDATE;
      case 'DELETE':
        return AuditAction.DELETE;
      default:
        return AuditAction.READ;
    }
  }
}
