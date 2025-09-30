# Guide des Migrations TypeORM

## Vue d'ensemble
Ce système de migrations permet de gérer l'évolution du schéma de base de données de manière sûre et versionnée, particulièrement critique pour les déploiements en production.

## Développement

### Créer une migration après modification des entités

1. **Modifier vos entités** (fichiers `*.entity.ts`)
2. **Générer la migration automatiquement** :
   ```bash
   npm run migration:generate -- src/migrations/NomDeLaMigration
   ```
3. **Vérifier le fichier généré** dans `src/migrations/`
4. **Tester la migration** :
   ```bash
   npm run migration:run
   ```

### Créer une migration manuelle

Pour des modifications personnalisées qui ne peuvent pas être détectées automatiquement :
```bash
npm run migration:create -- src/migrations/NomDeLaMigration
```

### Commandes utiles

- **Voir les migrations** :
  ```bash
  npm run migration:show
  ```
- **Annuler la dernière migration** :
  ```bash
  npm run migration:revert
  ```
- **Supprimer toutes les tables** (⚠️ ATTENTION) :
  ```bash
  npm run migration:drop
  ```

## Production

### ⚠️ Règles de sécurité CRITIQUES

1. **JAMAIS utiliser `synchronize: true` en production**
   - Le paramètre est automatiquement désactivé via `NODE_ENV !== 'production'`
   - Risque de perte de données si activé

2. **Toujours tester en staging avant production**
   - Créer un environnement de staging identique à la production
   - Valider les migrations sur des données réelles

3. **TOUJOURS faire un backup avant migration**
   ```bash
   pg_dump -h localhost -U postgres -d flotteq_prod > backup_$(date +%Y%m%d_%H%M%S).sql
   ```

### Processus de déploiement

1. **Backup de la base de données**
2. **Déployer le code**
3. **Exécuter le script de déploiement** :
   ```bash
   NODE_ENV=production ./scripts/deploy.sh
   ```

Le script `deploy.sh` :
- Vérifie que `NODE_ENV=production`
- Exécute les migrations automatiquement
- Démarre l'application

### Auto-exécution en production

Avec la configuration actuelle :
```typescript
migrationsRun: configService.get('NODE_ENV') === 'production'
```

Les migrations s'exécutent **automatiquement au démarrage** en production. Cela garantit que le schéma est toujours à jour.

## Tests des migrations

### Script de test automatique

```bash
cd backend
./scripts/test-migrations.sh
```

Ce script :
1. Sauvegarde l'état actuel de la DB
2. Drop toutes les tables
3. Exécute toutes les migrations
4. Vérifie que les tables existent

### Validation pre-deploy

Vérifier qu'il n'y a pas de migrations en attente :
```bash
ts-node src/migrations/validate.ts
```

## Rollback en cas de problème

### Annuler la dernière migration

```bash
npm run migration:revert
```

### Restaurer depuis un backup

```bash
psql -h localhost -U postgres -d flotteq_prod < backup_20250930_123456.sql
```

## Structure des fichiers

```
backend/
├── src/
│   ├── config/
│   │   └── migration.config.ts    # Configuration TypeORM CLI
│   ├── entities/
│   │   └── *.entity.ts            # Définition des entités
│   └── migrations/
│       ├── .gitkeep
│       ├── validate.ts            # Script de validation
│       └── [timestamp]-*.ts       # Fichiers de migration
├── scripts/
│   ├── deploy.sh                  # Script de déploiement production
│   └── test-migrations.sh         # Script de test des migrations
└── MIGRATIONS.md                  # Ce fichier
```

## Bonnes pratiques

1. **Toujours générer les migrations** plutôt que de les écrire manuellement
2. **Nommer les migrations de manière descriptive** : `AddDriversTable`, `AddVehicleMileageColumn`
3. **Tester les migrations en local** avant de commit
4. **Ne jamais modifier une migration déjà déployée** en production
5. **Versionner les migrations** avec git
6. **Documenter les migrations complexes** avec des commentaires

## Environnements

### Développement
- `synchronize: true` (modifications automatiques du schéma)
- Pas de migrations obligatoires (mais recommandées pour tester)

### Production
- `synchronize: false` (OBLIGATOIRE)
- `migrationsRun: true` (exécution automatique au démarrage)
- Toutes les modifications passent par des migrations

## Dépannage

### Migration échoue avec une erreur de syntaxe SQL
- Vérifier le fichier de migration généré
- Modifier manuellement si nécessaire
- Re-tester avec `npm run migration:run`

### Tables ne correspondent pas aux entités
- Vérifier que toutes les migrations ont été exécutées : `npm run migration:show`
- Générer une nouvelle migration : `npm run migration:generate`

### Besoin de réinitialiser complètement
```bash
npm run migration:drop    # Supprime toutes les tables
npm run migration:run     # Recrée depuis zéro
```

## Support

Pour toute question ou problème :
1. Consulter la [documentation TypeORM](https://typeorm.io/migrations)
2. Vérifier les logs de l'application
3. Contacter l'équipe DevOps