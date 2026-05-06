#!/bin/bash
# Bootstrap des certificats Let's Encrypt pour FlotteQ.
# À exécuter UNE SEULE FOIS sur le VPS, après le 1er git pull du multi-domaine.
# Usage : sudo bash scripts/init-letsencrypt.sh

set -e

# Vérifs préalables
if [ "$(id -u)" -ne 0 ]; then
  echo "Ce script doit être lancé en root (ou via sudo)." >&2
  exit 1
fi

if ! [ -x "$(command -v docker)" ]; then
  echo "docker n'est pas installé." >&2
  exit 1
fi

DOMAINS=(flotteq.fr www.flotteq.fr api.flotteq.fr app.flotteq.fr admin.flotteq.fr partner.flotteq.fr driver.flotteq.fr)
EMAIL="${LETSENCRYPT_EMAIL:-wissemkarboub@gmail.com}"
RSA_KEY_SIZE=4096
DATA_PATH="./certbot"
COMPOSE="docker compose -f docker-compose.production.yml"

echo "### Domaines : ${DOMAINS[*]}"
echo "### Email Let's Encrypt : $EMAIL"

# 1. Télécharger les params SSL recommandés
if [ ! -e "$DATA_PATH/conf/options-ssl-nginx.conf" ] || [ ! -e "$DATA_PATH/conf/ssl-dhparams.pem" ]; then
  echo "### Téléchargement des params SSL recommandés..."
  mkdir -p "$DATA_PATH/conf"
  curl -fsSL https://raw.githubusercontent.com/certbot/certbot/master/certbot-nginx/certbot_nginx/_internal/tls_configs/options-ssl-nginx.conf > "$DATA_PATH/conf/options-ssl-nginx.conf"
  curl -fsSL https://raw.githubusercontent.com/certbot/certbot/master/certbot/certbot/ssl-dhparams.pem > "$DATA_PATH/conf/ssl-dhparams.pem"
fi

# 2. Créer un dummy cert pour permettre à nginx de démarrer
DUMMY_PATH="/etc/letsencrypt/live/${DOMAINS[0]}"
echo "### Création du dummy cert pour nginx..."
mkdir -p "$DATA_PATH/conf/live/${DOMAINS[0]}"
$COMPOSE run --rm --entrypoint "\
  openssl req -x509 -nodes -newkey rsa:$RSA_KEY_SIZE -days 1\
    -keyout '$DUMMY_PATH/privkey.pem' \
    -out '$DUMMY_PATH/fullchain.pem' \
    -subj '/CN=localhost'" certbot

# 3. Démarrer nginx (avec dummy cert)
echo "### Démarrage de nginx avec dummy cert..."
$COMPOSE up --force-recreate -d nginx
sleep 5

# 4. Supprimer le dummy cert
echo "### Suppression du dummy cert..."
$COMPOSE run --rm --entrypoint "\
  rm -Rf /etc/letsencrypt/live/${DOMAINS[0]} && \
  rm -Rf /etc/letsencrypt/archive/${DOMAINS[0]} && \
  rm -Rf /etc/letsencrypt/renewal/${DOMAINS[0]}.conf" certbot

# 5. Demander le vrai cert via webroot
echo "### Demande des certificats Let's Encrypt..."
DOMAIN_ARGS=()
for d in "${DOMAINS[@]}"; do
  DOMAIN_ARGS+=("-d" "$d")
done

$COMPOSE run --rm --entrypoint "\
  certbot certonly --webroot -w /var/www/certbot \
    --email $EMAIL \
    ${DOMAIN_ARGS[*]} \
    --rsa-key-size $RSA_KEY_SIZE \
    --agree-tos \
    --no-eff-email \
    --non-interactive" certbot

# 6. Reload nginx avec les vrais certs
echo "### Rechargement de nginx avec les vrais certs..."
$COMPOSE exec nginx nginx -s reload

echo ""
echo "✅ Done. Tester :"
for d in "${DOMAINS[@]}"; do
  echo "  curl -I https://$d"
done
