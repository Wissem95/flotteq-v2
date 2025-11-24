import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { DocumentsService } from '../documents.service';
import { UserRole } from '../../entities/user.entity';

/**
 * Guard RBAC pour contrôler l'accès aux documents
 *
 * Règles:
 * - SUPER_ADMIN, SUPPORT: accès total (tous tenants)
 * - TENANT_ADMIN, MANAGER: accès total (leur tenant)
 * - DRIVER: accès limité à ses propres documents
 * - VIEWER: lecture seule, pas de DELETE
 */
@Injectable()
export class DocumentOwnershipGuard implements CanActivate {
  constructor(
    private readonly documentsService: DocumentsService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const documentId = request.params.id;
    const method = request.method;

    // Pas de documentId dans params (ex: GET /documents, POST /upload)
    if (!documentId) {
      return this.checkBasicPermissions(user, method);
    }

    // Récupérer le document
    let document;
    try {
      document = await this.documentsService.findOne(documentId, user.tenantId);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new ForbiddenException('Accès refusé au document');
    }

    // Règles par rôle
    switch (user.role) {
      case UserRole.SUPER_ADMIN:
      case UserRole.SUPPORT:
        // Accès total (cross-tenant)
        return true;

      case UserRole.TENANT_ADMIN:
      case UserRole.MANAGER:
        // Accès total à leur tenant (déjà filtré par TenantId)
        return true;

      case UserRole.DRIVER:
        return this.checkDriverAccess(user, document, method);

      case UserRole.VIEWER:
        return this.checkViewerAccess(method);

      default:
        throw new ForbiddenException('Rôle non reconnu');
    }
  }

  /**
   * Permissions de base sans documentId (GET liste, POST upload)
   */
  private checkBasicPermissions(user: any, method: string): boolean {
    console.log('DocumentOwnershipGuard - checkBasicPermissions:', {
      userId: user?.id,
      role: user?.role,
      method,
      allUserKeys: user ? Object.keys(user) : [],
    });

    if (!user) {
      throw new ForbiddenException(
        'Utilisateur non authentifié dans DocumentOwnershipGuard',
      );
    }

    // TENANT_ADMIN, MANAGER, DRIVER peuvent uploader
    // Seul VIEWER est en lecture seule
    if (user.role === UserRole.VIEWER && method !== 'GET') {
      throw new ForbiddenException('Les viewers ont un accès en lecture seule');
    }

    // Tous les autres rôles (TENANT_ADMIN, MANAGER, DRIVER, etc.) peuvent uploader
    return true;
  }

  /**
   * Règles spécifiques pour DRIVER
   * - Peut voir/télécharger ses propres uploads
   * - Ne peut pas supprimer (sauf ses propres uploads)
   */
  private checkDriverAccess(user: any, document: any, method: string): boolean {
    const isOwner = document.uploadedById === user.id;

    if (method === 'DELETE' && !isOwner) {
      throw new ForbiddenException(
        'Vous ne pouvez supprimer que vos propres documents',
      );
    }

    if (method === 'GET' && !isOwner) {
      // Driver peut voir documents liés à ses véhicules assignés
      // TODO: Vérifier si le driver est assigné au vehicle/entityId
      // Pour l'instant: accès refusé si pas owner
      throw new ForbiddenException(
        'Accès refusé: ce document ne vous appartient pas',
      );
    }

    return true;
  }

  /**
   * Règles pour VIEWER: lecture seule
   */
  private checkViewerAccess(method: string): boolean {
    if (method !== 'GET') {
      throw new ForbiddenException('Les viewers ont un accès en lecture seule');
    }
    return true;
  }
}
