#!/bin/bash
set -e

# ==========================================
# Script de déploiement FlotteQ sur IP
# Sans SSL/Nginx - Pour tests et présentations
# ==========================================

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Détection du projet
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

echo -e "${BLUE}╔════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   FlotteQ - Déploiement sur IP (HTTP)     ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${YELLOW}Date:${NC} $(date)"
echo -e "${YELLOW}Host:${NC} $(hostname)"
echo -e "${YELLOW}User:${NC} $(whoami)"
echo -e "${YELLOW}Project:${NC} $PROJECT_ROOT"
echo ""

# Vérifier qu'on est dans le bon dossier
cd "$PROJECT_ROOT"

if [ ! -f "docker-compose.ip.yml" ]; then
  echo -e "${RED}❌ Error: docker-compose.ip.yml not found${NC}"
  echo "Current directory: $(pwd)"
  exit 1
fi

if [ ! -f ".env.production.ip" ]; then
  echo -e "${RED}❌ Error: .env.production.ip not found${NC}"
  exit 1
fi

# Variables
LOG_DIR="/var/log/flotteq"
BACKUP_DIR="/var/backups/flotteq"
LOG_FILE="$LOG_DIR/deploy-ip-$(date +%Y%m%d_%H%M%S).log"

# Créer dossiers logs
mkdir -p "$LOG_DIR"
mkdir -p "$BACKUP_DIR"

# Rediriger logs
exec > >(tee -a "$LOG_FILE")
exec 2>&1

echo ""
echo -e "${YELLOW}════════════════════════════════════════════${NC}"
echo -e "${YELLOW}ÉTAPE 1/6 : Vérifications préalables${NC}"
echo -e "${YELLOW}════════════════════════════════════════════${NC}"

# Vérifier Docker
if ! docker --version > /dev/null 2>&1; then
  echo -e "${RED}❌ Docker not installed${NC}"
  echo "Install Docker: curl -fsSL https://get.docker.com | sh"
  exit 1
fi
echo -e "${GREEN}✅ Docker installed:${NC} $(docker --version)"

# Vérifier Docker Compose
if ! docker compose version > /dev/null 2>&1; then
  echo -e "${RED}❌ Docker Compose not installed${NC}"
  exit 1
fi
echo -e "${GREEN}✅ Docker Compose installed:${NC} $(docker compose version)"

# Vérifier espace disque (minimum 10GB)
AVAILABLE_SPACE=$(df -BG "$PROJECT_ROOT" | tail -1 | awk '{print $4}' | sed 's/G//')
echo -e "${BLUE}💾 Available disk space:${NC} ${AVAILABLE_SPACE}GB"

if [ "$AVAILABLE_SPACE" -lt 10 ]; then
  echo -e "${RED}❌ Insufficient disk space: ${AVAILABLE_SPACE}GB (minimum 10GB required)${NC}"
  exit 1
fi

echo -e "${GREEN}✅ Pre-deployment checks passed${NC}"

# ==========================================
# ÉTAPE 2: ARRÊTER SERVICES EXISTANTS
# ==========================================
echo ""
echo -e "${YELLOW}════════════════════════════════════════════${NC}"
echo -e "${YELLOW}ÉTAPE 2/6 : Arrêt services existants${NC}"
echo -e "${YELLOW}════════════════════════════════════════════${NC}"

if docker compose -f docker-compose.ip.yml ps | grep -q "Up"; then
  echo "Stopping existing services..."
  docker compose -f docker-compose.ip.yml down
  echo -e "${GREEN}✅ Services stopped${NC}"
else
  echo -e "${BLUE}ℹ️  No running services to stop${NC}"
fi

# ==========================================
# ÉTAPE 3: BUILD DOCKER IMAGES
# ==========================================
echo ""
echo -e "${YELLOW}════════════════════════════════════════════${NC}"
echo -e "${YELLOW}ÉTAPE 3/6 : Build Docker images${NC}"
echo -e "${YELLOW}════════════════════════════════════════════${NC}"
echo -e "${BLUE}⏳ This may take 15-20 minutes...${NC}"

docker compose -f docker-compose.ip.yml --env-file .env.production.ip build --no-cache

echo -e "${GREEN}✅ Docker images built successfully${NC}"

# Afficher images créées
echo ""
echo -e "${BLUE}📦 Docker images created:${NC}"
docker images | grep flotteq | head -5

# ==========================================
# ÉTAPE 4: DÉMARRER INFRASTRUCTURE
# ==========================================
echo ""
echo -e "${YELLOW}════════════════════════════════════════════${NC}"
echo -e "${YELLOW}ÉTAPE 4/6 : Démarrage infrastructure${NC}"
echo -e "${YELLOW}════════════════════════════════════════════${NC}"

# Démarrer Postgres et Redis
echo "Starting PostgreSQL and Redis..."
docker compose -f docker-compose.ip.yml --env-file .env.production.ip up -d postgres redis

# Attendre healthchecks
echo "Waiting for healthchecks..."
sleep 15

# Vérifier status
POSTGRES_STATUS=$(docker inspect flotteq_db_prod --format='{{.State.Health.Status}}' 2>/dev/null || echo "unknown")
REDIS_STATUS=$(docker inspect flotteq_redis_prod --format='{{.State.Health.Status}}' 2>/dev/null || echo "unknown")

