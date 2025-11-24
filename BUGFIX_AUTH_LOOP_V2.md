# 🐛 BUGFIX V2 : Boucle de redirection auth (session de debug)

**Date**: 19 octobre 2025
**Statut**: 🔄 EN COURS - En attente de logs utilisateur

---

## 📋 Historique des corrections

### ✅ Correction #1 - Type PartnerUser
**Fichier**: `frontend-partner/src/types/partner.ts`
**Problème**: Le type ne correspondait pas aux données sauvegardées dans localStorage
**Solution**: Ajout des champs `role?` et `partner?`

```typescript
export interface PartnerUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  partnerId: string;
  role?: string;  // ← AJOUTÉ
  partner?: {     // ← AJOUTÉ
    id: string;
    companyName: string;
    type: string;
    status: 'pending' | 'approved' | 'rejected' | 'suspended';
  };
}
```

### ✅ Correction #2 - Layout companyName
**Fichier**: `frontend-partner/src/layouts/PartnerLayout.tsx:55-57`
**Problème**: Accédait à `user?.companyName` qui n'existe plus
**Solution**: Utilise `user?.partner?.companyName` avec fallback

```typescript
<p className="text-sm font-medium text-gray-700">
  {user?.partner?.companyName || `${user?.firstName} ${user?.lastName}`}
</p>
```

### ✅ Correction #3 - Axios interceptor logs
**Fichier**: `frontend-partner/src/lib/axios.ts:29-35`
**Problème**: Redirection silencieuse sur 401, impossible de debugger
**Solution**: Ajout de logs détaillés avant redirection

```typescript
if (error.response?.status === 401) {
  console.error('🚫 401 Unauthorized:', {
    url: error.config?.url,
    method: error.config?.method,
    headers: error.config?.headers,
    response: error.response?.data
  });
  // ... redirect
}
```

---

## 🔍 Analyse du problème

### Symptômes
1. Utilisateur se connecte avec succès
2. Arrive sur `/dashboard` ✅
3. Clique sur "Planning"
4. Redirigé immédiatement vers `/login` ❌
5. Boucle infinie

### Flux d'erreur suspecté

```
User clicks "Planning"
  ↓
React Router: Navigate to /planning
  ↓
PlanningPage component mounts
  ↓
3 composants font des queries React Query:
  - AvailabilityEditor → GET /availabilities/me
  - UnavailabilityManager → GET /unavailabilities/list
  - ServiceSettings → GET /partners/me/services
  ↓
L'UN de ces appels retourne 401
  ↓
Axios interceptor détecte 401
  ↓
Clear localStorage + window.location.href = '/login'
  ↓
User est déconnecté et redirigé
```

### Hypothèses

#### Hypothèse A: Token invalide
- Le token n'est pas sauvegardé correctement dans localStorage
- Le token est corrompu lors de la sérialisation
- **Test**: Vérifier localStorage après login

#### Hypothèse B: Backend rejette le token
- Le JWT ne contient pas les bonnes claims
- Le partner n'est pas "approved"
- Le guard backend vérifie des permissions spécifiques
- **Test**: Décoder le JWT et vérifier les claims

#### Hypothèse C: Mauvais endpoint ou guard
- Les endpoints Planning requièrent des permissions spéciales
- Le guard vérifie un rôle spécifique (ex: "partner_admin")
- **Test**: Vérifier les guards dans availabilities.controller.ts

#### Hypothèse D: Race condition
- Le composant monte avant que le store ne soit hydraté
- isAuthenticated = false temporairement
- ProtectedRoute redirige prématurément
- **Test**: Ajouter des logs dans authStore.loadInitialState()

---

## 🧪 Plan de test

### Test 1: Vérifier le localStorage
```javascript
// Dans la console après login
console.log('Token:', localStorage.getItem('partner_token'));
console.log('User:', JSON.parse(localStorage.getItem('partner_user')));
```

**Résultat attendu**:
- Token: JWT string (commence par "eyJ...")
- User: Object avec partner nested

### Test 2: Décoder le JWT
```javascript
// Dans la console
const token = localStorage.getItem('partner_token');
const payload = JSON.parse(atob(token.split('.')[1]));
console.log('JWT payload:', payload);
```

**Résultat attendu**:
```json
{
  "sub": "uuid",
  "email": "...",
  "partnerId": "uuid",
  "role": "owner",
  "type": "partner",
  "exp": 1234567890
}
```

### Test 3: Tester l'API manuellement
```javascript
// Dans la console après login
const token = localStorage.getItem('partner_token');
fetch('http://localhost:3000/api/availabilities/me', {
  headers: { 'Authorization': 'Bearer ' + token }
})
.then(r => r.json())
.then(console.log)
.catch(console.error);
```

**Résultat attendu**:
- Status 200 + liste d'availabilities
- OU Status 401 + message d'erreur explicite

### Test 4: Observer les logs
Après correction #3, observer la console:
```
🚫 401 Unauthorized: {
  url: "http://localhost:3000/api/availabilities/me",
  method: "get",
  headers: {
    Authorization: "Bearer eyJ..."
  },
  response: {
    message: "Unauthorized",
    statusCode: 401
  }
}
```

---

## 🎯 Prochaines étapes

### Si message 401 reçu:
1. Analyser `response.message` pour comprendre la raison
2. Vérifier si c'est un problème de:
   - Token format
   - Token expiration
   - Permission (partnerId manquant)
   - Status partner (not approved)

### Si pas de 401:
1. Le problème est au niveau React/Router
2. Vérifier si ProtectedRoute se déclenche mal
3. Ajouter des logs dans authStore et ProtectedRoute

### Si 401 est dû au status:
1. Approuver le partner en DB:
```sql
UPDATE partners
SET status = 'approved'
WHERE email = 'Norautok@gmail.com';
```

### Si 401 est dû au guard:
1. Vérifier le JwtAuthGuard dans le backend
2. Vérifier la stratégie JWT
3. Vérifier si le guard extrait bien le partnerId du token

---

## 📚 Fichiers modifiés

- ✅ `frontend-partner/src/types/partner.ts`
- ✅ `frontend-partner/src/layouts/PartnerLayout.tsx`
- ✅ `frontend-partner/src/lib/axios.ts`

## 📊 Impact

- **Breaking changes**: Aucun
- **Nouvelles features**: Logs de debug
- **Régressions possibles**: Aucune

---

## 🔄 Statut

**EN ATTENTE**: Logs console de l'utilisateur pour identifier la cause exacte du 401

Une fois les logs reçus, je pourrai:
1. Identifier l'endpoint qui échoue
2. Comprendre pourquoi le backend rejette le token
3. Appliquer le fix approprié

---

**Next step**: 📸 Screenshot de la console avec le message d'erreur 401
