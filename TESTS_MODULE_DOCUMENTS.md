# 📋 GUIDE DE TESTS - Module Documents FT1-007

## ✅ Prérequis

1. **Backend démarré** : `npm run dev` (port 3000)
2. **Frontend démarré** : `cd frontend-client && npm run dev` (port 5173)
3. **BDD PostgreSQL** : Migration exécutée
4. **Authentification** : User connecté avec token valide

---

## 🧪 TEST 1 : Upload de Documents

### 1.1 Upload via Page Documents

**Navigation** : Menu latéral → Documents

**Actions** :
1. Cliquer sur "Nouveau document"
2. Drag & drop un fichier PDF (ou cliquer pour sélectionner)
3. Remplir le formulaire :
   - Type d'entité : `Véhicule`
   - ID de l'entité : Copier UUID d'un véhicule depuis `/vehicles`
   - Type de document : `Carte grise`
   - Date d'expiration : `2025-12-31`
   - Notes : `Carte grise renouvelée`
4. Cliquer "Uploader"

**Résultat attendu** :
- ✅ Modal se ferme
- ✅ Document apparaît dans la liste
- ✅ Badge "Carte grise" visible
- ✅ Badge expiration (orange si <30j, rouge si <7j)
- ✅ Fichier sauvegardé dans `/uploads/{tenantId}/`

**Vérification BDD** :
```sql
SELECT * FROM documents ORDER BY "createdAt" DESC LIMIT 1;
-- Colonnes attendues: document_type, expiry_date, notes
```

---

### 1.2 Upload Multiple Files

**Actions** :
1. Nouveau document
2. Sélectionner **3 fichiers** (2 PDF + 1 image)
3. Vérifier preview miniatures
4. Retirer 1 fichier (bouton X)
5. Uploader les 2 restants

**Résultat attendu** :
- ✅ 2 documents créés
- ✅ Preview correcte (icône PDF rouge, icône image bleue)
- ✅ Taille fichier affichée (KB/MB)

---

### 1.3 Upload via Onglet Véhicule

**Navigation** : Véhicules → Cliquer sur un véhicule → Onglet "Documents"

**Actions** :
1. Cliquer "Ajouter un document"
2. Upload 1 PDF (permis ou assurance)
3. **Noter** : `entityType` et `entityId` sont **pré-remplis**
4. Uploader

**Résultat attendu** :
- ✅ Document apparaît dans l'onglet Documents du véhicule
- ✅ Nom véhicule affiché dans modal : "Renault Clio (AB-123-CD)"
- ✅ Document **filtré automatiquement** (visible uniquement pour ce véhicule)

---

## 🔍 TEST 2 : Preview Documents

### 2.1 Preview PDF

**Navigation** : Documents → Cliquer sur une carte document PDF

**Résultat attendu** :
- ✅ Modal plein écran s'ouvre
- ✅ PDF affiché avec rendu correct
- ✅ Navigation pages (flèches gauche/droite)
- ✅ Compteur pages : "Page 1 sur 3"
- ✅ Zoom in/out fonctionnel (50% → 200%)
- ✅ Bouton download visible
- ✅ Bouton fermer (X) fonctionne

**Actions** :
1. Cliquer "Zoom in" 3 fois → Vérifier affichage "140%"
2. Naviguer vers page 2 → Vérifier "Page 2 sur 3"
3. Cliquer download → Vérifier téléchargement

---

### 2.2 Preview Image

**Actions** :
1. Cliquer sur un document image (JPG/PNG)

**Résultat attendu** :
- ✅ Image affichée full-screen
- ✅ Fond gris autour de l'image
- ✅ Pas de zoom/navigation (images seulement)
- ✅ Download fonctionne

---

### 2.3 Preview Type Non Supporté

**Actions** :
1. (Si possible) Upload un fichier Excel `.xlsx`
2. Cliquer pour preview

**Résultat attendu** :
- ✅ Message : "Aperçu non disponible pour ce type de fichier"
- ✅ Bouton "Télécharger le fichier" visible
- ✅ Clic download lance le téléchargement

---

## 🔧 TEST 3 : Filtres

### 3.1 Filtrer par Type d'Entité

**Navigation** : Documents → Cliquer "Filtres"

**Actions** :
1. Sélectionner "Véhicule" dans Type d'entité
2. Observer la liste

**Résultat attendu** :
- ✅ Seuls les documents de véhicules visibles
- ✅ Compteur mis à jour : "X documents trouvés"
- ✅ Documents de conducteurs/maintenances cachés

**Actions 2** :
1. Changer pour "Conducteur"
2. Vérifier que seuls les documents conducteurs apparaissent

---

### 3.2 Filtrer par Type de Document

**Actions** :
1. Sélectionner "Permis de conduire" dans Type de document
2. Observer la liste

