#!/bin/bash
set -e

# ==========================================
# Détection automatique du projet FlotteQ
# ==========================================
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

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

echo "📁 Projet: $PROJECT_ROOT"
echo "⚠️  ATTENTION: Cette opération va ÉCRASER la base de données actuelle!"
echo "📁 Fichier: $BACKUP_FILE"
echo ""
read -p "Continuer? (yes/no) " -r
if [[ ! $REPLY == "yes" ]]; then
  echo "❌ Annulé"
  exit 1
fi

cd "$PROJECT_ROOT"

# Arrêter le backend (pour éviter les connexions)
echo "🛑 Arrêt du backend..."
docker-compose -f docker-compose.production.yml stop backend

# Restaurer la DB
echo "💾 Restauration en cours..."
gunzip -c "$BACKUP_FILE" | docker-compose -f docker-compose.production.yml exec -T postgres \
  psql -U flotteq_prod -d flotteq_production

if [ $? -eq 0 ]; then
  echo "✅ Base de données restaurée"
else
  echo "❌ Échec de la restauration"
  exit 1
fi

# Redémarrer le backend
echo "🚀 Redémarrage du backend..."
docker-compose -f docker-compose.production.yml start backend

echo "✅ Restauration terminée"
