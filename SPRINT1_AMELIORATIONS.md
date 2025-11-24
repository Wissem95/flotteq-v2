# SPRINT 1 - AMÉLIORATIONS RESTANTES

Ce document contient les prompts pour implémenter les 3 fonctionnalités manquantes du Sprint 1.

---

## 📋 PROMPT 1 : Calcul TCO (Total Cost of Ownership)

### Contexte
Le système doit calculer le coût total de possession d'un véhicule depuis son achat jusqu'à aujourd'hui.

### Tâche
Implémente le calcul TCO pour les véhicules dans le backend et affiche-le dans le frontend.

### Backend - Étapes à suivre

1. **Ajouter la méthode calculateTCO dans VehiclesService**
   - Fichier : `backend/src/modules/vehicles/vehicles.service.ts`
   - Emplacement : Après la méthode `findOne`
   - Formule TCO :
     ```
     TCO = purchasePrice
         + totalMaintenanceCosts
         + estimatedFuelCosts
         - currentValue
     ```
   - Calcul carburant estimé : `(currentKm - initialMileage) * 0.08 €/km`
   - Récupérer les coûts maintenances via une query SQL sur la table `maintenances`

2. **Créer le DTO VehicleTCODto**
   - Fichier : `backend/src/modules/vehicles/dto/vehicle-tco.dto.ts`
   - Propriétés :
     ```typescript
     {
       vehicleId: string;
       purchasePrice: number;
       currentValue: number;
       totalMaintenanceCosts: number;
       estimatedFuelCosts: number;
       totalTCO: number;
       kmTraveled: number;
       tcoPerKm: number; // TCO / kmTraveled
     }
     ```

3. **Ajouter l'endpoint GET /vehicles/:id/tco**
   - Fichier : `backend/src/modules/vehicles/vehicles.controller.ts`
   - Après l'endpoint `getTimeline`
   - Swagger documentation : `@ApiOperation({ summary: 'Calcul du TCO (Total Cost of Ownership)' })`
   - Guard : `@UseGuards(JwtAuthGuard, TenantGuard)`

4. **Ajouter les tests unitaires**
   - Fichier : `backend/src/modules/vehicles/vehicles.service.spec.ts`
   - Tests :
     - TCO avec véhicule neuf (sans maintenances)
     - TCO avec véhicule ayant des maintenances
     - TCO avec véhicule vendu (soldDate)

### Frontend - Étapes à suivre

1. **Créer le type VehicleTCO**
   - Fichier : `frontend-client/src/types/vehicle.types.ts`
   - Ajouter à la fin du fichier

2. **Créer le composant VehicleTCO**
   - Fichier : `frontend-client/src/components/vehicles/VehicleTCO.tsx`
   - Props : `{ vehicleId: string }`
   - Affichage :
     - Card avec titre "Coût Total de Possession (TCO)"
     - Breakdown des coûts (achat, maintenances, carburant)
     - TCO total en grand (style highlight)
     - TCO par km parcouru
     - Graphique en barres (optionnel)

3. **Ajouter l'appel API dans vehiclesService**
   - Fichier : `frontend-client/src/api/services/vehicles.service.ts`
   - Méthode : `getTCO(vehicleId: string): Promise<VehicleTCO>`

4. **Intégrer VehicleTCO dans VehicleDetailPage**
   - Fichier : `frontend-client/src/pages/vehicles/VehicleDetailPage.tsx`
   - Ajouter un nouvel onglet "Coûts & TCO" ou intégrer dans l'onglet "costs"
   - Afficher le composant VehicleTCO

### Critères d'acceptation
- ✅ Endpoint /vehicles/:id/tco retourne le TCO calculé
- ✅ TCO affiché dans la page détail véhicule
- ✅ Breakdown des coûts visible
- ✅ TCO par km calculé et affiché
- ✅ Tests unitaires passent

---

## 📋 PROMPT 2 : Historique Kilométrage

### Contexte
Le système doit enregistrer et afficher l'évolution du kilométrage d'un véhicule au fil du temps.

### Tâche
Crée une table `mileage_history` et affiche l'historique kilométrique dans le frontend.

### Backend - Étapes à suivre

1. **Créer l'entité MileageHistory**
   - Fichier : `backend/src/entities/mileage-history.entity.ts`
   - Propriétés :
     ```typescript
     {
       id: string (uuid);
       vehicleId: string;
       vehicle: Vehicle (relation ManyToOne);
       mileage: number;
       previousMileage: number;
       difference: number; // mileage - previousMileage
       recordedAt: Date;
       recordedBy: string (userId);
       source: 'manual' | 'maintenance' | 'inspection';
       notes: string (nullable);
       tenantId: number;
     }
     ```

