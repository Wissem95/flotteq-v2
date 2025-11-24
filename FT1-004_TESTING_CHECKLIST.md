# ✅ FT1-004 - Checklist de Tests

## Backend - Tests Unitaires

### Exécuter les tests
```bash
cd backend
npm run test -- vehicles.service.spec.ts
```

### Tests attendus (33 tests)
- ✅ 24 tests CRUD existants
- ✅ 3 tests timeline (avec/sans données, erreur)
- ✅ 3 tests costs (avec maintenances, sans, calcul km)
- ✅ 3 tests upload photos (validation limite, erreurs)

## Backend - Tests Manuels API

### 1. Timeline
```bash
# Récupérer timeline d'un véhicule
curl -H "Authorization: Bearer {token}" \
  http://localhost:3000/vehicles/{vehicleId}/timeline
```

**Attendu:** Liste événements (maintenances + documents + création)

### 2. Costs
```bash
# Récupérer analyse coûts
curl -H "Authorization: Bearer {token}" \
  http://localhost:3000/vehicles/{vehicleId}/costs
```

**Attendu:**
```json
{
  "vehicleId": "...",
  "purchasePrice": 15000,
  "totalMaintenanceCost": 550,
  "totalOwnershipCost": 15550,
  "costPerKm": 3.11,
  "costsByType": [...]
}
```

### 3. Upload Photos
```bash
# Upload photo
curl -X POST \
  -H "Authorization: Bearer {token}" \
  -F "photos=@photo1.jpg" \
  -F "photos=@photo2.jpg" \
  http://localhost:3000/vehicles/{vehicleId}/photos
```

**Attendu:** Véhicule avec URLs photos

### 4. Delete Photo
```bash
# Supprimer photo
curl -X DELETE \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{"photoUrl": "/uploads/vehicles/xxx/photo.webp"}' \
  http://localhost:3000/vehicles/{vehicleId}/photos
```

**Attendu:** Véhicule avec photo supprimée

## Frontend - Tests Manuels UI

### 1. Liste Véhicules (/vehicles)
- [ ] Page se charge sans erreur
- [ ] Cards véhicules affichées en grid 3 colonnes
- [ ] Photos placeholder si pas de photo
- [ ] Badge statut coloré (vert=disponible, bleu=en service, etc.)
- [ ] Kilométrage affiché
- [ ] Conducteur affiché si assigné
- [ ] Filtres fonctionnent (status, marque, modèle)
- [ ] Bouton "Réinitialiser" reset les filtres
- [ ] Pagination fonctionne (page suivante/précédente)
- [ ] Bouton "+ Ajouter véhicule" ouvre modal

### 2. Modal Ajout Véhicule
- [ ] Modal s'ouvre au clic
- [ ] Formulaire avec 7 champs requis
- [ ] Validation champs (année min 1900)
- [ ] Bouton "Annuler" ferme modal
- [ ] Bouton "Ajouter" envoie requête
- [ ] Message erreur affiché si problème
- [ ] Modal se ferme après succès
- [ ] Liste se rafraîchit après ajout

### 3. Détail Véhicule (/vehicles/:id)

#### Tab Informations
- [ ] Photo principale affichée
- [ ] Registration en titre (grand, bold)
- [ ] Badge statut visible
- [ ] Breadcrumb "Véhicules > {registration}"
- [ ] Infos complètes: VIN, couleur, date achat, prix, km
- [ ] Navigation tabs fonctionne

#### Tab Photos ✨ NOUVEAU
- [ ] Zone drag & drop visible
- [ ] Message "Glissez-déposez..." affiché
- [ ] Limite "X/10 photos" affichée
- [ ] **Upload drag & drop:**
  - [ ] Glisser image → upload démarre
  - [ ] Loading spinner pendant upload
  - [ ] Photo apparaît dans grille après upload
  - [ ] Erreur affichée si fichier trop gros (>5MB)
  - [ ] Erreur affichée si mauvais format (ni JPG/PNG/WEBP)
  - [ ] Erreur affichée si limite 10 photos atteinte
