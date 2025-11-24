# 🐳 SPRINT D0 : DOCKERISATION (CRITIQUE)

**Objectif** : Créer tous les fichiers Docker manquants pour permettre le déploiement containerisé.

**Durée estimée** : 2-3 heures
**Priorité** : CRITIQUE (Blocker production)

---

## 📋 TICKET D0-001 : Créer Dockerfile Backend Multi-Stage

### Contexte
Le fichier `docker-compose.yml` (ligne 27) référence `./backend/Dockerfile` qui **n'existe pas**.
Sans ce fichier, `docker-compose up` échoue avec l'erreur : `unable to prepare context: path "./backend/Dockerfile" not found`

### Objectif
Créer un Dockerfile optimisé multi-stage pour le backend NestJS qui :
- Build l'application TypeScript
- Minimise la taille de l'image finale
- Exclut les devDependencies en production
- Configure les volumes pour uploads

### Fichier à créer
**Chemin** : `/Users/wissem/Flotteq-v2/backend/Dockerfile`

### Code complet

```dockerfile
# Stage 1: Builder
FROM node:20-alpine AS builder

WORKDIR /app

# Copier package.json et package-lock.json
COPY package*.json ./

# Installer toutes les dépendances (dev + prod)
RUN npm ci

# Copier le code source
COPY . .

# Build l'application
RUN npm run build

# Stage 2: Production
FROM node:20-alpine

WORKDIR /app

# Copier package.json
COPY package*.json ./

# Installer UNIQUEMENT les dépendances de production
RUN npm ci --only=production

# Copier le code compilé depuis le builder
COPY --from=builder /app/dist ./dist

# Créer le dossier uploads
RUN mkdir -p /app/uploads && chown -R node:node /app/uploads

# Utiliser l'utilisateur non-root 'node'
USER node

# Exposer le port 3000
EXPOSE 3000

# Variables d'environnement par défaut (override avec .env)
ENV NODE_ENV=production \
    PORT=3000

# Healthcheck
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Commande de démarrage
CMD ["node", "dist/main"]
```

### Test après création

```bash
# 1. Aller dans le dossier backend
cd /Users/wissem/Flotteq-v2/backend

# 2. Build l'image
docker build -t flotteq-backend:test .

# 3. Vérifier que l'image existe
docker images | grep flotteq-backend

# 4. Tester le run (optionnel)
docker run --rm -p 3000:3000 \
  -e DB_HOST=host.docker.internal \
  -e DB_PORT=5432 \
  -e DB_USER=postgres \
  -e DB_PASSWORD=flotteq123 \
  -e DB_NAME=flotteq_dev \
  -e JWT_ACCESS_SECRET=test \
  -e JWT_REFRESH_SECRET=test \
  flotteq-backend:test

# 5. Vérifier les logs (dans un autre terminal)
docker logs $(docker ps -q --filter ancestor=flotteq-backend:test)

# 6. Tester l'API
curl http://localhost:3000/api/health
```

### Critères d'acceptation
- ✅ Fichier `backend/Dockerfile` existe
- ✅ `docker build` réussit sans erreur
- ✅ Image finale < 300MB (vérifier avec `docker images`)
- ✅ Container démarre sans erreur
- ✅ Healthcheck fonctionne
- ✅ API répond sur port 3000

---

## 📋 TICKET D0-002 : Créer Dockerfiles Frontends (4 fichiers)

### Contexte
Les 4 frontends (client, partner, driver, internal) doivent être containerisés pour le déploiement production.
Actuellement, aucun Dockerfile n'existe pour eux.

### Objectif
Créer 4 Dockerfiles identiques (structure Vite + Nginx) pour servir les frontends en production.

### Fichiers à créer (4 fichiers)

#### 1. Frontend Client

**Chemin** : `/Users/wissem/Flotteq-v2/frontend-client/Dockerfile`

