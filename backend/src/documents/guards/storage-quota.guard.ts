import {
  Injectable,
  CanActivate,
  ExecutionContext,
  PayloadTooLargeException,
} from '@nestjs/common';
import { DocumentsService } from '../documents.service';
import { TenantsService } from '../../modules/tenants/tenants.service';

/**
 * Guard pour vérifier le quota de stockage avant upload
 *
 * Vérifie que l'usage actuel + taille du fichier <= quota du plan
 * Lance PayloadTooLargeException si dépassé
 */
@Injectable()
export class StorageQuotaGuard implements CanActivate {
  constructor(
    private readonly documentsService: DocumentsService,
    private readonly tenantsService: TenantsService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const file = request.file; // Multer file
    const tenantId = request.user?.tenantId;

    // Pas de fichier dans la requête, pas de vérification nécessaire
    if (!file) {
      return true;
    }

    if (!tenantId) {
      throw new PayloadTooLargeException('Tenant ID manquant');
    }

    // Calculer l'usage actuel du tenant
    const currentUsage =
      await this.documentsService.getTenantStorageUsage(tenantId);

    // Récupérer le plan du tenant
    const tenant = await this.tenantsService.findOne(tenantId);

    if (!tenant || !tenant.plan) {
      throw new PayloadTooLargeException("Plan d'abonnement introuvable");
    }

    const plan = tenant.plan;
    const quotaBytes = plan.maxStorageMb * 1024 * 1024;

    // Vérifier si l'upload dépasse le quota
    if (currentUsage + file.size > quotaBytes) {
      const usedMb = (currentUsage / 1024 / 1024).toFixed(2);
      const fileMb = (file.size / 1024 / 1024).toFixed(2);

      throw new PayloadTooLargeException(
        `Quota de stockage dépassé. Utilisé: ${usedMb}MB / ${plan.maxStorageMb}MB. Ce fichier (${fileMb}MB) dépasse la limite.`,
      );
    }

    return true;
  }
}
