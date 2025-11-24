# 🐛 DEBUG - Pourquoi les boutons restent cliquables ?

## 🔍 Étapes de diagnostic

### **1. Ouvrir l'application et la console**

```bash
# Frontend : http://localhost:5175
# Console DevTools : F12
```

### **2. Se connecter avec un compte VIEWER**

```
Email: viewer@test.com
Password: viewer123
```

### **3. Aller sur la page /users**

```
URL: http://localhost:5175/users
```

### **4. Vérifier les logs dans la console**

Cherchez ces messages :

```
[Permissions] Checking: { permission: 'users.create', userRole: 'viewer', user: {...} }
[Permissions] Result: false Permissions: ['vehicles.view']
```

**Si vous voyez ces logs** :
- ✅ Le système fonctionne
- ❌ Le bouton devrait être grisé mais ne l'est pas → Problème dans `ProtectedButton`

**Si vous NE voyez PAS ces logs** :
- ❌ `usePermissions()` n'est pas appelé
- ❌ Le composant `ProtectedButton` n'est pas utilisé

---

## 🔧 Vérifications possibles

### **Problème 1 : Le user n'a pas de rôle**

Dans la console :

```javascript
// Vérifier l'utilisateur dans React DevTools
// Chercher le composant AuthProvider
// Vérifier la valeur de `user`

// OU dans la console :
const checkUser = () => {
  // Inspecter le contexte
  console.log("Utilisateur:", window.__REACT_DEVTOOLS_GLOBAL_HOOK__);
}
```

### **Problème 2 : Le rôle n'est pas correct**

Si le log montre :

```
[Permissions] No permissions found for role: undefined
```

Alors le problème est que `user.role` est `undefined`.

**Solution** : Vérifier que le backend retourne bien le rôle :

```bash
# Tester l'API
curl http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN"

# Doit retourner :
{
  "id": "...",
  "email": "viewer@test.com",
  "role": "viewer",  ← DOIT ÊTRE PRÉSENT
  ...
}
```

### **Problème 3 : ProtectedButton n'est pas utilisé**

Vérifier dans `UsersPage.tsx` que les boutons utilisent bien `<ProtectedButton>` :

```tsx
// CORRECT ✅
<ProtectedButton permission="users.create" ...>
  Ajouter
</ProtectedButton>

// INCORRECT ❌
<button onClick={...}>
  Ajouter
</button>
```

### **Problème 4 : Les logs montrent "Result: true" pour un VIEWER**

Si vous voyez :

```
[Permissions] Checking: { permission: 'users.create', userRole: 'viewer', user: {...} }
[Permissions] Result: true  ← ERREUR !
```

Alors le problème est dans `ROLE_PERMISSIONS` :
- Vérifier que `UserRole.VIEWER` ne contient que `'vehicles.view'`

---

## 📊 Checklist de debug

- [ ] Ouvrir http://localhost:5175
- [ ] Ouvrir Console (F12)
- [ ] Se connecter avec VIEWER
- [ ] Aller sur /users
- [ ] Vérifier logs `[Permissions]` dans console
- [ ] Noter le `userRole` affiché
- [ ] Noter le `Result` (true/false)
- [ ] Vérifier si boutons sont grisés
- [ ] Essayer de cliquer sur un bouton grisé
- [ ] Vérifier si une requête HTTP est envoyée

---

## 🎯 Résultat attendu

**Console** :
```
[Permissions] Checking: {
  permission: 'users.create',
  userRole: 'viewer',
  user: { id: '...', email: 'viewer@test.com', role: 'viewer', ... }
}
[Permissions] Result: false
[Permissions] Permissions: ['vehicles.view']
```

**UI** :
- ✅ Bouton "Inviter" **GRISÉ** (opacity-50)
- ✅ Bouton "Ajouter un utilisateur" **GRISÉ** (opacity-50)
- ✅ Cursor = `not-allowed` au survol
- ✅ Tooltip s'affiche au survol

**DevTools Network** :
- ✅ **Aucune requête** POST /api/users quand on clique sur bouton grisé

---

## 🚨 Si les boutons restent cliquables

**Raisons possibles** :

1. **user.role est undefined**
   - Solution : Vérifier GET /api/auth/me

2. **ProtectedButton n'est pas importé**
   - Solution : Vérifier les imports dans UsersPage.tsx

3. **Cache navigateur**
   - Solution : Ctrl+Shift+R (hard refresh)

4. **Le composant ProtectedButton a un bug**
   - Solution : Vérifier que `disabled={isDisabled}` est bien présent

5. **CSS n'est pas appliqué**
   - Solution : Vérifier que className contient `opacity-50 cursor-not-allowed`

---

## 📸 Screenshot attendu

Bouton grisé (VIEWER) :

```
┌─────────────────────────────┐
│ ✉ Inviter                   │  ← Gris (opacity-50)
└─────────────────────────────┘
     ↑ Cursor: not-allowed

     Au survol :
     ┌──────────────────────────────────┐
     │ Seuls les admins peuvent inviter │
     └─────────▼───────────────────────┘
```

Bouton actif (ADMIN) :

```
┌─────────────────────────────┐
│ ✉ Inviter                   │  ← Blanc, border grise
└─────────────────────────────┘
     ↑ Cursor: pointer
```

---

**Temps de debug estimé** : 5-10 minutes

**Une fois le problème identifié, partagez les logs de la console !** 🔍
