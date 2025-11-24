# 🚨 PROBLÈMES DE SÉCURITÉ CRITIQUES - FI0-004

## Date: 2025-10-02
## Contexte: Dashboard Admin FlotteQ

---

## ❌ PROBLÈME 1: Erreurs 400 Bad Request sur tous les endpoints `/dashboard/internal/*`

### Symptômes
```
GET /api/dashboard/internal/stats → 400 Bad Request
GET /api/dashboard/internal/revenue → 400 Bad Request
GET /api/dashboard/internal/subscriptions → 400 Bad Request
GET /api/dashboard/internal/activity → 400 Bad Request
GET /api/dashboard/internal/tenants/recent → 400 Bad Request
```

### Cause probable
- L'utilisateur n'est **PAS** connecté comme super_admin
- Le guard `SuperAdminGuard` bloque l'accès mais retourne 400 au lieu de 401/403
- Erreur de validation du `ParseIntPipe` sur le paramètre `limit`

### Solution requise
1. ✅ Vérifier que l'utilisateur connecté a:
   - `tenantId = 1` (FlotteQ internal)
   - `role = 'super_admin'` ou `'support'`

2. ✅ Corriger le `ParseIntPipe` sur `/tenants/recent`:
```typescript
@Get('internal/tenants/recent')
@UseGuards(JwtAuthGuard, SuperAdminGuard)
async getInternalRecentTenants(
  @Query('limit', new DefaultValuePipe(5), ParseIntPipe) limit: number,
) {
  return this.dashboardService.getRecentTenants(limit);
}
```

Le `ParseIntPipe` peut échouer si `limit` est vide ou invalide.

**FIX:**
```typescript
@Query('limit') limit?: string,  // Accepter comme string optionnel
// Puis dans la fonction:
const parsedLimit = parseInt(limit) || 5;
```

---

## 🚨 PROBLÈME 2: SÉCURITÉ CRITIQUE - `/tenants` accessible sans restrictions

### Symptômes
```
Page http://localhost:3001/tenants 
→ Affiche TOUS les tenants sans filtrage
```

### Danger
**FUITE DE DONNÉES MASSIVE:**
- N'importe quel utilisateur authentifié peut voir **TOUS** les tenants
- Violation totale de l'isolation multi-tenant
- Expose: noms, emails, statuts, plans, revenus de TOUS les clients

### Code vulnérable

`backend/src/modules/tenants/tenants.controller.ts`:
```typescript
@Controller('tenants')
@UseGuards(JwtAuthGuard)  // ❌ Pas assez !
export class TenantsController {
  @Get()
  findAll(@Query() query: QueryTenantsDto) {
    return this.tenantsService.findAll(query);  // ❌ Retourne TOUS les tenants
  }
}
```

### Solution URGENTE requise

**Option A: Réserver aux super_admins uniquement**
```typescript
@Controller('tenants')
@UseGuards(JwtAuthGuard)
export class TenantsController {
  
  @Get()
  @UseGuards(SuperAdminGuard)  // ✅ Ajouter ce guard
  findAll(@Query() query: QueryTenantsDto) {
    return this.tenantsService.findAll(query);
  }

  @Get(':id')
  @UseGuards(SuperAdminGuard)  // ✅ Ajouter aussi ici
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.tenantsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(SuperAdminGuard)  // ✅ Ajouter aussi ici
  update(@Param('id', ParseIntPipe) id: number, @Body() updateTenantDto: UpdateTenantDto) {
    return this.tenantsService.update(id, updateTenantDto);
  }

  @Delete(':id')
  @UseGuards(SuperAdminGuard)  // ✅ Ajouter aussi ici
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.tenantsService.remove(id);
  }

  @Get(':id/stats')
  @UseGuards(SuperAdminGuard)  // ✅ Ajouter aussi ici
  getStats(@Param('id', ParseIntPipe) id: number) {
    return this.tenantsService.getStats(id);
  }
}
```

