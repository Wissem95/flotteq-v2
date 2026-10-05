# État de livraison FlotteQ

Mis à jour : 2026-09-25
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

## Actualisation facturation, 2026-09-23

- PROUVÉ en production, sans carte ni encaissement : les prix Stripe live associés à Pro et Business ouvrent une session Checkout en mode abonnement, avec respectivement 2 900 et 7 900 centimes EUR. Chaque session de contrôle a été expirée immédiatement, avant création de client et paiement.
- PROUVÉ dans le code : `PATCH /api/subscriptions/change-plan/:planId` modifiait localement un abonnement sans opération Stripe. Correctif local préparé : la route renvoie désormais vers le portail Stripe, et le webhook `customer.subscription.updated` synchronise le prix Stripe vers le plan et l'abonnement locaux.
- PROUVÉ en configuration Stripe : un portail client live par défaut est actif, avec gestion du moyen de paiement, des factures, de la résiliation et l'option de changement de prix activée. La configuration conserve la proratisation immédiate des hausses et la planification à fin de période des baisses. La liste explicite des produits n'est pas renvoyée par cette version de l'API Stripe après mise à jour, donc la sélection visuelle d'une offre dans une session portail reste à observer avec un abonnement synthétique sans paiement.
- Vérifications locales du correctif : nouveaux tests rouges observés puis 19/19 tests Stripe et abonnements ciblés verts. La suite backend complète est verte : 35 suites et 405 tests. Build backend vert et lint de contrôle vert.

## Correctif webhook, 2026-09-23

- PROUVÉ sur Stripe live, sans carte ni débit : un client synthétique en essai et son abonnement Pro ont déclenché les événements Stripe `customer.subscription.created`, `invoice.payment_succeeded` et `customer.subscription.deleted`, tous reçus par le backend de production. Les données synthétiques ont été annulées puis supprimées.
- CONTREDIT : ces webhooks ne pouvaient pas être traités jusqu'au bout. PostgreSQL de production ne contenait pas `tenants.trial_ends_at`, alors que l'entité Tenant la sélectionne, ce qui provoquait une réponse d'erreur webhook.
- Correctif local préparé : migration additive `1763001200000-EnsureTenantTrialEndsAt`, sans suppression ni transformation de données. Elle a été exécutée avec succès sur une base PostgreSQL jetable qui simulait cette colonne absente.
- Vérifications du correctif : 36 suites backend et 406 tests verts, lint et build backend verts. Publication et rejet d'un webhook réel restent à effectuer après cette actualisation.

## Publication et contrôle Stripe, 2026-09-23

- PROUVÉ : le commit `dafde78` est servi par `api.flotteq.fr`. Le healthcheck confirme PostgreSQL et Redis connectés, et les conteneurs applicatifs sont `healthy`.
- PROUVÉ : la migration additive `EnsureTenantTrialEndsAt1763001200000` est enregistrée en production et la colonne `tenants.trial_ends_at` est présente en `timestamp without time zone`.
- PROUVÉ : le portail Stripe live par défaut est actif. Le changement d'offre par prix, la résiliation, les moyens de paiement et l'historique des factures sont activés.
- PROUVÉ : un webhook signé par le secret de production, envoyé à l'URL publique, reçoit `200 {\"received\":true}` et est traité sans erreur SQL. Le client et l'abonnement synthétiques utilisés, sans carte et en essai, ont été annulés puis supprimés.
- CONTREDIT : une seconde route authentifiée, `POST /api/subscriptions`, permettait encore de créer localement un abonnement actif sans Checkout. Un test rouge l'a reproduite au niveau contrôleur. Le correctif interdit désormais cette route, sans modifier l'inscription ni Checkout.
- NON VÉRIFIÉ : une livraison Stripe autonome post-correctif, visible dans le Dashboard, ainsi qu'un débit par carte réelle. Le premier nécessite seulement une lecture Dashboard, le second un accord explicite juste avant une transaction financière.

## Reprise commerciale, 2026-09-24

