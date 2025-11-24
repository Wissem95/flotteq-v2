# 🔍 AUDIT - Erreur 500 API Commissions

## 📊 Symptômes

**Erreurs frontend** :
```
GET http://localhost:3000/api/commissions?status=paid → 500
GET http://localhost:3000/api/commissions?startDate=2025-10-01&endDate=2025-10-31 → 500
```

**Source** : `useCommissions.ts:26` et `useCommissions.ts:171`

---

## 🔬 Diagnostic

### 1️⃣ Test direct de l'API

```bash
curl 'http://localhost:3000/api/commissions?status=paid'
```

**Résultat** :
```json
{
  "message": "X-Tenant-ID header is required",
  "error": "Bad Request",
  "statusCode": 400
}
```

➡️ **Erreur réelle** : `400 Bad Request`, PAS `500 Internal Server Error`
➡️ **Cause** : Header `X-Tenant-ID` manquant

---

## 🎯 Analyse racine

### Controller Configuration

**Fichier** : `backend/src/modules/commissions/commissions.controller.ts`

```ts
@Controller('commissions')
@UseGuards(HybridAuthGuard)  // ✅ Accepte JWT tenant ET partner
@ApiBearerAuth()
export class CommissionsController {
  @Get()
  async findAll(
    @Query() filters: CommissionFilterDto,
    @Request() req: RequestWithUser,
  ): Promise<CommissionListResponseDto> {
    // Extrait partnerId du JWT si type='partner'
    const partnerId = req.user.type === 'partner' ? req.user.partnerId : undefined;
    return this.commissionsService.findAll(filters, partnerId);
  }
}
```

### Problème identifié

Le controller utilise **HybridAuthGuard** (qui accepte les partners), MAIS :

1. **TenantMiddleware** ou **TenantGuard** est probablement appliqué GLOBALEMENT
2. Ce middleware/guard EXIGE le header `X-Tenant-ID`
3. Les partners n'ont PAS de `tenantId`, donc pas de header `X-Tenant-ID`
4. Résultat : 400 Bad Request

---

## ✅ Solutions possibles

### Option 1 : Exclure CommissionsController du TenantMiddleware

**Fichier** : `app.module.ts`

```ts
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(TenantMiddleware)
      .exclude(
        { path: 'auth/(.*)', method: RequestMethod.ALL },
        { path: 'partner-auth/(.*)', method: RequestMethod.ALL },
        { path: 'commissions(.*)', method: RequestMethod.ALL },  // ✅ AJOUTER
      )
      .forRoutes('*');
  }
}
```

### Option 2 : Modifier TenantMiddleware pour accepter les partners

**Fichier** : `tenant.middleware.ts`

```ts
async use(req: Request, res: Response, next: NextFunction) {
  // Si JWT partner, skip tenant validation
  if (req.user?.type === 'partner') {
    return next();
  }

  // Sinon, exiger X-Tenant-ID
  const tenantId = req.headers['x-tenant-id'];
  if (!tenantId) {
    throw new BadRequestException('X-Tenant-ID header is required');
  }
  // ...
}
```

### Option 3 : Retirer TenantGuard du CommissionsController

Si TenantGuard est appliqué via decorator :

```ts
@Controller('commissions')
@UseGuards(HybridAuthGuard)  // ✅ Garder
// ❌ RETIRER @UseGuards(TenantGuard) si présent
```

---

## 🎯 Recommandation

**Option 1** est la plus simple et la plus propre :
- Exclure explicitement `/commissions` du TenantMiddleware
- Le controller gère déjà la logique partner vs admin via `HybridAuthGuard`

---

## ⚡ Action immédiate

1. Vérifier `app.module.ts` pour voir comment TenantMiddleware est configuré
2. Ajouter `commissions` à la liste d'exclusion
3. Redémarrer backend
4. Tester l'API
