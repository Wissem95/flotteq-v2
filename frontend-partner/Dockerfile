# Stage 1: Builder
FROM node:20.11.0-alpine AS builder

WORKDIR /app

# Arguments de build pour variables VITE (injectées au build-time)
ARG VITE_API_BASE

# Copier package.json
COPY package*.json ./

# Installer dépendances
RUN npm ci

# Copier le code source
COPY . .

# Build production avec variables VITE
ENV VITE_API_BASE=$VITE_API_BASE

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
