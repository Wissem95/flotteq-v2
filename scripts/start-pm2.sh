#!/bin/bash
set -e

# ==========================================
# Détection automatique du projet FlotteQ
# ==========================================
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

echo "⚠️  ATTENTION : PM2 est une alternative à Docker"
echo "📋 Architecture recommandée : Docker (voir docs/ARCHITECTURE.md)"
echo "❓ Utiliser PM2 seulement si vous ne voulez pas Docker"
echo ""
read -p "Continuer avec PM2 ? (yes/no) " -r
if [[ ! $REPLY == "yes" ]]; then
  echo "❌ Annulé"
  echo "💡 Utilisez 'docker-compose -f docker-compose.production.yml up -d' pour Docker"
  exit 1
fi

echo "🚀 Démarrage FlotteQ avec PM2"
echo "📁 Projet: $PROJECT_ROOT"

# Vérifier que PM2 est installé
if ! command -v pm2 &> /dev/null; then
  echo "❌ PM2 non installé"
  echo "Installer avec: npm install -g pm2"
  exit 1
fi

# Aller dans le dossier backend
cd "$PROJECT_ROOT/backend"

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