```dockerfile
# Stage 1: Builder
FROM node:20-alpine AS builder

WORKDIR /app

# Copier package.json
COPY package*.json ./

# Installer dépendances
RUN npm ci

# Copier le code source
COPY . .

# Build production
RUN npm run build

# Stage 2: Nginx
FROM nginx:alpine

# Copier le build depuis le builder
COPY --from=builder /app/dist /usr/share/nginx/html

# Copier configuration Nginx custom
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Exposer port 80
EXPOSE 80

# Healthcheck
HEALTHCHECK --interval=30s --timeout=3s \
  CMD wget --quiet --tries=1 --spider http://localhost/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
```

**Créer aussi** : `/Users/wissem/Flotteq-v2/frontend-client/nginx.conf`

```nginx
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # SPA routing - toutes les routes vers index.html
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
}
```

#### 2. Frontend Partner

**Chemin** : `/Users/wissem/Flotteq-v2/frontend-partner/Dockerfile`

```dockerfile
# MÊME CONTENU que frontend-client/Dockerfile
# (copier-coller le contenu ci-dessus)
```

**Créer aussi** : `/Users/wissem/Flotteq-v2/frontend-partner/nginx.conf`

```nginx
# MÊME CONTENU que frontend-client/nginx.conf
# (copier-coller le contenu ci-dessus)
```

#### 3. Frontend Driver

**Chemin** : `/Users/wissem/Flotteq-v2/frontend-driver/Dockerfile`

```dockerfile
# MÊME CONTENU que frontend-client/Dockerfile
```

**Créer aussi** : `/Users/wissem/Flotteq-v2/frontend-driver/nginx.conf`

```nginx
# MÊME CONTENU que frontend-client/nginx.conf
```

#### 4. Frontend Internal

**Chemin** : `/Users/wissem/Flotteq-v2/frontend-internal/Dockerfile`

```dockerfile
# MÊME CONTENU que frontend-client/Dockerfile
```

**Créer aussi** : `/Users/wissem/Flotteq-v2/frontend-internal/nginx.conf`

```nginx
# MÊME CONTENU que frontend-client/nginx.conf
```

### Test après création

```bash
# Tester chaque frontend (exemple avec client)
cd /Users/wissem/Flotteq-v2/frontend-client

# 1. Build
docker build -t flotteq-frontend-client:test .

# 2. Run
docker run --rm -p 8080:80 flotteq-frontend-client:test

# 3. Tester dans le navigateur
open http://localhost:8080

# 4. Vérifier les logs
docker logs $(docker ps -q --filter ancestor=flotteq-frontend-client:test)

# Répéter pour partner, driver, internal
```

### Critères d'acceptation
- ✅ 4 Dockerfiles créés (client, partner, driver, internal)
- ✅ 4 nginx.conf créés
- ✅ Chaque `docker build` réussit
- ✅ Images finales < 50MB chacune
- ✅ Nginx sert correctement les fichiers statiques
- ✅ Routing SPA fonctionne (refresh page ne fait pas 404)

---

## 📋 TICKET D0-003 : Créer .dockerignore (5 fichiers)

### Contexte
Sans `.dockerignore`, Docker copie **tout** (node_modules, .env, .git, etc.) dans le contexte de build, ce qui :
- Ralentit le build (giga-octets copiés)
- Augmente la taille de l'image
- Expose potentiellement des secrets

### Objectif
Créer 5 fichiers `.dockerignore` pour exclure les fichiers inutiles du build Docker.

### Fichiers à créer (5 fichiers)

#### 1. Backend

**Chemin** : `/Users/wissem/Flotteq-v2/backend/.dockerignore`

```
# Dependencies
node_modules
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Build outputs
dist
*.tsbuildinfo

# Environment files
.env
.env.*
!.env.example

# Tests
coverage
*.spec.ts
test

# Logs
*.log
logs

# OS files
.DS_Store
Thumbs.db

# Git
.git
.gitignore

# IDE
.vscode
.idea
*.swp
*.swo

# Uploads (à exclure du build, géré par volume)
uploads/*

# Docker
Dockerfile
.dockerignore
docker-compose*.yml
```

#### 2. Frontend Client

**Chemin** : `/Users/wissem/Flotteq-v2/frontend-client/.dockerignore`