- PROUVÉ : `api.flotteq.fr/api/health` et le dépôt servi par le VPS correspondent au commit `1b5fed7`. PostgreSQL et Redis sont connectés. Les services applicatifs possédant une sonde sont `healthy`; Certbot est démarré sans sonde déclarée.
- PROUVÉ : le footer public expose encore des liens `#` pour Documentation, Sécurité, Statut, Mentions légales, CGU, CGV et RGPD. Aucun contenu légal n'a été inventé ni modifié.
- PROUVÉ : aucune option `automatic_tax`, code fiscal, collecte d'identifiant TVA ou paramètre de taxe manuel n'est présente dans le code des parcours Checkout et abonnement. La collecte automatique n'est donc pas activée par cette intégration.
- PROUVÉ dans l’aperçu du portail Stripe live : Pro à 29 € TTC/mois et Business à 79 € TTC/mois sont les deux choix affichés lors du changement d’offre. Pro est sélectionnée et Business est sélectionnable. Cet aperçu ne constitue pas un achat ni une session client réelle.
- PROUVÉ dans ce même aperçu : l’en-tête de marque affiché est `BELPRE LOCATION`, tandis que les offres sont nommées FlotteQ Pro et FlotteQ Business. Le choix d’une éventuelle harmonisation de marque exige l’accord du propriétaire et n’a pas été modifié.
- PROUVÉ dans Stripe live, après accord explicite du propriétaire : le mémo par défaut des factures, PDF, e-mails de facturation et pages de paiement est `FlotteQ, solution de gestion de flotte éditée par BELPRE LOCATION.` Le réglage a été relu après rechargement. Les prix, la TVA et les moyens de paiement n’ont pas été modifiés.
- PROUVÉ dans le Dashboard Stripe live : la destination active `FlotteQ production SaaS` pointe vers `https://api.flotteq.fr/api/stripe/webhook` et écoute `checkout.session.completed`, `customer.subscription.created`, `customer.subscription.deleted`, `customer.subscription.updated`, `invoice.payment_failed`, `invoice.payment_succeeded` et `payment_intent.succeeded`.
- PROUVÉ dans les livraisons Stripe : les cinq tentatives HTTP 400 du 23/09 concernent trois événements, `customer.subscription.created`, `invoice.payment_succeeded` et `customer.subscription.deleted`. Le Dashboard marque chacune de ces trois livraisons « récupéré » après des renvois automatiques. La dernière tentative de l’événement facture inspecté répond HTTP 200 avec `{\"received\":true}` et porte le même identifiant d’événement que la tentative initiale. Il n’y a donc aucune livraison perdue démontrée dans ce groupe d’erreurs.
- PROUVÉ dans Stripe Tax live, sans modification : le siège social est en France, une catégorie par défaut de service électronique B2B est configurée et le comportement d’inclusion de taxe est automatique. Stripe affiche « Activer Tax » et confirme qu’aucune immatriculation fiscale française n’est ajoutée, donc aucune taxe ne sera collectée par Stripe Tax tant que cette immatriculation n’est pas fournie et que Tax n’est pas activé.
- PROUVÉ dans le code et dans un événement Stripe inspecté : `automatic_tax` est désactivé pour l’abonnement observé. Aucune collecte automatique n’est active par l’intégration actuelle.
- PROUVÉ via Pappers le 24/09 : l’entité choisie pour facturer est BELPRE LOCATION, SASU active, SIREN `952 175 529`, SIRET `952 175 529 00017`, RCS Pontoise `952 175 529`, capital social 1 000 €, siège au 5 rue Berthie Albrecht, 95210 Saint-Gratien, présidée par Sylvain Prenol. Pappers affiche aussi le numéro de TVA `FR80952175529`. Source : https://www.pappers.fr/entreprise/blprloc-belpre-location-952175529
- NON VÉRIFIÉ : le régime de TVA effectivement applicable à la vente du SaaS, l’autorisation d’utiliser ce numéro pour activer une immatriculation Stripe Tax et le mode de facturation à retenir. Une fiche Pappers et un numéro de TVA ne remplacent pas la confirmation de BELPRE LOCATION ou de son expert-comptable. Stripe Tax demeure désactivé.
- BLOQUÉ, contenu légal : les liens publics restent des `#`. Les données Pappers suffisent à préparer l’identité de l’éditeur, mais ne fournissent pas les décisions requises pour publier des CGU, CGV, politique RGPD, cookies, sécurité, statut et documentation, notamment les finalités/durées de conservation, sous-traitants, cookies, canal d’incident, disponibilité promise, règles de support, droit applicable et règlement des litiges. Aucun texte juridique n’a été inventé ni publié.
- NON VÉRIFIÉ : une véritable session de portail d’un client payé et tout encaissement par carte réelle. Aucune configuration Stripe n’a été changée durant ce contrôle.

## Lot information et consentement, 2026-09-25

