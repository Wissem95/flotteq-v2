# Retour client → Prompt de dev structuré (FlotteQ)

> Document généré à partir du retour de Loucky + tests, **après vérification du code existant**.
> Chaque point indique : ce que veut le client · ce qui existe déjà dans le code · ce qu'il reste à faire.
> Légende : ✅ existe déjà · ⚠️ partiel / à corriger · ❌ à créer

---

## PRIORITÉ 1 — Sécurité & cohérence (à faire avant la bêta)

### 1.1 — Retirer l'accès Administration des espaces publics
**Demande client :** le lien vers l'Administration ne doit pas apparaître sur la page de connexion publique ; l'admin reste réservée à l'équipe FlotteQ.
**État du code :** ⚠️ Le portail Admin est listé publiquement dans le sélecteur « Choisissez votre espace ».
- `frontend-landing/src/components/LoginOverlay.tsx:23-25` (entrée `Administration` / `admin.flotteq.fr`)
- `frontend-portal/src/components/PortalGrid.tsx:41-44` (`PORTAL_DEFS.admin`)
- `frontend-portal/src/pages/LoginPortalPage.tsx:8` (carte admin ajoutée à la grille)

**À faire :**
- Supprimer la carte « Administration » des sélecteurs d'espace publics (les 3 fichiers ci-dessus).
- L'accès à `admin.flotteq.fr` reste possible en tapant l'URL directement, mais n'est plus annoncé.
- Vérifier qu'aucune « version démo » de l'admin n'est accessible publiquement (router frontend-internal + déploiement) ; si une démo existe, la protéger derrière auth ou la retirer.

---

### 1.2 — Supprimer les boutons « Supprimer » côté Administration
**Demande client :** pas de bouton « Supprimer » pour utilisateurs / conducteurs / véhicules côté admin FlotteQ. Les véhicules et conducteurs appartiennent aux tenants → suppression/modification = côté tenant. L'admin = supervision globale + possibilité de **désactiver / bannir** en cas d'abus.
**État du code :** ⚠️ Boutons Supprimer présents partout ; désactivation seulement pour Users.
- `frontend-internal/src/pages/users/UsersListPage.tsx:198` (Delete) + `:187-190` (deactivate/activate ✅)
- `frontend-internal/src/pages/drivers/DriversListPage.tsx:144` (Delete) — ❌ pas de désactiver
- `frontend-internal/src/pages/vehicles/VehiclesListPage.tsx:119` (Delete) — ❌ pas de désactiver
- Backend : enums `DriverStatus` (active/inactive/suspended/on_leave) et `VehicleStatus` existent mais **aucun endpoint de changement de statut**.

**À faire :**
- Retirer le bouton « Supprimer » des pages Drivers et Vehicles de l'admin (`frontend-internal`).
- Pour Users admin : retirer « Supprimer » (ou le réserver strictement au SUPER_ADMIN), garder activer/désactiver.
- Ajouter une action **Désactiver / Bannir** sur Drivers et Vehicles :
  - Backend : `PATCH /drivers/:id/status` et `PATCH /vehicles/:id/status` (valeurs : actif / suspendu / banni), avec `@Auditable`.
  - Frontend-internal : boutons d'état (désactiver / réactiver / bannir) sur les listes Drivers et Vehicles.
- Note : la suppression/modif réelle reste côté tenant (frontend-client) — ne rien y changer.
- Précision client : pour les conducteurs, l'action sert surtout aux sociétés avec flotte + employés (moins utile pour la réservation type Turo).

---

## PRIORITÉ 2 — Parcours partenaire & véhicule

### 2.1 — Statut partenaire : « configuration incomplète » au lieu de « suspendu »
**Demande client :** quand un partenaire commence l'enregistrement bancaire puis annule avant la fin, le statut passe en « suspendu ». Il faudrait afficher « configuration incomplète ».
**État du code :** ⚠️ Enum `PartnerStatus` = pending / approved / rejected / suspended → **pas de valeur `incomplete`**. La suspension est en réalité manuelle (admin), mais l'UX affiche un état trompeur quand l'onboarding Stripe est inachevé.
- `backend/src/entities/partner.entity.ts:21-26` (enum)
- `backend/src/migrations/1760560000000-CreatePartnerTables.ts:13-15`
- `frontend-partner/src/pages/SettingsPage.tsx:119-136` (affichage onboarding Stripe)

