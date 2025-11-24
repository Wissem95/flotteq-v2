# Architecture FlotteQ - Décisions Techniques

**Date** : Novembre 2025
**Version** : v2.0
**Stack** : NestJS + React + PostgreSQL + Redis

---

## 🎯 Orchestration : Docker ✅

### Architecture principale (Production)

**Orchestrateur choisi** : **Docker Compose**

**Justification :**
- ✅ Multi-services isolés (9 containers)
- ✅ Portabilité complète (dev = prod)
- ✅ Scaling horizontal facile
- ✅ Gestion centralisée (un seul `docker-compose`)
- ✅ Rollback rapide (images versionnées)
- ✅ Standard moderne et bien documenté

### Services containerisés (9 containers)

1. **postgres** - Base de données PostgreSQL 15
2. **redis** - Cache + Bull Queue
3. **backend** - API NestJS (port 3000)
4. **frontend-client** - App tenant (React + Vite)
5. **frontend-partner** - App partenaires/garages
6. **frontend-driver** - App conducteurs
7. **frontend-internal** - App administrative FlotteQ
8. **nginx** - Reverse proxy (SSL, rate limiting)
9. **certbot** - Gestion certificats SSL Let's Encrypt

### Commandes Docker principales

```bash
# Démarrage complet
docker-compose -f docker-compose.production.yml up -d

# Scaler le backend (4 instances)
docker-compose -f docker-compose.production.yml up -d --scale backend=4

# Vérifier status
docker-compose -f docker-compose.production.yml ps

# Logs
docker-compose -f docker-compose.production.yml logs -f backend

# Arrêt
docker-compose -f docker-compose.production.yml down
```

### Avantages pour FlotteQ

| Fonctionnalité | Avantage |
|---------------|----------|
| **Isolation** | Chaque service dans son container (sécurité) |
| **Scaling** | `--scale backend=N` pour + de perf |
| **Portabilité** | Même config dev/staging/prod |
| **Rollback** | `docker-compose up -d backend:v1.2.0` |
| **Healthchecks** | Auto-restart si crash |
| **Logs centralisés** | `docker logs <container>` |
| **Networking** | Réseau interne `flotteq_network` |
| **Volumes** | Données persistantes (postgres, redis, uploads) |

### Déploiement production

```bash
# 1. Build images
docker-compose -f docker-compose.production.yml build

# 2. Push vers registry (optionnel)
docker tag flotteq-backend:latest registry.flotteq.com/backend:v1.0.0
docker push registry.flotteq.com/backend:v1.0.0

# 3. Deploy sur VPS
ssh root@flotteq.com
cd /opt/flotteq
docker-compose -f docker-compose.production.yml pull
docker-compose -f docker-compose.production.yml up -d

# 4. Vérifier healthchecks
docker-compose -f docker-compose.production.yml ps
curl https://api.flotteq.com/api/health
```

### Configuration Nginx reverse proxy

Nginx route les 5 domaines vers les containers correspondants :

| Domaine | Upstream | Service |
|---------|----------|---------|
| api.flotteq.com | backend:3000 | API NestJS |
| app.flotteq.com | frontend-client:80 | App tenant |
| partner.flotteq.com | frontend-partner:80 | App partenaires |
| driver.flotteq.com | frontend-driver:80 | App conducteurs |
| admin.flotteq.com | frontend-internal:80 | App admin |

