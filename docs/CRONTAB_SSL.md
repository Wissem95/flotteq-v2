# Configuration Crontab - Renouvellement SSL

## Installation

1. Copier le script sur le VPS:
```bash
scp scripts/renew-ssl.sh root@flotteq.com:/opt/flotteq/
chmod +x /opt/flotteq/renew-ssl.sh
```

2. Éditer crontab root:
```bash
sudo crontab -e
```

3. Ajouter cette ligne (exécution quotidienne à 2h du matin):
```cron
0 2 * * * /opt/flotteq/renew-ssl.sh >> /var/log/flotteq/ssl-renew.log 2>&1
```

4. Vérifier que la cron est bien enregistrée:
```bash
sudo crontab -l
```

## Test manuel

Tester le renouvellement sans modifier les certificats:
```bash
cd /opt/flotteq
docker-compose -f docker-compose.production.yml run --rm certbot renew --dry-run
```

## Logs

Vérifier les logs de renouvellement:
```bash
tail -f /var/log/flotteq/ssl-renew.log
```

## Expiration

Vérifier les dates d'expiration:
```bash
docker-compose -f docker-compose.production.yml run --rm certbot certificates
```

Exemple sortie:
```
Certificate Name: api.flotteq.com
  Domains: api.flotteq.com
  Expiry Date: 2025-04-20 (VALID: 89 days)
```
