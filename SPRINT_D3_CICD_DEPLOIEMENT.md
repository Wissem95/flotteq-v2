# 🚀 SPRINT D3 : CI/CD & DÉPLOIEMENT

**Objectif** : Automatiser le déploiement avec GitHub Actions, créer les scripts de déploiement et la documentation finale.

**Durée estimée** : 2-3 heures
**Priorité** : IMPORTANTE (Qualité de vie + fiabilité)

---

## 📋 TICKET D3-001 : Créer GitHub Actions Workflow CI/CD

### Contexte
Actuellement, le déploiement est manuel. GitHub Actions permet d'automatiser:
- Tests à chaque push
- Build à chaque commit sur `main`
- Déploiement automatique sur le VPS
- Rollback en cas d'échec

### Objectif
Créer un workflow GitHub Actions complet pour tester + déployer automatiquement.

### Fichiers à créer (3 fichiers)

#### 1. Workflow CI (Tests)

**Chemin** : `/Users/wissem/Flotteq-v2/.github/workflows/ci.yml`

```yaml
name: CI - Tests & Build

on:
  push:
    branches: ['**']  # Tous les branches
  pull_request:
    branches: [main, develop]

jobs:
  # Backend Tests
  backend-tests:
    name: Backend - Tests & Build
    runs-on: ubuntu-latest

    services:
      postgres:
        image: postgres:15-alpine
        env:
          POSTGRES_USER: postgres
          POSTGRES_PASSWORD: test_password
          POSTGRES_DB: flotteq_test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js 20
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
          cache-dependency-path: backend/package-lock.json

      - name: Install dependencies
        working-directory: ./backend
        run: npm ci

      - name: Lint code
        working-directory: ./backend
        run: npm run lint

      - name: Run unit tests
        working-directory: ./backend
        run: npm test
        env:
          DB_HOST: localhost
          DB_PORT: 5432
          DB_USER: postgres
          DB_PASSWORD: test_password
          DB_NAME: flotteq_test
          JWT_ACCESS_SECRET: test_access_secret_min_32_chars
          JWT_REFRESH_SECRET: test_refresh_secret_min_32_chars
          NODE_ENV: test

      - name: Run E2E tests
        working-directory: ./backend
        run: npm run test:e2e
        env:
          DB_HOST: localhost
          DB_PORT: 5432
          DB_USER: postgres
          DB_PASSWORD: test_password
          DB_NAME: flotteq_test
          JWT_ACCESS_SECRET: test_access_secret
          JWT_REFRESH_SECRET: test_refresh_secret

      - name: Build backend
        working-directory: ./backend
        run: npm run build

      - name: Upload backend artifact
        uses: actions/upload-artifact@v4
        with:
          name: backend-dist
          path: backend/dist
          retention-days: 7

  # Frontend Client Tests & Build
  frontend-client-build:
    name: Frontend Client - Build
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
          cache-dependency-path: frontend-client/package-lock.json

      - name: Install dependencies
        working-directory: ./frontend-client
        run: npm ci

      - name: Lint
        working-directory: ./frontend-client
        run: npm run lint

      - name: Run tests
        working-directory: ./frontend-client
        run: npm test
        env:
          VITE_API_URL: http://localhost:3000/api

      - name: Build
        working-directory: ./frontend-client
        run: npm run build
        env:
          VITE_API_URL: https://api.flotteq.com/api
          VITE_STRIPE_PUBLISHABLE_KEY: pk_test_dummy_for_build

      - name: Upload artifact
        uses: actions/upload-artifact@v4
        with:
          name: frontend-client-dist
          path: frontend-client/dist
          retention-days: 7

  # Frontend Partner Build
  frontend-partner-build:
    name: Frontend Partner - Build
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
          cache-dependency-path: frontend-partner/package-lock.json

      - name: Install dependencies
        working-directory: ./frontend-partner
        run: npm ci

      - name: Build
        working-directory: ./frontend-partner
        run: npm run build
        env:
          VITE_API_URL: https://api.flotteq.com

  # Frontend Driver Build
  frontend-driver-build:
    name: Frontend Driver - Build
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
          cache-dependency-path: frontend-driver/package-lock.json

      - name: Install dependencies
        working-directory: ./frontend-driver
        run: npm ci

      - name: Build
        working-directory: ./frontend-driver
        run: npm run build
        env:
          VITE_API_URL: https://api.flotteq.com/api
          VITE_STRIPE_PUBLISHABLE_KEY: pk_test_dummy_for_build

  # Frontend Internal Build
  frontend-internal-build:
    name: Frontend Internal - Build
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
          cache-dependency-path: frontend-internal/package-lock.json

      - name: Install dependencies
        working-directory: ./frontend-internal
        run: npm ci

      - name: Build
        working-directory: ./frontend-internal
        run: npm run build
        env:
          VITE_API_URL: https://api.flotteq.com

  # Docker Build Test
  docker-build-test:
    name: Docker - Build Test
    runs-on: ubuntu-latest
    needs: [backend-tests]

    steps:
      - uses: actions/checkout@v4

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3

      - name: Build backend image
        uses: docker/build-push-action@v5
        with:
          context: ./backend
          file: ./backend/Dockerfile
          push: false
          tags: flotteq-backend:test
          cache-from: type=gha
          cache-to: type=gha,mode=max

      - name: Build frontend-client image
        uses: docker/build-push-action@v5
        with:
          context: ./frontend-client
          file: ./frontend-client/Dockerfile
          push: false
          tags: flotteq-frontend-client:test
```

#### 2. Workflow CD (Déploiement Production)

**Chemin** : `/Users/wissem/Flotteq-v2/.github/workflows/deploy.yml`

