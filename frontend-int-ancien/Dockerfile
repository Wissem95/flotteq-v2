# ─── Étape 1 : Build de l'application React ───
FROM node:20-alpine AS builder

# Créer et positionner le répertoire de travail
WORKDIR /app

# Copier package.json et lockfiles pour installer les dépendances
COPY package.json package-lock.json* pnpm-lock.yaml* bun.lockb* ./

# Installer TOUTES les dépendances (y compris react-datepicker et date-fns)
RUN npm install

# Copier le reste du code source
COPY . .

# Lancer la compilation de production
RUN npm run build

# ─── Étape 2 : Serveur Nginx pour l'application ───
FROM nginx:alpine

# Copier le build généré dans le dossier nginx par défaut
COPY --from=builder /app/dist /usr/share/nginx/html

# (Optionnel) Si vous avez un fichier nginx.conf personnalisé, le copier :
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Exposer le port 80
EXPOSE 80

# Démarrer Nginx en mode foreground
CMD ["nginx", "-g", "daemon off;"]

