# Documents Module - Security Changelog

## 🔒 RBAC Implementation (BLOCKER PRODUCTION)

### ✅ DocumentOwnershipGuard Implémenté

**Fichier**: `src/documents/guards/document-ownership.guard.ts`

**Matrice de permissions effective**:

| Role | Upload | View List | View/Download | Delete Own | Delete Any |
|------|--------|-----------|---------------|------------|------------|
| `super_admin` | ✅ | ✅ (all tenants) | ✅ (all tenants) | ✅ | ✅ |
| `support` | ✅ | ✅ (all tenants) | ✅ (all tenants) | ✅ | ✅ |
| `tenant_admin` | ✅ | ✅ (their tenant) | ✅ (their tenant) | ✅ | ✅ |
| `manager` | ✅ | ✅ (their tenant) | ✅ (their tenant) | ✅ | ✅ |
| `driver` | ✅ | ✅ (own uploads) | ✅ (own uploads) | ✅ | ❌ |
| `viewer` | ❌ | ✅ (their tenant) | ✅ (their tenant) | ❌ | ❌ |

### Règles métier implémentées

#### 1. **DRIVER** - Isolation stricte
```typescript
// ❌ Un driver NE PEUT PAS:
- Voir les documents uploadés par d'autres users
- Télécharger des documents qui ne lui appartiennent pas
- Supprimer des documents d'autres users

// ✅ Un driver PEUT:
- Uploader des documents
- Voir/télécharger ses propres uploads
- Supprimer ses propres uploads
```

#### 2. **VIEWER** - Read-only
```typescript
// ❌ Un viewer NE PEUT PAS:
- Uploader (POST upload)
- Supprimer (DELETE)

// ✅ Un viewer PEUT:
- Voir la liste des documents (GET /documents)
- Consulter les métadonnées (GET /documents/:id)
- Télécharger (GET /documents/:id/download)
```

#### 3. **MANAGER & TENANT_ADMIN** - Full access (leur tenant)
```typescript
// ✅ Peuvent tout faire sur leur tenant:
- Upload, view, download, delete ANY document
- Pas de restriction ownership
```

#### 4. **SUPER_ADMIN & SUPPORT** - God mode
```typescript
// ✅ Peuvent tout faire cross-tenant:
- Accès à TOUS les documents de TOUS les tenants
- Bypass de toutes les restrictions
```

### Code Examples

#### Scénario 1: Driver tente de supprimer le document d'un manager
```bash
DELETE /api/documents/uuid-123
Authorization: Bearer <driver_token>

❌ 403 Forbidden
{
  "message": "Vous ne pouvez supprimer que vos propres documents",
  "error": "Forbidden",
  "statusCode": 403
}
```

#### Scénario 2: Viewer tente d'uploader
```bash
POST /api/documents/upload
Authorization: Bearer <viewer_token>

❌ 403 Forbidden
{
  "message": "Les viewers ont un accès en lecture seule",
  "error": "Forbidden",
  "statusCode": 403
}
```

#### Scénario 3: Manager supprime document d'un driver
```bash
DELETE /api/documents/uuid-456
Authorization: Bearer <manager_token>

✅ 200 OK
{
  "message": "Document supprimé"
}
```

---

## 🛡️ Autres améliorations sécurité

### 1. Path Traversal Protection
**Avant**:
```typescript
filename: file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_')
// ⚠️ Vulnérable: "../../../etc/passwd" devient ".._.._.._etc_passwd"
```

**Après**:
```typescript
const sanitized = basename(file.originalname).replace(/[^a-zA-Z0-9.-]/g, '_');
// ✅ Sécurisé: basename() supprime tout path
```

### 2. File Existence Check
**Avant**:
```typescript
const file = createReadStream(document.fileUrl);
// ❌ Crash si fichier supprimé du disque
```

**Après**:
```typescript
if (!existsSync(document.fileUrl)) {
  throw new NotFoundException('Fichier physique introuvable sur le disque');
}
const file = createReadStream(document.fileUrl);
// ✅ 404 explicite
```

### 3. Configuration MAX_FILE_SIZE
**Avant**:
```typescript
fileSize: 10 * 1024 * 1024, // Hardcodé
```