2. **Créer la migration**
   - Commande : `npm run migration:generate -- -n CreateMileageHistory`
   - Fichier généré : `backend/src/migrations/TIMESTAMP-CreateMileageHistory.ts`
   - Index sur (vehicleId, recordedAt)

3. **Créer MileageHistoryService**
   - Fichier : `backend/src/modules/vehicles/mileage-history.service.ts`
   - Méthodes :
     - `recordMileage(vehicleId, mileage, userId, source, notes?)`
     - `getHistory(vehicleId, tenantId): Promise<MileageHistory[]>`
     - `getLatestMileage(vehicleId): Promise<MileageHistory | null>`

4. **Modifier VehiclesService pour enregistrer automatiquement**
   - Fichier : `backend/src/modules/vehicles/vehicles.service.ts`
   - Dans la méthode `update`, si `currentKm` change :
     ```typescript
     if (updateVehicleDto.currentKm && updateVehicleDto.currentKm !== vehicle.currentKm) {
       await this.mileageHistoryService.recordMileage(
         vehicle.id,
         updateVehicleDto.currentKm,
         userId,
         'manual'
       );
     }
     ```

5. **Ajouter l'endpoint GET /vehicles/:id/mileage-history**
   - Fichier : `backend/src/modules/vehicles/vehicles.controller.ts`
   - Retourne la liste triée par date (DESC)
   - Swagger documentation

6. **Auto-enregistrement depuis maintenances**
   - Fichier : `backend/src/modules/maintenance/maintenance.service.ts`
   - Quand une maintenance est complétée, enregistrer le kilométrage du véhicule

### Frontend - Étapes à suivre

1. **Créer le type MileageHistory**
   - Fichier : `frontend-client/src/types/vehicle.types.ts`
   - Interface correspondant à l'entité backend

2. **Créer le composant MileageHistoryTimeline**
   - Fichier : `frontend-client/src/components/vehicles/MileageHistoryTimeline.tsx`
   - Props : `{ vehicleId: string }`
   - Affichage : Timeline verticale avec :
     - Date
     - Kilométrage
     - Différence (+XXXX km) avec badge coloré
     - Source (badge : manual/maintenance/inspection)
     - Notes si présentes

3. **Ajouter l'appel API**
   - Fichier : `frontend-client/src/api/services/vehicles.service.ts`
   - Méthode : `getMileageHistory(vehicleId: string): Promise<MileageHistory[]>`

4. **Intégrer dans VehicleDetailPage**
   - Fichier : `frontend-client/src/pages/vehicles/VehicleDetailPage.tsx`
   - Ajouter un nouvel onglet "Historique KM"
   - Afficher MileageHistoryTimeline

5. **Ajouter graphique d'évolution (bonus)**
   - Utiliser `recharts` (déjà installé)
   - LineChart avec kilométrage en Y et dates en X

### Critères d'acceptation
- ✅ Table mileage_history créée
- ✅ Enregistrement automatique lors de la modification du kilométrage
- ✅ Enregistrement automatique lors des maintenances
- ✅ Endpoint /vehicles/:id/mileage-history fonctionnel
- ✅ Timeline affichée dans la page véhicule
- ✅ Différences calculées et affichées

---

## 📋 PROMPT 3 : Génération de Thumbnails (Miniatures)

### Contexte
Lors de l'upload de photos de véhicules ou de documents images, générer automatiquement des miniatures (thumbnails) pour optimiser l'affichage et les performances.

### Tâche
Utilise la librairie `sharp` pour générer des thumbnails lors de l'upload d'images.

### Backend - Étapes à suivre

1. **Créer le service ThumbnailService**
   - Fichier : `backend/src/common/services/thumbnail.service.ts`
   - Méthodes :
     ```typescript
     generateThumbnail(
       originalPath: string,
       options?: {
         width?: number,  // défaut 400
         height?: number, // défaut 300
         quality?: number // défaut 80
       }
     ): Promise<string> // retourne le path du thumbnail
     ```
   - Utiliser `sharp` :
     ```typescript
     import * as sharp from 'sharp';

     const thumbnailPath = originalPath.replace(/(\.[^.]+)$/, '_thumb$1');
     await sharp(originalPath)
       .resize(width, height, { fit: 'cover' })
       .jpeg({ quality })
       .toFile(thumbnailPath);
     ```

2. **Modifier DocumentsService pour générer thumbnails**
   - Fichier : `backend/src/documents/documents.service.ts`
   - Dans la méthode `create`, après sauvegarde du fichier :
     ```typescript
     let thumbnailUrl: string | null = null;

     if (file.mimetype.startsWith('image/')) {
       try {
         thumbnailUrl = await this.thumbnailService.generateThumbnail(file.path);
       } catch (error) {
         this.logger.warn('Failed to generate thumbnail', error);
       }
     }
     ```

