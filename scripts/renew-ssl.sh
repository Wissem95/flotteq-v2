#!/bin/bash
set -e

# ==========================================
# Détection automatique du projet FlotteQ
# ==========================================
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

echo "🔄 Renouvellement certificats SSL Let's Encrypt"
echo "📁 Projet: $PROJECT_ROOT"

cd "$PROJECT_ROOT"

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