**Option B: Permettre aux tenants de voir SEULEMENT leur propre info**
```typescript
@Get(':id')
async findOne(
  @Param('id', ParseIntPipe) id: number,
  @Req() req: any,
) {
  // Si super_admin → accès total
  if (req.user.tenantId === 1 && ['super_admin', 'support'].includes(req.user.role)) {
    return this.tenantsService.findOne(id);
  }
  
  // Sinon → seulement son propre tenant
  if (req.user.tenantId !== id) {
    throw new ForbiddenException('You can only access your own tenant');
  }
  
  return this.tenantsService.findOne(id);
}
```

---

## 📋 RECOMMANDATIONS SÉCURITÉ SUPPLÉMENTAIRES

### 1. Audit complet des endpoints
Vérifier **TOUS** les controllers pour s'assurer qu'ils:
- ✅ Utilisent `JwtAuthGuard`
- ✅ Filtrent par `tenantId` quand nécessaire
- ✅ N'exposent pas de données cross-tenant

### 2. Endpoints à vérifier en priorité
```bash
- /api/users → Filtre-t-il par tenantId ?
- /api/vehicles → Filtre-t-il par tenantId ?
- /api/drivers → Filtre-t-il par tenantId ?
- /api/maintenance → Filtre-t-il par tenantId ?
- /api/subscriptions → Filtre-t-il par tenantId ?
```

### 3. Créer un TenantScopeGuard réutilisable
```typescript
// backend/src/common/guards/tenant-scope.guard.ts
@Injectable()
export class TenantScopeGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const requestedTenantId = parseInt(request.params.id || request.query.tenantId);

    // Super admins → accès total
    if (user.tenantId === 1 && ['super_admin', 'support'].includes(user.role)) {
      return true;
    }

    // Autres → seulement leur tenant
    if (user.tenantId !== requestedTenantId) {
      throw new ForbiddenException('Access denied to this tenant');
    }

    return true;
  }
}
```

### 4. Tests de sécurité à ajouter
```typescript
describe('Tenant isolation', () => {
  it('should NOT allow tenant A to see tenant B data', async () => {
    const userA = { tenantId: 2, role: 'admin' };
    const response = await request(app)
      .get('/api/tenants/3')
      .set('Authorization', `Bearer ${tokenA}`)
      .expect(403);
  });

  it('should allow super_admin to see all tenants', async () => {
    const superAdmin = { tenantId: 1, role: 'super_admin' };
    const response = await request(app)
      .get('/api/tenants/3')
      .set('Authorization', `Bearer ${superAdminToken}`)
      .expect(200);
  });
});
```

---

## ⚠️ ACTIONS IMMÉDIATES REQUISES

1. **URGENT:** Ajouter `SuperAdminGuard` à **TOUS** les endpoints `/tenants`
2. **URGENT:** Vérifier l'isolation tenant sur tous les autres controllers
3. **CRITIQUE:** Tester l'accès cross-tenant sur tous les endpoints
4. **IMPORTANT:** Corriger le problème 400 du dashboard
5. **RECOMMANDÉ:** Créer des tests de sécurité automatisés

---

## 📝 CHECKLIST SÉCURITÉ

- [ ] Fix: Ajouter SuperAdminGuard sur TenantsController
- [ ] Fix: Corriger ParseIntPipe sur /tenants/recent
- [ ] Test: Vérifier que dashboard/internal/* retourne 403 pour non-admin
- [ ] Test: Vérifier que /tenants retourne 403 pour non-admin
- [ ] Audit: Vérifier isolation tenant sur VehiclesController
- [ ] Audit: Vérifier isolation tenant sur DriversController
- [ ] Audit: Vérifier isolation tenant sur UsersController
- [ ] Audit: Vérifier isolation tenant sur MaintenanceController
- [ ] Créer: TenantScopeGuard réutilisable
- [ ] Créer: Tests de sécurité automatisés

---

## 🔐 CONCLUSION

**RISQUE ACTUEL: CRITIQUE**

Le système expose actuellement des données cross-tenant, ce qui est une **violation majeure de sécurité** dans une architecture multi-tenant.

**PRIORITÉ 1:** Sécuriser `/tenants` endpoint
**PRIORITÉ 2:** Audit complet de tous les controllers
**PRIORITÉ 3:** Tests de sécurité automatisés

---

**Auteur:** Claude Code Security Audit
**Date:** 2025-10-02
**Ticket:** FI0-004 Security Review
