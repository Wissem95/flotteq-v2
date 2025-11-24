# ✅ Réponses à tes questions

## Question 1 : Pourquoi pas mettre les seeders dans le dossier `seeds` existant ?

**Réponse : Tu as 100% raison !**

### Ce que j'ai fait :

❌ **Avant (mauvais)** :
```
backend/
├── src/
│   ├── database/
│   │   └── seeds/          ❌ Nouveau dossier inutile
│   │       ├── tenant.seed.ts
│   │       └── run-seeds.ts
│   └── seeds/
│       └── seed.ts         ✅ Fichier existant
```

✅ **Après (corrigé)** :
```
backend/
└── src/
    └── seeds/
        ├── seed.ts         ✅ Fichier principal modifié
        └── tenant.seed.ts  ✅ Juste pour référence (optionnel)
```

### Modifications effectuées :

1. ✅ **Intégré les tenants dans `seed.ts` existant**
   - Ajouté import `Tenant` et `TenantStatus`
   - Ajouté fonction `createTenants()`
   - Ajouté appel `await createTenants(dataSource)` AVANT `createUsers()`
   - Ajouté `TRUNCATE TABLE tenants CASCADE`

2. ✅ **Supprimé le dossier `database/seeds/`**

3. ✅ **Nettoyé `package.json`**
   - Supprimé `seed:tenants` (inutile maintenant)
   - Gardé uniquement `npm run seed` qui fait TOUT

### Utilisation maintenant :

```bash
# Une seule commande pour tout créer
npm run seed

# Ordre d'exécution :
# 1. TRUNCATE toutes les tables
# 2. Créer 3 tenants (FlotteQ, Transport Express, Logistique Rapide)
# 3. Créer 15 users (5 par tenant)
# 4. Créer 15 drivers (5 par tenant)
# 5. Créer 15 vehicles (5 par tenant)
# 6. Créer 30 maintenances
```

---

## Question 2 : Où est la DB locale et comment la conteneuriser ?

### 🗄️ Configuration actuelle

Ta base de données est **DÉJÀ conteneurisée** avec Docker !

**Fichier** : `docker-compose.yml` (à la racine du projet)

```yaml
services:
  postgres:
    image: postgres:15-alpine
    container_name: flotteq_db        # ⭐ Nom du container
    ports:
      - "5432:5432"                   # ⭐ Port exposé
    environment:
      POSTGRES_USER: postgres         # ⭐ User
      POSTGRES_PASSWORD: flotteq123   # ⭐ Password
      POSTGRES_DB: flotteq_dev        # ⭐ Database
    volumes:
      - flotteq_data:/var/lib/postgresql/data  # ⭐ Données persistantes
```

### 📍 Où sont stockées les données ?

Les données PostgreSQL sont dans un **volume Docker** :

```bash
# Nom du volume
flotteq_data

# Localisation physique (macOS/Linux)
/var/lib/docker/volumes/flotteq_data/_data

# Voir les infos du volume
docker volume inspect flotteq_data
```

### 🚀 Commandes essentielles

#### 1. Démarrer PostgreSQL

```bash
# Depuis la racine du projet
docker-compose up postgres -d

# Vérifier qu'il tourne
docker ps | grep flotteq_db

# Voir les logs
docker logs flotteq_db
```

#### 2. Se connecter à la DB

**Option A : Via Docker**
```bash
docker exec -it flotteq_db psql -U postgres -d flotteq_dev
```

**Option B : Via psql local**
```bash
psql -h localhost -p 5432 -U postgres -d flotteq_dev
# Password: flotteq123
```

**Option C : Via GUI (recommandé)**
- **TablePlus** : https://tableplus.com/ (gratuit, super UX)
- **DBeaver** : https://dbeaver.io/ (gratuit, complet)
- **pgAdmin** : https://www.pgadmin.org/ (gratuit, officiel)

**Credentials** :
```
Host: localhost
Port: 5432
Database: flotteq_dev
User: postgres
Password: flotteq123
```

#### 3. Setup complet (première fois)

