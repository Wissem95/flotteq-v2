#!/bin/bash
set -e

# ==========================================
# Détection automatique du projet FlotteQ
# ==========================================
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

echo "🔐 Initialisation SSL Let's Encrypt pour FlotteQ"
echo "📁 Projet: $PROJECT_ROOT"

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
cd "$PROJECT_ROOT"
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
