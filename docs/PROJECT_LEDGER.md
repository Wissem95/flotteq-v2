# État de livraison FlotteQ

Mis à jour : 2026-09-23
Coordinateur : FlotteQ · Orchestration
Dépôt : `/Users/wissem/Flotteq-v2`, branche `codex/production-beta-fixes-20260913`

## Objectif et périmètre

Rendre le SaaS FlotteQ exploitable commercialement, avec parcours client, partenaire, conducteur et administration, abonnements SaaS Stripe, emails transactionnels et déploiement VPS. Prix convenus : Pro 29 € TTC/mois, Business 79 € TTC/mois. Stripe Connect et paiements aux partenaires exclus du lancement.

## Autorisations

- A0 : inspection, corrections locales, tests, builds et vérification web en lecture seule autorisés.
- A1 : commit, push et déploiement production non autorisés dans cette tâche.
- A2 : paiement réel, modification de secrets/configuration production, décision juridique/fiscale ou envoi d'un nouvel email à une personne non autorisés sans accord précis.
- Aucun secret ni aucune donnée client réelle à recopier dans cet état.

## État actuel observé

| Élément | État | Preuve |
|---|---|---|
| SHA actuellement servi sur le VPS | NON VÉRIFIÉ | SSH reste bloqué par l'absence d'empreinte approuvée par une source indépendante. Le healthcheck public de l'ancienne version expose seulement la version statique `2.0.0`, sans SHA. Le correctif local ajoutera `build` après publication. |
| Disponibilité web/API | 8 URL HTTPS, statut 200 | Six fronts (`flotteq.fr`, app, driver, partner, admin, portal), `/api/health` et `/api/subscriptions/plans`, vérifiés le 2026-09-23. Health retourne `status=ok`, base `connected`, Redis `not_checked`. |
| Empreinte des bundles publics | 5 bundles différents, 1 identique au build local | Comparaison SHA-256 des scripts JS servis et des fichiers produits localement : landing, client, driver, partner et admin diffèrent; portal correspond. Les modifications locales ne sont pas publiées. |
| Déploiement historique | PROUVÉ | Le journal GitHub CD `35744725450` montre l'exécution de `deploy-production.sh` sur le VPS le 22/09/2026, avec `Commit: abf6be8`, backend, PostgreSQL et Redis healthy puis healthcheck public OK. Les six frontends étaient encore `health: starting` au moment de l'instantané. |
| Conteneurs production actuels | NON VÉRIFIÉ | Le journal CD est une preuve historique, pas une inspection actuelle. Aucun accès SSH avec empreinte validée indépendamment n'a été obtenu dans cette session. |
| Email de test | succès rapporté par l'utilisateur | message utilisateur, non renvoyé ni revalidé pendant cette vérification |
| Stripe | parcours code/API et offres visibles, aucune transaction réelle effectuée | aucune preuve d'encaissement réel |
| Modifications locales | présentes, non publiées | `git status`, branche de travail |

## Corrections locales préparées

- Alignement des prix et textes marketing TTC, suppression des promesses de versement partenaire au lancement.
- Réactivation/extension de la CI et couverture des tests de plusieurs frontends.
- CI backend rendue déterministe : lint de contrôle sans réécriture, services PostgreSQL et Redis jetables, E2E terminées par `--forceExit`, et CD déclenché seulement après un CI réussi sur `main`.
- Déploiement verrouillé sur le SHA validé par le CI, plutôt que sur le dernier état de `main` au moment de l'exécution.
- Healthcheck backend : vrai `PING` Redis avec authentification lorsque Redis est activé, et exposition du SHA `BUILD_SHA` injecté par le script de déploiement.
- Sonde Docker des six frontends configurée sur IPv4 loopback.
- Parcours Checkout client plus sûr, vérification du statut actif avant confirmation, portail client pour gérer/changer l'offre.
- Sélection de l'offre Pro depuis l'inscription, URL API de production corrigée et exemples de configuration harmonisés.
- Parcours d'inscription conducteur redirigé vers Checkout lorsque requis.
- Dashboard backend basé sur le stockage réellement utilisé, autorisations document durcies et journalisation PII retirée.
- Inscription partenaire alignée sur les catégories backend, envoi obligatoire du justificatif PDF/JPG/PNG (5 Mo max), stockage privé et vérification admin avec contrôle du partenaire et du document.
- Corrections migrations : rôle utilisateur, table et enums documents, enum de statut partenaire, tables opérationnelles, colonnes/types/enums core, état actif utilisateur, unicité email par tenant et offres canoniques. Les migrations locales vont jusqu'à `1763001100000` (46 migrations).
- L’échec de mise en file de l’email de bienvenue ne transforme plus une inscription déjà validée en erreur HTTP.
- Les routes racine `GET /` de l'API sont publiques, le middleware locataire n'exige plus d'en-tête pour cette réponse générique.