```bash
# 1. Démarrer PostgreSQL
docker-compose up postgres -d

# 2. Attendre qu'il soit prêt (10-15 secondes)
sleep 15

# 3. Exécuter les migrations
cd backend
npm run migration:run

# 4. Créer les données de test
npm run seed

# 5. Vérifier
docker exec -it flotteq_db psql -U postgres -d flotteq_dev -c "SELECT COUNT(*) FROM tenants;"
# ✅ Devrait afficher 3
```

#### 4. Workflow quotidien

```bash
# Démarrer la DB (si arrêtée)
docker-compose start postgres

# Démarrer le backend en local (hot reload)
cd backend
npm run start:dev

# Arrêter proprement
docker-compose stop postgres
```

#### 5. Reset complet (⚠️ efface tout)

```bash
# Supprimer toutes les données
docker-compose down -v

# Recréer from scratch
docker-compose up postgres -d
sleep 15
cd backend
npm run migration:run
npm run seed
```

### 🔍 Vérifier les données

```bash
# Se connecter
docker exec -it flotteq_db psql -U postgres -d flotteq_dev

# Lister les tables
\dt

# Voir les tenants
SELECT id, name, email, status FROM tenants;

# Stats par tenant
SELECT
  t.name,
  COUNT(DISTINCT u.id) as users,
  COUNT(DISTINCT v.id) as vehicles,
  COUNT(DISTINCT d.id) as drivers
FROM tenants t
LEFT JOIN users u ON u.tenant_id = t.id
LEFT JOIN vehicles v ON v.tenant_id = t.id
LEFT JOIN drivers d ON d.tenant_id = t.id
GROUP BY t.name;

# Quitter
\q
```

### 📦 Backup et Restore

**Sauvegarder** :
```bash
# Backup complet
docker exec -t flotteq_db pg_dump -U postgres flotteq_dev > backup_$(date +%Y%m%d).sql

# Backup compressé
docker exec -t flotteq_db pg_dump -U postgres flotteq_dev | gzip > backup.sql.gz
```

**Restaurer** :
```bash
# Depuis un fichier SQL
docker exec -i flotteq_db psql -U postgres -d flotteq_dev < backup.sql

# Depuis un fichier compressé
gunzip -c backup.sql.gz | docker exec -i flotteq_db psql -U postgres -d flotteq_dev
```

---

## 🎯 Résumé

### 1. Seeders ✅
- Tout intégré dans `src/seeds/seed.ts`
- Une seule commande : `npm run seed`
- Ordre : Tenants → Users → Drivers → Vehicles → Maintenances

### 2. Base de données ✅
- Déjà conteneurisée avec Docker
- Volume persistant : `flotteq_data`
- Commande principale : `docker-compose up postgres -d`
- Connexion : `localhost:5432` / `postgres` / `flotteq123`

### 3. Workflow dev recommandé ✅
```bash
# Terminal 1 - DB
docker-compose up postgres -d

# Terminal 2 - Backend
cd backend
npm run start:dev

# Terminal 3 - Commandes SQL
docker exec -it flotteq_db psql -U postgres -d flotteq_dev
```

---

## 📚 Documentation complète

J'ai créé un guide détaillé : **[GUIDE_DATABASE_SETUP.md](./GUIDE_DATABASE_SETUP.md)**

Ce guide contient :
- 🔧 Toutes les commandes Docker
- 📊 Requêtes SQL utiles
- 🐛 Troubleshooting
- 🚀 Migration vers production
- 📦 Backup/Restore
- 🔍 Monitoring

---

## ✅ Actions à faire maintenant

```bash
# 1. Vérifier que Docker est installé
docker --version

# 2. Démarrer PostgreSQL
docker-compose up postgres -d

# 3. Vérifier que ça tourne
docker ps | grep flotteq_db

# 4. Exécuter les migrations
cd backend
npm run migration:run

# 5. Créer les données
npm run seed

# 6. Vérifier dans la DB
docker exec -it flotteq_db psql -U postgres -d flotteq_dev -c "SELECT name, email, status FROM tenants;"

# ✅ Tu devrais voir 3 tenants :
# 1. FlotteQ (active)
# 2. Transport Express Paris (active)
# 3. Logistique Rapide (trial)
```

---

**Questions résolues ✅**
- Seeders déplacés et intégrés
- DB expliquée et documentée
- Workflow complet fourni