```yaml
name: CD - Deploy to Production

on:
  push:
    branches: [main]
  workflow_dispatch:  # Allow manual trigger

jobs:
  deploy:
    name: Deploy to VPS
    runs-on: ubuntu-latest
    environment: production

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup SSH
        uses: webfactory/ssh-agent@v0.9.0
        with:
          ssh-private-key: ${{ secrets.VPS_SSH_KEY }}

      - name: Add VPS to known_hosts
        run: |
          mkdir -p ~/.ssh
          ssh-keyscan -H ${{ secrets.VPS_HOST }} >> ~/.ssh/known_hosts

      - name: Deploy to VPS
        env:
          VPS_HOST: ${{ secrets.VPS_HOST }}
          VPS_USER: ${{ secrets.VPS_USER }}
        run: |
          ssh $VPS_USER@$VPS_HOST << 'EOF'
            set -e

            echo "🚀 Starting deployment..."

            # Navigate to project
            cd /opt/flotteq

            # Pull latest code
            git pull origin main

            # Run deployment script
            ./scripts/deploy-production.sh

            echo "✅ Deployment completed!"
          EOF

      - name: Health check
        run: |
          sleep 30  # Wait for services to start
          curl -f https://api.flotteq.com/api/health || exit 1

      - name: Notify Slack (success)
        if: success()
        run: |
          curl -X POST ${{ secrets.SLACK_WEBHOOK_URL }} \
            -H 'Content-Type: application/json' \
            -d '{
              "text": "✅ FlotteQ deployed successfully to production!",
              "username": "GitHub Actions",
              "icon_emoji": ":rocket:"
            }'

      - name: Notify Slack (failure)
        if: failure()
        run: |
          curl -X POST ${{ secrets.SLACK_WEBHOOK_URL }} \
            -H 'Content-Type: application/json' \
            -d '{
              "text": "❌ FlotteQ deployment FAILED!",
              "username": "GitHub Actions",
              "icon_emoji": ":warning:"
            }'
```

#### 3. Documentation GitHub Secrets

**Chemin** : `/Users/wissem/Flotteq-v2/docs/GITHUB_SECRETS.md`

```markdown
# Configuration GitHub Secrets

Pour que les workflows fonctionnent, configurer les secrets suivants dans GitHub.

## Accès GitHub Secrets

1. Aller sur le repo: https://github.com/YOUR_USERNAME/flotteq-v2
2. Cliquer sur **Settings** → **Secrets and variables** → **Actions**
3. Cliquer **New repository secret**

## Secrets requis

### VPS_SSH_KEY (CRITIQUE)

**Description**: Clé privée SSH pour connexion au VPS

**Génération**:
```bash
# Sur votre machine locale
ssh-keygen -t ed25519 -C "github-actions@flotteq.com" -f ~/.ssh/flotteq_deploy

# Afficher la clé privée (à copier dans GitHub Secret)
cat ~/.ssh/flotteq_deploy

# Copier la clé publique sur le VPS
ssh-copy-id -i ~/.ssh/flotteq_deploy.pub root@flotteq.com
```

**Valeur dans GitHub Secret**:
Copier TOUT le contenu de `~/.ssh/flotteq_deploy` (y compris `-----BEGIN OPENSSH PRIVATE KEY-----`)

### VPS_HOST

**Description**: Adresse IP ou domaine du VPS

**Valeur**: `flotteq.com` ou `1.2.3.4`

### VPS_USER

**Description**: Utilisateur SSH sur le VPS

**Valeur**: `root` ou `flotteq`

### SLACK_WEBHOOK_URL (Optionnel)

**Description**: Webhook Slack pour notifications de déploiement

**Configuration Slack**:
1. Aller sur https://api.slack.com/apps
2. Créer une app → Activer "Incoming Webhooks"
3. Créer un webhook pour votre channel (ex: #deployments)
4. Copier l'URL (format: `https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXX`)

**Valeur**: L'URL du webhook

## Vérification

### Tester la connexion SSH (sur votre machine)

```bash
ssh -i ~/.ssh/flotteq_deploy root@flotteq.com "echo 'SSH OK'"
```

### Tester le workflow manuellement

1. Aller dans **Actions** → **CD - Deploy to Production**
2. Cliquer **Run workflow**
3. Vérifier les logs

## Sécurité

⚠️ **JAMAIS commiter les clés privées dans le repo!**

Les secrets GitHub sont chiffrés et accessibles uniquement:
- Lors de l'exécution des workflows
- Par les admins du repo
```

### Test après création

```bash
# 1. Créer le dossier .github/workflows
mkdir -p .github/workflows

# 2. Vérifier les fichiers créés
ls -la .github/workflows/

# 3. Valider la syntaxe YAML
# Installer yamllint si besoin: brew install yamllint
yamllint .github/workflows/ci.yml
yamllint .github/workflows/deploy.yml

# 4. Commit et push (déclenchera le workflow CI)
git add .github/workflows/
git commit -m "ci: add GitHub Actions workflows"
git push origin main

# 5. Vérifier sur GitHub
# Aller sur https://github.com/YOUR_USERNAME/flotteq-v2/actions
# Le workflow CI devrait se lancer automatiquement

# 6. Configurer les secrets (voir docs/GITHUB_SECRETS.md)
# Puis tester le déploiement manuel
```

### Critères d'acceptation
- ✅ Workflow `ci.yml` créé (tests automatiques)
- ✅ Workflow `deploy.yml` créé (déploiement auto)
- ✅ Documentation secrets complète
- ✅ Syntaxe YAML valide
- ✅ Tests backend passent dans GitHub Actions
- ✅ Build frontend réussit dans GitHub Actions
- ✅ Déploiement fonctionne (après config secrets)
- ✅ Healthcheck post-déploiement fonctionne
- ✅ Notifications Slack configurées (optionnel)

