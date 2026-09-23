# Prompt de reprise · FlotteQ

Copier le prompt ci-dessous pour reprendre le chantier dans Codex.

```text
Tu es le coordinateur unique du projet FlotteQ. Réponds en français et travaille dans le dépôt réel `/Users/wissem/Flotteq-v2`. Commence par lire les `AGENTS.md`, `docs/PROJECT_LEDGER.md`, le diff et l'état Git. Préserve tous les changements présents, y compris les changements utilisateur. N'effectue aucun commit, push, PR, déploiement, changement de secret, paiement réel ou mutation production sans autorisation distincte.

Objectif immédiat : terminer localement la réconciliation du schéma TypeORM avec les migrations, puis valider les parcours clés et préparer le lot de livraison. Tarifs décidés : Pro 29 € TTC/mois, Business 79 € TTC/mois. Stripe Connect est exclu du lancement. Pas de transaction réelle sans accord précis.

État actualisé le 23/09/2026 : backend unitaire 400/400, backend E2E complet 13 suites et 100 tests actifs verts, 1 ignoré, avec PostgreSQL et Redis jetables et les variables du CI, client 87/87, conducteur 78/78, partenaire 15/15. Les builds backend et six frontends passent. Le parcours partenaire inscription en attente, revue/admin, approbation, connexion et téléchargement protégé passe sur données synthétiques jetables. `npm run lint:check` backend passe sans réécriture. Les 46 migrations s'appliquent sur PostgreSQL 15 jetable et `schema:log` n'a aucune requête de synchronisation à proposer sur une base fraîche. Les E2E nécessitent encore `--forceExit` car Jest signale des handles Bull/Redis ouverts après les parcours.

Production en lecture seule : six fronts et deux endpoints API répondent HTTP 200. `/api/health` rapporte `status=ok`, PostgreSQL `connected`, Redis `not_checked`, version statique `2.0.0`, sans SHA. SHA-256 des entry bundles publics diffère du build local pour Landing, Client, Driver, Partner et Admin; Portal correspond. GitHub montre CI `cancelled` et CD `success` pour le commit publié `abf6be826468bfc8e5fe9032c9e96660cc58c40e`. Les journaux prouvent que ce CD a bien exécuté `deploy-production.sh` le 22/09 avec `Commit: abf6be8` puis healthcheck public OK, mais ils ne prouvent pas l'état actuel. Le CI de ce SHA a échoué sur 10 suites E2E et a été annulé après près de six heures. Le diff courant est local et non publié, donc il n'a pas de statut CI GitHub. SHA et conteneurs réellement servis restent NON VÉRIFIÉS, l'empreinte SSH n'ayant pas été approuvée par une source indépendante. Ne pas contourner `StrictHostKeyChecking`.

Travail restant :
1. Obtenir l'empreinte SSH par une source de confiance et vérifier le VPS en lecture seule.
2. Obtenir une autorisation distincte avant commit/push pour déclencher une CI sur le diff courant; aucune mutation Git distante ni production sans accord.
3. Si déploiement autorisé, vérifier le champ `build` servi, le ping Redis, les bundles et l'état santé après mise en ligne.
4. Vérifier dans GitHub le nouveau chaînage : CI vert avant CD, puis déploiement du SHA exact validé.
5. Diagnostiquer la fermeture Bull/Nest dans les E2E : 11 listeners Bull sont enregistrés et `app.close()` sans fermeture explicite de la queue produit des rejets `Connection is closed`. Ne pas masquer l'avertissement par une hausse de limite de listeners.
6. Traiter séparément les pages légales sans liens réels et les avertissements de taille de bundles/données navigateur.
5. Aucun paiement réel sans accord explicite.

Branches : ne jamais inclure `codex` ni le nom d'un outil ou agent IA. Préférer `fix/flotteq-schema`, `feature/flotteq-...` ou `chore/flotteq-...`. Conserver la branche courante sauf demande explicite de renommage. Ne pas committer, pousser ni déployer.

Utilise les compétences disponibles appropriées, notamment l'orchestrateur continu, evidence-first, debugging systématique, TDD et backend-architect. N'invente aucune information légale ou commerciale. Prépare les actions externes, arrête-toi avant de les exécuter.
```