## Vérifications locales déjà effectuées

- Backend unitaire : 33 suites, 400/400 tests verts (2026-09-23), dont le healthcheck PostgreSQL, Redis authentifié et SHA de build.
- Backend E2E sur PostgreSQL et Redis locaux jetables, avec les variables du CI et `NODE_ENV=test` : 13 suites, 100 tests actifs verts, 1 ignoré (2026-09-23). L'isolation Redis de la suite e-mail a été ajoutée après reproduction d'un conflit pendant l'exécution complète. Jest signale encore des handles Bull/Redis ouverts en fin de test, d'où `--forceExit`; les parcours passent mais l'hygiène de fermeture reste à améliorer.
- Parcours partenaire E2E complet : inscription en attente, refus de connexion avant approbation, listing et consultation admin du justificatif, approbation document/partenaire, connexion réussie, téléchargement anonyme refusé (401), téléchargement admin PDF autorisé (200). Données synthétiques et fichier de test nettoyés.
- Client : 19 fichiers, 87/87 tests. Conducteur : 15 fichiers, 78/78. Partenaire : 3 fichiers, 15/15.
- Builds backend et des six frontends passent. Internal, Landing et Portal n'exposent pas de script de test dans leur `package.json`. Avertissements non bloquants : bundles volumineux (client, driver, partner, admin) et données Browserslist/Baseline anciennes.
- `npm run lint:check` backend passe sans `--fix`; `git diff --check` passe. Les 14 erreurs de formatage détectées dans le commit publié ont été normalisées localement, sans toucher aux fichiers déjà modifiés par le travail en cours.
- 46 migrations appliquées sur PostgreSQL 15 jetable. `schema:log` affiche `Your schema is up to date - there are no queries to be executed by schema synchronization.` Cela prouve la parité sur une base fraîche locale, pas sur la base production.
- GitHub : `origin/main` et `HEAD` correspondent au commit publié `abf6be826468bfc8e5fe9032c9e96660cc58c40e`. Le CI GitHub de ce SHA a échoué sur 10 suites E2E puis est resté ouvert près de six heures avant annulation. Le CD du même SHA a néanmoins été lancé en parallèle et a réussi. Les correctifs locaux n'ont aucun statut GitHub tant qu'ils ne sont pas publiés.
- Production en lecture seule : les six domaines frontaux, `/api/health` et `/api/subscriptions/plans` répondent HTTP 200. Health indique `status=ok`, PostgreSQL `connected`, Redis `not_checked`, version statique `2.0.0` sans SHA.
- SHA-256 des bundles publics comparés aux builds locaux : différents pour Landing, Client, Driver, Partner et Admin; identiques pour Portal. Ceci confirme que cinq fronts ne servent pas les artefacts actuellement construits localement. Le SHA backend servi reste inconnu.
- Aucun commit, push, PR, déploiement, changement de secret ou paiement réel n'a été effectué.

Incident SMTP de test, résolu pour les validations suivantes : un E2E antérieur avait tenté une connexion Gmail depuis la configuration `.env` locale. Les journaux montraient un rejet d'authentification 535; aucune livraison acceptée n'a été observée. `NODE_ENV=test` utilise maintenant Nodemailer JSON et le parcours onboarding remplace le provider e-mail; le run complet E2E ultérieur n'a pas fait d'envoi externe.

