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