```
# Dependencies
node_modules
npm-debug.log*

# Build
dist
*.tsbuildinfo

# Environment
.env
.env.*
!.env.example

# Tests
coverage
*.test.*
*.spec.*

# Logs
*.log

# OS
.DS_Store

# Git
.git
.gitignore

# IDE
.vscode
.idea
*.swp

# Docker
Dockerfile
.dockerignore
```

#### 3. Frontend Partner

**Chemin** : `/Users/wissem/Flotteq-v2/frontend-partner/.dockerignore`

```
# MÊME CONTENU que frontend-client/.dockerignore
```

#### 4. Frontend Driver

**Chemin** : `/Users/wissem/Flotteq-v2/frontend-driver/.dockerignore`

```
# MÊME CONTENU que frontend-client/.dockerignore
```

#### 5. Frontend Internal

**Chemin** : `/Users/wissem/Flotteq-v2/frontend-internal/.dockerignore`

```
# MÊME CONTENU que frontend-client/.dockerignore
```

### Test après création

```bash
# Vérifier que .dockerignore est respecté
cd /Users/wissem/Flotteq-v2/backend

# 1. Build avec contexte verbose
docker build --no-cache --progress=plain -t test . 2>&1 | grep -E "(node_modules|\.env)"

# ❌ Ne devrait PAS afficher "Sending node_modules" ou ".env"
# ✅ Si rien ne s'affiche = OK, .dockerignore fonctionne

# 2. Vérifier la taille du contexte (doit être < 10MB)
docker build --progress=plain -t test . 2>&1 | grep "Sending build context"

# Exemple sortie attendue : "Sending build context to Docker daemon  5.234MB"
```

### Critères d'acceptation
- ✅ 5 fichiers `.dockerignore` créés
- ✅ Contexte de build < 10MB par projet
- ✅ `node_modules/` exclu (vérifier logs build)
- ✅ `.env` exclu
- ✅ Temps de build réduit de 50%+

---

## 📋 TICKET D0-004 : Créer docker-compose.production.yml

### Contexte
Le fichier `docker-compose.yml` actuel est configuré pour le **développement** (hot reload, volumes code source).
Il faut un fichier séparé pour la **production** avec :
- Build optimisé (pas de volumes code)
- Secrets gérés proprement
- Healthchecks actifs
- Redis pour les queues
- Nginx reverse proxy

### Objectif
Créer `docker-compose.production.yml` complet avec tous les services production.

### Fichier à créer

**Chemin** : `/Users/wissem/Flotteq-v2/docker-compose.production.yml`

### Code complet

