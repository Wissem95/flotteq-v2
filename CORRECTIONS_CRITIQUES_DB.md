# 🔧 CORRECTIONS CRITIQUES - Configuration Base de Données

**Date** : 19 Janvier 2025
**Priorité** : CRITIQUE - À appliquer AVANT tout déploiement

---

## 🚨 PROBLÈMES DÉTECTÉS

### Problème 1 : Incohérence variables DB (CRITIQUE)

**Fichiers concernés** :
- `backend/src/app.module.ts` (ligne 51-53)
- `backend/src/config/migration.config.ts` (ligne 11-13)
- `backend/.env`

**Incohérence** :
```typescript
// app.module.ts utilise :
username: configService.get('DB_USER', 'postgres'),
database: configService.get('DB_NAME', 'flotteq_dev'),

// migration.config.ts utilise :
username: process.env.DB_USERNAME || 'postgres',  // ❌ DIFFÉRENT
database: process.env.DB_DATABASE || 'flotteq_dev',  // ❌ DIFFÉRENT

// .env actuel :
DB_USER=postgres       // ✅ OK
DB_NAME=flotteq_dev    // ✅ OK
```

**Impact** :
- Migrations NE FONCTIONNERONT PAS en production
- Erreur : "role DB_USERNAME does not exist"

---

### Problème 2 : Redis manquant dans docker-compose.yml

**Constat** :
- Backend utilise Bull Queue pour emails (redis requis)
- `.env` a `REDIS_HOST=localhost` et `REDIS_PORT=6379`
- `docker-compose.yml` n'a PAS de service Redis !

**Impact** :
- Emails ne s'enverront pas en production Docker
- Jobs Bull Queue échoueront

---

### Problème 3 : Uploads non persistants

**Constat** :
- `backend/uploads/` contient 7.1GB de données
- Pas de volume Docker configuré pour uploads
- En cas de redéploiement container, uploads perdus !

---

## ✅ CORRECTIONS À APPLIQUER

### Correction 1 : Unifier les variables DB

#### Option A : Modifier migration.config.ts (RECOMMANDÉ)

**Fichier** : `backend/src/config/migration.config.ts`

**AVANT (lignes 11-13)** :
```typescript
username: process.env.DB_USERNAME || 'postgres',
password: process.env.DB_PASSWORD || 'flotteq123',
database: process.env.DB_DATABASE || 'flotteq_dev',
```

**APRÈS (utiliser DB_USER et DB_NAME)** :
```typescript
username: process.env.DB_USER || 'postgres',
password: process.env.DB_PASSWORD || 'flotteq123',
database: process.env.DB_NAME || 'flotteq_dev',
```

**Commande** :
```bash
# Éditer le fichier
nano backend/src/config/migration.config.ts

# Remplacer DB_USERNAME → DB_USER
# Remplacer DB_DATABASE → DB_NAME
```

#### Vérification :
```bash
cd backend
npm run migration:show
# ✅ Devrait afficher les migrations sans erreur
```

---

### Correction 2 : Ajouter Redis dans docker-compose.production.yml

**Note** : Redis est DÉJÀ inclus dans le `docker-compose.production.yml` créé dans Sprint D0-004.

**Vérifier** :
```bash
grep -A 10 "redis:" docker-compose.production.yml
```

**Résultat attendu** :
```yaml
redis:
  image: redis:7-alpine
  container_name: flotteq_redis_prod
  restart: always
  command: redis-server --requirepass ${REDIS_PASSWORD}
  volumes:
    - redis_data:/data
  networks:
    - flotteq_network
```

✅ **Déjà corrigé dans les sprints !**

---

### Correction 3 : Configurer uploads volume persistent

**Fichier** : `docker-compose.production.yml`

**Vérifier que le backend a bien** :
```yaml
backend:
  # ...
  volumes:
    - uploads_data:/app/uploads  # ✅ Volume persistant
```

**Vérifier que le volume est déclaré** :
```yaml
volumes:
  postgres_data:
    driver: local
  redis_data:
    driver: local
  uploads_data:    # ✅ Volume uploads
    driver: local
```

✅ **Déjà corrigé dans docker-compose.production.yml du Sprint D0-004 !**

---

## 🔍 VÉRIFICATIONS SUPPLÉMENTAIRES

### Vérification 1 : Variables .env cohérentes

**Fichier actuel** : `backend/.env`

**Variables utilisées dans le code** :
```env
# Database (app.module.ts)
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres           # ✅ Utilisé par app.module.ts
DB_PASSWORD=flotteq123
DB_NAME=flotteq_dev        # ✅ Utilisé par app.module.ts

# Redis (Bull Queue)
REDIS_HOST=localhost
REDIS_PORT=6379

# ⚠️ MANQUE : REDIS_PASSWORD (optionnel en dev, obligatoire prod)
```

**Action** : Ajouter dans `.env.production.example` :
```env
REDIS_PASSWORD=CHANGEME_STRONG_REDIS_PASSWORD
```

✅ **Déjà inclus dans Sprint D1-001 !**

---

