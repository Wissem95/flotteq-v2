import { SetMetadata } from '@nestjs/common';
import { AuditAction } from '../../entities/audit-log.entity';

export const AUDITABLE_KEY = 'auditable';

export interface AuditableOptions {
  entityType: string;
  action?: AuditAction;
}

/**
 * Decorator to mark endpoints for automatic audit logging
 * @param options - Entity type or detailed options
 * @example
 * @Auditable('Vehicle')
 * @Auditable({ entityType: 'Vehicle', action: AuditAction.CREATE })
 */
export const Auditable = (options: AuditableOptions | string) => {
  const opts = typeof options === 'string' ? { entityType: options } : options;
  return SetMetadata(AUDITABLE_KEY, opts);
};
