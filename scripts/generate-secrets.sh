#!/bin/bash
set -e

# ==========================================
# Détection automatique du projet FlotteQ
# ==========================================
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

echo "🔐 Génération des secrets production FlotteQ"
echo "📁 Projet: $PROJECT_ROOT"
echo ""

cd "$PROJECT_ROOT"
SECRETS_DIR="./secrets"
mkdir -p "$SECRETS_DIR"

# 1. Mot de passe DB
echo "📝 Génération mot de passe PostgreSQL..."
openssl rand -base64 32 > "$SECRETS_DIR/db_password.txt"
echo "✅ secrets/db_password.txt créé"

# 2. JWT Access Secret
echo "📝 Génération JWT Access Secret..."
openssl rand -base64 64 > "$SECRETS_DIR/jwt_access_secret.txt"
echo "✅ secrets/jwt_access_secret.txt créé"

# 3. JWT Refresh Secret
echo "📝 Génération JWT Refresh Secret..."
openssl rand -base64 64 > "$SECRETS_DIR/jwt_refresh_secret.txt"
echo "✅ secrets/jwt_refresh_secret.txt créé"

# 4. JWT Partner Secret
echo "📝 Génération JWT Partner Secret..."
openssl rand -base64 64 > "$SECRETS_DIR/jwt_partner_secret.txt"
echo "✅ secrets/jwt_partner_secret.txt créé"

# 5. Redis Password
echo "📝 Génération mot de passe Redis..."
openssl rand -base64 32 > "$SECRETS_DIR/redis_password.txt"
echo "✅ secrets/redis_password.txt créé"

echo ""
echo "🔒 Protection des fichiers (chmod 600)..."
chmod 600 "$SECRETS_DIR"/*.txt
echo "✅ Permissions appliquées"

echo ""
echo "✅ Secrets générés avec succès dans $SECRETS_DIR/"
echo ""
echo "⚠️  IMPORTANT: Ajouter manuellement les secrets suivants:"
echo "   1. secrets/stripe_secret_key.txt (copier depuis Stripe Dashboard LIVE)"
echo "   2. secrets/smtp_password.txt (mot de passe SMTP)"
echo ""
echo "📋 Commandes pour ajouter les secrets manuels:"
echo "   echo 'sk_live_xxxxx' > secrets/stripe_secret_key.txt"
echo "   echo 'your_smtp_password' > secrets/smtp_password.txt"
echo "   chmod 600 secrets/stripe_secret_key.txt secrets/smtp_password.txt"
echo ""
echo "🔍 Afficher les secrets générés:"
echo "   cat $SECRETS_DIR/db_password.txt"
echo "   cat $SECRETS_DIR/jwt_access_secret.txt"