**À faire :**
- Ajouter un statut `incomplete` (« Configuration incomplète ») à l'enum + migration.
- Logique : tant que l'onboarding Stripe Connect n'est pas finalisé → statut `incomplete`, **jamais `suspended`**. `suspended` reste réservé à une action admin volontaire.
- `frontend-partner` : afficher « Configuration incomplète » (pas « Suspendu ») et un CTA pour reprendre l'onboarding bancaire.

### 2.2 — Documents partenaires : destination de vérification
**Demande client :** quand un partenaire envoie des documents, où vont-ils pour vérification ?
**État du code :** ⚠️ Upload OK et stocké (`document.entity.ts`, `entityType=partner`), mais **aucun écran admin de vérification** (le détail partenaire n'affiche que `insuranceDocument`). Marqué « Sprint 2 » dans le validateur.
- `backend/src/documents/documents.controller.ts:52-116` (upload) · `documents.service.ts`
- `frontend-internal/src/pages/partners/PartnerDetailModal.tsx:272-291` (affichage limité)

**À faire :**
- Créer un onglet/section « Documents à vérifier » dans le détail partenaire de `frontend-internal` : liste des documents uploadés, prévisualisation, et actions **Valider / Refuser** (avec motif).
- Répondre fonctionnellement à la question : les documents arrivent dans l'admin FlotteQ pour vérification manuelle par l'équipe.

### 2.3 — Ajout véhicule : envoi de la carte grise
**Demande client :** prévoir l'envoi de la carte grise lors de l'ajout d'un véhicule.
**État du code :** ✅ Infra **complète et déjà branchée** : type `CARTE_GRISE`, endpoint `POST /documents/upload` (`entityType=vehicle`), onglet Documents dans `VehicleDetailPage`.
- `frontend-client/src/components/documents/EntityDocumentsTab.tsx`
- `frontend-client/src/pages/vehicles/VehicleDetailPage.tsx:241-248`

**À faire (léger) :**
- Exposer l'upload de la carte grise **dès le formulaire d'ajout** (`AddVehicleModal.tsx`), ou afficher un message clair « Ajoutez la carte grise dans l'onglet Documents » après création.
- Aucune nouvelle infra nécessaire — uniquement de l'UX pour rendre la fonctionnalité visible au moment de l'ajout.

### 2.4 — VIN non obligatoire
**Demande client :** ne pas rendre le VIN obligatoire pour l'instant (ne pas surcharger l'utilisateur). Plus tard : récupération auto via scan de carte grise + IA.
**État du code :** ⚠️ VIN **obligatoire** côté front et back, colonne `unique`.
- Front : `frontend-client/src/components/vehicles/AddVehicleModal.tsx:166` (`required`) + `EditVehicleModal.tsx:208`
- Back : `CreateVehicleDto` `@IsNotEmpty()` (~ligne 46) ; `Vehicle.entity.ts:70-71` (`@Column({ unique: true })`)

**À faire :**
- Rendre le VIN optionnel : retirer `required` (front) et `@IsNotEmpty()` → `@IsOptional()` (back `CreateVehicleDto`).
- Rendre la colonne `nullable` ; attention à la contrainte `unique` → utiliser un index unique partiel (ignorer les NULL) pour éviter les conflits sur véhicules sans VIN. Migration nécessaire.
- **Backlog / plus tard (à ne pas faire maintenant) :** scan de la carte grise + IA pour pré-remplir VIN et infos véhicule.

---

## PRIORITÉ 3 — Tarifs & marketplace