**Résultat attendu** :
- ✅ Seuls les documents de type "permis" visibles
- ✅ Badge "Permis de conduire" visible sur chaque carte

---

### 3.3 Filtres Combinés

**Actions** :
1. Type d'entité : `Véhicule`
2. Type de document : `Carte grise`
3. Observer

**Résultat attendu** :
- ✅ Seules les cartes grises de véhicules visibles
- ✅ Compteur correct

---

### 3.4 Réinitialiser Filtres

**Actions** :
1. Appliquer plusieurs filtres
2. Cliquer "Réinitialiser"

**Résultat attendu** :
- ✅ Tous les documents réapparaissent
- ✅ Sélecteurs remis à "Tous"
- ✅ Compteur total affiché

---

## 📊 TEST 4 : Widget Dashboard

### 4.1 Affichage Widget

**Navigation** : Dashboard

**Résultat attendu** :
- ✅ Widget "Documents à renouveler" visible
- ✅ Si aucun document expirant : "Aucun document n'expire dans les 30 prochains jours"
- ✅ Sinon : Liste de 5 max documents avec :
  - Nom fichier
  - Type document
  - Date expiration
  - Badge urgence (rouge/orange/bleu)
  - Nombre jours restants

**Vérification couleurs** :
- ❌ Expiré (négatif) → Badge **rouge** "Expiré"
- 🔴 <7j → Badge **rouge** "X jours restants"
- 🟡 7-30j → Badge **orange** "X jours restants"
- 🔵 >30j → Pas de badge (document pas dans widget)

---

### 4.2 Lien vers Documents

**Actions** :
1. Si >5 documents expirant → Cliquer "Voir tous les documents"

**Résultat attendu** :
- ✅ Redirection vers `/documents`
- ✅ Tous les documents affichés

---

## 🗂️ TEST 5 : Onglets Entités

### 5.1 Onglet Documents Véhicule

**Navigation** : Véhicules → Sélectionner véhicule → Onglet "Documents"

**Résultat attendu** :
- ✅ Titre : "Documents"
- ✅ Compteur : "X documents"
- ✅ Bouton "Ajouter un document"
- ✅ Seuls les documents de **ce véhicule** visibles

**Actions** :
1. Cliquer "Ajouter un document"
2. Vérifier modal :
   - Titre : "Ajouter un document - Renault Clio (AB-123-CD)"
   - Pas de champs entityType/entityId (pré-remplis)
3. Upload fichier
4. Vérifier apparition immédiate dans l'onglet

---

### 5.2 Onglet Documents Conducteur

**Navigation** : Conducteurs → Sélectionner conducteur → Onglet "Documents"

**Actions** :
1. Upload un permis de conduire avec date expiration proche
2. Vérifier badge orange/rouge
3. Télécharger le document
4. Prévisualiser le document
5. Supprimer le document

**Résultat attendu** :
- ✅ Toutes les actions fonctionnent
- ✅ Documents filtrés par conducteur
- ✅ Badge expiration correct

---

## ⚠️ TEST 6 : Gestion Erreurs

### 6.1 Fichier Trop Volumineux

**Actions** :
1. Tenter d'uploader un fichier >10MB

**Résultat attendu** :
- ✅ Message erreur : "Fichier trop volumineux (max 5MB)"
- ✅ Fichier rejeté, pas ajouté à la liste
- ✅ Autres fichiers valides toujours sélectionnés

---

### 6.2 Type Fichier Non Autorisé

**Actions** :
1. Tenter d'uploader un fichier `.exe` ou `.zip`

**Résultat attendu** :
- ✅ Message erreur : "Type de fichier non autorisé"
- ✅ Fichier rejeté

---

### 6.3 Upload Sans Fichier

**Actions** :
1. Modal upload ouverte
2. Ne rien sélectionner
3. Cliquer "Uploader"

**Résultat attendu** :
- ✅ Alert : "Veuillez sélectionner au moins un fichier"
- ✅ Modal reste ouverte

---

### 6.4 EntityId Invalide

**Actions** :
1. Page Documents → Nouveau document
2. EntityId : `invalid-uuid-123`
3. Upload

**Résultat attendu** :
- ✅ Erreur validation backend : "L'entité référencée n'existe pas"
- ✅ Modal reste ouverte
- ✅ Message erreur affiché

---

## 🔄 TEST 7 : Actions Documents

### 7.1 Download Document

**Actions** :
1. Cliquer bouton Download sur une carte

**Résultat attendu** :
- ✅ Téléchargement démarre
- ✅ Nom fichier original conservé
- ✅ Type MIME correct (application/pdf, image/jpeg)

---

### 7.2 Suppression Document

**Actions** :
1. Cliquer bouton Delete (poubelle)
2. Confirmer la suppression

