# 🔒 GUIDE - Appliquer ProtectedButton partout

## ✅ Déjà fait

- [x] **UsersPage** - Boutons protégés
- [x] **VehiclesListPage** - Bouton "Ajouter un véhicule" protégé

---

## 📋 À FAIRE - Pattern à suivre

### **1. Importer ProtectedButton**

```typescript
import { ProtectedButton } from '@/components/common/ProtectedButton';
```

### **2. Remplacer les boutons classiques**

**AVANT** :
```tsx
<button
  onClick={handleCreate}
  className="px-4 py-2 bg-blue-600 text-white rounded-lg"
>
  Créer
</button>
```

**APRÈS** :
```tsx
<ProtectedButton
  permission="resource.create"  // Changer selon la ressource
  onClick={handleCreate}
  className="px-4 py-2 bg-blue-600 text-white rounded-lg"
  disabledMessage="Seuls les managers peuvent créer..."
>
  Créer
</ProtectedButton>
```

---

## 🎯 FICHIERS À MODIFIER

### **📄 DOCUMENTS**

#### **1. Documents List/Upload Page**

**Fichier** : Trouver avec :
```bash
find frontend-client/src/pages -name "*ocument*" -type f
```

**Boutons à protéger** :
- ✅ "Upload document" → `permission="documents.create"`
- ✅ "Supprimer" (icône poubelle) → `permission="documents.delete"`

**Code** :
```tsx
// Import
import { ProtectedButton } from '@/components/common/ProtectedButton';

// Bouton Upload
<ProtectedButton
  permission="documents.create"
  onClick={handleUpload}
  className="..."
  disabledMessage="Seuls les managers peuvent uploader des documents"
>
  Upload
</ProtectedButton>

// Bouton Delete (dans la liste)
<ProtectedButton
  permission="documents.delete"
  onClick={() => handleDelete(doc.id)}
  className="text-red-600 hover:text-red-900"
  disabledMessage="Seuls les managers peuvent supprimer"
>
  <TrashIcon />
</ProtectedButton>
```

---

### **🔧 MAINTENANCES**

#### **1. MaintenancesListPage**

**Fichier** : `frontend-client/src/pages/maintenance/MaintenancesListPage.tsx`

**Boutons à protéger** :
- ✅ "Créer maintenance" → `permission="maintenances.create"`
- ✅ "Modifier" → `permission="maintenances.update"`
- ✅ "Supprimer" → `permission="maintenances.delete"`

**Code** :
```tsx
// Bouton Créer
<ProtectedButton
  permission="maintenances.create"
  onClick={() => setIsModalOpen(true)}
  className="bg-blue-600 text-white px-4 py-2 rounded-lg"
  disabledMessage="Seuls les managers peuvent créer des maintenances"
>
  + Nouvelle maintenance
</ProtectedButton>

// Boutons actions (dans tableau)
<ProtectedButton
  permission="maintenances.update"
  onClick={() => handleEdit(maintenance)}
  className="text-blue-600"
  disabledMessage="Vous ne pouvez pas modifier les maintenances"
>
  <PencilIcon />
</ProtectedButton>

<ProtectedButton
  permission="maintenances.delete"
  onClick={() => handleDelete(maintenance.id)}
  className="text-red-600"
  disabledMessage="Vous ne pouvez pas supprimer les maintenances"
>
  <TrashIcon />
</ProtectedButton>
```

#### **2. MaintenanceDetailPage**

**Fichier** : `frontend-client/src/pages/maintenance/MaintenanceDetailPage.tsx`

**Boutons à protéger** :
- ✅ "Modifier" → `permission="maintenances.update"`
- ✅ "Supprimer" → `permission="maintenances.delete"`

#### **3. MaintenanceCalendarPage**

**Fichier** : `frontend-client/src/pages/maintenance/MaintenanceCalendarDnDPage.tsx`

**Boutons à protéger** :
- ✅ "Créer événement" → `permission="maintenances.create"`

---

### **👥 CONDUCTEURS (DRIVERS)**

#### **1. DriversPage / DriversListPage**

**Fichier** : Trouver avec :
```bash
find frontend-client/src/pages -name "*river*" -type f
```

**Boutons à protéger** :
- ✅ "Ajouter conducteur" → `permission="drivers.create"`
- ✅ "Modifier" → `permission="drivers.update"`
- ✅ "Supprimer" → `permission="drivers.delete"`

**Code** :
```tsx
<ProtectedButton
  permission="drivers.create"
  onClick={() => setIsModalOpen(true)}
  className="bg-blue-600 text-white px-4 py-2 rounded-lg"
  disabledMessage="Seuls les managers peuvent ajouter des conducteurs"
>
  + Ajouter un conducteur
</ProtectedButton>
```

---

### **🚗 VEHICULES (compléter)**

#### **1. VehicleDetailPage**

**Fichier** : `frontend-client/src/pages/vehicles/VehicleDetailPage.tsx`

**Boutons à protéger** :
- ✅ "Modifier véhicule" → `permission="vehicles.update"`
- ✅ "Supprimer véhicule" → `permission="vehicles.delete"`
- ✅ "Upload photos" → `permission="vehicles.update"`