### Vérification 2 : TypeORM config cohérente

**app.module.ts** (lignes 45-60) :
```typescript
TypeOrmModule.forRootAsync({
  imports: [ConfigModule],
  useFactory: (configService: ConfigService) => ({
    type: 'postgres',
    host: configService.get('DB_HOST', 'localhost'),      // ✅
    port: configService.get('DB_PORT', 5432),             // ✅
    username: configService.get('DB_USER', 'postgres'),   // ✅
    password: configService.get('DB_PASSWORD', 'flotteq123'), // ✅
    database: configService.get('DB_NAME', 'flotteq_dev'), // ✅
    // ...
    synchronize: configService.get('NODE_ENV') !== 'production', // ✅ FALSE en prod
    migrationsRun: configService.get('NODE_ENV') === 'production', // ✅ TRUE en prod
  }),
```

✅ **Configuration correcte !**

---

### Vérification 3 : Migrations path

**app.module.ts** (ligne 57) :
```typescript
migrations: ['dist/migrations/*.js'],  // ✅ Compile en dist/
```

**migration.config.ts** (ligne 15) :
```typescript
migrations: [join(__dirname, '..', 'migrations', '*.{ts,js}')],  // ✅ OK
```

✅ **Paths cohérents !**

---

## 🛠️ ACTIONS À FAIRE MAINTENANT

### Action 1 : Corriger migration.config.ts (URGENT)

```bash
# Ouvrir le fichier
nano backend/src/config/migration.config.ts

# Ligne 11 : Remplacer
DB_USERNAME → DB_USER

# Ligne 13 : Remplacer
DB_DATABASE → DB_NAME

# Sauvegarder (Ctrl+X, Y, Enter)

# Tester
cd backend
npm run migration:show
# ✅ Devrait fonctionner sans erreur
```

### Action 2 : Vérifier que Redis sera bien déployé

```bash
# Vérifier docker-compose.production.yml
grep -A 15 "redis:" docker-compose.production.yml

# ✅ Devrait afficher la config Redis
```

### Action 3 : Tester la connexion DB locale

```bash
cd backend
npm run start:dev

# Dans un autre terminal
curl http://localhost:3000/api/health

# ✅ Devrait retourner : {"status":"ok","database":"connected"}
```

---

## 📋 CHECKLIST FINALE

Avant de déployer en production, vérifier :

### Base de données
- [ ] `migration.config.ts` utilise `DB_USER` (pas `DB_USERNAME`)
- [ ] `migration.config.ts` utilise `DB_NAME` (pas `DB_DATABASE`)
- [ ] `npm run migration:show` fonctionne
- [ ] Migrations s'exécutent : `npm run migration:run`

### Redis
- [ ] `docker-compose.production.yml` a un service `redis:`
- [ ] `.env.production` a `REDIS_PASSWORD` défini
- [ ] Backend peut se connecter : logs montrent "Redis connected"

### Uploads
- [ ] `docker-compose.production.yml` a volume `uploads_data`
- [ ] Backend monte `/app/uploads`
- [ ] Permissions correctes (user `node` peut écrire)

### Variables d'environnement
- [ ] `.env` utilise `DB_USER` (pas `DB_USERNAME`)
- [ ] `.env` utilise `DB_NAME` (pas `DB_DATABASE`)
- [ ] `.env.production.example` est à jour
- [ ] Tous les `CHANGEME` remplacés en production

---

## 🎯 RÉSUMÉ DES INCOHÉRENCES

| Fichier | Variable incorrecte | Variable correcte | Statut |
|---------|-------------------|------------------|--------|
| `migration.config.ts` | `DB_USERNAME` | `DB_USER` | ❌ À corriger |
| `migration.config.ts` | `DB_DATABASE` | `DB_NAME` | ❌ À corriger |
| `docker-compose.yml` | Pas de Redis | Redis manquant | ✅ Corrigé dans production |
| `docker-compose.yml` | Pas volume uploads | Volume manquant | ✅ Corrigé dans production |

---

## 🚀 APRÈS CORRECTIONS

Une fois les corrections appliquées :

```bash
# 1. Commit les changements
git add backend/src/config/migration.config.ts
git commit -m "fix: unify DB variable names (DB_USER, DB_NAME)"

# 2. Tester les migrations
cd backend
npm run migration:show
npm run migration:run

# 3. Tester l'application complète
npm run start:dev

# 4. Vérifier healthcheck
curl http://localhost:3000/api/health

# 5. Continuer avec les sprints déploiement
```

---

## 📞 QUESTIONS ?

Si après ces corrections, tu rencontres des erreurs :

1. **Erreur "role DB_USERNAME does not exist"**
   → Migration config pas corrigé, refaire Action 1

2. **Erreur Redis connection**
   → Vérifier que Redis tourne : `docker ps | grep redis`

3. **Uploads disparus après redéploiement**
   → Vérifier volume dans docker-compose : `docker volume ls`

---

**Ces corrections sont CRITIQUES pour que la production fonctionne !**

Applique-les AVANT d'exécuter les sprints de déploiement.
