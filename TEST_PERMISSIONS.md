# 🧪 GUIDE DE TEST - SYSTÈME DE PERMISSIONS

## ✅ Problème résolu

**Erreur initiale** : `The requested module doesn't provide an export named 'Permission'`

**Solution appliquée** :
```typescript
// AVANT
import { usePermissions, Permission } from '@/hooks/usePermissions';

// APRÈS
import { usePermissions, type Permission } from '@/hooks/usePermissions';
```

**Fichier corrigé** : [ProtectedButton.tsx](frontend-client/src/components/common/ProtectedButton.tsx#L2)

---

## 🚀 Serveur de développement

```bash
# Frontend-client démarré sur :
http://localhost:5175/

# Vérifier les logs :
tail -f /tmp/vite-client.log
```

---

## 🧪 TESTS À EFFECTUER

### **Test 1 : Créer un utilisateur VIEWER (Lecteur)**

#### **Étape 1 : Se connecter en tant qu'Admin**
```
URL: http://localhost:5175/login
Email: 3ws@3ws.com  (ou votre admin)
Password: [votre mot de passe]
```

#### **Étape 2 : Créer un utilisateur VIEWER**
1. Aller sur `/users`
2. Cliquer sur "Ajouter un utilisateur"
3. Remplir :
   - Email : `viewer@test.com`
   - Password : `viewer123`
   - Prénom : `Test`
   - Nom : `Viewer`
   - Rôle : **Lecteur** (VIEWER)
   - Téléphone : (optionnel)
4. Cliquer "Créer"

#### **Étape 3 : Se connecter avec le compte VIEWER**
1. Se déconnecter
2. Se reconnecter avec :
   - Email : `viewer@test.com`
   - Password : `viewer123`

#### **Étape 4 : Vérifier les boutons grisés**

**Page `/users` :**
- ✅ Bouton "Inviter" → **Doit être GRISÉ et DÉSACTIVÉ**
- ✅ Bouton "Ajouter un utilisateur" → **Doit être GRISÉ et DÉSACTIVÉ**
- ✅ Icône "Modifier" (crayon) dans le tableau → **Doit être GRISÉE**
- ✅ Icône "Désactiver/Activer" → **Doit être GRISÉE**
- ✅ Icône "Supprimer" (poubelle) → **Doit être GRISÉE**

**Au survol des boutons grisés :**
- ✅ Un **tooltip** doit apparaître avec le message :
  - "Seuls les admins peuvent inviter des utilisateurs"
  - "Seuls les admins peuvent créer des utilisateurs"
  - "Vous ne pouvez pas modifier les utilisateurs"
  - "Vous ne pouvez pas supprimer les utilisateurs"

**Vérifier qu'aucune requête HTTP n'est envoyée :**
1. Ouvrir DevTools (F12)
2. Onglet "Network"
3. Cliquer sur un bouton grisé
4. ✅ **Aucune requête HTTP** ne doit apparaître

---

### **Test 2 : Créer un utilisateur DRIVER (Conducteur)**

#### **Répéter les étapes avec rôle DRIVER**
1. Se reconnecter en tant qu'admin
2. Créer un utilisateur avec rôle "Conducteur"
   - Email : `driver@test.com`
   - Password : `driver123`
3. Se connecter avec ce compte
4. ✅ Vérifier que les boutons sont **grisés** (même comportement que VIEWER)

---

### **Test 3 : Créer un utilisateur MANAGER**

#### **Tester les permissions partielles**
1. Se reconnecter en tant qu'admin
2. Créer un utilisateur avec rôle "Manager"
   - Email : `manager@test.com`
   - Password : `manager123`
3. Se connecter avec ce compte

**Page `/users` :**
- ✅ Tous les boutons **GRISÉS** (pas de permission utilisateurs)

**Page `/vehicles` (à implémenter) :**
- ✅ Tous les boutons **ACTIFS** (a la permission véhicules)

---

### **Test 4 : Vérifier les tooltips**

#### **Interaction utilisateur**
1. Se connecter en tant que VIEWER
2. Aller sur `/users`
3. Passer la souris sur le bouton "Inviter" (grisé)
4. ✅ Après ~500ms, un **tooltip noir** doit apparaître
5. ✅ Tooltip contient : "Seuls les admins peuvent inviter des utilisateurs"
6. ✅ Le tooltip a une **flèche** pointant vers le bouton

#### **Style attendu du tooltip**
```css
background: #1f2937 (gris foncé)
color: white
padding: 8px 12px
border-radius: 4px
font-size: 12px
z-index: 50
```

---

### **Test 5 : Console DevTools (vérifier aucune erreur)**

1. Ouvrir DevTools (F12)
2. Onglet "Console"
3. ✅ **Aucune erreur** ne doit apparaître :
   - Pas d'erreur `Permission is not defined`
   - Pas d'erreur `usePermissions is not a function`
   - Pas d'erreur TypeScript

---

## 🎨 APERÇU VISUEL ATTENDU

### **Bouton ACTIF (Admin/Manager)**
```
┌─────────────────────────────┐
│ + Ajouter un utilisateur    │  ← Bleu vif (bg-blue-600)
└─────────────────────────────┘
     ↑ Cursor: pointer
```

### **Bouton GRISÉ (Viewer/Driver)**
```
┌─────────────────────────────┐
│ + Ajouter un utilisateur    │  ← Gris clair (opacity-50)
└─────────────────────────────┘
     ↑ Cursor: not-allowed

     Tooltip au survol :
     ┌───────────────────────────────────┐
     │ Seuls les admins peuvent créer... │
     └─────────▼─────────────────────────┘
```

---

## 📊 RÉSULTATS ATTENDUS

| Utilisateur | Bouton "Inviter" | Bouton "Ajouter" | Boutons tableau | Tooltip |
|-------------|------------------|------------------|-----------------|---------|
| **VIEWER** | ❌ Grisé | ❌ Grisé | ❌ Grisés | ✅ Oui |
| **DRIVER** | ❌ Grisé | ❌ Grisé | ❌ Grisés | ✅ Oui |
| **MANAGER** | ❌ Grisé | ❌ Grisé | ❌ Grisés | ✅ Oui |
| **TENANT_ADMIN** | ✅ Actif | ✅ Actif | ✅ Actifs | ❌ Non |
| **SUPER_ADMIN** | ✅ Actif | ✅ Actif | ✅ Actifs | ❌ Non |

---

## 🐛 DÉBOGAGE

### **Si les boutons ne sont pas grisés :**

1. **Vérifier le rôle dans AuthContext**
```typescript
// Ouvrir Console DevTools
const { user } = useAuth();
console.log('User role:', user?.role);
// Doit afficher : 'viewer', 'driver', 'manager', etc.
```

2. **Vérifier les permissions**
```typescript
import { usePermissions } from '@/hooks/usePermissions';
const { hasPermission } = usePermissions();
console.log('Can create users:', hasPermission('users.create'));
// VIEWER/DRIVER → Doit afficher : false
// ADMIN → Doit afficher : true
```

3. **Vérifier le localStorage**
```bash
# Console DevTools
localStorage.getItem('access_token')  // Doit être présent
localStorage.getItem('tenant_id')     // Doit être présent
```

### **Si l'erreur "Permission is not defined" persiste :**

1. **Vider le cache navigateur**
   - Chrome : Ctrl+Shift+Delete → "Cached images and files"
   - Firefox : Ctrl+Shift+Delete → "Cache"

2. **Hard refresh**
   - Ctrl+Shift+R (Windows/Linux)
   - Cmd+Shift+R (Mac)

3. **Vérifier l'import**
```typescript
// frontend-client/src/components/common/ProtectedButton.tsx
import { usePermissions, type Permission } from '@/hooks/usePermissions';
//                        ^^^^
//                        Le mot-clé "type" DOIT être présent
```

---

## ✅ CHECKLIST FINALE

Avant de valider les tests :

- [ ] Serveur dev lancé sur http://localhost:5175
- [ ] Utilisateur VIEWER créé avec succès
- [ ] Login VIEWER fonctionne
- [ ] Boutons grisés sur `/users` pour VIEWER
- [ ] Tooltips s'affichent au survol
- [ ] Aucune requête HTTP envoyée en cliquant sur bouton grisé
- [ ] Console DevTools sans erreur
- [ ] Utilisateur MANAGER a permissions partielles
- [ ] Utilisateur TENANT_ADMIN a tous les boutons actifs

---

## 📝 NOTES

**Temps estimé pour tous les tests** : 15-20 minutes

**Fichiers à vérifier en cas de problème** :
- [usePermissions.ts](frontend-client/src/hooks/usePermissions.ts)
- [ProtectedButton.tsx](frontend-client/src/components/common/ProtectedButton.tsx)
- [UsersPage.tsx](frontend-client/src/pages/users/UsersPage.tsx)

**Serveur backend doit être actif** :
```bash
# Vérifier que le backend tourne
curl http://localhost:3000/api/health
# Doit retourner : {"status":"ok"}
```

---

**Date** : 2025-01-09
**Version** : 1.0.0
**Status** : ✅ Prêt pour les tests