- PROUVÉ localement : le site vitrine contient maintenant huit routes publiques, `/mentions-legales`, `/cgu`, `/cgv`, `/rgpd`, `/cookies`, `/securite`, `/statut` et `/documentation`. Le footer les relie sans lien factice. Les routes acceptent aussi une barre oblique finale. Le serveur Vite local a répondu HTTP 200 pour chacune et les tests de rendu ont passé.
- PROUVÉ localement : les pages affichent l’identité communiquée de BELPRE LOCATION, les offres FlotteQ Pro et Business, le support, les principes de confidentialité, cookies, sécurité, statut et documentation. Les CGV prévoient un formulaire de rétractation et l’accès immédiat demandé par le consommateur. Ces textes sont des projets locaux, non publiés et non soumis à une validation juridique externe.
- PROUVÉ localement : l’inscription demande le type de client, l’acceptation des CGU et de la politique de confidentialité. Pour un particulier, la demande expresse d’accès immédiat est obligatoire. Le backend refuse les inscriptions sans ces consentements et enregistre, dans une nouvelle table `legal_acceptances`, les versions acceptées, le type de client et la demande d’accès immédiat dans la même transaction que la création du compte.
- PROUVÉ localement : 36 suites backend et 409 tests passent, ainsi que le build Nest. Client : 19 fichiers et 88 tests passent. Landing : 2 tests, lint et build passent. Les sorties de test contiennent des journaux d’erreur attendus de scénarios simulés, sans échec de test.
- NON VÉRIFIÉ : l’E2E complet de ce lot n’a pas été relancé. Sa configuration ne déclare pas de base de données explicitement jetable et peut prendre les variables PostgreSQL par défaut. Il ne doit pas être exécuté avant d’avoir prouvé son isolation.
- NON VÉRIFIÉ : rendu visuel automatisé dans un navigateur local. Le navigateur Chromium attendu par Playwright n’est pas installé sur ce Mac. Les routes HTTP et le rendu React testé prouvent la disponibilité fonctionnelle locale, pas une inspection visuelle.
- BLOQUÉ avant publication commerciale : identifier le médiateur de la consommation applicable et faire relire les textes légaux par BELPRE LOCATION ou son conseil, notamment la conservation des données, les sous-traitants, le droit applicable et la médiation. Ces informations ne sont pas déductibles du code ni de Pappers.
- PROUVÉ localement : `npm audit --omit=dev` ne remonte aucune vulnérabilité dans les 49 dépendances de production de la vitrine. Le verrouillage des dépendances a été actualisé sans changement majeur. Deux vulnérabilités modérées subsistent dans Vitest et son mocker, utilisés uniquement pour les tests ; leur seul correctif proposé est la montée majeure vers Vitest 5, non effectuée sans migration dédiée.
- Aucune modification Stripe, DNS, secret, commit, push ou déploiement n’a été effectuée pour ce lot.

## Validation E2E isolée, 2026-09-25

- PROUVÉ : PostgreSQL local déclaré dans `.env` n’était pas accessible, donc aucun test ne pouvait l’utiliser. Une base PostgreSQL neuve `flotteq_test` et un Redis neufs ont été créés dans deux conteneurs temporaires distincts, sur des ports locaux dédiés. Aucun conteneur applicatif ou de production n’a été touché.
- PROUVÉ : les 48 migrations ont été appliquées avec succès depuis une base PostgreSQL vide, dont `CreateLegalAcceptances1763100000000`.
- PROUVÉ : le premier run E2E a isolé deux suites incompatibles avec le nouveau contrat d’inscription. Elles n’envoyaient pas `customerType`, l’acceptation des CGU, l’acceptation RGPD et la demande d’accès immédiat. Les scénarios ont été alignés avec le contrat professionnel puis les deux suites ont passé.
- PROUVÉ : après recréation complète de PostgreSQL et Redis, la suite E2E intégrale a passé : 13 suites, 100 tests verts, 1 ignoré. Elle se termine encore avec `--forceExit` et émet les avertissements Bull déjà connus sur les handles ouverts.
- NON VÉRIFIÉ : inspection visuelle automatisée dans un navigateur local. L’outil navigateur requis est incomplet sur cet environnement, après l’absence de Chromium déjà observée. Les routes HTTP et les tests de rendu React restent verts, mais ne remplacent pas une inspection visuelle.
- PROUVÉ par la documentation officielle : BELPRE LOCATION ne peut pas désigner un médiateur de la consommation de sa seule initiative. Il faut une convention ou une adhésion préalable avec un médiateur référencé par la CECMC et compétent pour l’activité. CNPM Médiation Consommation et CM2C figurent dans la liste officielle, mais aucun rattachement de BELPRE à l’un d’eux n’a été observé. Ne pas publier leurs coordonnées avant la signature correspondante.

## Lot Analytics Umami, 2026-10-01

