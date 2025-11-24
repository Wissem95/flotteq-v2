# 🔐 SYSTÈME DE PERMISSIONS FLOTTEQ

## 📋 Vue d'ensemble

Le système de permissions permet de contrôler l'accès aux fonctionnalités selon le rôle de l'utilisateur. Les boutons d'action sont automatiquement **grisés et désactivés** si l'utilisateur n'a pas la permission requise.

---

## 👥 RÔLES UTILISATEURS

| Rôle | Code | Description |
|------|------|-------------|
| **Super Admin** | `super_admin` | Administrateur FlotteQ (tenantId = 1) - Accès complet |
| **Support** | `support` | Support FlotteQ (tenantId = 1) - Accès complet |
| **Admin Tenant** | `tenant_admin` | Admin de l'entreprise cliente - Gestion complète de son tenant |
| **Manager** | `manager` | Manager de flotte - Gestion véhicules, documents, maintenances |
| **Conducteur** | `driver` | Conducteur - **Lecture seule** |
| **Lecteur** | `viewer` | Utilisateur en lecture seule - **Lecture seule** |

---

## 🔑 MATRICE DES PERMISSIONS

### **Véhicules**

| Action | Super Admin | Support | Tenant Admin | Manager | Driver | Viewer |
|--------|-------------|---------|--------------|---------|--------|--------|
| Créer véhicule | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| Modifier véhicule | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| Supprimer véhicule | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| Voir véhicules | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Upload photos | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |

### **Utilisateurs**

| Action | Super Admin | Support | Tenant Admin | Manager | Driver | Viewer |
|--------|-------------|---------|--------------|---------|--------|--------|
| Créer user | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| Modifier user | ✅ | ✅ | ✅ | ❌ | ❌ (sauf soi) | ❌ (sauf soi) |
| Supprimer user | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| Inviter user | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| Activer/Désactiver | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |

### **Documents**

| Action | Super Admin | Support | Tenant Admin | Manager | Driver | Viewer |
|--------|-------------|---------|--------------|---------|--------|--------|
| Créer document | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| Modifier document | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| Supprimer document | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| Voir documents | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |

### **Maintenances**

| Action | Super Admin | Support | Tenant Admin | Manager | Driver | Viewer |
|--------|-------------|---------|--------------|---------|--------|--------|
| Créer maintenance | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| Modifier maintenance | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| Supprimer maintenance | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| Voir maintenances | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |

### **Conducteurs**

| Action | Super Admin | Support | Tenant Admin | Manager | Driver | Viewer |
|--------|-------------|---------|--------------|---------|--------|--------|
| Créer conducteur | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| Modifier conducteur | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| Supprimer conducteur | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| Voir conducteurs | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |

---

## 💻 UTILISATION DANS LE CODE

### **1. Hook `usePermissions()`**

Fichier : `frontend-client/src/hooks/usePermissions.ts`

```typescript
import { usePermissions } from '@/hooks/usePermissions';

function MyComponent() {
  const { hasPermission, canManage, isAdmin } = usePermissions();

  // Vérifier une permission spécifique
  if (hasPermission('vehicles.create')) {
    // Afficher le bouton "Créer véhicule"
  }

  // Vérifier si l'utilisateur peut gérer les véhicules
  if (canManage('vehicles')) {
    // Afficher tous les boutons d'action
  }

  // Vérifier si l'utilisateur est admin
  if (isAdmin()) {
    // Afficher les fonctionnalités admin
  }
}
```

### **2. Composant `<ProtectedButton>`**

Fichier : `frontend-client/src/components/common/ProtectedButton.tsx`

```tsx
import { ProtectedButton } from '@/components/common/ProtectedButton';

// Bouton protégé par une permission
<ProtectedButton
  permission="vehicles.create"
  onClick={handleCreateVehicle}
  className="px-4 py-2 bg-blue-600 text-white rounded-lg"
  disabledMessage="Seuls les managers peuvent créer des véhicules"
>
  Créer un véhicule
</ProtectedButton>

// Bouton protégé par plusieurs permissions (au moins une requise)
<ProtectedButton
  anyPermissions={['users.create', 'users.invite']}
  onClick={handleAction}
>
  Action
</ProtectedButton>

// Bouton masqué si pas de permission (au lieu de grisé)
<ProtectedButton
  permission="users.delete"
  hideWhenDisabled={true}
  onClick={handleDelete}
>
  Supprimer
</ProtectedButton>
```

### **3. Composant `<Protected>` (pour sections complètes)**

