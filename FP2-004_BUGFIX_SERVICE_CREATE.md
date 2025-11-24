# 🐛 FP2-004 : Bugs corrigés - Module Services

**Date** : 19 octobre 2025
**Ticket** : FP2-004 (post-completion fixes)
**Statut** : ✅ **RÉSOLU**

---

## 🐛 BUG #1 : TypeError - service.price.toFixed is not a function

### Symptôme
- Page Planning/Services affichait un écran blanc
- Console : `TypeError: service.price.toFixed is not a function`
- Composant ServiceSettings crashait au chargement

### Cause racine
L'API PostgreSQL retourne les colonnes `DECIMAL` comme **string** au lieu de **number**.

```typescript
// Backend retourne
{ price: "99.99" }  // ❌ String

// Frontend attendait
{ price: 99.99 }    // ✅ Number
```

### Solution appliquée
Conversion explicite avec `Number()` avant `.toFixed()` :

**Fichiers modifiés** :
1. [ServiceSettings.tsx:238](frontend-partner/src/components/planning/ServiceSettings.tsx#L238)
2. [PendingBookingCard.tsx:76](frontend-partner/src/components/dashboard/PendingBookingCard.tsx#L76)
3. [partner.ts](frontend-partner/src/types/partner.ts) - Types mis à jour

```typescript
// ❌ Avant
{service.price.toFixed(2)} €

// ✅ Après
{Number(service.price).toFixed(2)} €
```

**Types mis à jour** :
```typescript
export interface PartnerService {
  price: number | string; // API returns string from PostgreSQL DECIMAL
}

export interface Booking {
  service: {
    price: number | string; // API returns string from PostgreSQL DECIMAL
  };
}
```

---

## ✨ AMÉLIORATION #1 : Ajout bouton "Créer un service"

### Problème
- Aucun moyen de créer un nouveau service depuis l'UI
- Utilisateur pouvait seulement éditer les services existants
- Message "Aucun service configuré" sans action possible

### Solution implémentée

#### 1. Bouton "Nouveau service"
- Ajouté dans le header de ServiceSettings
- Icône `Plus` de lucide-react
- Désactivé pendant la création

#### 2. Formulaire de création
- Formulaire inline avec fond bleu
- Champs :
  - Nom du service * (requis)
  - Prix (€) * (requis, min 0)
  - Description (optionnel, textarea)
  - Durée (minutes) * (requis, step 15)
- Validation côté client
- Boutons "Créer" et "Annuler"

#### 3. Intégration avec API
- Hook `useCreateService` déjà existant
- Service API `createService` déjà existant
- Endpoint backend : `POST /partners/me/services`
- Toast de succès/erreur automatique

### Code ajouté

**Imports** :
```typescript
import { Plus } from 'lucide-react';
import { useCreateService } from '../../hooks/useServices';
```

**État** :
```typescript
const [isCreating, setIsCreating] = useState(false);
const createMutation = useCreateService();
```

**Handlers** :
```typescript
const handleCreate = () => {
  setIsCreating(true);
  setEditForm({ name: '', description: '', price: 0, durationMinutes: 30 });
};

const handleSaveNew = () => {
  if (!editForm.name || editForm.price <= 0) return;

  createMutation.mutate({
    name: editForm.name,
    description: editForm.description || undefined,
    price: editForm.price,
    durationMinutes: editForm.durationMinutes,
  }, {
    onSuccess: () => handleCancelEdit(),
  });
};
```

**Fichier modifié** : [ServiceSettings.tsx](frontend-partner/src/components/planning/ServiceSettings.tsx)

---

## 🐛 BUG #2 : 404 Not Found lors de l'édition de service

### Symptôme
- Édition d'un service existant
- Clic sur "Enregistrer"
- Console : `PATCH http://localhost:3000/api/partners/me/services/:id [404 Not Found]`
- Modifications non sauvegardées

### Cause racine
Mauvaise URL pour update et delete :
- Frontend appelait : `PATCH /api/partners/me/services/:id` ❌
- Backend attendait : `PATCH /api/partners/services/:id` ✅

### Solution appliquée
Correction des endpoints dans `services.service.ts` :

```typescript
// ❌ Avant
updateService: async (id: string, updates: UpdateServiceDto) => {
  await axiosInstance.patch(`${API_CONFIG.ENDPOINTS.PARTNER_SERVICES}/${id}`, updates);
  // = /api/partners/me/services/:id ❌
}

// ✅ Après
updateService: async (id: string, updates: UpdateServiceDto) => {
  await axiosInstance.patch(`/api/partners/services/${id}`, updates);
  // = /api/partners/services/:id ✅
}
```

**Fichier modifié** : [services.service.ts](frontend-partner/src/api/services.service.ts)

---

## 📊 RÉSUMÉ DES CHANGEMENTS

### Fichiers modifiés : 5

**Frontend** :
1. `components/planning/ServiceSettings.tsx` - Bug fix + feature create
2. `components/dashboard/PendingBookingCard.tsx` - Bug fix price
3. `types/partner.ts` - Types price: number | string
4. `api/services.service.ts` - Fix endpoints update/delete

### Impact
- ✅ Page Services fonctionnelle (plus d'écran blanc)
- ✅ Affichage correct des prix
- ✅ Création de services possible
- ✅ **Édition de services possible** (plus de 404)
- ✅ UX améliorée avec message d'aide

### Tests effectués
- [x] Chargement page Services sans crash
- [x] Affichage prix existants OK
- [x] Clic "Nouveau service" → Formulaire s'affiche
- [x] Création service valide → Succès + toast
- [x] Création invalide (prix = 0) → Bouton désactivé
- [x] Annulation création → Formulaire se ferme
- [x] **Édition service → Enregistrement réussi (200 OK)**
- [x] **Modification prix/durée → Persistée en BDD**

---

## 🎯 RÉSULTAT FINAL

**Statut** : ✅ **100% FONCTIONNEL**

**Onglet Services** :
- ✅ Chargement sans erreur
- ✅ Affichage prix corrects
- ✅ Édition services existants
- ✅ **NOUVEAU** : Création de nouveaux services
- ✅ Activation/Désactivation services

**Prochaines étapes possibles** :
- [ ] Confirmation avant suppression service
- [ ] Upload d'image pour chaque service
- [ ] Catégories de services
- [ ] Duplication de service

---

**Corrigé par** : Claude Code
**Date** : 19 octobre 2025
**Version** : 1.1.0 ✅
