# Documents Module - Permissions et Sécurité

## 🔒 Modèle de permissions actuel

### Niveau d'isolation: **TENANT**

Tous les endpoints utilisent `@TenantId()` pour garantir que:
- Un utilisateur ne peut accéder qu'aux documents de son tenant
- Impossible d'accéder aux documents d'autres tenants même avec un UUID valide

### Permissions par endpoint

| Endpoint | Qui peut accéder | Restrictions |
|----------|------------------|--------------|
| `POST /upload` | ✅ Tous les users authentifiés du tenant | Aucune - tout user peut uploader |
| `GET /documents` | ✅ Tous les users authentifiés du tenant | Voit TOUS les documents du tenant |
| `GET /:id` | ✅ Tous les users authentifiés du tenant | Peut voir n'importe quel document du tenant |
| `GET /:id/download` | ✅ Tous les users authentifiés du tenant | Peut télécharger n'importe quel document du tenant |
| `DELETE /:id` | ✅ Tous les users authentifiés du tenant | Peut supprimer n'importe quel document du tenant |

## ⚠️ Limitations actuelles

### 1. Pas de contrôle propriétaire
**Problème**: Un user peut supprimer un document uploadé par un autre user du même tenant.

**Solution recommandée**:
```typescript
// Dans documents.service.ts
async remove(id: string, tenantId: number, userId: string): Promise<void> {
  const document = await this.findOne(id, tenantId);

  // Option 1: Seul l'uploader peut supprimer
  if (document.uploadedById !== userId) {
    throw new ForbiddenException('Seul l\'uploader peut supprimer ce document');
  }

  await this.documentsRepository.softDelete(id);
}
```

### 2. Pas de contrôle par rôle
**Problème**: Un `driver` peut voir/supprimer des documents de `maintenance` ou `vehicle`.

**Solution recommandée**:
```typescript
// Créer un guard Documents
@Injectable()
export class DocumentOwnershipGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const documentId = request.params.id;

    const document = await this.documentsService.findOne(documentId, user.tenantId);

    // Règle métier: drivers ne peuvent accéder qu'aux docs de type DRIVER
    if (user.role === 'driver' && document.entityType !== 'driver') {
      throw new ForbiddenException();
    }

    return true;
  }
}
```

## 🎯 Recommandations production

### Priorité HAUTE
1. **Implémenter contrôle propriétaire pour DELETE**
   - Seul l'uploader ou un admin peut supprimer
   - Role `tenant_admin` bypass toutes restrictions

2. **Ajouter ownership check pour download de documents sensibles**
   - Documents de type `driver` : seul le driver concerné + admins
   - Documents de type `vehicle` : driver assigné + admins
   - Documents de type `maintenance` : tous (logs publics du tenant)

### Priorité MOYENNE
3. **Audit trail**
   - Logger qui télécharge quoi (`DocumentAccessLog` entity)
   - Utile pour compliance RGPD

4. **Rate limiting spécifique**
   - Max 100 uploads/jour par user
   - Max 1000 downloads/jour par user

### Priorité BASSE
5. **Partage inter-tenants**
   - Actuellement impossible
   - Si besoin futur: table `document_shares` avec expiration

## 🔐 Modèle de sécurité recommandé

```typescript
// documents.controller.ts
@Delete(':id')
@UseGuards(JwtAuthGuard, DocumentOwnershipGuard)
async remove(
  @Param('id', ParseUUIDPipe) id: string,
  @CurrentUser('id') userId: string,
  @CurrentUser('role') role: string,
  @TenantId() tenantId: number,
) {
  // Service vérifie ownership OU admin role
  await this.documentsService.remove(id, tenantId, userId, role);
  return { message: 'Document supprimé' };
}
```

## 📊 Matrice de permissions recommandée

| Role | Upload | View All | Download Own | Download All | Delete Own | Delete All |
|------|--------|----------|--------------|--------------|------------|------------|
| `driver` | ✅ | ❌ (only driver docs) | ✅ | ❌ | ✅ | ❌ |
| `manager` | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| `tenant_admin` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |

## 🚨 Vulnérabilités connues (à corriger avant prod)

1. ❌ **Aucun contrôle RBAC** → Tout user peut tout faire
2. ❌ **Pas de vérification entityId existence** → On peut uploader pour un vehicleId inexistant
3. ❌ **Pas de quota storage par tenant** → Risk d'abus
4. ✅ **Path traversal protégé** → `basename()` utilisé
5. ✅ **Tenant isolation OK** → `@TenantId()` en place
6. ✅ **File existence check** → `existsSync()` avant download

---

**Statut actuel**: ⚠️ Dev-ready, **PAS production-ready sans RBAC**