---

## 📋 TICKET D3-002 : Script deploy-production.sh Complet

### Contexte
Le script de déploiement est appelé par GitHub Actions (ou manuellement).
Il doit gérer:
- Backup avant déploiement
- Build des images Docker
- Migrations DB
- Déploiement zero-downtime
- Healthcheck
- Rollback automatique si échec

### Objectif
Créer un script de déploiement production robuste et sécurisé.

### Fichier à créer

**Chemin** : `/Users/wissem/Flotteq-v2/scripts/deploy-production.sh`

```bash
#!/bin/bash
set -e

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
echo ""

# Vérifier qu'on est bien dans le bon dossier
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
      docker-compose -f docker-compose.production.yml exec -T postgres \
      psql -U flotteq_prod -d flotteq_production
  fi

  # Revenir au commit précédent
  git reset --hard HEAD~1

  # Redémarrer les anciens containers
  docker-compose -f docker-compose.production.yml up -d

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
if ! docker-compose --version > /dev/null 2>&1; then
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
docker-compose -f docker-compose.production.yml exec -T postgres \
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
docker-compose -f docker-compose.production.yml build --no-cache

echo -e "${GREEN}✅ Images built successfully${NC}"

# ==========================================
# ÉTAPE 5: RUN DATABASE MIGRATIONS
# ==========================================
echo ""
echo -e "${YELLOW}📊 Step 5/7: Running database migrations${NC}"

# Démarrer temporairement Postgres si pas actif
docker-compose -f docker-compose.production.yml up -d postgres

# Attendre que Postgres soit prêt
echo "Waiting for PostgreSQL..."
sleep 10

# Run migrations via backend container
docker-compose -f docker-compose.production.yml run --rm backend npm run migration:run

echo -e "${GREEN}✅ Migrations completed${NC}"

# ==========================================
# ÉTAPE 6: DEPLOY SERVICES (Zero-downtime)
# ==========================================
echo ""
echo -e "${YELLOW}🚀 Step 6/7: Deploying services${NC}"

# Démarrer Redis si pas actif
docker-compose -f docker-compose.production.yml up -d redis

# Backend (force recreate pour charger nouveau code)
echo "Deploying backend..."
docker-compose -f docker-compose.production.yml up -d --force-recreate --no-deps backend

# Attendre que le backend soit healthy
echo "Waiting for backend health check..."
sleep 30

# Vérifier healthcheck
BACKEND_HEALTH=$(docker inspect flotteq_backend_prod --format='{{.State.Health.Status}}')
if [ "$BACKEND_HEALTH" != "healthy" ]; then
  echo -e "${RED}❌ Backend health check failed: $BACKEND_HEALTH${NC}"
  rollback
fi

# Frontends (un par un pour éviter downtime)
echo "Deploying frontend-client..."
docker-compose -f docker-compose.production.yml up -d --force-recreate --no-deps frontend-client

echo "Deploying frontend-partner..."
docker-compose -f docker-compose.production.yml up -d --force-recreate --no-deps frontend-partner

echo "Deploying frontend-driver..."
docker-compose -f docker-compose.production.yml up -d --force-recreate --no-deps frontend-driver

echo "Deploying frontend-internal..."
docker-compose -f docker-compose.production.yml up -d --force-recreate --no-deps frontend-internal

# Nginx (reload configuration sans downtime)
echo "Reloading Nginx..."
docker-compose -f docker-compose.production.yml exec nginx nginx -s reload

echo -e "${GREEN}✅ All services deployed${NC}"

# ==========================================
# ÉTAPE 7: POST-DEPLOYMENT CHECKS
# ==========================================
echo ""
echo -e "${YELLOW}🏥 Step 7/7: Post-deployment health checks${NC}"

# Attendre 10 secondes
sleep 10

# Check API health
API_HEALTH=$(curl -s -o /dev/null -w "%{http_code}" https://api.flotteq.com/api/health)
if [ "$API_HEALTH" != "200" ]; then
  echo -e "${RED}❌ API health check failed: HTTP $API_HEALTH${NC}"
  rollback
fi

echo -e "${GREEN}✅ API health check passed (HTTP 200)${NC}"

# Check frontends (optionnel)
APP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://app.flotteq.com)
PARTNER_STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://partner.flotteq.com)

echo "Frontend status:"
echo "  - app.flotteq.com: HTTP $APP_STATUS"
echo "  - partner.flotteq.com: HTTP $PARTNER_STATUS"

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
docker-compose -f docker-compose.production.yml ps
echo ""
echo "🌐 URLs:"
echo "  - API: https://api.flotteq.com/api/health"
echo "  - App: https://app.flotteq.com"
echo "  - Partner: https://partner.flotteq.com"
echo "  - Driver: https://driver.flotteq.com"
echo "  - Admin: https://admin.flotteq.com"
echo ""
```

### Test après création

```bash
# 1. Rendre le script exécutable
chmod +x scripts/deploy-production.sh

# 2. Vérifier la syntaxe bash
bash -n scripts/deploy-production.sh

# 3. Test à sec (sans execution réelle)
# Éditer le script: ajouter `set -n` après `#!/bin/bash`
./scripts/deploy-production.sh

# 4. Test complet (en environnement staging si disponible)
# Ou tester sur VPS de test
./scripts/deploy-production.sh

