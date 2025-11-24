# 🌐 SPRINT D2 : INFRASTRUCTURE & NGINX

**Objectif** : Créer la configuration Nginx, SSL, backups et process management pour la production.

**Durée estimée** : 2-3 heures
**Priorité** : MAJEURE (Requis pour VPS)

---

## 📋 TICKET D2-001 : Créer Configuration Nginx Reverse Proxy

### Contexte
En production, Nginx doit servir de **reverse proxy** pour router:
- `api.flotteq.com` → Backend (port 3000)
- `app.flotteq.com` → Frontend Client (port 80 container)
- `partner.flotteq.com` → Frontend Partner (port 80 container)
- `driver.flotteq.com` → Frontend Driver (port 80 container)
- `admin.flotteq.com` → Frontend Internal (port 80 container)

Sans Nginx, impossible de gérer multi-domaines + SSL.

### Objectif
Créer une configuration Nginx complète avec reverse proxy, compression, caching, et security headers.

### Fichiers à créer (6 fichiers)

#### 1. Configuration Nginx Principale

**Chemin** : `/Users/wissem/Flotteq-v2/nginx/nginx.conf`

```nginx
user nginx;
worker_processes auto;
error_log /var/log/nginx/error.log warn;
pid /var/run/nginx.pid;

events {
    worker_connections 2048;
    use epoll;
    multi_accept on;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    # Logging
    log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                    '$status $body_bytes_sent "$http_referer" '
                    '"$http_user_agent" "$http_x_forwarded_for"';

    access_log /var/log/nginx/access.log main;

    # Performance
    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    types_hash_max_size 2048;
    client_max_body_size 50M;

    # Gzip Compression
    gzip on;
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types text/plain text/css text/xml text/javascript
               application/json application/javascript application/xml+rss
               application/rss+xml font/truetype font/opentype
               application/vnd.ms-fontobject image/svg+xml;

    # Rate Limiting
    limit_req_zone $binary_remote_addr zone=api_limit:10m rate=10r/s;
    limit_req_zone $binary_remote_addr zone=general_limit:10m rate=20r/s;

    # Include configs
    include /etc/nginx/conf.d/*.conf;
}
```

#### 2. Backend API (api.flotteq.com)

**Chemin** : `/Users/wissem/Flotteq-v2/nginx/conf.d/api.conf`

```nginx
# Backend API - api.flotteq.com
upstream backend {
    server backend:3000 max_fails=3 fail_timeout=30s;
    keepalive 32;
}

server {
    listen 80;
    server_name api.flotteq.com;

    # Redirect HTTP to HTTPS
    location / {
        return 301 https://$server_name$request_uri;
    }

    # Let's Encrypt challenge
    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }
}

server {
    listen 443 ssl http2;
    server_name api.flotteq.com;

    # SSL Certificates (Let's Encrypt)
    ssl_certificate /etc/letsencrypt/live/api.flotteq.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.flotteq.com/privkey.pem;

    # SSL Configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers 'ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384';
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # Security Headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # Logging
    access_log /var/log/nginx/api_access.log main;
    error_log /var/log/nginx/api_error.log warn;

    # Proxy to Backend
    location /api {
        limit_req zone=api_limit burst=20 nodelay;

        proxy_pass http://backend;
        proxy_http_version 1.1;

        # Headers
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Forwarded-Host $host;
        proxy_set_header X-Forwarded-Port $server_port;

        # WebSocket support
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";

        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;

        # Buffering
        proxy_buffering off;
        proxy_request_buffering off;
    }

    # Uploads static files
    location /uploads {
        proxy_pass http://backend/uploads;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;

        # Cache uploaded files
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Health check (public, pas de rate limit)
    location /api/health {
        proxy_pass http://backend/api/health;
        proxy_set_header Host $host;
        access_log off;
    }
}
```

#### 3. Frontend Client (app.flotteq.com)

**Chemin** : `/Users/wissem/Flotteq-v2/nginx/conf.d/app.conf`