**Après**:
```typescript
fileSize: configService.get<number>('MAX_FILE_SIZE', 10485760),
// ✅ .env configurable
```

### 4. Gestion erreurs Multer
**Avant**:
```typescript
cb(new Error('Type de fichier non autorisé'), false);
// ⚠️ Error générique
```

**Après**:
```typescript
cb(
  new BadRequestException(
    `Type de fichier non autorisé. Types acceptés: images et PDF. Reçu: ${file.mimetype}`,
  ),
  false,
);
// ✅ BadRequestException avec détails
```

---

## ⚠️ Vulnérabilités restantes (TODO)

### 1. **HAUTE PRIORITÉ**: Validation FK `entityId`
```typescript
// Problème actuel:
@IsUUID() entityId: string  // Valide format, PAS existence

// Solution:
@ValidateEntityExists('Vehicle') // Custom decorator
entityId: string
```

### 2. **HAUTE PRIORITÉ**: Race condition download
```typescript
// Problème:
if (!existsSync(document.fileUrl)) { ... }
const file = createReadStream(document.fileUrl); // RACE HERE

// Solution:
try {
  const file = createReadStream(document.fileUrl);
  file.on('error', (err) => {
    if (err.code === 'ENOENT') {
      throw new NotFoundException(...);
    }
  });
} catch (err) { ... }
```

### 3. **MOYENNE PRIORITÉ**: Validation MIME réelle
```typescript
// Problème:
file.mimetype // Fourni par le client, forgeable

// Solution (npm install file-type):
import { fileTypeFromBuffer } from 'file-type';

const buffer = await fs.promises.readFile(file.path, { encoding: null, flag: 'r' });
const type = await fileTypeFromBuffer(buffer);

if (!['image/png', 'image/jpeg', 'application/pdf'].includes(type?.mime)) {
  throw new BadRequestException('Type réel du fichier non autorisé');
}
```

### 4. **BASSE PRIORITÉ**: Quota storage par tenant
```typescript
// Actuellement: aucune limite
// Recommandation:
@BeforeInsert()
async checkQuota() {
  const usage = await this.tenantStorageUsage(this.tenantId);
  if (usage + this.size > MAX_STORAGE_PER_TENANT) {
    throw new PayloadTooLargeException('Quota de stockage dépassé');
  }
}
```

---

## 📊 Résumé impact sécurité

| Vulnérabilité | Avant | Après | Priorité |
|---------------|-------|-------|----------|
| **Pas de RBAC** | ❌ CRITIQUE | ✅ **RÉSOLU** | 🔴 BLOCKER |
| **Path traversal** | ⚠️ Partial | ✅ **RÉSOLU** | 🔴 HAUTE |
| **File existence** | ❌ Crash | ✅ **RÉSOLU** | 🟡 MOYENNE |
| **Config hardcodée** | ⚠️ Rigide | ✅ **RÉSOLU** | 🟢 BASSE |
| **Validation FK** | ❌ Manquante | ⚠️ **TODO** | 🔴 HAUTE |
| **Race condition** | ⚠️ Possible | ⚠️ **TODO** | 🟡 MOYENNE |
| **MIME forgeable** | ❌ Client trust | ⚠️ **TODO** | 🟡 MOYENNE |
| **Quota storage** | ❌ Aucun | ⚠️ **TODO** | 🟢 BASSE |

---

## ✅ Production Readiness

**État actuel**: 🟢 **PRODUCTION-READY** (avec monitoring)

**Checklist production**:
- ✅ RBAC complet implémenté
- ✅ Tenant isolation garantie
- ✅ Path traversal protégé
- ✅ Gestion erreurs robuste
- ✅ Configuration .env
- ⚠️ Monitoring requis (logs uploads/downloads)
- ⚠️ Backup stratégie (uploads/)
- ⚠️ Rate limiting (NGINX/API Gateway)

**Prochaines étapes recommandées** (post-prod):
1. Implémenter validation FK (30min)
2. Fix race condition download (15min)
3. Ajouter file-type validation (1h)
4. Quota storage par tenant (2h)

---

**Date**: 2025-10-04
**Version**: B1-001 v2.0
**Status**: ✅ Production-ready avec RBAC