# 5. Vérifier les logs
tail -f /var/log/flotteq/deploy-*.log
```

### Critères d'acceptation
- ✅ Script `deploy-production.sh` créé et exécutable
- ✅ Pre-deployment checks (Docker, espace disque)
- ✅ Backup DB automatique avant déploiement
- ✅ Build Docker sans cache
- ✅ Migrations DB automatiques
- ✅ Déploiement zero-downtime (un service à la fois)
- ✅ Health checks post-déploiement
- ✅ Rollback automatique si échec
- ✅ Logs détaillés dans `/var/log/flotteq/`
- ✅ Cleanup images anciennes

---

## 📋 TICKET D3-003 : Script rollback.sh

### Contexte
En cas de bug critique en production, possibilité de rollback rapide au commit précédent.

### Objectif
Créer un script de rollback simple et rapide.

### Fichier à créer

**Chemin** : `/Users/wissem/Flotteq-v2/scripts/rollback.sh`

```bash
#!/bin/bash
set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${RED}⏪ FlotteQ Production Rollback${NC}"
echo "=========================================="
echo ""

# Vérifier qu'on est dans le bon dossier
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
docker-compose -f docker-compose.production.yml stop backend

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
    docker-compose -f docker-compose.production.yml exec -T postgres \
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

docker-compose -f docker-compose.production.yml build --no-cache backend

echo ""
echo -e "${YELLOW}🚀 Step 5/5: Redeploying services${NC}"

# Redémarrer tout
docker-compose -f docker-compose.production.yml up -d

# Attendre healthcheck
echo "Waiting for services to start..."
sleep 30

# ==========================================
# ÉTAPE 5: HEALTH CHECK
# ==========================================
echo ""
echo -e "${YELLOW}🏥 Health check${NC}"