```nginx
# Frontend Client - app.flotteq.com
upstream frontend_client {
    server frontend-client:80;
}

server {
    listen 80;
    server_name app.flotteq.com;

    location / {
        return 301 https://$server_name$request_uri;
    }

    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }
}

server {
    listen 443 ssl http2;
    server_name app.flotteq.com;

    ssl_certificate /etc/letsencrypt/live/app.flotteq.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/app.flotteq.com/privkey.pem;

    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers 'ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256';
    ssl_prefer_server_ciphers off;

    # Security Headers
    add_header Strict-Transport-Security "max-age=31536000" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;

    # Logging
    access_log /var/log/nginx/app_access.log main;
    error_log /var/log/nginx/app_error.log warn;

    location / {
        limit_req zone=general_limit burst=50 nodelay;

        proxy_pass http://frontend_client;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # Cache static assets
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
            proxy_pass http://frontend_client;
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }
}
```

#### 4. Frontend Partner (partner.flotteq.com)

**Chemin** : `/Users/wissem/Flotteq-v2/nginx/conf.d/partner.conf`

```nginx
# Frontend Partner - partner.flotteq.com
upstream frontend_partner {
    server frontend-partner:80;
}

server {
    listen 80;
    server_name partner.flotteq.com;

    location / {
        return 301 https://$server_name$request_uri;
    }

    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }
}

server {
    listen 443 ssl http2;
    server_name partner.flotteq.com;

    ssl_certificate /etc/letsencrypt/live/partner.flotteq.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/partner.flotteq.com/privkey.pem;

    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers 'ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256';
    ssl_prefer_server_ciphers off;

    add_header Strict-Transport-Security "max-age=31536000" always;
    add_header X-Frame-Options "SAMEORIGIN" always;

    access_log /var/log/nginx/partner_access.log main;
    error_log /var/log/nginx/partner_error.log warn;

    location / {
        limit_req zone=general_limit burst=50 nodelay;
        proxy_pass http://frontend_partner;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

#### 5. Frontend Driver (driver.flotteq.com)

**Chemin** : `/Users/wissem/Flotteq-v2/nginx/conf.d/driver.conf`

```nginx
# Frontend Driver - driver.flotteq.com
upstream frontend_driver {
    server frontend-driver:80;
}

server {
    listen 80;
    server_name driver.flotteq.com;

    location / {
        return 301 https://$server_name$request_uri;
    }

    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }
}