echo -e "${BLUE}PostgreSQL status:${NC} $POSTGRES_STATUS"
echo -e "${BLUE}Redis status:${NC} $REDIS_STATUS"

if [ "$POSTGRES_STATUS" != "healthy" ] && [ "$POSTGRES_STATUS" != "unknown" ]; then
  echo -e "${RED}❌ PostgreSQL health check failed${NC}"
  docker logs flotteq_db_prod | tail -20
  exit 1
fi

echo -e "${GREEN}✅ Infrastructure started${NC}"

# ==========================================
# ÉTAPE 5: DÉMARRER BACKEND + MIGRATIONS
# ==========================================
echo ""
echo -e "${YELLOW}════════════════════════════════════════════${NC}"
echo -e "${YELLOW}ÉTAPE 5/6 : Démarrage backend + migrations${NC}"
echo -e "${YELLOW}════════════════════════════════════════════${NC}"

# Démarrer backend
echo "Starting backend (migrations will run automatically)..."
docker compose -f docker-compose.ip.yml --env-file .env.production.ip up -d backend

# Attendre migrations + healthcheck
echo "Waiting for migrations and backend start..."
sleep 45

# Vérifier logs backend
echo ""
echo -e "${BLUE}📋 Backend logs (last 30 lines):${NC}"
docker logs flotteq_backend_prod | tail -30

# Vérifier healthcheck backend
BACKEND_HEALTH=$(docker inspect flotteq_backend_prod --format='{{.State.Health.Status}}' 2>/dev/null || echo "unknown")
echo ""
echo -e "${BLUE}Backend status:${NC} $BACKEND_HEALTH"

if [ "$BACKEND_HEALTH" != "healthy" ] && [ "$BACKEND_HEALTH" != "unknown" ]; then
  echo -e "${RED}❌ Backend health check failed${NC}"
  echo "Check logs: docker logs flotteq_backend_prod"
  exit 1
fi

echo -e "${GREEN}✅ Backend started successfully${NC}"

# ==========================================
# ÉTAPE 6: DÉMARRER FRONTENDS
# ==========================================
echo ""
echo -e "${YELLOW}════════════════════════════════════════════${NC}"
echo -e "${YELLOW}ÉTAPE 6/6 : Démarrage frontends${NC}"
echo -e "${YELLOW}════════════════════════════════════════════${NC}"

# Démarrer tous les frontends
echo "Starting frontends..."
docker compose -f docker-compose.ip.yml --env-file .env.production.ip up -d

# Attendre démarrage
sleep 20

echo -e "${GREEN}✅ All services started${NC}"

# ==========================================
# HEALTH CHECKS FINAUX
# ==========================================
echo ""
echo -e "${YELLOW}════════════════════════════════════════════${NC}"
echo -e "${YELLOW}HEALTH CHECKS${NC}"
echo -e "${YELLOW}════════════════════════════════════════════${NC}"

# Récupérer IP publique
PUBLIC_IP=$(curl -s ifconfig.me || echo "UNKNOWN")

# Test API
echo ""
echo -e "${BLUE}Testing API health...${NC}"
API_RESPONSE=$(curl -s http://localhost:3000/api/health 2>/dev/null || echo "ERROR")

if echo "$API_RESPONSE" | grep -q "ok"; then
  echo -e "${GREEN}✅ API health check: OK${NC}"
else
  echo -e "${RED}⚠️  API health check: FAILED${NC}"
  echo "Response: $API_RESPONSE"
fi

# Status containers
echo ""
echo -e "${BLUE}📦 Containers status:${NC}"
docker compose -f docker-compose.ip.yml ps

# ==========================================
# SUCCESS
# ==========================================
echo ""
echo -e "${GREEN}╔════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║     ✅ DÉPLOIEMENT RÉUSSI !                ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${BLUE}📅 Date:${NC} $(date)"
echo -e "${BLUE}📝 Log file:${NC} $LOG_FILE"
echo ""
echo -e "${YELLOW}🌐 ACCÈS APPLICATION (HTTP):${NC}"
echo ""
echo -e "  ${GREEN}API Backend:${NC}        http://$PUBLIC_IP:3000/api/health"
echo -e "  ${GREEN}Frontend Client:${NC}    http://$PUBLIC_IP:5174"
echo -e "  ${GREEN}Frontend Partner:${NC}   http://$PUBLIC_IP:5175"
echo -e "  ${GREEN}Frontend Driver:${NC}    http://$PUBLIC_IP:5176"
echo -e "  ${GREEN}Frontend Admin:${NC}     http://$PUBLIC_IP:3001"
echo ""
echo -e "${YELLOW}📝 COMMANDES UTILES:${NC}"
echo ""
echo -e "  ${BLUE}Voir logs:${NC}       docker compose -f docker-compose.ip.yml logs -f"
echo -e "  ${BLUE}Status:${NC}          docker compose -f docker-compose.ip.yml ps"
echo -e "  ${BLUE}Arrêter:${NC}         docker compose -f docker-compose.ip.yml down"
echo -e "  ${BLUE}Redémarrer:${NC}      docker compose -f docker-compose.ip.yml restart SERVICE_NAME"
echo ""
echo -e "${RED}⚠️  IMPORTANT:${NC}"
echo -e "  - Connexion HTTP uniquement (pas HTTPS)"
echo -e "  - Parfait pour tests et présentations"
echo -e "  - Pour production: utiliser domaine + SSL (DEPLOYMENT_GUIDE.md)"
echo ""