```yaml
version: '3.8'

services:
  # PostgreSQL Database
  postgres:
    image: postgres:15-alpine
    container_name: flotteq_db_prod
    restart: always
    environment:
      POSTGRES_USER: ${DB_USER:-flotteq_prod}
      POSTGRES_PASSWORD_FILE: /run/secrets/db_password
      POSTGRES_DB: ${DB_NAME:-flotteq_production}
    secrets:
      - db_password
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./backups:/backups
    networks:
      - flotteq_network
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${DB_USER:-flotteq_prod}"]
      interval: 10s
      timeout: 5s
      retries: 5

  # Redis (pour Bull Queue + Cache)
  redis:
    image: redis:7-alpine
    container_name: flotteq_redis_prod
    restart: always
    command: redis-server --requirepass ${REDIS_PASSWORD:-flotteq_redis_pass}
    volumes:
      - redis_data:/data
    networks:
      - flotteq_network
    healthcheck:
      test: ["CMD", "redis-cli", "--raw", "incr", "ping"]
      interval: 10s
      timeout: 3s
      retries: 5

  # Backend NestJS API
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: flotteq_backend_prod
    restart: always
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    environment:
      NODE_ENV: production
      PORT: 3000
      DB_HOST: postgres
      DB_PORT: 5432
      DB_USER: ${DB_USER:-flotteq_prod}
      DB_NAME: ${DB_NAME:-flotteq_production}
      REDIS_HOST: redis
      REDIS_PORT: 6379
      REDIS_ENABLED: "true"
      REDIS_PASSWORD: ${REDIS_PASSWORD:-flotteq_redis_pass}
      # Autres vars depuis .env.production
      JWT_ACCESS_SECRET: ${JWT_ACCESS_SECRET}
      JWT_REFRESH_SECRET: ${JWT_REFRESH_SECRET}
      JWT_PARTNER_SECRET: ${JWT_PARTNER_SECRET}
      STRIPE_SECRET_KEY: ${STRIPE_SECRET_KEY}
      STRIPE_WEBHOOK_SECRET: ${STRIPE_WEBHOOK_SECRET}
      CORS_ORIGIN: ${CORS_ORIGIN}
      FRONTEND_CLIENT_URL: ${FRONTEND_CLIENT_URL}
      PARTNER_FRONTEND_URL: ${PARTNER_FRONTEND_URL}
    secrets:
      - db_password
    volumes:
      - uploads_data:/app/uploads
    networks:
      - flotteq_network
    healthcheck:
      test: ["CMD", "node", "-e", "require('http').get('http://localhost:3000/api/health', (r) => process.exit(r.statusCode === 200 ? 0 : 1))"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

  # Frontend Client (Tenants)
  frontend-client:
    build:
      context: ./frontend-client
      dockerfile: Dockerfile
      args:
        VITE_API_URL: ${VITE_API_URL}
        VITE_STRIPE_PUBLISHABLE_KEY: ${VITE_STRIPE_PUBLISHABLE_KEY}
    container_name: flotteq_frontend_client_prod
    restart: always
    networks:
      - flotteq_network
    healthcheck:
      test: ["CMD", "wget", "--quiet", "--tries=1", "--spider", "http://localhost/"]
      interval: 30s
      timeout: 3s
      retries: 3

  # Frontend Partner (Garages)
  frontend-partner:
    build:
      context: ./frontend-partner
      dockerfile: Dockerfile
      args:
        VITE_API_URL: ${VITE_API_URL}
    container_name: flotteq_frontend_partner_prod
    restart: always
    networks:
      - flotteq_network
    healthcheck:
      test: ["CMD", "wget", "--quiet", "--tries=1", "--spider", "http://localhost/"]
      interval: 30s
      timeout: 3s
      retries: 3

  # Frontend Driver (Conducteurs)
  frontend-driver:
    build:
      context: ./frontend-driver
      dockerfile: Dockerfile
      args:
        VITE_API_URL: ${VITE_API_URL}
        VITE_STRIPE_PUBLISHABLE_KEY: ${VITE_STRIPE_PUBLISHABLE_KEY}
    container_name: flotteq_frontend_driver_prod
    restart: always
    networks:
      - flotteq_network
    healthcheck:
      test: ["CMD", "wget", "--quiet", "--tries=1", "--spider", "http://localhost/"]
      interval: 30s
      timeout: 3s
      retries: 3

  # Frontend Internal (Admin FlotteQ)
  frontend-internal:
    build:
      context: ./frontend-internal
      dockerfile: Dockerfile
      args:
        VITE_API_URL: ${VITE_API_URL}
    container_name: flotteq_frontend_internal_prod
    restart: always
    networks:
      - flotteq_network
    healthcheck:
      test: ["CMD", "wget", "--quiet", "--tries=1", "--spider", "http://localhost/"]
      interval: 30s
      timeout: 3s
      retries: 3

  # Nginx Reverse Proxy
  nginx:
    image: nginx:alpine
    container_name: flotteq_nginx_prod
    restart: always
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      - ./nginx/conf.d:/etc/nginx/conf.d:ro
      - ./certbot/conf:/etc/letsencrypt:ro
      - ./certbot/www:/var/www/certbot:ro
    depends_on:
      - backend
      - frontend-client
      - frontend-partner
      - frontend-driver
      - frontend-internal
    networks:
      - flotteq_network
    healthcheck:
      test: ["CMD", "nginx", "-t"]
      interval: 30s
      timeout: 3s
      retries: 3

  # Certbot (SSL Let's Encrypt)
  certbot:
    image: certbot/certbot
    container_name: flotteq_certbot_prod
    volumes:
      - ./certbot/conf:/etc/letsencrypt
      - ./certbot/www:/var/www/certbot
    entrypoint: "/bin/sh -c 'trap exit TERM; while :; do certbot renew; sleep 12h & wait $${!}; done;'"

volumes:
  postgres_data:
    driver: local
  redis_data:
    driver: local
  uploads_data:
    driver: local

networks:
  flotteq_network:
    driver: bridge

secrets:
  db_password:
    file: ./secrets/db_password.txt
```

