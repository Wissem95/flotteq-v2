# 🗄️ Guide : Base de données locale et conteneurisation

## 📍 Où est ta base de données ?

### Configuration actuelle

Ta base de données PostgreSQL est **conteneurisée avec Docker** :

```yaml
# docker-compose.yml (ligne 4-22)
services:
  postgres:
    image: postgres:15-alpine
    container_name: flotteq_db
    ports:
      - "5432:5432"
    volumes:
      - flotteq_data:/var/lib/postgresql/data  # ⭐ Données persistantes
```

### 🔍 Localisation des données

Les données PostgreSQL sont stockées dans un **volume Docker** :

```bash
# Nom du volume
flotteq_data

# Pour voir les détails du volume
docker volume inspect flotteq_data

# Localisation physique (sur macOS)
/var/lib/docker/volumes/flotteq_data/_data
```

---

## 🚀 Commandes essentielles

### 1. Démarrer la base de données

```bash
# Démarrer uniquement PostgreSQL
docker-compose up postgres -d

# Ou démarrer tous les services
docker-compose up -d
```

### 2. Vérifier l'état

```bash
# Vérifier que le container tourne
docker ps | grep flotteq_db

# Voir les logs de PostgreSQL
docker logs flotteq_db

# Vérifier la santé
docker inspect flotteq_db | grep -A 5 Health
```

### 3. Se connecter à la base de données

#### Option A : Via psql dans le container
```bash
docker exec -it flotteq_db psql -U postgres -d flotteq_dev
```

#### Option B : Via psql local
```bash
psql -h localhost -p 5432 -U postgres -d flotteq_dev
# Mot de passe: flotteq123
```

#### Option C : Via GUI (recommandé)
- **TablePlus** : https://tableplus.com/
- **DBeaver** : https://dbeaver.io/
- **pgAdmin** : https://www.pgadmin.org/

**Configuration de connexion :**
```
Host: localhost
Port: 5432
Database: flotteq_dev
User: postgres
Password: flotteq123
```

### 4. Arrêter/Redémarrer

```bash
# Arrêter la DB (garde les données)
docker-compose stop postgres

# Redémarrer
docker-compose start postgres

# Supprimer le container (mais pas les données)
docker-compose down

# Supprimer TOUT (⚠️ efface les données)
docker-compose down -v
```

---

## 🔧 Gestion des données

### Sauvegarder la base de données

```bash
# Backup complet
docker exec -t flotteq_db pg_dump -U postgres flotteq_dev > backup_$(date +%Y%m%d_%H%M%S).sql

# Backup compressé
docker exec -t flotteq_db pg_dump -U postgres flotteq_dev | gzip > backup_$(date +%Y%m%d_%H%M%S).sql.gz
```

### Restaurer une sauvegarde

```bash
# Restaurer depuis un fichier SQL
docker exec -i flotteq_db psql -U postgres -d flotteq_dev < backup.sql

# Restaurer depuis un fichier compressé
gunzip -c backup.sql.gz | docker exec -i flotteq_db psql -U postgres -d flotteq_dev
```

### Réinitialiser complètement la base

```bash
# 1. Arrêter et supprimer tout
docker-compose down -v

# 2. Recréer la base
docker-compose up postgres -d

# 3. Attendre que PostgreSQL soit prêt (10-15 secondes)
sleep 15

# 4. Exécuter les migrations
cd backend
npm run migration:run

# 5. Créer les données de test
npm run seed
```

---

## 📊 Voir les données actuelles

### Via ligne de commande

```bash
# Se connecter
docker exec -it flotteq_db psql -U postgres -d flotteq_dev

# Lister les tables
\dt

# Voir les tenants
SELECT id, name, email, status FROM tenants;

# Voir les utilisateurs
SELECT id, email, tenant_id FROM users;

# Voir les véhicules
SELECT id, registration, brand, model, tenant_id FROM vehicles;

# Quitter
\q
```

### Requêtes SQL utiles

```sql
-- Statistiques par tenant
SELECT
  t.id,
  t.name,
  COUNT(DISTINCT u.id) as users_count,
  COUNT(DISTINCT v.id) as vehicles_count,
  COUNT(DISTINCT d.id) as drivers_count
FROM tenants t
LEFT JOIN users u ON u.tenant_id = t.id
LEFT JOIN vehicles v ON v.tenant_id = t.id
LEFT JOIN drivers d ON d.tenant_id = t.id
GROUP BY t.id, t.name;

-- Vérifier l'isolation des données
SELECT
  'users' as table_name, tenant_id, COUNT(*) as count
FROM users GROUP BY tenant_id
UNION ALL
SELECT
  'vehicles', tenant_id, COUNT(*)
FROM vehicles GROUP BY tenant_id
UNION ALL
SELECT
  'drivers', tenant_id, COUNT(*)
FROM drivers GROUP BY tenant_id
ORDER BY table_name, tenant_id;
```