### 3.1 — Harmoniser les tarifs sur la grille de la landing (image 2) + Stripe
**Demande client :** suivre les packages de l'image 2 (flotteq.fr/#pricing) et les répercuter dans le système. **Décision validée : la grille de l'image 2 est la référence ; on met à jour le backend et Stripe en conséquence.**
**État du code :** ⚠️ **3 sources divergentes** :
- Landing : `frontend-landing/src/data/pricing.ts` → Starter Gratuit / Pro 29€ / Business 79€ / Enterprise sur devis
- Backend (seed, source de vérité actuelle) : `backend/src/seeds/seed.ts:797-855` → Freemium 0€ / Starter 29€ / Business 99€ / Enterprise 299€
- Hardcodé obsolète (à supprimer) : `frontend-client/src/types/subscription.types.ts:12-61` + `frontend-driver/src/types/subscription.types.ts`
- Register : récupère déjà dynamiquement via `GET /subscriptions/plans` ✅

**Grille cible (image 2) :**

| Plan | Prix | Véhicules | Cible |
|---|---|---|---|
| Starter | Gratuit (0€) | jusqu'à 3 | démarrage / particuliers 1-3 véhicules |
| Pro ⭐ | 29 €/mois | jusqu'à 10 | TPE et particuliers exigeants (« le plus populaire ») |
| Business | 79 €/mois | jusqu'à 50 | PME multi-conducteurs / multi-utilisateurs |
| Enterprise | Sur devis | illimité | flottes > 50 véhicules, besoins spécifiques |