server {
    listen 443 ssl http2;
    server_name driver.flotteq.com;

    ssl_certificate /etc/letsencrypt/live/driver.flotteq.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/driver.flotteq.com/privkey.pem;

    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers off;

    add_header Strict-Transport-Security "max-age=31536000" always;

    access_log /var/log/nginx/driver_access.log main;
    error_log /var/log/nginx/driver_error.log warn;

    location / {
        limit_req zone=general_limit burst=50 nodelay;
        proxy_pass http://frontend_driver;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

#### 6. Frontend Internal (admin.flotteq.com)

**Chemin** : `/Users/wissem/Flotteq-v2/nginx/conf.d/admin.conf`

```nginx
# Frontend Internal - admin.flotteq.com
upstream frontend_internal {
    server frontend-internal:80;
}

server {
    listen 80;
    server_name admin.flotteq.com;

    location / {
        return 301 https://$server_name$request_uri;
    }

    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }
}

server {
    listen 443 ssl http2;
    server_name admin.flotteq.com;

    ssl_certificate /etc/letsencrypt/live/admin.flotteq.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/admin.flotteq.com/privkey.pem;

    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers off;

    add_header Strict-Transport-Security "max-age=31536000" always;

    access_log /var/log/nginx/admin_access.log main;
    error_log /var/log/nginx/admin_error.log warn;

    # IP Whitelist (optionnel - décommenter pour restreindre)
    # allow 1.2.3.4;  # IP bureau
    # deny all;

    location / {
        limit_req zone=general_limit burst=50 nodelay;
        proxy_pass http://frontend_internal;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### Test après création

```bash
# 1. Vérifier la syntaxe Nginx
nginx -t -c /Users/wissem/Flotteq-v2/nginx/nginx.conf

# Ou si Nginx pas installé localement, via Docker:
docker run --rm -v /Users/wissem/Flotteq-v2/nginx:/etc/nginx:ro nginx:alpine nginx -t

# 2. Tester avec docker-compose (sans SSL pour l'instant)
cd /Users/wissem/Flotteq-v2
docker-compose -f docker-compose.production.yml up -d nginx

# 3. Tester les redirections HTTP → HTTPS (devrait fail sans SSL)
curl -I http://localhost/api/health

# 4. Vérifier les logs
docker-compose -f docker-compose.production.yml logs nginx
```

### Critères d'acceptation
- ✅ 6 fichiers Nginx créés (1 principal + 5 conf.d)
- ✅ Syntaxe Nginx valide (`nginx -t` OK)
- ✅ Rate limiting configuré (10r/s API, 20r/s frontends)
- ✅ Gzip compression activée
- ✅ Security headers présents (HSTS, X-Frame-Options)
- ✅ Redirect HTTP → HTTPS configuré
- ✅ WebSocket support (Upgrade header)
- ✅ Cache static assets (1 year)

---

## 📋 TICKET D2-002 : Configuration SSL Let's Encrypt

### Contexte
Let's Encrypt fournit des certificats SSL gratuits avec renouvellement automatique.
Certbot doit tourner en container pour obtenir et renouveler les certificats.

### Objectif
Créer les scripts et configuration pour obtenir des certificats SSL pour les 5 domaines.

### Fichiers à créer (3 fichiers)

#### 1. Script Initialisation SSL (Premier déploiement)

**Chemin** : `/Users/wissem/Flotteq-v2/scripts/init-ssl.sh`

```bash
#!/bin/bash
set -e

echo "🔐 Initialisation SSL Let's Encrypt pour FlotteQ"

# Variables
DOMAINS=(
  "api.flotteq.com"
  "app.flotteq.com"
  "partner.flotteq.com"
  "driver.flotteq.com"
  "admin.flotteq.com"
)
EMAIL="admin@flotteq.com"
STAGING=0  # 0 = production, 1 = staging (pour tests)

# Vérifier que les domaines pointent vers le VPS
echo "⚠️  IMPORTANT: Vérifier que les domaines DNS pointent vers ce serveur!"
echo ""
for domain in "${DOMAINS[@]}"; do
  IP=$(dig +short "$domain" | tail -n1)
  echo "  $domain → $IP"
done
echo ""
read -p "Les IPs sont correctes? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
  echo "❌ Configuration DNS requise avant de continuer"
  exit 1
fi

# Créer dossiers certbot
mkdir -p certbot/conf certbot/www

# Démarrer Nginx en mode HTTP seulement (pour acme-challenge)
echo "📦 Démarrage Nginx temporaire..."
docker-compose -f docker-compose.production.yml up -d nginx

# Obtenir certificats pour chaque domaine
for domain in "${DOMAINS[@]}"; do
  echo ""
  echo "🔑 Obtention certificat pour $domain..."

  if [ $STAGING -eq 1 ]; then
    STAGING_ARG="--staging"
  else
    STAGING_ARG=""
  fi

  docker-compose -f docker-compose.production.yml run --rm certbot certonly \
    --webroot \
    --webroot-path=/var/www/certbot \
    --email "$EMAIL" \
    --agree-tos \
    --no-eff-email \
    $STAGING_ARG \
    -d "$domain"

  if [ $? -eq 0 ]; then
    echo "✅ Certificat obtenu pour $domain"
  else
    echo "❌ Échec pour $domain"
    exit 1
  fi
done

echo ""
echo "✅ Tous les certificats SSL obtenus!"
echo ""
echo "📋 Prochaines étapes:"
echo "  1. Redémarrer Nginx avec SSL: docker-compose -f docker-compose.production.yml restart nginx"
echo "  2. Tester HTTPS: curl https://api.flotteq.com/api/health"
echo "  3. Vérifier renouvellement: docker-compose -f docker-compose.production.yml run --rm certbot renew --dry-run"
```

#### 2. Script Renouvellement SSL (Cron quotidien)

**Chemin** : `/Users/wissem/Flotteq-v2/scripts/renew-ssl.sh`

```bash
#!/bin/bash
set -e

echo "🔄 Renouvellement certificats SSL Let's Encrypt"

cd /path/to/flotteq-v2  # Adapter le chemin

# Renouveler les certificats (seulement si < 30 jours avant expiration)
docker-compose -f docker-compose.production.yml run --rm certbot renew

# Recharger Nginx si renouvellement effectué
if [ $? -eq 0 ]; then
  echo "✅ Certificats renouvelés"
  docker-compose -f docker-compose.production.yml exec nginx nginx -s reload
  echo "✅ Nginx rechargé"
else
  echo "ℹ️  Aucun renouvellement nécessaire"
fi

# Nettoyer les vieux certificats (> 90 jours)
docker-compose -f docker-compose.production.yml run --rm certbot \
  certificates --quiet | grep "INVALID: EXPIRED" | awk '{print $1}' | \
  xargs -I {} docker-compose -f docker-compose.production.yml run --rm certbot delete --cert-name {}

echo "✅ Vérification terminée"
```

#### 3. Crontab pour renouvellement automatique

**Fichier** : `/Users/wissem/Flotteq-v2/docs/CRONTAB_SSL.md`

```markdown
# Configuration Crontab - Renouvellement SSL

## Installation

1. Copier le script sur le VPS:
```bash
scp scripts/renew-ssl.sh root@flotteq.com:/opt/flotteq/
chmod +x /opt/flotteq/renew-ssl.sh
```

2. Éditer crontab root:
```bash
sudo crontab -e
```

3. Ajouter cette ligne (exécution quotidienne à 2h du matin):
```cron
0 2 * * * /opt/flotteq/renew-ssl.sh >> /var/log/flotteq/ssl-renew.log 2>&1
```

4. Vérifier que la cron est bien enregistrée:
```bash
sudo crontab -l
```

## Test manuel

Tester le renouvellement sans modifier les certificats:
```bash
cd /opt/flotteq
docker-compose -f docker-compose.production.yml run --rm certbot renew --dry-run
```

## Logs

Vérifier les logs de renouvellement:
```bash
tail -f /var/log/flotteq/ssl-renew.log
```

## Expiration

Vérifier les dates d'expiration:
```bash
docker-compose -f docker-compose.production.yml run --rm certbot certificates
```

Exemple sortie:
```
Certificate Name: api.flotteq.com
  Domains: api.flotteq.com
  Expiry Date: 2025-04-20 (VALID: 89 days)
```
```

### Test après création

```bash
# 1. Rendre les scripts exécutables
chmod +x scripts/init-ssl.sh
chmod +x scripts/renew-ssl.sh

# 2. Test en STAGING (pour éviter rate limit Let's Encrypt)
# Éditer init-ssl.sh: STAGING=1

# 3. Lancer l'initialisation (nécessite DNS configuré)
./scripts/init-ssl.sh

# 4. Vérifier les certificats obtenus
ls -la certbot/conf/live/

# Devrait afficher 5 dossiers (1 par domaine):
# - api.flotteq.com/
# - app.flotteq.com/
# - partner.flotteq.com/
# - driver.flotteq.com/
# - admin.flotteq.com/

# 5. Vérifier un certificat
openssl x509 -in certbot/conf/live/api.flotteq.com/fullchain.pem -text -noout | grep -A 2 "Validity"

# 6. Tester le renouvellement (dry-run)
./scripts/renew-ssl.sh
```

### Critères d'acceptation
- ✅ Script `init-ssl.sh` créé et exécutable
- ✅ Script `renew-ssl.sh` créé et exécutable
- ✅ 5 certificats SSL obtenus (1 par domaine)
- ✅ Certificats valides 90 jours
- ✅ Cron configurée (renouvellement auto)
- ✅ `certbot renew --dry-run` réussit
- ✅ HTTPS fonctionne sur les 5 domaines

---

## 📋 TICKET D2-003 : Scripts Backup Automatique

### Contexte
En production, AUCUNE donnée ne doit être perdue. Il faut des backups:
- Base de données PostgreSQL (quotidien)
- Uploads (photos véhicules, documents) (hebdomadaire)
- Rétention 30 jours minimum

### Objectif
Créer des scripts de backup automatiques avec rotation.

### Fichiers à créer (4 fichiers)

#### 1. Script Backup Base de Données

**Chemin** : `/Users/wissem/Flotteq-v2/scripts/backup-db.sh`

```bash
#!/bin/bash
set -e

echo "💾 Backup PostgreSQL FlotteQ"

# Variables
BACKUP_DIR="/var/backups/flotteq/db"
DATE=$(date +%Y%m%d_%H%M%S)
RETENTION_DAYS=30

# Créer le dossier de backup
mkdir -p "$BACKUP_DIR"

# Backup avec pg_dump via Docker
echo "Dumping database..."
docker-compose -f /opt/flotteq/docker-compose.production.yml exec -T postgres \
  pg_dump -U flotteq_prod flotteq_production | gzip > "$BACKUP_DIR/flotteq_$DATE.sql.gz"

if [ $? -eq 0 ]; then
  SIZE=$(du -h "$BACKUP_DIR/flotteq_$DATE.sql.gz" | cut -f1)
  echo "✅ Backup créé: flotteq_$DATE.sql.gz ($SIZE)"
else
  echo "❌ Échec du backup"
  exit 1
fi

# Supprimer les backups > 30 jours
echo "Nettoyage anciens backups (> $RETENTION_DAYS jours)..."
find "$BACKUP_DIR" -name "flotteq_*.sql.gz" -type f -mtime +$RETENTION_DAYS -delete

# Afficher l'espace utilisé
echo ""
echo "📊 Espace utilisé par les backups:"
du -sh "$BACKUP_DIR"
echo ""
echo "📋 Backups disponibles:"
ls -lh "$BACKUP_DIR" | tail -n 10

# Envoyer notification (optionnel)
# curl -X POST https://hooks.slack.com/services/YOUR/WEBHOOK \
#   -d "{\"text\": \"✅ Backup DB FlotteQ réussi: $SIZE\"}"

echo "✅ Backup terminé"
```

#### 2. Script Backup Uploads

**Chemin** : `/Users/wissem/Flotteq-v2/scripts/backup-uploads.sh`

```bash
#!/bin/bash
set -e

echo "📁 Backup Uploads FlotteQ"

# Variables
BACKUP_DIR="/var/backups/flotteq/uploads"
UPLOADS_DIR="/opt/flotteq/uploads"
DATE=$(date +%Y%m%d_%H%M%S)
RETENTION_DAYS=60  # 2 mois pour les uploads

# Créer le dossier de backup
mkdir -p "$BACKUP_DIR"

# Backup avec tar + compression
echo "Archiving uploads..."
tar -czf "$BACKUP_DIR/uploads_$DATE.tar.gz" -C "$UPLOADS_DIR" .

if [ $? -eq 0 ]; then
  SIZE=$(du -h "$BACKUP_DIR/uploads_$DATE.tar.gz" | cut -f1)
  echo "✅ Backup créé: uploads_$DATE.tar.gz ($SIZE)"
else
  echo "❌ Échec du backup"
  exit 1
fi

# Supprimer les backups > 60 jours
echo "Nettoyage anciens backups (> $RETENTION_DAYS jours)..."
find "$BACKUP_DIR" -name "uploads_*.tar.gz" -type f -mtime +$RETENTION_DAYS -delete

# Stats
echo ""
echo "📊 Espace uploads:"
du -sh "$UPLOADS_DIR"
echo "📊 Espace backups:"
du -sh "$BACKUP_DIR"

echo "✅ Backup terminé"
```

#### 3. Script Restauration DB

**Chemin** : `/Users/wissem/Flotteq-v2/scripts/restore-db.sh`

```bash
#!/bin/bash
set -e

# Usage: ./restore-db.sh /path/to/backup.sql.gz

if [ -z "$1" ]; then
  echo "❌ Usage: $0 /path/to/backup.sql.gz"
  echo ""
  echo "📋 Backups disponibles:"
  ls -lh /var/backups/flotteq/db/ | tail -n 10
  exit 1
fi

BACKUP_FILE="$1"

if [ ! -f "$BACKUP_FILE" ]; then
  echo "❌ Fichier non trouvé: $BACKUP_FILE"
  exit 1
fi

echo "⚠️  ATTENTION: Cette opération va ÉCRASER la base de données actuelle!"
echo "📁 Fichier: $BACKUP_FILE"
echo ""
read -p "Continuer? (yes/no) " -r
if [[ ! $REPLY == "yes" ]]; then
  echo "❌ Annulé"
  exit 1
fi

# Arrêter le backend (pour éviter les connexions)
echo "🛑 Arrêt du backend..."
docker-compose -f /opt/flotteq/docker-compose.production.yml stop backend

# Restaurer la DB
echo "💾 Restauration en cours..."
gunzip -c "$BACKUP_FILE" | docker-compose -f /opt/flotteq/docker-compose.production.yml exec -T postgres \
  psql -U flotteq_prod -d flotteq_production

if [ $? -eq 0 ]; then
  echo "✅ Base de données restaurée"
else
  echo "❌ Échec de la restauration"
  exit 1
fi

# Redémarrer le backend
echo "🚀 Redémarrage du backend..."
docker-compose -f /opt/flotteq/docker-compose.production.yml start backend

echo "✅ Restauration terminée"
```

#### 4. Configuration Crontab Backups

**Fichier** : `/Users/wissem/Flotteq-v2/docs/CRONTAB_BACKUPS.md`

```markdown
# Configuration Crontab - Backups Automatiques

## Installation sur VPS

1. Copier les scripts:
```bash
scp scripts/backup-db.sh root@flotteq.com:/opt/flotteq/scripts/
scp scripts/backup-uploads.sh root@flotteq.com:/opt/flotteq/scripts/
chmod +x /opt/flotteq/scripts/backup-*.sh
```

2. Créer les dossiers de backups:
```bash
mkdir -p /var/backups/flotteq/db
mkdir -p /var/backups/flotteq/uploads
```

3. Éditer crontab root:
```bash
sudo crontab -e
```

4. Ajouter ces lignes:
```cron
# Backup DB (tous les jours à 2h30)
30 2 * * * /opt/flotteq/scripts/backup-db.sh >> /var/log/flotteq/backup-db.log 2>&1

# Backup Uploads (tous les dimanches à 3h)
0 3 * * 0 /opt/flotteq/scripts/backup-uploads.sh >> /var/log/flotteq/backup-uploads.log 2>&1
```

## Vérification

### Lister les backups DB
```bash
ls -lh /var/backups/flotteq/db/
```

### Lister les backups uploads
```bash
ls -lh /var/backups/flotteq/uploads/
```

### Voir les logs
```bash
tail -f /var/log/flotteq/backup-db.log
tail -f /var/log/flotteq/backup-uploads.log
```

## Test manuel

Tester les scripts avant d'activer la cron:
```bash
# Test backup DB
/opt/flotteq/scripts/backup-db.sh

# Test backup uploads
/opt/flotteq/scripts/backup-uploads.sh
```

## Restauration

### Restaurer une DB
```bash
/opt/flotteq/scripts/restore-db.sh /var/backups/flotteq/db/flotteq_20250119_143000.sql.gz
```

### Restaurer uploads
```bash
cd /opt/flotteq/uploads
tar -xzf /var/backups/flotteq/uploads/uploads_20250119_030000.tar.gz
```

## Stockage externe (recommandé)

Pour plus de sécurité, copier les backups vers S3, Backblaze B2, ou OVH Object Storage:

```bash
# Exemple avec rclone (S3)
rclone copy /var/backups/flotteq/ s3:flotteq-backups/ --include "*.gz"
```
```

### Test après création

```bash
# 1. Rendre les scripts exécutables
chmod +x scripts/backup-db.sh
chmod +x scripts/backup-uploads.sh
chmod +x scripts/restore-db.sh

# 2. Créer dossiers de test
mkdir -p /tmp/backups/flotteq/db
mkdir -p /tmp/backups/flotteq/uploads

# 3. Éditer les scripts pour tester localement
# Remplacer /var/backups par /tmp/backups
# Remplacer /opt/flotteq par /Users/wissem/Flotteq-v2

# 4. Tester backup DB
./scripts/backup-db.sh

# 5. Vérifier le backup créé
ls -lh /tmp/backups/flotteq/db/
gunzip -c /tmp/backups/flotteq/db/flotteq_*.sql.gz | head -n 20

# 6. Tester backup uploads
./scripts/backup-uploads.sh

# 7. Vérifier le backup
ls -lh /tmp/backups/flotteq/uploads/
tar -tzf /tmp/backups/flotteq/uploads/uploads_*.tar.gz | head -n 20

# 8. Tester restauration (dans environnement de test!)
./scripts/restore-db.sh /tmp/backups/flotteq/db/flotteq_*.sql.gz
```

### Critères d'acceptation
- ✅ 3 scripts créés (backup-db, backup-uploads, restore-db)
- ✅ Documentation crontab créée
- ✅ Backup DB fonctionne (fichier .sql.gz créé)
- ✅ Backup uploads fonctionne (fichier .tar.gz créé)
- ✅ Restauration DB fonctionne
- ✅ Rotation automatique (> 30 jours supprimés)
- ✅ Compression efficace (gzip)
- ✅ Logs détaillés

---

## 📋 TICKET D2-004 : Configuration PM2 (Process Manager)

### Contexte
PM2 est une alternative à Docker pour gérer le backend en production avec:
- Restart automatique si crash
- Clustering multi-core (utiliser tous les CPU)
- Logs centralisés
- Monitoring en temps réel
- Zero-downtime reload

### Objectif
Créer la configuration PM2 pour le backend (optionnel si Docker utilisé).

### Fichier à créer

**Chemin** : `/Users/wissem/Flotteq-v2/backend/ecosystem.config.js`

```javascript
module.exports = {
  apps: [
    {
      name: 'flotteq-api',
      script: 'dist/main.js',
      cwd: '/opt/flotteq/backend',

      // Instances & mode
      instances: 'max', // Utilise tous les CPU disponibles
      exec_mode: 'cluster', // Mode cluster pour load balancing

      // Watch & reload
      watch: false, // Pas de watch en production
      ignore_watch: ['node_modules', 'uploads', 'logs'],

      // Environment
      env_production: {
        NODE_ENV: 'production',
        PORT: 3000,
      },

      // Logs
      error_file: '/var/log/flotteq/api-error.log',
      out_file: '/var/log/flotteq/api-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,

      // Auto-restart
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s',
      max_memory_restart: '1G',

      // Graceful shutdown
      kill_timeout: 5000,
      wait_ready: true,
      listen_timeout: 10000,

      // Cron restart (optionnel - redémarrage quotidien à 4h)
      cron_restart: '0 4 * * *',

      // Instance vars
      instance_var: 'INSTANCE_ID',
    },
  ],
};
```

### Script démarrage PM2

**Chemin** : `/Users/wissem/Flotteq-v2/scripts/start-pm2.sh`

```bash
#!/bin/bash
set -e

echo "🚀 Démarrage FlotteQ avec PM2"

# Vérifier que PM2 est installé
if ! command -v pm2 &> /dev/null; then
  echo "❌ PM2 non installé"
  echo "Installer avec: npm install -g pm2"
  exit 1
fi

# Aller dans le dossier backend
cd /opt/flotteq/backend

# Build si nécessaire
if [ ! -d "dist" ]; then
  echo "📦 Build du backend..."
  npm run build
fi

# Démarrer avec PM2
echo "🚀 Démarrage PM2..."
pm2 start ecosystem.config.js --env production

# Sauvegarder la config PM2 (restart automatique au boot)
pm2 save

# Setup startup script
pm2 startup

echo ""
echo "✅ FlotteQ démarré avec PM2"
echo ""
echo "📋 Commandes utiles:"
echo "  pm2 status          # Voir l'état"
echo "  pm2 logs flotteq-api # Voir les logs"
echo "  pm2 monit           # Monitoring temps réel"
echo "  pm2 restart all     # Redémarrer"
echo "  pm2 reload all      # Reload sans downtime"
echo "  pm2 stop all        # Arrêter"
```

### Documentation PM2

**Chemin** : `/Users/wissem/Flotteq-v2/docs/PM2_GUIDE.md`

```markdown
# Guide PM2 - FlotteQ Backend

## Installation PM2 (sur VPS)

```bash
npm install -g pm2
```

## Démarrage

```bash
cd /opt/flotteq
./scripts/start-pm2.sh
```

## Commandes principales

### Status
```bash
pm2 status
```

Sortie:
```
┌─────┬────────────────┬─────────┬─────────┬─────────┬──────────┬────────┐
│ id  │ name           │ mode    │ ↺      │ status  │ cpu      │ memory │
├─────┼────────────────┼─────────┼─────────┼─────────┼──────────┼────────┤
│ 0   │ flotteq-api    │ cluster │ 0       │ online  │ 5%       │ 123M   │
│ 1   │ flotteq-api    │ cluster │ 0       │ online  │ 4%       │ 118M   │
│ 2   │ flotteq-api    │ cluster │ 0       │ online  │ 6%       │ 125M   │
│ 3   │ flotteq-api    │ cluster │ 0       │ online  │ 5%       │ 121M   │
└─────┴────────────────┴─────────┴─────────┴─────────┴──────────┴────────┘
```

### Logs
```bash
# Voir tous les logs
pm2 logs flotteq-api

# Logs erreurs seulement
pm2 logs flotteq-api --err

# Vider les logs
pm2 flush
```

### Monitoring
```bash
pm2 monit
```

Interface interactive avec CPU, RAM, logs en temps réel.

### Restart / Reload

```bash
# Hard restart (downtime court)
pm2 restart flotteq-api

# Reload graceful (zero-downtime)
pm2 reload flotteq-api

# Restart tous les process
pm2 restart all
```

### Arrêt

```bash
# Arrêter
pm2 stop flotteq-api

# Arrêter et supprimer
pm2 delete flotteq-api

# Tout arrêter
pm2 stop all
```

## Déploiement

### Avec zero-downtime reload

```bash
cd /opt/flotteq
git pull origin main
cd backend
npm ci --only=production
npm run build
pm2 reload flotteq-api
```

### Rollback

```bash
git checkout HEAD~1
cd backend
npm run build
pm2 reload flotteq-api
```

## Logs persistants

### Configuration logrotate

Créer `/etc/logrotate.d/flotteq`:

```
/var/log/flotteq/*.log {
    daily
    rotate 14
    compress
    delaycompress
    notifempty
    create 0640 root root
    sharedscripts
    postrotate
        pm2 reloadLogs
    endscript
}
```

### Vérifier logrotate

```bash
logrotate -d /etc/logrotate.d/flotteq
```

## Clustering

Par défaut, PM2 démarre autant d'instances que de CPU.

Vérifier le nombre d'instances:
```bash
pm2 status
```

Ajuster manuellement:
```bash
pm2 scale flotteq-api 8  # 8 instances
```

## Monitoring avancé (PM2 Plus)

### Gratuit pour 1 serveur

```bash
pm2 link YOUR_SECRET_KEY YOUR_PUBLIC_KEY
```

Dashboard: https://app.pm2.io

## Startup automatique

Générer script systemd:
```bash
pm2 startup

# Copier-coller la commande affichée (avec sudo)
```

Sauvegarder la liste des apps:
```bash
pm2 save
```

Vérifier:
```bash
systemctl status pm2-root
```

## Troubleshooting

### App crash en boucle

Vérifier les logs:
```bash
pm2 logs flotteq-api --lines 100
```

Désactiver auto-restart temporairement:
```bash
pm2 stop flotteq-api
node dist/main.js  # Tester manuellement
```

### Mémoire élevée

Redémarrer avec limite RAM:
```bash
pm2 restart flotteq-api --max-memory-restart 800M
```

### Trop de restarts

Vérifier config `max_restarts` dans ecosystem.config.js
```

### Test après création

```bash
# 1. Installer PM2 (si pas déjà fait)
npm install -g pm2

# 2. Build le backend
cd backend
npm run build

# 3. Démarrer avec PM2
pm2 start ecosystem.config.js --env production

# 4. Vérifier status
pm2 status

# 5. Voir logs
pm2 logs flotteq-api --lines 50

# 6. Tester l'API
curl http://localhost:3000/api/health

# 7. Tester reload zero-downtime
pm2 reload flotteq-api

# 8. Monitoring temps réel
pm2 monit

# 9. Arrêter
pm2 stop flotteq-api
```

### Critères d'acceptation
- ✅ `ecosystem.config.js` créé
- ✅ Script `start-pm2.sh` créé
- ✅ Documentation PM2 complète
- ✅ Backend démarre avec PM2
- ✅ Clustering multi-core fonctionne (instances = nb CPU)
- ✅ Auto-restart si crash
- ✅ Logs centralisés dans /var/log/flotteq/
- ✅ `pm2 reload` fonctionne (zero-downtime)
- ✅ Startup automatique configuré

---

## 🎯 RÉSUMÉ SPRINT D2

### Fichiers créés (16 fichiers)
1. `nginx/nginx.conf`
2. `nginx/conf.d/api.conf`
3. `nginx/conf.d/app.conf`
4. `nginx/conf.d/partner.conf`
5. `nginx/conf.d/driver.conf`
6. `nginx/conf.d/admin.conf`
7. `scripts/init-ssl.sh`
8. `scripts/renew-ssl.sh`
9. `docs/CRONTAB_SSL.md`
10. `scripts/backup-db.sh`
11. `scripts/backup-uploads.sh`
12. `scripts/restore-db.sh`
13. `docs/CRONTAB_BACKUPS.md`
14. `backend/ecosystem.config.js`
15. `scripts/start-pm2.sh`
16. `docs/PM2_GUIDE.md`

### Commandes de validation finale

```bash
# 1. Vérifier syntaxe Nginx
docker run --rm -v $(pwd)/nginx:/etc/nginx:ro nginx:alpine nginx -t

# 2. Tester SSL (nécessite DNS configuré)
./scripts/init-ssl.sh

# 3. Tester backups
./scripts/backup-db.sh
./scripts/backup-uploads.sh

# 4. Tester PM2
./scripts/start-pm2.sh
pm2 status
```

### Prochaine étape
👉 **SPRINT D3 : CI/CD & Déploiement** (GitHub Actions, scripts deploy)
