#!/bin/bash
set -e

# ==========================================
# Détection automatique du projet FlotteQ
# ==========================================
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${RED}⏪ FlotteQ Production Rollback${NC}"
echo "=========================================="
echo "Project: $PROJECT_ROOT"
echo ""

# Vérifier qu'on est dans le bon dossier
cd "$PROJECT_ROOT"

if [ ! -f "docker-compose.production.yml" ]; then
  echo -e "${RED}❌ docker-compose.production.yml not found${NC}"
  exit 1
fi

# Variables
BACKUP_DIR="/var/backups/flotteq/pre-deploy"
COMMITS_TO_ROLLBACK=${1:-1}  # Par défaut 1 commit

echo -e "${YELLOW}⚠️  WARNING: This will rollback the last $COMMITS_TO_ROLLBACK commit(s)${NC}"
echo ""

# Afficher les derniers commits
echo "📋 Recent commits:"
git log --oneline -n 5
echo ""

# Demander confirmation
read -p "Continue with rollback? (yes/no) " -n 3 -r
echo
if [[ ! $REPLY == "yes" ]]; then
  echo "❌ Rollback cancelled"
  exit 1
fi

# ==========================================
# ÉTAPE 1: ARRÊTER LE BACKEND
# ==========================================
echo ""
echo -e "${YELLOW}🛑 Step 1/5: Stopping backend${NC}"
docker compose -f docker-compose.production.yml stop backend

# ==========================================
# ÉTAPE 2: RESTAURER LA DB
# ==========================================
echo ""
echo -e "${YELLOW}📦 Step 2/5: Restoring database${NC}"

# Chercher le dernier backup
LATEST_BACKUP=$(ls -t "$BACKUP_DIR"/*.sql.gz 2>/dev/null | head -n 1)

if [ -z "$LATEST_BACKUP" ]; then
  echo -e "${RED}⚠️  No backup found, skipping DB restore${NC}"
else
  echo "Restoring: $LATEST_BACKUP"
  gunzip -c "$LATEST_BACKUP" | \
    docker compose -f docker-compose.production.yml exec -T postgres \
    psql -U flotteq_prod -d flotteq_production

  echo -e "${GREEN}✅ Database restored${NC}"
fi

# ==========================================
# ÉTAPE 3: REVENIR AU CODE PRÉCÉDENT
# ==========================================
echo ""
echo -e "${YELLOW}📥 Step 3/5: Rolling back code${NC}"

CURRENT_COMMIT=$(git rev-parse --short HEAD)
echo "Current commit: $CURRENT_COMMIT"

git reset --hard HEAD~$COMMITS_TO_ROLLBACK

NEW_COMMIT=$(git rev-parse --short HEAD)
echo "Rolled back to: $NEW_COMMIT"

# ==========================================
# ÉTAPE 4: REBUILD & REDEPLOY
# ==========================================
echo ""
echo -e "${YELLOW}🏗️  Step 4/5: Rebuilding images${NC}"

docker compose -f docker-compose.production.yml build --no-cache backend

echo ""
echo -e "${YELLOW}🚀 Step 5/5: Redeploying services${NC}"

# Redémarrer tout
docker compose -f docker-compose.production.yml up -d

# Attendre healthcheck
echo "Waiting for services to start..."
sleep 30

# ==========================================
# ÉTAPE 5: HEALTH CHECK
# ==========================================
echo ""
echo -e "${YELLOW}🏥 Health check${NC}"

API_HEALTH=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/api/health 2>/dev/null || echo "000")
if [ "$API_HEALTH" != "200" ]; then
  echo -e "${RED}❌ Health check failed: HTTP $API_HEALTH${NC}"
  echo -e "${RED}Manual intervention required!${NC}"
  exit 1
fi

echo -e "${GREEN}✅ Health check passed${NC}"

# ==========================================
# SUCCESS
# ==========================================
echo ""
echo "=========================================="
echo -e "${GREEN}✅ ROLLBACK SUCCESSFUL${NC}"
echo "=========================================="
echo "Reverted to commit: $NEW_COMMIT"
echo "Previous commit was: $CURRENT_COMMIT"
echo ""
echo "⚠️  IMPORTANT:"
echo "  - Review logs: tail -f /var/log/flotteq/deploy-*.log"
echo "  - Monitor: docker compose -f docker-compose.production.yml logs -f"
echo "  - If issues persist, contact dev team"
echo ""