**À faire :**
- Mettre à jour le **seed/entité backend** pour refléter exactement cette grille (noms, prix, limite véhicules ; conserver/définir limites users & conducteurs cohérentes — à confirmer car non visibles sur l'image 2, l'image étant tronquée).
- Mettre à jour les **produits/prix Stripe** correspondants (Starter gratuit = pas de paiement, Pro 29€, Business 79€, Enterprise = manuel/sur devis), et lier les `priceId` Stripe aux plans.
- Supprimer les données hardcodées obsolètes dans `frontend-client` et `frontend-driver` (`subscription.types.ts:12-61`).
- Vérifier que `GET /subscriptions/plans` renvoie bien la nouvelle grille → register + landing affichent la même chose.
- ⚠️ À confirmer avec le client : limites exactes **utilisateurs** et **conducteurs** par plan (non visibles sur l'image 2).

### 3.2 — Recherche de garages : filtre par type de réparation
**Demande client :** pouvoir filtrer les garages par type de réparation recherchée (ex : remplacement de disques de frein), pas seulement par distance.
**État du code :** ✅ Backend prêt : entité `partner-service.entity.ts`, filtre `serviceType` déjà dans `search.service.ts:146-150`. ⚠️ Le champ **n'est pas exposé dans l'UI** et il n'existe **pas de liste prédéfinie** de prestations.
- Backend : `backend/src/modules/partners/dto/search-partners.dto.ts:58` + `search.service.ts`
- Front : `frontend-client/src/components/marketplace/SearchFilters.tsx` (manque le filtre)

**À faire :**
- Ajouter dans `SearchFilters.tsx` un filtre par type de prestation/réparation (en plus de la distance).
- Définir une liste de prestations courantes (disques/plaquettes de frein, vidange, pneus, distribution, révision, CT…) pour standardiser, tout en gardant la recherche texte libre.
- Brancher ce filtre sur le `serviceType` existant du backend.

---

## PRIORITÉ 4 — Administration : équipe interne FlotteQ

### 4.1 — Gestion des employés internes FlotteQ
**Demande client :** il manque la gestion des employés internes FlotteQ dans l'administration.
**État du code :** ✅ La base existe largement : rôles `SUPER_ADMIN` / `SUPPORT` (tenant FlotteQ), page `UsersListPage` (créer/lister/modifier/activer/désactiver), permissions hiérarchisées, audit `@Auditable`.
- `frontend-internal/src/pages/users/UsersListPage.tsx` + `CreateUserModal.tsx`
- `backend/src/entities/user.entity.ts:20-25` (enum rôles) · `backend/src/modules/users/`

**À faire :**
- Créer une vue dédiée **« Équipe FlotteQ »** dans l'admin, filtrée sur les utilisateurs internes (tenant FlotteQ, rôles SUPER_ADMIN / SUPPORT) — réutiliser la page Users existante avec un filtre, pas de réécriture.
- Permettre la création d'un employé interne avec choix du rôle (SUPER_ADMIN / SUPPORT) et activer/désactiver.
- (Optionnel / backlog) : journal d'audit visible dans l'UI, 2FA pour comptes admin.

---

## PRIORITÉ 5 — Landing (contenu)

### 5.1 — Mention « Réservation entretien » (particuliers)
**Demande client :** ajouter « Réservation entretien » à la carte « Pour les particuliers » (annotation manuscrite sur l'image).
**État du code :** ✅ La fonctionnalité de réservation **existe déjà** (`frontend-client/src/pages/bookings/*`, module `backend/src/modules/bookings/`). Il manque juste la mention marketing.
- `frontend-landing/src/data/audiences.ts:41-45` (features « Pour les particuliers »)

**À faire :**
- Ajouter une feature « Réservation d'entretien en ligne » dans le tableau `features` de la carte particuliers (`audiences.ts`).

### 5.2 — Cohérence cartes « Conducteurs en entreprise »
**Demande client (déduit des surlignages) :** vérifier que les fonctionnalités annoncées existent : Véhicule assigné en un coup d'œil, Rapports d'état des lieux photo, Planning des trajets.
**À faire :**
- Vérifier dans `frontend-driver` que ces 3 fonctionnalités existent réellement ; sinon, soit les implémenter, soit ajuster le discours de la landing pour ne promettre que l'existant.

### 5.3 — Formulaire d'inscription : champs « Nom de l'entreprise » & « Email professionnel »
**Demande client (déduit des surlignages images 4-5) :** clarifier ces deux champs.
**État du code :** « Nom de l'entreprise » et « Email professionnel » sont **obligatoires**, mais **aucune validation** ne rejette les emails personnels (gmail, etc.).
- `frontend-client/src/pages/auth/RegisterPage.tsx:264-291` · `backend/src/core/auth/dto/register.dto.ts:11-16`

**À faire (à valider avec le client) :**
- Décider si « Email professionnel » doit réellement refuser les domaines perso (gmail/hotmail…) ou rester un simple email. Si oui : ajouter une validation de domaine côté DTO backend + message front.
- Confirmer si « Nom de l'entreprise » doit rester obligatoire (cas particuliers sans société ?).

---

## Récapitulatif effort estimé

| # | Tâche | Effort | Type |
|---|---|---|---|
| 1.1 | Retirer Admin des espaces publics | Faible | Correctif |
| 1.2 | Retirer Supprimer + ajouter Désactiver/Bannir (admin) | Moyen | Front + Back |
| 2.1 | Statut partenaire « incomplete » | Moyen | Back + migration + Front |
| 2.2 | Écran admin vérification documents partenaires | Moyen | Front + Back |
| 2.3 | Carte grise visible à l'ajout véhicule | Faible | Front (UX) |
| 2.4 | VIN optionnel | Faible/Moyen | Front + Back + migration |
| 3.1 | Harmoniser tarifs (image 2) + Stripe | Moyen | Back + Stripe + cleanup |
| 3.2 | Filtre garage par réparation | Moyen | Front (back prêt) |
| 4.1 | Vue « Équipe FlotteQ » | Faible | Front (réutilise existant) |
| 5.1 | Mention « Réservation entretien » | Très faible | Contenu |
| 5.2 | Vérif features conducteurs | Faible | Vérif/contenu |
| 5.3 | Validation email pro / nom entreprise | Faible | À valider d'abord |

**Points à confirmer avec le client avant dev :**
- Limites utilisateurs / conducteurs par plan tarifaire (image 2 tronquée).
- Email professionnel : refus des domaines perso, oui/non ?
- « Banni » vs « Désactivé » côté admin : deux états distincts ou un seul ?
