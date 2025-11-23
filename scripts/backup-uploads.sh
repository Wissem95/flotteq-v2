#!/bin/bash
set -e

# ==========================================
# Détection automatique du projet FlotteQ
# ==========================================
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

echo "📁 Backup Uploads FlotteQ"
echo "📁 Projet: $PROJECT_ROOT"

# Variables
BACKUP_DIR="/var/backups/flotteq/uploads"
UPLOADS_DIR="$PROJECT_ROOT/uploads"
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
