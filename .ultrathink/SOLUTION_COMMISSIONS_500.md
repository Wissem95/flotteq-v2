# ✅ SOLUTION - Erreur 500 API Commissions

## 🎯 Problème identifié

**Erreur réelle** : `400 Bad Request - X-Tenant-ID header is required`

Le frontend reçoit `500` à cause d'une mauvaise gestion d'erreur, mais l'erreur backend est `400`.

---

## 🔍 Analyse TenantMiddleware

**Fichier** : `backend/src/core/tenant/tenant.middleware.ts:53-67`

Le middleware détecte déjà les tokens partner :

```ts
const authHeader = req.headers['authorization'] as string;
if (authHeader && authHeader.startsWith('Bearer ')) {
  const token = authHeader.substring(7);
  try {
    const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
    if (payload.type === 'partner' && payload.partnerId) {
      return next(); // ✅ Skip X-Tenant-ID requirement
    }
  } catch (e) {
    // Invalid token format
  }
}
```

---

## 🐛 Cause racine

Le middleware exige `type === 'partner'` dans le JWT payload, mais :

**Hypothèse 1** : Le JWT partner n'a pas le champ `type: 'partner'`
**Hypothèse 2** : Le token n'est pas envoyé par le frontend
**Hypothèse 3** : Le token est invalide/expiré

---

## ✅ Actions à vérifier

### 1. Vérifier le JWT partner payload

Fichier : `backend/src/modules/partners/partner-auth.service.ts`

Le token généré doit contenir :
```ts
{
  userId: partnerUser.id,
  partnerId: partnerUser.partnerId,
  role: partnerUser.role,
  type: 'partner',  // ✅ OBLIGATOIRE
}
```

### 2. Vérifier l'envoi du token côté frontend

Fichier : `frontend-partner/src/lib/axios.ts`

Doit ajouter le header Authorization :
```ts
axiosInstance.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

### 3. Vérifier le store auth

Fichier : `frontend-partner/src/stores/authStore.ts`

Le token doit être :
- ✅ Stocké après login
- ✅ Persisté dans localStorage
- ✅ Chargé au démarrage

---

## 🔧 Plan d'action

1. ✅ Vérifier génération JWT partner (doit inclure `type: 'partner'`)
2. ✅ Vérifier axios interceptor envoie le token
3. ✅ Vérifier le token est stocké dans authStore
4. ⚠️ Déboguer : Afficher le token dans la console pour vérifier son contenu
