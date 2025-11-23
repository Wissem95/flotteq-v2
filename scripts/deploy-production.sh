#!/bin/bash
set -e

# ==========================================
# Détection automatique du projet FlotteQ
# ==========================================
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Couleurs pour les logs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 FlotteQ Production Deployment${NC}"
echo "=========================================="
echo "Date: $(date)"
echo "User: $(whoami)"
echo "Host: $(hostname)"
echo "Project: $PROJECT_ROOT"
echo ""

# Vérifier qu'on est bien dans le bon dossier
cd "$PROJECT_ROOT"

if [ ! -f "docker-compose.production.yml" ]; then
  echo -e "${RED}❌ Error: docker-compose.production.yml not found${NC}"
  echo "Current directory: $(pwd)"
  exit 1
fi

# Variables
BACKUP_DIR="/var/backups/flotteq/pre-deploy"
LOG_FILE="/var/log/flotteq/deploy-$(date +%Y%m%d_%H%M%S).log"

# Créer dossiers logs
mkdir -p /var/log/flotteq
mkdir -p "$BACKUP_DIR"

# Rediriger stdout et stderr vers log file
exec > >(tee -a "$LOG_FILE")
exec 2>&1

# Fonction de rollback en cas d'erreur
rollback() {
  echo -e "${RED}❌ Deployment failed! Rolling back...${NC}"

  # Restaurer backup DB (si existe)
  if [ -f "$BACKUP_DIR/latest.sql.gz" ]; then
    echo "Restoring database backup..."
    gunzip -c "$BACKUP_DIR/latest.sql.gz" | \
      docker compose -f docker-compose.production.yml exec -T postgres \
      psql -U flotteq_prod -d flotteq_production
  fi

  # Revenir au commit précédent
  git reset --hard HEAD~1

  # Redémarrer les anciens containers
  docker compose -f docker-compose.production.yml up -d

  echo -e "${RED}❌ Rollback completed${NC}"
  exit 1
}

# Trap errors
trap rollback ERR

# ==========================================
# ÉTAPE 1: PRE-DEPLOYMENT CHECKS
# ==========================================
echo -e "${YELLOW}📋 Step 1/7: Pre-deployment checks${NC}"

# Vérifier Docker
if ! docker --version > /dev/null 2>&1; then
  echo -e "${RED}❌ Docker not installed${NC}"
  exit 1
fi

# Vérifier Docker Compose
if ! docker compose version > /dev/null 2>&1; then
  echo -e "${RED}❌ Docker Compose not installed${NC}"
  exit 1
fi

# Vérifier espace disque (minimum 5GB)
AVAILABLE_SPACE=$(df -BG . | tail -1 | awk '{print $4}' | sed 's/G//')
if [ "$AVAILABLE_SPACE" -lt 5 ]; then
  echo -e "${RED}❌ Insufficient disk space: ${AVAILABLE_SPACE}GB (minimum 5GB required)${NC}"
  exit 1
fi

echo -e "${GREEN}✅ Pre-deployment checks passed${NC}"

# ==========================================
# ÉTAPE 2: BACKUP DATABASE
# ==========================================
echo ""
echo -e "${YELLOW}📦 Step 2/7: Backing up database${NC}"

# Backup DB
docker compose -f docker-compose.production.yml exec -T postgres \
  pg_dump -U flotteq_prod flotteq_production | gzip > "$BACKUP_DIR/latest.sql.gz"

BACKUP_SIZE=$(du -h "$BACKUP_DIR/latest.sql.gz" | cut -f1)
echo -e "${GREEN}✅ Database backed up: $BACKUP_SIZE${NC}"

# ==========================================
# ÉTAPE 3: PULL LATEST CODE
# ==========================================
echo ""
echo -e "${YELLOW}📥 Step 3/7: Pulling latest code${NC}"

CURRENT_COMMIT=$(git rev-parse --short HEAD)
echo "Current commit: $CURRENT_COMMIT"

git pull origin main

NEW_COMMIT=$(git rev-parse --short HEAD)
echo "New commit: $NEW_COMMIT"

if [ "$CURRENT_COMMIT" == "$NEW_COMMIT" ]; then
  echo "⚠️  No new changes"
else
  echo -e "${GREEN}✅ Code updated${NC}"
fi

# ==========================================
# ÉTAPE 4: BUILD DOCKER IMAGES
# ==========================================
echo ""
echo -e "${YELLOW}🏗️  Step 4/7: Building Docker images${NC}"