3. **Ajouter le champ thumbnailUrl dans Document entity**
   - Fichier : `backend/src/entities/document.entity.ts`
   - Ajouter : `@Column({ nullable: true }) thumbnailUrl: string;`
   - Créer migration : `npm run migration:generate -- -n AddThumbnailToDocument`

4. **Modifier VehiclesService pour les photos**
   - Fichier : `backend/src/modules/vehicles/vehicles.service.ts`
   - Dans la méthode `uploadPhotos`, générer thumbnails pour chaque photo
   - Stocker dans un tableau `photoThumbnails: string[]` dans Vehicle entity

5. **Ajouter le champ photoThumbnails dans Vehicle entity**
   - Fichier : `backend/src/entities/vehicle.entity.ts`
   - Ajouter : `@Column({ type: 'simple-array', nullable: true }) photoThumbnails: string[];`
   - Créer migration : `npm run migration:generate -- -n AddThumbnailsToVehicle`

6. **Modifier les endpoints de téléchargement**
   - Ajouter un query param `?thumbnail=true` pour servir les miniatures
   - Exemple : `GET /documents/:id/download?thumbnail=true`
   - Exemple : `GET /vehicles/:id/photos/:index?thumbnail=true`

### Frontend - Étapes à suivre

1. **Modifier VehicleCard pour utiliser thumbnails**
   - Fichier : `frontend-client/src/components/vehicles/VehicleCard.tsx`
   - Utiliser `photoThumbnails[0]` au lieu de `photos[0]` pour l'affichage
   - Fallback sur `photos[0]` si pas de thumbnail

2. **Modifier VehiclePhotos pour lazy loading**
   - Fichier : `frontend-client/src/components/vehicles/VehiclePhotos.tsx`
   - Afficher les thumbnails dans la galerie
   - Au clic, charger et afficher l'image complète en modal

3. **Créer un composant ThumbnailImage réutilisable**
   - Fichier : `frontend-client/src/components/common/ThumbnailImage.tsx`
   - Props :
     ```typescript
     {
       thumbnailUrl: string;
       fullUrl: string;
       alt: string;
       className?: string;
       onClickFullImage?: () => void;
     }
     ```
   - Comportement : Affiche thumbnail, charge full image au clic

4. **Modifier la liste des documents**
   - Fichier : `frontend-client/src/components/documents/EntityDocumentsTab.tsx`
   - Pour les documents images, afficher thumbnail au lieu de l'icône générique

5. **Optimiser les appels API**
   - Modifier `vehiclesService.getVehicles()` pour demander les thumbnails
   - Ajouter paramètre `includeThumbnails=true` dans la query

### Critères d'acceptation
- ✅ ThumbnailService créé et fonctionnel
- ✅ Thumbnails générés automatiquement pour les images
- ✅ Champs thumbnailUrl ajoutés aux entités
- ✅ Endpoints servent les thumbnails via query param
- ✅ Frontend affiche les thumbnails dans les listes
- ✅ Images complètes chargées uniquement au clic
- ✅ Performance améliorée (vérifier avec Chrome DevTools)

---

## 🚀 ORDRE D'EXÉCUTION RECOMMANDÉ

1. **Calcul TCO** (2h) - Plus simple, impact business immédiat
2. **Historique Kilométrage** (2h) - Nécessite migration DB
3. **Génération Thumbnails** (2h) - Plus technique, nécessite sharp

**Total : 6 heures**

---

## 📌 NOTES IMPORTANTES

### Avant de commencer :
- ✅ Faire un backup de la DB : `pg_dump flotteq_dev > backup_pre_ameliorations.sql`
- ✅ Créer une branche git : `git checkout -b sprint1-ameliorations`
- ✅ S'assurer que `sharp` est bien installé : `cd backend && npm list sharp`

### Après chaque fonctionnalité :
- ✅ Tester manuellement dans l'interface
- ✅ Commit avec message clair : `feat(vehicles): add TCO calculation`
- ✅ Mettre à jour la documentation si nécessaire

### En cas d'erreur :
- Migration DB : `npm run migration:revert`
- Restaurer backup : `psql flotteq_dev < backup_pre_ameliorations.sql`

---

## 🎯 COMMENT UTILISER CES PROMPTS

Pour chaque amélioration, copie-colle le prompt complet à Claude Code :

**Exemple pour TCO :**
```
Je veux implémenter le calcul TCO (Total Cost of Ownership) dans mon projet Flotteq.

[Copier tout le contenu du PROMPT 1]

Contexte du projet :
- Backend : NestJS + TypeORM + PostgreSQL
- Frontend : React + TypeScript + Vite
- Le système de véhicules existe déjà
- Les maintenances sont fonctionnelles

Implémente cette fonctionnalité en suivant exactement les étapes du prompt.
```

Répète pour les 3 prompts ! 🚀