- PROUVÉ localement : l'admin contient une route protégée `/analytics` et une entrée de navigation « Analytics » qui ouvre le tableau de bord séparé `https://analytics.flotteq.fr` avec `noopener noreferrer`.
- PROUVÉ localement : la vitrine charge le script Umami uniquement lorsque l'hôte et l'identifiant du site sont fournis au build. Le script est ajouté une seule fois et limité aux domaines `flotteq.fr,www.flotteq.fr`.
- PROUVÉ localement : le déploiement Docker prépare Umami `3.4.0`, une base PostgreSQL 15 distincte, un volume persistant distinct, quatre secrets obligatoires, un healthcheck et le reverse proxy TLS `analytics.flotteq.fr`. Le certificat wildcard existant couvre ce sous-domaine, mais aucun enregistrement DNS public `analytics.flotteq.fr` n'a été observé pendant ce contrôle.
- PROUVÉ par un test d'intégration jetable : PostgreSQL et Umami sont devenus `healthy`; `/api/heartbeat` et `/script.js` ont répondu HTTP 200. Le bootstrap a remplacé le mot de passe administrateur initial, qui reçoit ensuite HTTP 401, vérifié le nouveau mot de passe en HTTP 200, créé une seule propriété `flotteq.fr` et renvoyé le même identifiant lors d'une seconde exécution. Les conteneurs et volumes temporaires ont ensuite été supprimés.
- PROUVÉ localement : les deux tests admin, les quatre tests Landing, les deux builds et le lint ciblé du lot passent. `npm audit` de l'admin ne remonte aucune vulnérabilité après mise à jour compatible des dépendances directes et transitives concernées.
- PROUVÉ, limite existante : le lint complet de l'admin échoue encore sur 58 erreurs antérieures et indépendantes de ce lot. Le bundle admin reste supérieur à 500 kB après minification.
- NON VÉRIFIÉ en production : Umami n'est ni publié ni démarré sur le VPS; aucun secret persistant, enregistrement DNS, compte administrateur de production ou identifiant de site n'a été créé. Le script de déploiement est préparé pour sécuriser le compte, créer ou retrouver la propriété, enregistrer son identifiant et reconstruire la vitrine, mais cette séquence n'a pas été exécutée sur le VPS.
- Aucune modification Stripe, DNS, secret de production, commit, push ou déploiement n'a été effectuée pour ce lot. Le fichier personnel `.claude/settings.local.json` reste exclu du lot.

## Intégration Analytics dans l'administration, 2026-10-05

- PROUVÉ publiquement avant ce nouveau lot : l'API de production sert le build `907ec36e5e3a6e852f3e03729975b42f7d26ea36`, PostgreSQL et Redis sont connectés, et `https://analytics.flotteq.fr/api/heartbeat` répond `{"ok":true}`.
- PROUVÉ localement par un cycle de tests rouge puis vert : une route super-administrateur `GET /api/dashboard/internal/analytics?days=30` agrège les statistiques Umami et leur évolution quotidienne. Le mot de passe et le jeton Umami restent côté backend et ne figurent pas dans la réponse.
- PROUVÉ localement : la page `/analytics` de l'administration affiche pages vues, visiteurs, sessions, taux de rebond et évolution quotidienne. Elle possède des états de chargement et d'indisponibilité, une actualisation manuelle et conserve le lien vers le tableau de bord Umami complet.
- PROUVÉ localement : une indisponibilité ou une configuration incomplète d'Umami renvoie une erreur isolée `503` sur cette route analytique. Le backend ne dépend pas du conteneur Umami pour démarrer.
- PROUVÉ localement avec Node.js `24.21.0` : 36 suites backend et 413 tests unitaires passent. Sur PostgreSQL et Redis jetables, les 48 migrations puis 13 suites E2E passent avec 100 tests actifs et 1 ignoré. Les conteneurs temporaires ont ensuite été supprimés. L'avertissement connu sur les handles Bull ouverts et `--forceExit` subsiste.
- PROUVÉ localement avec Node.js `24.21.0` : Client 88 tests, Partenaire 15, Conducteur 78, Landing 4, Administration 2. Les six builds frontend, le build backend et les deux tests du bootstrap Umami passent. Le lint Client passe avec 11 avertissements et le lint ciblé Administration passe.
- PROUVÉ localement : le lint ciblé des fichiers administration modifiés passe. Le lint complet de l'administration conserve 57 erreurs antérieures hors de ce lot. Le bundle administration reste supérieur à 500 kB après minification.
- PROUVÉ localement : la configuration Docker Compose de production accepte les variables serveur Umami ajoutées au backend. La validation utilise uniquement des valeurs factices et n'affiche aucun secret réel.
- PROUVÉ par les dépôts officiels GitHub : les références CI ont été alignées sur `actions/checkout@v7`, `actions/setup-node@v7`, `docker/setup-buildx-action@v4`, `docker/build-push-action@v7` et `webfactory/ssh-agent@v0.10.0`. Les jobs Node utilisent Node.js 24 et les deux workflows restent valides en YAML.
- NON VÉRIFIÉ en production lors de ce relevé pré-publication : la route analytique intégrée et l'interface enrichie ne sont pas encore servies publiquement.
- Le fichier personnel `.claude/settings.local.json` est resté inchangé par ce lot et doit rester hors commit.