# Build images (sans cache pour prod)
docker compose -f docker-compose.production.yml build --no-cache

echo -e "${GREEN}✅ Images built successfully${NC}"

# ==========================================
# ÉTAPE 5: RUN DATABASE MIGRATIONS
# ==========================================
echo ""
echo -e "${YELLOW}📊 Step 5/7: Running database migrations${NC}"

# Démarrer temporairement Postgres si pas actif
docker compose -f docker-compose.production.yml up -d postgres

# Attendre que Postgres soit prêt
echo "Waiting for PostgreSQL..."
sleep 10

# Run migrations via backend container
docker compose -f docker-compose.production.yml run --rm backend npm run migration:run

echo -e "${GREEN}✅ Migrations completed${NC}"

# ==========================================
# ÉTAPE 6: DEPLOY SERVICES (Zero-downtime)
# ==========================================
echo ""
echo -e "${YELLOW}🚀 Step 6/7: Deploying services${NC}"

# Démarrer Redis si pas actif
docker compose -f docker-compose.production.yml up -d redis

# Backend (force recreate pour charger nouveau code)
echo "Deploying backend..."
docker compose -f docker-compose.production.yml up -d --force-recreate --no-deps backend

# Attendre que le backend soit healthy
echo "Waiting for backend health check..."
sleep 30

# Vérifier healthcheck
BACKEND_HEALTH=$(docker inspect flotteq_backend_prod --format='{{.State.Health.Status}}' 2>/dev/null || echo "unknown")
if [ "$BACKEND_HEALTH" != "healthy" ] && [ "$BACKEND_HEALTH" != "unknown" ]; then
  echo -e "${RED}❌ Backend health check failed: $BACKEND_HEALTH${NC}"
  rollback
fi

# Frontends (un par un pour éviter downtime)
echo "Deploying frontend-client..."
docker compose -f docker-compose.production.yml up -d --force-recreate --no-deps frontend-client

echo "Deploying frontend-partner..."
docker compose -f docker-compose.production.yml up -d --force-recreate --no-deps frontend-partner

echo "Deploying frontend-driver..."
docker compose -f docker-compose.production.yml up -d --force-recreate --no-deps frontend-driver

echo "Deploying frontend-internal..."
docker compose -f docker-compose.production.yml up -d --force-recreate --no-deps frontend-internal

# Nginx (reload configuration sans downtime)
echo "Reloading Nginx..."
docker compose -f docker-compose.production.yml exec nginx nginx -s reload 2>/dev/null || echo "Nginx reload skipped (not running)"

echo -e "${GREEN}✅ All services deployed${NC}"

# ==========================================
# ÉTAPE 7: POST-DEPLOYMENT CHECKS
# ==========================================
echo ""
echo -e "${YELLOW}🏥 Step 7/7: Post-deployment health checks${NC}"

# Attendre 10 secondes
sleep 10

# Check API health
API_HEALTH=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/api/health 2>/dev/null || echo "000")
if [ "$API_HEALTH" != "200" ]; then
  echo -e "${RED}❌ API health check failed: HTTP $API_HEALTH${NC}"
  rollback
fi

echo -e "${GREEN}✅ API health check passed (HTTP 200)${NC}"

# ==========================================
# ÉTAPE 8: CLEANUP
# ==========================================
echo ""
echo -e "${YELLOW}🧹 Cleaning up old images${NC}"

# Supprimer images non utilisées (plus de 7 jours)
docker image prune -a -f --filter "until=168h"

# Supprimer vieux backups (> 30 jours)
find "$BACKUP_DIR" -name "*.sql.gz" -type f -mtime +30 -delete

echo -e "${GREEN}✅ Cleanup completed${NC}"

# ==========================================
# SUCCESS
# ==========================================
echo ""
echo "=========================================="
echo -e "${GREEN}✅ DEPLOYMENT SUCCESSFUL!${NC}"
echo "=========================================="
echo "Commit: $NEW_COMMIT"
echo "Date: $(date)"
echo "Log file: $LOG_FILE"
echo ""
echo "📋 Services status:"
docker compose -f docker-compose.production.yml ps
echo ""
echo "🌐 URLs:"
echo "  - API: https://api.flotteq.com/api/health"
echo "  - App: https://app.flotteq.com"
echo "  - Partner: https://partner.flotteq.com"
echo "  - Driver: https://driver.flotteq.com"
echo "  - Admin: https://admin.flotteq.com"
echo ""
