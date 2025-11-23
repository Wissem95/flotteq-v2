# Stage 1: Builder
FROM node:20.11.0-alpine AS builder

WORKDIR /app

# Copier package.json et package-lock.json
COPY package*.json ./

# Installer toutes les dépendances (dev + prod)
RUN npm ci --legacy-peer-deps

# Copier le code source
COPY . .

# Build l'application
RUN npm run build

# Stage 2: Production
FROM node:20.11.0-alpine

WORKDIR /app

# Installer netcat pour le healthcheck de PostgreSQL
RUN apk add --no-cache netcat-openbsd

# Copier package.json
COPY package*.json ./

# Installer UNIQUEMENT les dépendances de production
RUN npm ci --only=production --legacy-peer-deps

# Copier le code compilé depuis le builder
COPY --from=builder /app/dist ./dist

# Copier les migrations pour pouvoir les exécuter
COPY --from=builder /app/src/migrations ./src/migrations
COPY --from=builder /app/src/config ./src/config

# Copier le script d'entrypoint
COPY docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

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

# Commande de démarrage via entrypoint
ENTRYPOINT ["docker-entrypoint.sh"]
