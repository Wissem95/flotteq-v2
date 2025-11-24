# 🐛 DEBUG - Token Partner non envoyé

## ✅ Vérifications effectuées

### Backend
1. ✅ JWT généré avec `type: 'partner'` (ligne 77 de partner-auth.service.ts)
2. ✅ TenantMiddleware détecte les tokens partner (lignes 53-67)
3. ✅ Payload correct :
```ts
{
  sub: partnerUser.id,
  email: partnerUser.email,
  partnerId: partnerUser.partnerId,
  role: partnerUser.role,
  type: 'partner',  // ✅
}
```

### Frontend
1. ✅ axios.ts:14 lit `localStorage.getItem('partner_token')`
2. ✅ axios.ts:16 ajoute `Authorization: Bearer ${token}`
3. ✅ authStore stocke le token lors du login

---

## 🔍 Hypothèses

### Hypothèse A : Utilisateur non connecté
- Le token n'existe pas dans localStorage
- Pas de header Authorization envoyé
- → Middleware retourne "X-Tenant-ID required"

### Hypothèse B : Token expiré
- Le token existe mais est invalide
- Le décodage échoue (ligne 59 catch)
- → Middleware retourne "X-Tenant-ID required"

### Hypothèse C : localStorage vide après rechargement
- Le token n'est pas persisté correctement
- authStore.login() n'est pas appelé après la connexion

---

## ✅ SOLUTION : Vérifier dans DevTools

### 1. Ouvrir Console Browser (F12)

### 2. Vérifier localStorage
```js
console.log('Token:', localStorage.getItem('partner_token'));
console.log('User:', localStorage.getItem('partner_user'));
```

### 3. Vérifier Network Tab
- Aller dans "Network"
- Rafraîchir la page
- Chercher requête `GET /api/commissions?status=paid`
- Regarder "Request Headers"
- Vérifier si `Authorization: Bearer xxx` est présent

### 4. Décoder le token
```js
const token = localStorage.getItem('partner_token');
if (token) {
  const payload = JSON.parse(atob(token.split('.')[1]));
  console.log('Token payload:', payload);
  console.log('Has type=partner?', payload.type === 'partner');
  console.log('Expires at:', new Date(payload.exp * 1000));
}
```

---

## 🎯 Actions selon résultat

### Si localStorage est VIDE
→ L'utilisateur n'est pas connecté ou le login a échoué
→ **Action** : Se reconnecter

### Si token existe MAIS pas de header Authorization
→ L'interceptor axios ne fonctionne pas
→ **Action** : Bug frontend, vérifier axios.ts

### Si header Authorization existe MAIS erreur 400
→ Le token est invalide/expiré ou n'a pas `type: 'partner'`
→ **Action** : Vérifier le payload du token

### Si token a `type: 'partner'` MAIS erreur 400
→ Bug dans TenantMiddleware ou ordre d'exécution des middlewares
→ **Action** : Ajouter logs côté backend