---

## 🐳 Conteneurisation complète

### Configuration actuelle

```yaml
services:
  postgres:      # Base de données
  backend:       # API NestJS
```

### Variables d'environnement

**En développement local** (backend/.env) :
```env
DB_HOST=localhost  # ⭐ Pour connexion directe
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=flotteq123
DB_NAME=flotteq_dev
```

**En conteneur** (docker-compose.yml) :
```yaml
environment:
  DB_HOST: postgres  # ⭐ Utilise le nom du service
  DB_PORT: 5432
```

### Modes de démarrage

#### Mode 1 : DB conteneurisée + Backend local (recommandé pour dev)

```bash
# 1. Démarrer uniquement PostgreSQL
docker-compose up postgres -d

# 2. Backend en local
cd backend
npm run start:dev
```

**Avantages :**
- ✅ Hot reload du backend
- ✅ Logs clairs dans le terminal
- ✅ Debugger facilement
- ✅ Pas de rebuild Docker à chaque changement

#### Mode 2 : Tout conteneurisé (pour tester la prod)

```bash
# Démarrer tous les services
docker-compose up -d

# Voir les logs
docker-compose logs -f backend

# Rebuild après changement de code
docker-compose up --build backend -d
```

---

## 🔍 Vérifications après setup

### 1. Vérifier que PostgreSQL tourne

```bash
docker ps | grep flotteq_db
# ✅ Devrait afficher le container
```

### 2. Tester la connexion

```bash
docker exec -it flotteq_db psql -U postgres -c "SELECT version();"
# ✅ Devrait afficher la version PostgreSQL
```

### 3. Vérifier les migrations

```bash
cd backend
npm run migration:show
# ✅ Devrait lister les migrations appliquées
```

### 4. Vérifier les données de seed

```bash
docker exec -it flotteq_db psql -U postgres -d flotteq_dev -c "SELECT COUNT(*) FROM tenants;"
# ✅ Devrait afficher 3 (ou 0 si seed pas exécuté)
```

---

## 🛠️ Dépannage

### Problème : "Connection refused"

```bash
# Vérifier que PostgreSQL est démarré
docker ps | grep flotteq_db

# Si non démarré
docker-compose up postgres -d

# Attendre quelques secondes
sleep 10
```

### Problème : "Port 5432 already in use"

```bash
# Voir ce qui utilise le port
lsof -i :5432

# Si c'est PostgreSQL local
brew services stop postgresql@15

# Ou utiliser un autre port dans docker-compose.yml
ports:
  - "5433:5432"  # Change 5432 en 5433
```

### Problème : "Role postgres does not exist"

```bash
# Recréer complètement le container
docker-compose down -v
docker-compose up postgres -d
```

### Problème : Migrations ne passent pas

```bash
# 1. Vérifier le schéma
docker exec -it flotteq_db psql -U postgres -d flotteq_dev -c "\dt"

# 2. Réinitialiser les migrations (⚠️ efface tout)
npm run migration:drop
npm run migration:run

# 3. Recréer les données
npm run seed
```

---

## 📦 Migration vers production

### Variables d'environnement production

```env
# .env.production
DB_HOST=your-db-host.aws.com
DB_PORT=5432
DB_USER=flotteq_prod
DB_PASSWORD=super_secure_password
DB_NAME=flotteq_production
DB_SSL=true
```

### Docker Compose pour production

```yaml
# docker-compose.prod.yml
services:
  postgres:
    environment:
      POSTGRES_PASSWORD_FILE: /run/secrets/db_password
    secrets:
      - db_password
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./backups:/backups  # Pour les sauvegardes automatiques

secrets:
  db_password:
    external: true
```

---

## 🎯 Résumé des commandes essentielles

```bash
# SETUP INITIAL
docker-compose up postgres -d
cd backend
npm run migration:run
npm run seed

# DÉVELOPPEMENT QUOTIDIEN
docker-compose start postgres   # Démarrer DB
npm run start:dev              # Backend local

# GESTION
docker logs flotteq_db         # Voir logs
docker exec -it flotteq_db psql -U postgres -d flotteq_dev  # SQL
docker-compose down            # Arrêter tout

# RESET COMPLET
docker-compose down -v         # ⚠️ Efface TOUTES les données
docker-compose up postgres -d
npm run migration:run
npm run seed
```

---

## 📚 Ressources

- **PostgreSQL Docs** : https://www.postgresql.org/docs/15/
- **Docker Compose** : https://docs.docker.com/compose/
- **TypeORM Migrations** : https://typeorm.io/migrations
- **psql Cheatsheet** : https://postgrescheatsheet.com/

---

**Dernière mise à jour** : 2025-09-30
