#!/bin/bash
set -e

# ==========================================
# Détection automatique du projet FlotteQ
# ==========================================
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

echo "💾 Backup PostgreSQL FlotteQ"
echo "📁 Projet: $PROJECT_ROOT"

# Variables
BACKUP_DIR="/var/backups/flotteq/db"
DATE=$(date +%Y%m%d_%H%M%S)
RETENTION_DAYS=30

# Créer le dossier de backup
mkdir -p "$BACKUP_DIR"

# Backup avec pg_dump via Docker
echo "Dumping database..."
cd "$PROJECT_ROOT"
docker-compose -f docker-compose.production.yml exec -T postgres \
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