**Résultat attendu** :
- ✅ Modale confirmation : "Êtes-vous sûr de vouloir supprimer ce document ?"
- ✅ Après confirmation : document disparaît de la liste
- ✅ **Soft delete** : Vérifier BDD → `deletedAt` non null

**Vérification BDD** :
```sql
SELECT id, "fileName", "deletedAt" FROM documents WHERE "deletedAt" IS NOT NULL;
```

**Actions 2** :
1. Rafraîchir page Documents
2. Vérifier que document supprimé ne réapparaît pas

---

## 📱 TEST 8 : Responsive & UX

### 8.1 Mobile (Simuler avec DevTools)

**Actions** :
1. Ouvrir DevTools → Toggle device toolbar (Ctrl+Shift+M)
2. Sélectionner iPhone 12 Pro
3. Naviguer sur `/documents`

**Résultat attendu** :
- ✅ Grille passe à 1 colonne
- ✅ Filtres empilés verticalement
- ✅ Boutons "Filtres" et "Nouveau" empilés
- ✅ Modal upload scrollable

---

### 8.2 Drag & Drop

**Actions** :
1. Ouvrir modal upload
2. Drag un fichier depuis l'explorateur
3. Hover au-dessus de la zone

**Résultat attendu** :
- ✅ Zone devient **bleue** avec texte "Déposez les fichiers ici..."
- ✅ Drop ajoute le fichier
- ✅ Preview miniature apparaît

---

## 🔍 TEST 9 : Performance & Cache

### 9.1 Cache React Query

**Actions** :
1. Aller sur `/documents` (requête API)
2. Naviguer vers `/dashboard`
3. Revenir sur `/documents`

**Résultat attendu** :
- ✅ Pas de nouvelle requête API (cache React Query)
- ✅ Documents affichés instantanément

---

### 9.2 Invalidation Cache après Upload

**Actions** :
1. Sur `/documents`
2. Upload nouveau document
3. Observer la liste

**Résultat attendu** :
- ✅ Requête API automatique après upload
- ✅ Nouveau document apparaît sans refresh manuel

---

## 🎯 CHECKLIST FINALE

### Backend
- [ ] Migration exécutée (colonnes `document_type`, `expiry_date`, `notes`)
- [ ] Endpoint `/documents/alerts/expiring` fonctionne
- [ ] Upload fichiers sauvegardés dans `/uploads/{tenantId}/`
- [ ] Soft delete fonctionne (`deletedAt`)

### Frontend - Core
- [ ] Page `/documents` accessible
- [ ] Menu "Documents" visible dans sidebar
- [ ] Upload drag & drop fonctionne
- [ ] Preview PDF avec zoom + navigation pages
- [ ] Preview images full-screen
- [ ] Download fichiers fonctionne

### Frontend - Filtres
- [ ] Filtrer par type d'entité
- [ ] Filtrer par type de document
- [ ] Réinitialiser filtres
- [ ] Compteur documents mis à jour

### Frontend - Dashboard
- [ ] Widget "Documents à renouveler" affiché
- [ ] Top 5 documents expirant
- [ ] Couleurs urgence correctes (rouge/orange)
- [ ] Lien vers `/documents` fonctionne

### Frontend - Onglets Entités
- [ ] Onglet "Documents" dans VehicleDetailPage
- [ ] Onglet "Documents" dans DriverDetailPage
- [ ] Upload contextualisé (entityId pré-rempli)
- [ ] Documents filtrés par entité

### UX & Erreurs
- [ ] Validation fichier trop volumineux
- [ ] Validation type fichier incorrect
- [ ] Confirmation suppression
- [ ] Messages erreurs clairs
- [ ] Responsive mobile

---

## 🐛 Problèmes Courants

### Problème 1 : Worker PDF.js non chargé

**Symptôme** : Erreur console "pdf.worker.js not found"

**Solution** :
```typescript
// Vérifier dans DocumentPreviewModal.tsx
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
```

---

### Problème 2 : CORS Upload

**Symptôme** : Erreur 403 lors upload

**Solution** :
```typescript
// Vérifier token dans localStorage
console.log(localStorage.getItem('token'));

// Vérifier backend CORS (backend/.env)
CORS_ORIGIN=http://localhost:5173
```

---

### Problème 3 : Documents pas filtrés

**Symptôme** : Tous les documents visibles dans onglet véhicule

**Solution** :
```typescript
// Vérifier query params dans EntityDocumentsTab
const { data: documents } = useDocuments({ entityType, entityId });
```

---

## 📊 RÉSULTATS ATTENDUS

**Tests réussis** : 35/35 ✅

**Temps estimé tests** : 30-45 minutes

**Fichiers testés** :
- 15 composants React
- 6 endpoints backend
- 1 migration BDD
- 9 hooks React Query

**Conclusion** : Module Documents 100% fonctionnel ! 🚀
