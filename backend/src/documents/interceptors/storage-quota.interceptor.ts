import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  PayloadTooLargeException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { DocumentsService } from '../documents.service';
import { TenantsService } from '../../modules/tenants/tenants.service';

/**
 * Interceptor pour vérifier le quota de stockage APRÈS l'upload Multer
 *
 * Doit s'exécuter APRÈS FileInterceptor pour avoir accès à request.file
 */
@Injectable()
export class StorageQuotaInterceptor implements NestInterceptor {
  constructor(
    private readonly documentsService: DocumentsService,
    private readonly tenantsService: TenantsService,
  ) {}

  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest();
    const file = request.file; // Multer file (déjà uploadé)
    const tenantId = request.user?.tenantId;

    // Pas de fichier dans la requête, continuer
    if (!file) {
      return next.handle();
    }

    if (!tenantId) {
      throw new PayloadTooLargeException('Tenant ID manquant');
    }

    // Calculer l'usage actuel du tenant
    const currentUsage = await this.documentsService.getTenantStorageUsage(tenantId);

    // Récupérer le plan du tenant
    const tenant = await this.tenantsService.findOne(tenantId);

    if (!tenant || !tenant.plan) {
      throw new PayloadTooLargeException('Plan d\'abonnement introuvable');
    }

    const plan = tenant.plan;
    // Quota effectif = custom si défini, sinon celui du plan
    const effectiveQuotaMb = tenant.customStorageQuotaMb || plan.maxStorageMb;
    const quotaBytes = effectiveQuotaMb * 1024 * 1024;

    // Vérifier si l'upload dépasse le quota
    if (currentUsage + file.size > quotaBytes) {
      const usedMb = (currentUsage / 1024 / 1024).toFixed(2);
      const fileMb = (file.size / 1024 / 1024).toFixed(2);

      throw new PayloadTooLargeException(
        `Quota de stockage dépassé. Utilisé: ${usedMb}MB / ${effectiveQuotaMb}MB. Ce fichier (${fileMb}MB) dépasse la limite.`
      );
    }

    // Quota OK, continuer
    return next.handle();
  }
}
