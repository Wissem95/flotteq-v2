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