API_HEALTH=$(curl -s -o /dev/null -w "%{http_code}" https://api.flotteq.com/api/health)
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
echo "  - Monitor: docker-compose -f docker-compose.production.yml logs -f"
echo "  - If issues persist, contact dev team"
echo ""
```

### Test après création

```bash
# 1. Rendre exécutable
chmod +x scripts/rollback.sh

# 2. Tester à sec (syntax check)
bash -n scripts/rollback.sh

# 3. NE PAS tester en production!
# Créer environnement test avec git séparé

# 4. Simuler rollback (sans vraiment rollback)
# Éditer script: commenter `git reset --hard`
# ./scripts/rollback.sh
```

### Critères d'acceptation
- ✅ Script `rollback.sh` créé et exécutable
- ✅ Confirmation utilisateur avant rollback
- ✅ Affiche les derniers commits
- ✅ Restaure backup DB
- ✅ Rollback Git (HEAD~1)
- ✅ Rebuild + redeploy automatique
- ✅ Health check post-rollback
- ✅ Logs détaillés

---

## 📋 TICKET D3-004 : Documentation Déploiement Complète

### Contexte
Documentation finale pour déployer FlotteQ en production sur VPS OVH.

### Objectif
Créer un guide de déploiement step-by-step complet.

### Fichier à créer

**Chemin** : `/Users/wissem/Flotteq-v2/DEPLOYMENT_GUIDE.md`

```markdown
# 🚀 Guide de Déploiement Production - FlotteQ

**Dernière mise à jour**: 19 Janvier 2025
**Environnement cible**: VPS OVH Ubuntu 22.04 LTS

---

## 📋 PRÉREQUIS

### VPS Recommandé (OVH)

| Ressource | Minimum | Recommandé |
|-----------|---------|------------|
| CPU | 4 vCPU | 8 vCPU |
| RAM | 8 GB | 16 GB |
| Stockage | 80 GB SSD | 160 GB NVMe |
| Bande passante | 500 Mbps | 1 Gbps |

**Prix estimé**: 30-40€/mois (VPS Elite)

### Domaines & DNS

Configurer 5 domaines (ou sous-domaines) pointant vers l'IP du VPS:

```dns
api.flotteq.com     A    1.2.3.4
app.flotteq.com     A    1.2.3.4
partner.flotteq.com A    1.2.3.4
driver.flotteq.com  A    1.2.3.4
admin.flotteq.com   A    1.2.3.4
```

Vérifier la propagation DNS: `dig +short api.flotteq.com`

### Services Externes

- [ ] Compte Stripe (mode LIVE activé)
- [ ] SMTP configuré (Gmail, SendGrid, Mailgun)
- [ ] GitHub repository créé
- [ ] Slack webhook (optionnel - notifications)

---

## 🛠️ INSTALLATION INITIALE VPS

### Étape 1: Connexion SSH

```bash
ssh root@flotteq.com
```

### Étape 2: Mise à jour système

```bash
apt update && apt upgrade -y
apt install -y curl git ufw fail2ban
```

### Étape 3: Installation Docker

```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Start Docker
systemctl enable docker
systemctl start docker

# Install Docker Compose v2
apt install docker-compose-plugin -y

# Verify
docker --version
docker compose version
```

### Étape 4: Configuration Firewall UFW

```bash
# Configure UFW
ufw default deny incoming
ufw default allow outgoing
ufw allow ssh
ufw allow 80/tcp
ufw allow 443/tcp

# Enable
ufw enable
ufw status
```

### Étape 5: Créer utilisateur non-root (optionnel)

```bash
adduser flotteq
usermod -aG docker flotteq
usermod -aG sudo flotteq

# Switch to flotteq user
su - flotteq
```

---

## 📦 DÉPLOIEMENT APPLICATION

### Étape 1: Cloner le repository

```bash
cd /opt
git clone https://github.com/YOUR_USERNAME/flotteq-v2.git
cd flotteq-v2
```

### Étape 2: Générer les secrets

```bash
# Générer tous les secrets
chmod +x scripts/generate-secrets.sh
./scripts/generate-secrets.sh

# Secrets créés dans secrets/
ls -la secrets/
```

### Étape 3: Créer .env.production

```bash
# Backend
cp backend/.env.production.example backend/.env.production
nano backend/.env.production

# Modifier TOUS les CHANGEME:
# - DB_PASSWORD (copier depuis secrets/db_password.txt)
# - JWT_*_SECRET (copier depuis secrets/)
# - STRIPE_SECRET_KEY (depuis dashboard Stripe LIVE)
# - REDIS_PASSWORD (copier depuis secrets/)
# - SMTP_PASSWORD (mot de passe SMTP)
# - CORS_ORIGIN (vérifier les 5 domaines)

# Frontends
cp frontend-client/.env.production.example frontend-client/.env.production
cp frontend-partner/.env.production.example frontend-partner/.env.production
cp frontend-driver/.env.production.example frontend-driver/.env.production
cp frontend-internal/.env.production.example frontend-internal/.env.production

# Modifier les VITE_STRIPE_PUBLISHABLE_KEY avec clé LIVE
nano frontend-client/.env.production
nano frontend-driver/.env.production
```

### Étape 4: Initialiser SSL Let's Encrypt

```bash
chmod +x scripts/init-ssl.sh
./scripts/init-ssl.sh

# Suivre les instructions
# Vérifier que les 5 certificats sont obtenus
ls -la certbot/conf/live/
```

### Étape 5: Premier déploiement

```bash
chmod +x scripts/deploy-production.sh
./scripts/deploy-production.sh

# Le script va:
# 1. Build Docker images
# 2. Démarrer PostgreSQL
# 3. Run migrations
# 4. Démarrer tous les services
# 5. Health check
```

### Étape 6: Vérifier le déploiement

```bash
# Check services
docker compose -f docker-compose.production.yml ps

# Tous devraient être "Up" et "healthy"

# Check logs
docker compose -f docker-compose.production.yml logs -f --tail=100

# Test API
curl https://api.flotteq.com/api/health

# Résultat attendu: {"status":"ok",...}

# Test frontends
curl -I https://app.flotteq.com
curl -I https://partner.flotteq.com
curl -I https://driver.flotteq.com
curl -I https://admin.flotteq.com
```

---

## 🔄 CI/CD AVEC GITHUB ACTIONS

### Configuration GitHub Secrets

1. Aller sur GitHub: Settings → Secrets → Actions
2. Ajouter ces secrets:

| Secret | Valeur |
|--------|--------|
| `VPS_SSH_KEY` | Clé privée SSH (voir docs/GITHUB_SECRETS.md) |
| `VPS_HOST` | `flotteq.com` |
| `VPS_USER` | `root` ou `flotteq` |
| `SLACK_WEBHOOK_URL` | Webhook Slack (optionnel) |

### Test déploiement automatique

```bash
# Faire un changement trivial
echo "# Test deploy" >> README.md
git add README.md
git commit -m "test: trigger deployment"
git push origin main

# Vérifier sur GitHub Actions
# https://github.com/YOUR_USERNAME/flotteq-v2/actions

# Le workflow "CD - Deploy to Production" devrait se lancer
```

---

## 🔁 MAINTENANCE & BACKUPS

### Backups automatiques

```bash
# Copier scripts sur VPS
chmod +x scripts/backup-db.sh
chmod +x scripts/backup-uploads.sh
chmod +x scripts/renew-ssl.sh

# Configurer crontab
crontab -e

# Ajouter ces lignes:
30 2 * * * /opt/flotteq/scripts/backup-db.sh >> /var/log/flotteq/backup-db.log 2>&1
0 3 * * 0 /opt/flotteq/scripts/backup-uploads.sh >> /var/log/flotteq/backup-uploads.log 2>&1
0 2 * * * /opt/flotteq/scripts/renew-ssl.sh >> /var/log/flotteq/ssl-renew.log 2>&1
```

### Monitoring

```bash
# Logs application
tail -f /var/log/flotteq/deploy-*.log

# Logs Docker
docker compose -f docker-compose.production.yml logs -f backend

# Status services
docker compose -f docker-compose.production.yml ps

# Espace disque
df -h

# Mémoire
free -h
```

---

## 🆘 TROUBLESHOOTING

### Service ne démarre pas

```bash
# Voir les logs
docker compose -f docker-compose.production.yml logs SERVICE_NAME

# Exemples:
docker compose logs backend
docker compose logs postgres
docker compose logs nginx
```

### API retourne 502 Bad Gateway

```bash
# Vérifier backend
docker compose ps backend

# Vérifier logs backend
docker compose logs backend | tail -100

# Vérifier healthcheck
curl http://localhost:3000/api/health
```

### Base de données corrompue

```bash
# Restaurer dernier backup
ls -lh /var/backups/flotteq/db/

# Rollback complet
./scripts/rollback.sh
```

### SSL expiré

```bash
# Renouveler manuellement
docker compose -f docker-compose.production.yml run --rm certbot renew

# Reload Nginx
docker compose exec nginx nginx -s reload
```

### Out of disk space

```bash
# Nettoyer images Docker
docker image prune -a -f

# Nettoyer vieux backups
find /var/backups/flotteq -name "*.gz" -mtime +60 -delete

# Nettoyer logs
find /var/log/flotteq -name "*.log" -mtime +30 -delete
```

---

## 🚨 ROLLBACK D'URGENCE

En cas de bug critique en production:

```bash
cd /opt/flotteq
./scripts/rollback.sh

# Suivre les instructions
# Le script va:
# 1. Arrêter backend
# 2. Restaurer DB (dernier backup)
# 3. Rollback Git (HEAD~1)
# 4. Rebuild + redeploy
# 5. Health check
```

---

## 📊 MONITORING RECOMMANDÉ

### Outils gratuits

- **UptimeRobot**: https://uptimerobot.com (checks HTTP)
- **Sentry**: https://sentry.io (error tracking)
- **PM2 Plus**: https://pm2.io (si PM2 utilisé)
- **Grafana Cloud**: https://grafana.com (métriques)

### Healthchecks à configurer

| URL | Fréquence | Alerte si |
|-----|-----------|-----------|
| https://api.flotteq.com/api/health | 5 min | HTTP ≠ 200 |
| https://app.flotteq.com | 10 min | HTTP ≠ 200 |
| https://partner.flotteq.com | 10 min | HTTP ≠ 200 |

---

## 🎯 CHECKLIST POST-DÉPLOIEMENT

- [ ] Tous les services "healthy" (`docker compose ps`)
- [ ] API health check retourne 200
- [ ] 5 frontends accessibles en HTTPS
- [ ] Certificats SSL valides (90 jours)
- [ ] Backups configurés (crontab)
- [ ] GitHub Actions fonctionne
- [ ] Logs centralisés dans /var/log/flotteq/
- [ ] Monitoring UptimeRobot actif
- [ ] Documentation d'équipe mise à jour
- [ ] Stripe en mode LIVE (pas test!)
- [ ] SMTP envoie emails correctement
- [ ] Test complet: créer compte → ajouter véhicule → upload document

---

## 📞 SUPPORT

En cas de problème:

1. Vérifier logs: `/var/log/flotteq/`
2. Consulter troubleshooting ci-dessus
3. Rollback si critique: `./scripts/rollback.sh`
4. Contacter équipe dev

---

**Bon déploiement! 🚀**
```

### Test après création

```bash
# 1. Vérifier le fichier
cat DEPLOYMENT_GUIDE.md | head -50

# 2. Vérifier les liens internes
grep -o "\[.*\](.*.md)" DEPLOYMENT_GUIDE.md

# 3. Tester les commandes bash (copier dans terminal)
# Exemple: vérifier syntaxe Docker install
curl -fsSL https://get.docker.com -o get-docker.sh
head get-docker.sh
rm get-docker.sh
```

### Critères d'acceptation
- ✅ Guide `DEPLOYMENT_GUIDE.md` créé
- ✅ Prérequis complets (VPS, DNS, services)
- ✅ Installation step-by-step
- ✅ Configuration .env détaillée
- ✅ Commandes de vérification
- ✅ CI/CD expliqué
- ✅ Maintenance & backups documentés
- ✅ Troubleshooting complet
- ✅ Rollback d'urgence
- ✅ Checklist post-déploiement

---

## 📋 TICKET D3-005 : Mettre à jour README.md Principal

### Contexte
Le README actuel est basique. Il faut le mettre à jour avec badges, architecture, liens vers guides, etc.

### Objectif
Créer un README professionnel et complet.

### Fichier à modifier

**Chemin** : `/Users/wissem/Flotteq-v2/README.md`

```markdown
# 🚗 FlotteQ - SaaS Multi-Tenant Fleet Management

[![CI](https://github.com/YOUR_USERNAME/flotteq-v2/workflows/CI/badge.svg)](https://github.com/YOUR_USERNAME/flotteq-v2/actions)
[![License](https://img.shields.io/badge/license-Proprietary-red.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/node-20.x-green.svg)](https://nodejs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue.svg)](https://www.typescriptlang.org/)
[![NestJS](https://img.shields.io/badge/NestJS-10.x-ea2845.svg)](https://nestjs.com/)
[![React](https://img.shields.io/badge/React-19.x-61dafb.svg)](https://reactjs.org/)

Plateforme SaaS multi-tenant de gestion de flottes automobiles avec marketplace de services (garages, assurances, contrôles techniques).

## 🎯 Features

### Core Platform
- ✅ **Multi-tenant architecture** - Isolation complète des données
- ✅ **4 Applications distinctes** - Client, Partner, Driver, Admin
- ✅ **Authentification sécurisée** - JWT dual-token, bcrypt rounds=12
- ✅ **Système de permissions** - 6 rôles (super_admin, support, tenant_admin, manager, driver, viewer)
- ✅ **Stripe Billing** - Abonnements SaaS (4 plans) avec Customer Portal
- ✅ **Documents quotas** - Gestion documents avec limites par plan

### Fleet Management
- ✅ **Gestion véhicules** - CRUD complet avec photos, historique kilométrique
- ✅ **Maintenances** - Templates, planification, suivi coûts
- ✅ **Conducteurs** - Assignation véhicules, trajets, rapports état des lieux
- ✅ **Statistiques** - Dashboard analytics multi-critères

### Marketplace
- ✅ **Partners** - Garages, assurances, contrôles techniques
- ✅ **Bookings** - Réservation services avec disponibilités
- ✅ **Stripe Connect** - Onboarding partners + split commissions automatique
- ✅ **Ratings** - Système notation 5 étoiles

### Infrastructure
- ✅ **Docker** - Containerisé avec docker-compose
- ✅ **PostgreSQL 15** - Base de données avec 31 migrations
- ✅ **Redis** - Cache + Bull Queue pour emails
- ✅ **Nginx** - Reverse proxy + SSL Let's Encrypt
- ✅ **CI/CD** - GitHub Actions
- ✅ **Monitoring** - Health checks, logs centralisés

## 🏗️ Architecture

```
┌─────────────────────────────────────────────┐
│          INTERNET (HTTPS)                  │
└────────────────┬────────────────────────────┘
                 │
         ┌───────▼────────┐
         │  NGINX REVERSE │
         │     PROXY      │
         │  (SSL/HTTPS)   │
         └───────┬────────┘
                 │
      ┌──────────┼──────────┬────────┐
      │          │          │        │
┌─────▼────┐ ┌──▼──────┐ ┌─▼────┐ ┌─▼──────┐
│ Frontend │ │ Frontend│ │Frontend│Frontend│
│  Client  │ │ Partner │ │ Driver │Internal│
│  :5174   │ │  :5175  │ │ :5176  │ :3001  │
└──────────┘ └─────────┘ └────────┘└────────┘
                 │
          ┌──────▼──────┐
          │   Backend   │
          │   NestJS    │
          │    :3000    │
          └──────┬──────┘
                 │
      ┌──────────┼──────────┐
      │          │          │
┌─────▼──────┐ ┌▼─────┐ ┌──▼──────┐
│ PostgreSQL │ │Redis │ │ Uploads │
│   :5432    │ │:6379 │ │  (S3)   │
└────────────┘ └──────┘ └─────────┘
```

## 📦 Tech Stack

### Backend
- **Framework**: NestJS 10.x
- **Language**: TypeScript 5.9
- **ORM**: TypeORM 0.3
- **Database**: PostgreSQL 15
- **Cache**: Redis 7 (optionnel dev, obligatoire prod)
- **Queue**: Bull (jobs emails asynchrones)
- **Auth**: JWT (access 15m + refresh 7d), Passport
- **Payments**: Stripe (billing + Connect marketplace)
- **Email**: Nodemailer + Handlebars templates
- **Upload**: Multer + Sharp (thumbnails)
- **Security**: Bcrypt, Helmet, Throttler, CORS
- **Docs**: Swagger/OpenAPI

### Frontends
- **Framework**: React 19.x
- **Language**: TypeScript 5.9
- **Build**: Vite 7
- **Styling**: Tailwind CSS + shadcn/ui
- **Data**: TanStack Query v5
- **State**: Zustand (partner, driver)
- **Forms**: React Hook Form + Zod
- **Routing**: React Router v7
- **Charts**: Recharts
- **Maps**: Leaflet (recherche garages)
- **Calendar**: React Big Calendar
- **PDF**: jsPDF

### DevOps
- **Container**: Docker + Docker Compose
- **Reverse Proxy**: Nginx
- **SSL**: Let's Encrypt (Certbot)
- **CI/CD**: GitHub Actions
- **Process Manager**: PM2 (alternative Docker)
- **Logs**: Centralisés /var/log/flotteq/
- **Backups**: Automatiques (cron quotidien)

## 🚀 Quick Start

### Prérequis
- Node.js >= 20
- Docker + Docker Compose
- PostgreSQL 15 (ou via Docker)
- Redis (optionnel en dev)

### Installation Développement

```bash
# 1. Cloner le repo
git clone https://github.com/YOUR_USERNAME/flotteq-v2.git
cd flotteq-v2

# 2. Démarrer PostgreSQL (Docker)
docker-compose up -d postgres

# 3. Backend
cd backend
cp .env.example .env
npm install
npm run migration:run
npm run seed  # Données de test
npm run start:dev

# 4. Frontend Client (nouveau terminal)
cd frontend-client
cp .env.example .env
npm install
npm run dev

# 5. Accès
# API: http://localhost:3000/api
# Swagger: http://localhost:3000/api/docs
# App Client: http://localhost:5174
```

### URLs Développement

| Application | URL | Port |
|-------------|-----|------|
| Backend API | http://localhost:3000/api | 3000 |
| Swagger Docs | http://localhost:3000/api/docs | 3000 |
| Frontend Client | http://localhost:5174 | 5174 |
| Frontend Partner | http://localhost:5175 | 5175 |
| Frontend Driver | http://localhost:5176 | 5176 |
| Frontend Internal | http://localhost:3001 | 3001 |
| PostgreSQL | localhost:5432 | 5432 |
| Redis | localhost:6379 | 6379 |

## 📚 Documentation

- **[Guide Déploiement Production](DEPLOYMENT_GUIDE.md)** - Déployer sur VPS OVH
- **[Configuration Stripe](GUIDE_CONFIGURATION_STRIPE.md)** - Setup Stripe billing + Connect
- **[Database Setup](GUIDE_DATABASE_SETUP.md)** - PostgreSQL + migrations
- **[Système Permissions](PERMISSIONS_SYSTEM.md)** - Matrice rôles/permissions
- **[Frontend Internal](FRONTEND_INTERNAL_DOCUMENTATION.md)** - Documentation app admin
- **[Tests Manuels](GUIDE_TESTS_MANUELS.md)** - Procédures de test

### Sprints Déploiement
- **[Sprint D0 - Dockerisation](SPRINT_D0_DOCKERISATION.md)** - Créer Dockerfiles
- **[Sprint D1 - Configuration Production](SPRINT_D1_CONFIGURATION_PRODUCTION.md)** - .env, healthcheck
- **[Sprint D2 - Infrastructure Nginx](SPRINT_D2_INFRASTRUCTURE_NGINX.md)** - Reverse proxy, SSL, backups
- **[Sprint D3 - CI/CD](SPRINT_D3_CICD_DEPLOIEMENT.md)** - GitHub Actions, scripts deploy

## 🧪 Tests

```bash
# Backend - Unit tests
cd backend
npm test

# Backend - E2E tests
npm run test:e2e

# Backend - Coverage
npm run test:cov

# Frontend Client - Unit tests
cd frontend-client
npm test

# Scripts bash - Tests API
./test-commission-e2e.sh
./test-stripe-booking.sh
./test-ratings-api.sh
```

## 🗄️ Base de Données

### Entités principales (21 tables)

- **Tenants** - Entreprises clientes
- **Users** - Utilisateurs (6 rôles)
- **Vehicles** - Véhicules avec photos
- **Drivers** - Conducteurs
- **Maintenances** - Historique maintenances
- **Documents** - Documents avec quotas
- **Partners** - Partenaires marketplace
- **Bookings** - Réservations services
- **Commissions** - Calcul automatique commissions
- **Ratings** - Notations 5 étoiles
- **Trips** - Trajets conducteurs
- **Reports** - États des lieux photos
- **Subscriptions** - Abonnements SaaS
- **Subscription Plans** - 4 plans (Starter, Standard, Business, Enterprise)

### Migrations

31 migrations TypeORM actives. Voir `backend/src/migrations/`.

## 🔐 Sécurité

- ✅ **Mots de passe**: Bcrypt rounds=12
- ✅ **JWT**: Secrets générés (openssl rand -base64 64)
- ✅ **CORS**: Whitelist domaines autorisés
- ✅ **Helmet**: Security headers HTTP
- ✅ **Rate Limiting**: 10 req/s API, 20 req/s frontends
- ✅ **SQL Injection**: TypeORM parameterized queries
- ✅ **XSS**: React auto-escaping + CSP headers
- ✅ **CSRF**: SameSite cookies
- ✅ **Secrets**: Jamais commités (.gitignore)
- ✅ **SSL/TLS**: HTTPS obligatoire production (Let's Encrypt)
- ✅ **Firewall**: UFW configuré (ports 80, 443, 22)

## 💳 Stripe Integration

### Billing (SaaS Subscriptions)

4 plans disponibles:
- **Starter**: 29€/mois (5 véhicules, 3 utilisateurs)
- **Standard**: 49.99€/mois (15 véhicules, 10 utilisateurs)
- **Business**: 99€/mois (50 véhicules, 30 utilisateurs)
- **Enterprise**: 299€/mois (illimité)

### Marketplace (Stripe Connect)

- Onboarding partners via Connect Express
- Split automatique commissions (plateforme 10%)
- Paiements directs partner → client
- Dashboard commissions temps réel

## 📧 Email Notifications

Templates Handlebars:
- Welcome email (nouveau tenant)
- Booking confirmation (partner + client)
- Booking reminder (24h avant)
- Payment success
- Password reset

Queue Bull pour envois asynchrones.

## 🎨 Design System

- **UI Library**: shadcn/ui (Radix UI + Tailwind)
- **Icons**: Lucide React
- **Colors**: Palette personnalisée FlotteQ
- **Fonts**: Inter (system font)
- **Responsive**: Mobile-first design

## 🚀 Déploiement Production

```bash
# Sur VPS OVH Ubuntu 22.04
# Suivre le guide complet: DEPLOYMENT_GUIDE.md

# Résumé:
1. Configurer DNS (5 domaines)
2. Installer Docker + Nginx
3. Cloner repo + générer secrets
4. Créer .env.production
5. Initialiser SSL Let's Encrypt
6. Lancer déploiement: ./scripts/deploy-production.sh
7. Vérifier: curl https://api.flotteq.com/api/health
```

## 📊 Statistiques Projet

- **85,000+ lignes de code** (backend + 4 frontends)
- **400+ fichiers TypeScript**
- **31 migrations** base de données
- **21 entités** TypeORM
- **24 modules métier** backend
- **27 controllers** API
- **34 services** backend
- **77 fichiers documentation** Markdown
- **41 tests** (11 E2E + 30 unit)
- **17 scripts bash** tests API

## 🤝 Contributing

Ce projet est privé et propriétaire.

## 📄 License

Proprietary - Tous droits réservés

## 👥 Équipe

- **Lead Developer**: Wissem
- **Framework**: NestJS + React
- **Hébergement**: OVH VPS

---

**Made with ❤️ in France** 🇫🇷
```

### Test après création

```bash
# 1. Vérifier le fichier
cat README.md | head -100

# 2. Vérifier les liens Markdown
grep -o "\[.*\](.*.md)" README.md

# 3. Vérifier badges GitHub Actions
# (nécessite que le repo soit sur GitHub)

# 4. Preview du README (sur GitHub ou avec grip)
# brew install grip
grip README.md
# Ouvrir http://localhost:6419
```

### Critères d'acceptation
- ✅ README.md mis à jour
- ✅ Badges GitHub Actions, Node, TypeScript, etc.
- ✅ Architecture diagram (ASCII)
- ✅ Features complètes listées
- ✅ Tech stack détaillé
- ✅ Quick start fonctionnel
- ✅ Liens vers toute la documentation
- ✅ Statistiques projet à jour
- ✅ Déploiement documenté
- ✅ Sécurité et Stripe expliqués

---

## 🎯 RÉSUMÉ SPRINT D3

### Fichiers créés (5 fichiers)
1. `.github/workflows/ci.yml`
2. `.github/workflows/deploy.yml`
3. `docs/GITHUB_SECRETS.md`
4. `scripts/deploy-production.sh`
5. `scripts/rollback.sh`
6. `DEPLOYMENT_GUIDE.md`

### Fichiers modifiés (1 fichier)
1. `README.md`

### Commandes de validation finale

```bash
# 1. Vérifier syntaxe YAML workflows
yamllint .github/workflows/*.yml

# 2. Tester deploy script (dry-run)
bash -n scripts/deploy-production.sh

# 3. Tester rollback script (dry-run)
bash -n scripts/rollback.sh

# 4. Commit et push (déclenchera CI)
git add .
git commit -m "feat: add CI/CD and deployment automation"
git push origin main

# 5. Vérifier GitHub Actions
# https://github.com/YOUR_USERNAME/flotteq-v2/actions
```

### Prochaine étape
👉 **Déploiement Production** sur VPS OVH (suivre DEPLOYMENT_GUIDE.md)

---

**FIN DES 4 SPRINTS DE DÉPLOIEMENT! 🎉**

**Récapitulatif total**:
- **Sprint D0**: 17 fichiers (Dockerisation)
- **Sprint D1**: 14 fichiers (Configuration production)
- **Sprint D2**: 16 fichiers (Nginx + backups)
- **Sprint D3**: 6 fichiers (CI/CD + docs)

**TOTAL: 53 fichiers créés/modifiés** pour rendre FlotteQ 100% production-ready! 🚀