**Chercher dans le fichier** :
```bash
grep -n "onClick.*edit\|onClick.*delete\|onClick.*upload" VehicleDetailPage.tsx
```

**Code** :
```tsx
<ProtectedButton
  permission="vehicles.update"
  onClick={() => setShowEditModal(true)}
  className="..."
  disabledMessage="Seuls les managers peuvent modifier"
>
  Modifier
</ProtectedButton>

<ProtectedButton
  permission="vehicles.delete"
  onClick={handleDelete}
  className="..."
  disabledMessage="Seuls les managers peuvent supprimer"
>
  Supprimer
</ProtectedButton>
```

---

## 🔍 TROUVER LES BOUTONS À PROTÉGER

### **Commande universelle**

```bash
# Chercher tous les boutons avec onClick dans les pages
grep -rn "button.*onClick\|<Plus\|<Trash\|<Edit\|<Pencil" frontend-client/src/pages/ | grep -v "node_modules"

# Résultat exemple :
# pages/users/UsersPage.tsx:102: <button onClick={handleCreate}>
# pages/vehicles/VehicleDetailPage.tsx:234: <button onClick={handleDelete}>
```

### **Par ressource**

```bash
# Documents
grep -rn "button.*onClick" frontend-client/src/pages/documents/

# Maintenances
grep -rn "button.*onClick" frontend-client/src/pages/maintenance/

# Drivers
grep -rn "button.*onClick" frontend-client/src/pages/drivers/
```

---

## 📊 MATRICE DES PERMISSIONS

| Permission | Manager | Driver | Viewer |
|------------|---------|--------|--------|
| `vehicles.create` | ✅ | ❌ | ❌ |
| `vehicles.update` | ✅ | ❌ | ❌ |
| `vehicles.delete` | ✅ | ❌ | ❌ |
| `documents.create` | ✅ | ❌ | ❌ |
| `documents.delete` | ✅ | ❌ | ❌ |
| `maintenances.create` | ✅ | ❌ | ❌ |
| `maintenances.update` | ✅ | ❌ | ❌ |
| `maintenances.delete` | ✅ | ❌ | ❌ |
| `drivers.create` | ✅ | ❌ | ❌ |
| `drivers.update` | ✅ | ❌ | ❌ |
| `drivers.delete` | ✅ | ❌ | ❌ |

---

## ✅ CHECKLIST PAR PAGE

### **Documents**
- [ ] Page liste documents - Bouton "Upload"
- [ ] Page liste documents - Bouton "Supprimer" (par document)
- [ ] Page détail document - Bouton "Supprimer"

### **Maintenances**
- [ ] MaintenancesListPage - Bouton "Créer"
- [ ] MaintenancesListPage - Boutons "Modifier" (tableau)
- [ ] MaintenancesListPage - Boutons "Supprimer" (tableau)
- [ ] MaintenanceDetailPage - Bouton "Modifier"
- [ ] MaintenanceDetailPage - Bouton "Supprimer"
- [ ] MaintenanceCalendarPage - Bouton "Créer événement"

### **Conducteurs**
- [ ] DriversPage - Bouton "Ajouter"
- [ ] DriversPage - Boutons "Modifier" (tableau)
- [ ] DriversPage - Boutons "Supprimer" (tableau)
- [ ] DriverDetailPage - Bouton "Modifier"
- [ ] DriverDetailPage - Bouton "Supprimer"

### **Véhicules (compléter)**
- [x] VehiclesListPage - Bouton "Ajouter" ✅
- [ ] VehicleDetailPage - Bouton "Modifier"
- [ ] VehicleDetailPage - Bouton "Supprimer"
- [ ] VehicleDetailPage - Bouton "Upload photos"

---

## 🧪 TESTER

Après chaque page modifiée :

1. Se connecter avec un compte **VIEWER**
2. Aller sur la page modifiée
3. ✅ Vérifier que les boutons sont **grisés**
4. ✅ Vérifier le **tooltip** au survol
5. ✅ Vérifier qu'aucune **requête HTTP** n'est envoyée en cliquant

---

## 🚀 SCRIPT D'AUTOMATISATION (optionnel)

Si vous voulez automatiser, créez un script :

```bash
#!/bin/bash
# apply-protected-buttons.sh

echo "🔍 Recherche des boutons à protéger..."

# Documents
echo "📄 Documents:"
grep -rn "button.*onClick" frontend-client/src/pages/documents/ | head -5

# Maintenances
echo "🔧 Maintenances:"
grep -rn "button.*onClick" frontend-client/src/pages/maintenance/ | head -5

# Drivers
echo "👥 Conducteurs:"
grep -rn "button.*onClick" frontend-client/src/pages/drivers/ | head -5

echo "✅ Appliquez ProtectedButton sur chaque bouton trouvé"
```

---

**Temps estimé** : 30-45 minutes pour tout appliquer

**Priorité** :
1. 🔥 Maintenances (le plus utilisé)
2. 📄 Documents
3. 👥 Conducteurs
4. 🚗 Véhicules (compléter DetailPage)

**Besoin d'aide ?** Utilisez le pattern ci-dessus, c'est toujours le même !