```tsx
import { Protected } from '@/components/common/ProtectedButton';

// Masquer toute une section
<Protected permission="users.create">
  <div className="admin-panel">
    {/* Contenu visible uniquement si permission */}
  </div>
</Protected>

// Afficher un fallback si pas de permission
<Protected
  permission="vehicles.delete"
  fallback={<p>Vous n'avez pas accès à cette fonctionnalité</p>}
>
  <DangerZone />
</Protected>
```

---

## 🎯 PERMISSIONS DISPONIBLES

### Code des permissions

```typescript
type Permission =
  // Véhicules
  | 'vehicles.create'
  | 'vehicles.update'
  | 'vehicles.delete'
  | 'vehicles.view'
  // Utilisateurs
  | 'users.create'
  | 'users.update'
  | 'users.delete'
  | 'users.invite'
  // Documents
  | 'documents.create'
  | 'documents.update'
  | 'documents.delete'
  // Maintenances
  | 'maintenances.create'
  | 'maintenances.update'
  | 'maintenances.delete'
  // Conducteurs
  | 'drivers.create'
  | 'drivers.update'
  | 'drivers.delete';
```

---

## 📄 FICHIERS MODIFIÉS

| Fichier | Description |
|---------|-------------|
| `frontend-client/src/hooks/usePermissions.ts` | Hook pour vérifier les permissions |
| `frontend-client/src/components/common/ProtectedButton.tsx` | Composant bouton protégé |
| `frontend-client/src/pages/users/UsersPage.tsx` | Page utilisateurs avec boutons protégés |

---

## ✅ COMPORTEMENT UX

### **Pour un utilisateur DRIVER ou VIEWER :**

1. ✅ **Boutons grisés** : Les boutons "Créer", "Modifier", "Supprimer" sont visibles mais **désactivés et grisés**
2. ✅ **Tooltip informatif** : Au survol, un message explique : "Vous n'avez pas la permission d'effectuer cette action"
3. ✅ **Pas de requête HTTP** : Aucune requête n'est envoyée au serveur si l'utilisateur clique sur un bouton désactivé
4. ✅ **UX claire** : L'utilisateur voit les fonctionnalités disponibles mais comprend qu'il ne peut pas y accéder

### **Pour un utilisateur MANAGER :**

1. ✅ Peut **créer/modifier/supprimer** : Véhicules, Documents, Maintenances, Conducteurs
2. ❌ **NE peut PAS** : Gérer les utilisateurs (boutons grisés)

### **Pour un utilisateur TENANT_ADMIN :**

1. ✅ **Accès complet** sur tout ce qui concerne son tenant
2. ❌ **NE peut PAS** : Modifier les rôles super_admin ou support

---

## 🧪 TESTS À EFFECTUER

### **Test 1 : Utilisateur VIEWER**

1. Se connecter avec un compte VIEWER
2. Naviguer vers `/users`
3. ✅ Les boutons "Inviter" et "Ajouter" doivent être **grisés**
4. ✅ Les boutons "Modifier", "Désactiver", "Supprimer" dans le tableau doivent être **grisés**
5. ✅ Au survol, un tooltip doit s'afficher

### **Test 2 : Utilisateur DRIVER**

1. Se connecter avec un compte DRIVER
2. Naviguer vers `/vehicles`
3. ✅ Le bouton "Ajouter un véhicule" doit être **grisé**
4. ✅ Les boutons "Modifier" et "Supprimer" dans la liste doivent être **grisés**

### **Test 3 : Utilisateur MANAGER**

1. Se connecter avec un compte MANAGER
2. Naviguer vers `/vehicles`
3. ✅ Tous les boutons véhicules doivent être **actifs**
4. Naviguer vers `/users`
5. ✅ Les boutons utilisateurs doivent être **grisés** (pas de permission)

### **Test 4 : Utilisateur TENANT_ADMIN**

1. Se connecter avec un compte TENANT_ADMIN
2. ✅ Tous les boutons doivent être **actifs** sur toutes les pages

---

## 🚀 PROCHAINES ÉTAPES

- [ ] Appliquer `ProtectedButton` sur les pages Vehicles
- [ ] Appliquer `ProtectedButton` sur les pages Documents
- [ ] Appliquer `ProtectedButton` sur les pages Maintenances
- [ ] Appliquer `ProtectedButton` sur les pages Drivers
- [ ] Tests E2E pour chaque rôle

---

## 📝 NOTES IMPORTANTES

1. **Backend synchronisé** : Les permissions frontend sont alignées avec les guards backend (RolesGuard, etc.)
2. **Sécurité** : Le frontend ne fait que l'UX - **le backend vérifie toujours les permissions**
3. **Performance** : Pas de requêtes inutiles - les boutons sont désactivés côté client
4. **Extensible** : Facile d'ajouter de nouvelles permissions dans `ROLE_PERMISSIONS`

---

**Dernière mise à jour** : 2025-01-09
**Version** : 1.0.0