- [ ] **Galerie photos:**
  - [ ] Grid 4 colonnes responsive
  - [ ] Click sur photo → lightbox s'ouvre
  - [ ] Navigation lightbox (flèches, zoom)
  - [ ] Bouton delete visible au hover
  - [ ] Confirmation avant suppression
  - [ ] Photo disparaît après suppression

#### Tab Historique
- [ ] Timeline verticale avec ligne temporelle
- [ ] Icônes par type (🔧 maintenance, 📄 document, ✅ création)
- [ ] Date formatée (ex: "15 janvier 2024, 14:30")
- [ ] Description complète
- [ ] Tri chronologique inverse (+ récent en haut)
- [ ] Message "Aucun événement" si vide

#### Tab Coûts
- [ ] 3 cards métriques visibles:
  - Coût total de possession
  - Total maintenances
  - Coût moyen/maintenance
- [ ] Card "Coût par km" affichée si km > 0
- [ ] Tableau répartition par type de maintenance
- [ ] Nombre interventions par type
- [ ] Coûts formatés en euros (€)
- [ ] Message "Aucune donnée" si pas de maintenances

### 4. Navigation & UX
- [ ] Menu "Véhicules" actif (surligné en bleu)
- [ ] Click card → redirection vers détail
- [ ] Breadcrumb cliquable (retour liste)
- [ ] États loading affichés (spinners)
- [ ] Messages d'erreur clairs
- [ ] Pas de console errors

## Tests de Validation

### Limites & Validation
- [ ] Backend rejette fichier >5MB
- [ ] Backend rejette format non-image
- [ ] Backend rejette 11ème photo
- [ ] Frontend affiche erreur taille fichier
- [ ] Frontend affiche erreur format fichier
- [ ] Frontend cache upload zone si 10 photos

### Performance
- [ ] Upload 5 photos < 10 secondes
- [ ] Redimensionnement Sharp fonctionnel (vérifier taille fichier réduite)
- [ ] Thumbnails générés (vérifier dossier uploads/)
- [ ] Timeline charge < 2 secondes
- [ ] Coûts calculent < 1 seconde

### Stockage
- [ ] Photos sauvegardées dans `backend/uploads/vehicles/{vehicleId}/`
- [ ] Fichier principal: `{timestamp}-{random}.webp`
- [ ] Thumbnail: `thumb-{timestamp}-{random}.webp`
- [ ] URLs en DB: `/uploads/vehicles/{vehicleId}/{filename}`

## Tests de Régression

### Endpoints existants
- [ ] GET /vehicles fonctionne toujours
- [ ] POST /vehicles fonctionne toujours
- [ ] GET /vehicles/stats fonctionne toujours
- [ ] PATCH /vehicles/:id fonctionne toujours
- [ ] DELETE /vehicles/:id fonctionne toujours

### Fonctionnalités existantes
- [ ] Création véhicule sans photo fonctionne
- [ ] Filtres status/marque/modèle fonctionnent
- [ ] Pagination fonctionne
- [ ] Vérification limite plan fonctionne

## Bugs Connus

Aucun bug connu à ce stade. ✅

## Notes

- Les photos sont converties en WebP pour compression
- Les thumbnails sont générés automatiquement
- La galerie utilise react-photo-view (lightbox)
- L'upload utilise react-dropzone (drag & drop)
- Sharp redimensionne à 1920x1080 max
- Limite stricte: 10 photos par véhicule

## Statut Global

- [ ] Tous les tests backend passent
- [ ] Tous les tests manuels API validés
- [ ] Tous les tests UI validés
- [ ] Aucune erreur console
- [ ] Performance acceptable
- [ ] Prêt pour review

**Quand toutes les cases sont cochées → Module 100% validé ! ✅**