Fonctionnalités Nginx :
- ✅ SSL/TLS (Let's Encrypt)
- ✅ HTTP → HTTPS redirect
- ✅ Rate limiting (10r/s API, 20r/s frontends)
- ✅ Gzip compression
- ✅ Security headers (HSTS, X-Frame-Options)
- ✅ Cache assets statiques (1 an)
- ✅ WebSocket support

---

## 🔄 Alternative : PM2 (Optionnel)

### Cas d'usage

**Utiliser PM2 uniquement si :**
- ⚠️ VPS unique avec ressources limitées (< 2GB RAM)
- ⚠️ Préférence Node.js natif (pas Docker)
- ⚠️ Besoin clustering backend seulement

**Note** : Non recommandé pour FlotteQ car l'architecture multi-services bénéficie davantage de Docker.

### Architecture PM2

```
VPS
├── Nginx (installé sur VPS, pas containerisé)
├── PostgreSQL (installé sur VPS ou Docker seul)
├── Redis (installé sur VPS ou Docker seul)
└── Backend NestJS (géré par PM2 en clustering)
    ├── Instance 1 (CPU 1)
    ├── Instance 2 (CPU 2)
    ├── Instance 3 (CPU 3)
    └── Instance 4 (CPU 4)
```

### Commandes PM2

```bash
# Démarrage
cd /opt/flotteq
./scripts/start-pm2.sh

# ⚠️ Warning affiché :
# "PM2 est une alternative à Docker"
# "Architecture recommandée : Docker"

# Si confirmation, PM2 démarre
pm2 status
pm2 logs flotteq-api
pm2 monit
pm2 reload flotteq-api  # Zero-downtime
```

### Documentation PM2 complète

Voir **[docs/alternatives/PM2_GUIDE.md](./alternatives/PM2_GUIDE.md)** pour :
- Installation PM2
- Configuration ecosystem.config.js
- Clustering multi-core
- Logs et monitoring
- Déploiement et rollback

### Comparaison Docker vs PM2

| Critère | Docker | PM2 |
|---------|--------|-----|
| **Multi-services** | ✅ Excellente (9 containers) | ❌ Backend seulement |
| **Isolation** | ✅ Complète | ❌ Partage système |
| **Portabilité** | ✅ Dev = Prod | ⚠️ Config VPS différente |
| **Scaling** | ✅ `--scale backend=N` | ✅ Clustering auto |
| **Rollback** | ✅ Images versionnées | ⚠️ Manuel (git checkout) |
| **Complexité** | ⚠️ Moyenne (Docker + Compose) | ✅ Simple (npm install pm2) |
| **RAM overhead** | ⚠️ ~200MB par container | ✅ Léger (~50MB total) |
| **Recommandé pour FlotteQ** | **✅ OUI** | ❌ Non (sauf VPS limité) |

---

## 📊 Architecture Réseau Docker

### Réseau interne

```
flotteq_network (bridge)
├── postgres:5432
├── redis:6379
├── backend:3000
├── frontend-client:80
├── frontend-partner:80
├── frontend-driver:80
├── frontend-internal:80
└── nginx:80,443 (exposé publiquement)
```

### Communication

- **Frontends → Backend** : Via Nginx (`api.flotteq.com/api`)
- **Backend → Postgres** : Connexion directe (`postgres:5432`)
- **Backend → Redis** : Connexion directe (`redis:6379`)
- **Externe → Nginx** : Ports 80 et 443 exposés

### Sécurité

- ✅ Aucun port backend exposé publiquement (sauf via Nginx)
- ✅ Postgres accessible uniquement depuis containers
- ✅ Redis protégé par mot de passe
- ✅ Secrets Docker (db_password via `/run/secrets/`)

---

## 💾 Volumes Persistants

### Données persistantes (survit au `docker-compose down`)

| Volume | Contenu | Backup |
|--------|---------|--------|
| `postgres_data` | Base de données PostgreSQL | ✅ `backup-db.sh` (quotidien) |
| `redis_data` | Cache Redis (optionnel) | ❌ Cache volatile |
| `uploads_data` | Photos véhicules, documents | ✅ `backup-uploads.sh` (hebdo) |
| `certbot/conf` | Certificats SSL | ✅ Critiques |
| `certbot/www` | ACME challenges | ❌ Temporaire |

### Commandes volumes

```bash
# Lister volumes
docker volume ls | grep flotteq

# Inspecter volume
docker volume inspect flotteq-v2_postgres_data

# Backup manuel volume
docker run --rm -v flotteq-v2_postgres_data:/data -v $(pwd):/backup alpine tar -czf /backup/postgres-backup.tar.gz -C /data .

# Restaurer volume
docker run --rm -v flotteq-v2_postgres_data:/data -v $(pwd):/backup alpine tar -xzf /backup/postgres-backup.tar.gz -C /data
```

---

## 🔐 Gestion Secrets

### Secrets Docker (production)

```yaml
secrets:
  db_password:
    file: ./secrets/db_password.txt
```

**Avantages :**
- ✅ Jamais dans .env (pas de commit accidentel)
- ✅ Montés dans `/run/secrets/` (read-only)
- ✅ Isolés par container

**Génération :**
```bash
./scripts/generate-secrets.sh
# Crée secrets/db_password.txt, jwt_*.txt, redis_password.txt
```

### Variables d'environnement (.env.production)

Fichier `.env.production` pour variables non-sensibles :

```env
NODE_ENV=production
DB_HOST=postgres
DB_PORT=5432
DB_USER=flotteq_prod
DB_NAME=flotteq_production

REDIS_HOST=redis
REDIS_PORT=6379
REDIS_ENABLED=true

CORS_ORIGIN=https://app.flotteq.com,https://partner.flotteq.com
FRONTEND_CLIENT_URL=https://app.flotteq.com
PARTNER_FRONTEND_URL=https://partner.flotteq.com

# Secrets référencés depuis files
DB_PASSWORD_FILE=/run/secrets/db_password
REDIS_PASSWORD=${REDIS_PASSWORD}
JWT_ACCESS_SECRET=${JWT_ACCESS_SECRET}
```

---

## 🚀 Prochaine Étape : CI/CD

Voir **Sprint D3 : CI/CD & Déploiement**

Objectifs :
- GitHub Actions workflows (build, test, deploy)
- Scripts déploiement automatisés
- Rollback automatique si échec
- Notifications (Slack/Discord)
- Monitoring (Prometheus + Grafana)

---

## 📚 Documentation Complémentaire

- [SPRINT_D0_COMPLETION_REPORT.md](../SPRINT_D0_COMPLETION_REPORT.md) - Dockerisation
- [SPRINT_D1_COMPLETION_REPORT.md](../SPRINT_D1_COMPLETION_REPORT.md) - Configuration production
- [SPRINT_D2_COMPLETION_REPORT.md](../SPRINT_D2_COMPLETION_REPORT.md) - Infrastructure Nginx
- [PM2_GUIDE.md](./alternatives/PM2_GUIDE.md) - Guide complet PM2 (alternative)
- [CRONTAB_SSL.md](./CRONTAB_SSL.md) - Configuration SSL automatique
- [CRONTAB_BACKUPS.md](./CRONTAB_BACKUPS.md) - Configuration backups automatiques

---

**Architecture validée : Docker Compose ✅**
**Date de décision : Novembre 2025**