## Écarts et blocages prouvés

| Écart | Preuve | Prochaine étape |
|---|---|---|
| Liens Documentation, Sécurité, Statut, Mentions légales, CGU, CGV et RGPD pointent vers `#` | `frontend-landing/src/components/Footer.tsx` | Fournir/valider les contenus et coordonnées légales, puis publier des routes/liens réels. Ne rien inventer. |
| CI GitHub non verte pour les modifications actuelles | Le CI publié a échoué sur 10 suites E2E et a été annulé après environ six heures. Localement, 400 tests unitaires, 100 E2E actifs et le lint de contrôle passent; le worktree reste non publié. | Une publication autorisée est nécessaire pour déclencher la CI GitHub sur ce lot. Aucun push n'a été fait. |
| CD de l'ancien pipeline non conditionné par le CI | Le CD `35744725450` a déployé `abf6be8` alors que le CI `35744725533` du même SHA a été annulé. | Correction locale : `workflow_run` conditionné à un CI réussi et déploiement du SHA précis. À publier et observer dans GitHub. |
| SHA backend servi et santé des conteneurs actuels non établis | Le healthcheck public sans SHA et le contrôle SSH bloqué ne permettent pas d'identifier le runtime actuel. | Publier le champ `build`, obtenir l'empreinte SSH par une source de confiance, puis inspecter le VPS en lecture seule. |
| Cinq fronts servis diffèrent des builds locaux | SHA-256 bundle différent pour landing, client, driver, partner et admin; portal correspond | Publier les corrections après autorisation, puis comparer les bundles et sondes après déploiement. |
| Redis de production n'est pas contrôlé par le healthcheck actuellement servi | Réponse publique `/api/health`: `redis=not_checked`; le code publié renvoie cette valeur statiquement. | Correctif local avec `PING` Redis authentifié, à publier puis vérifier via le healthcheck public. |
| Handles Bull/Redis ouverts après les E2E | Le run E2E jetable est vert, mais Jest émet `MaxListenersExceededWarning` puis requiert `--forceExit`. Le diagnostic isolé montre 11 listeners Bull par type sur la connexion et des rejets `Connection is closed` lors de `app.close()` sans fermeture explicite de la queue. | Identifier le cycle de fermeture Bull/Nest et fermer la queue une seule fois dans le montage E2E, puis retirer `--forceExit`. Cela n'empêche pas les parcours testés de passer. |
| Une unicité globale email subsistait malgré la contrainte par tenant prévue par User | La base neuve contenait toujours `UQ_97672ac88f789774dd47f7c8be3 UNIQUE(email)`; l'ancienne migration ne supprimait que `UQ_users_email` | Migration locale forward-only `1763001000000-AlignUserEmailUniqueness`; test transactionnel synthétique validé, sans données conservées. |
| Lint frontend hors CI incomplet | Tests/builds des trois frontends sans suite de test passent; internal, landing et portal n'ont pas de script de test déclaré. | Ajouter séparément un périmètre lint/test cohérent aux apps qui en sont dépourvues après revue des conventions existantes. |
| Corrections non publiées | production à `abf6be8`, changements présents uniquement dans le worktree | préparer puis demander l'autorisation de déployer exactement ce lot; ne pas prétendre que la production contient les corrections. |
| Encaissement réel non prouvé | aucune transaction par carte réelle | ne faire qu'après accord explicite juste avant l'opération, avec montant et compte de test contrôlés. |

## Prochain lot

1. Faire vérifier l'empreinte SSH par une source de confiance, puis inspecter le SHA et les conteneurs de production en lecture seule.
2. Obtenir l'autorisation de publier les changements pour que GitHub exécute une CI sur le diff actuel.
3. Si déploiement autorisé, comparer les artefacts servis et les états de santé post-déploiement.
4. Valider les contenus légaux avec le propriétaire. Aucun paiement réel sans accord distinct.