### Fichier secret à créer

**Chemin** : `/Users/wissem/Flotteq-v2/secrets/db_password.txt`

```bash
# Créer le dossier secrets
mkdir -p /Users/wissem/Flotteq-v2/secrets

# Générer mot de passe sécurisé
openssl rand -base64 32 > /Users/wissem/Flotteq-v2/secrets/db_password.txt

# Vérifier
cat /Users/wissem/Flotteq-v2/secrets/db_password.txt
```

### Test après création

```bash
# 1. Vérifier la syntaxe
cd /Users/wissem/Flotteq-v2
docker-compose -f docker-compose.production.yml config

# 2. Créer le fichier .env.production (temporaire pour test)
cat > .env.production << 'EOF'
DB_USER=flotteq_prod
DB_NAME=flotteq_production
REDIS_PASSWORD=test_redis_pass
JWT_ACCESS_SECRET=test_access_secret_32chars_min
JWT_REFRESH_SECRET=test_refresh_secret_32chars_min
JWT_PARTNER_SECRET=test_partner_secret_32chars_min
STRIPE_SECRET_KEY=sk_test_fake
STRIPE_WEBHOOK_SECRET=whsec_fake
CORS_ORIGIN=https://app.flotteq.com,https://partner.flotteq.com
FRONTEND_CLIENT_URL=https://app.flotteq.com
PARTNER_FRONTEND_URL=https://partner.flotteq.com
VITE_API_URL=https://api.flotteq.com
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_fake
EOF

# 3. Build les images (SANS run)
docker-compose -f docker-compose.production.yml build --no-cache

# 4. Vérifier les images créées
docker images | grep flotteq

# 5. Tester le démarrage (optionnel - va créer les containers)
# docker-compose -f docker-compose.production.yml up -d

# 6. Vérifier les healthchecks
# docker-compose -f docker-compose.production.yml ps
```

### Critères d'acceptation
- ✅ Fichier `docker-compose.production.yml` créé
- ✅ Syntaxe YAML valide (`config` passe)
- ✅ Secrets Docker configurés
- ✅ Healthchecks pour tous les services
- ✅ Redis ajouté (absent dans dev)
- ✅ Nginx reverse proxy configuré
- ✅ Certbot pour SSL auto-renewal
- ✅ Volumes persistants (postgres, redis, uploads)
- ✅ Build réussit pour tous les services

---

## 🎯 RÉSUMÉ SPRINT D0

### Fichiers créés (17 fichiers)
1. `backend/Dockerfile`
2. `backend/.dockerignore`
3. `frontend-client/Dockerfile`
4. `frontend-client/nginx.conf`
5. `frontend-client/.dockerignore`
6. `frontend-partner/Dockerfile`
7. `frontend-partner/nginx.conf`
8. `frontend-partner/.dockerignore`
9. `frontend-driver/Dockerfile`
10. `frontend-driver/nginx.conf`
11. `frontend-driver/.dockerignore`
12. `frontend-internal/Dockerfile`
13. `frontend-internal/nginx.conf`
14. `frontend-internal/.dockerignore`
15. `docker-compose.production.yml`
16. `secrets/db_password.txt`
17. `.env.production` (temporaire pour tests)

### Commandes de validation finale

```bash
# Build TOUT
docker-compose -f docker-compose.production.yml build

# Vérifier taille des images
docker images | grep flotteq

# Résultats attendus:
# flotteq_backend_prod         < 300MB
# flotteq_frontend_client_prod < 50MB
# flotteq_frontend_partner_prod < 50MB
# flotteq_frontend_driver_prod < 50MB
# flotteq_frontend_internal_prod < 50MB
```

### Prochaine étape
👉 **SPRINT D1 : Configuration Production** (création .env.production.example complets)
