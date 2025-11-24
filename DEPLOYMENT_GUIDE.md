# 🚀 Guide de Déploiement Production - FlotteQ

**Dernière mise à jour**: Novembre 2025  
**Environnement cible**: VPS OVH Ubuntu 22.04 LTS

---

## 📋 PRÉREQUIS

### VPS Recommandé (OVH)

| Ressource | Minimum | Recommandé |
|-----------|---------|------------|
| CPU | 4 vCPU | 8 vCPU |
| RAM | 8 GB | 16 GB |
| Stockage | 80 GB SSD | 160 GB NVMe |
| Bande passante | 500 Mbps | 1 Gbps |

**Prix estimé**: 30-40€/mois (VPS Elite)

### Domaines & DNS

Configurer 5 domaines (ou sous-domaines) pointant vers l'IP du VPS:

```dns
api.flotteq.com     A    1.2.3.4
app.flotteq.com     A    1.2.3.4
partner.flotteq.com A    1.2.3.4
driver.flotteq.com  A    1.2.3.4
admin.flotteq.com   A    1.2.3.4
```

Vérifier la propagation DNS: `dig +short api.flotteq.com`

### Services Externes

- [ ] Compte Stripe (mode LIVE activé)
- [ ] SMTP configuré (Gmail, SendGrid, Mailgun)
- [ ] GitHub repository créé
- [ ] Slack webhook (optionnel - notifications)

---

## 🛠️ INSTALLATION INITIALE VPS

### Étape 1: Connexion SSH

```bash
ssh root@flotteq.com
```

### Étape 2: Mise à jour système

```bash
apt update && apt upgrade -y
apt install -y curl git ufw fail2ban
```

### Étape 3: Installation Docker

```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Start Docker
systemctl enable docker
systemctl start docker

# Install Docker Compose v2
apt install docker-compose-plugin -y

# Verify
docker --version
docker compose version
```

### Étape 4: Configuration Firewall UFW

```bash
# Configure UFW
ufw default deny incoming
ufw default allow outgoing
ufw allow ssh
ufw allow 80/tcp
ufw allow 443/tcp

# Enable
ufw enable
ufw status
```

### Étape 5: Créer utilisateur non-root (optionnel)

```bash
adduser flotteq
usermod -aG docker flotteq
usermod -aG sudo flotteq

# Switch to flotteq user
su - flotteq
```

---

## 📦 DÉPLOIEMENT APPLICATION

### Étape 1: Cloner le repository

```bash
cd /opt
git clone https://github.com/YOUR_USERNAME/flotteq-v2.git
cd flotteq-v2
```

### Étape 2: Générer les secrets

```bash
# Générer tous les secrets
chmod +x scripts/generate-secrets.sh
./scripts/generate-secrets.sh

# Secrets créés dans secrets/
ls -la secrets/
```

### Étape 3: Créer .env.production

```bash
# Backend
cp backend/.env.production.example backend/.env.production
nano backend/.env.production

# Modifier TOUS les CHANGEME:
# - DB_PASSWORD (copier depuis secrets/db_password.txt)
# - JWT_*_SECRET (copier depuis secrets/)
# - STRIPE_SECRET_KEY (depuis dashboard Stripe LIVE)
# - REDIS_PASSWORD (copier depuis secrets/)
# - SMTP_PASSWORD (mot de passe SMTP)
# - CORS_ORIGIN (vérifier les 5 domaines)

# Frontends
cp frontend-client/.env.production.example frontend-client/.env.production
cp frontend-partner/.env.production.example frontend-partner/.env.production
cp frontend-driver/.env.production.example frontend-driver/.env.production
cp frontend-internal/.env.production.example frontend-internal/.env.production

# Modifier les VITE_STRIPE_PUBLISHABLE_KEY avec clé LIVE
nano frontend-client/.env.production
nano frontend-driver/.env.production
```

### Étape 4: Initialiser SSL Let's Encrypt

```bash
chmod +x scripts/init-ssl.sh
./scripts/init-ssl.sh

# Suivre les instructions
# Vérifier que les 5 certificats sont obtenus
ls -la certbot/conf/live/
```

### Étape 5: Premier déploiement

```bash
chmod +x scripts/deploy-production.sh
./scripts/deploy-production.sh

# Le script va:
# 1. Build Docker images
# 2. Démarrer PostgreSQL
# 3. Run migrations
# 4. Démarrer tous les services
# 5. Health check
```

### Étape 6: Vérifier le déploiement

```bash
# Check services
docker compose -f docker-compose.production.yml ps

# Tous devraient être "Up" et "healthy"

# Check logs
docker compose -f docker-compose.production.yml logs -f --tail=100

# Test API
curl https://api.flotteq.com/api/health

# Résultat attendu: {"status":"ok",...}

# Test frontends
curl -I https://app.flotteq.com
curl -I https://partner.flotteq.com
curl -I https://driver.flotteq.com
curl -I https://admin.flotteq.com
```

---

## 🔄 CI/CD AVEC GITHUB ACTIONS

### Configuration GitHub Secrets

1. Aller sur GitHub: Settings → Secrets → Actions
2. Ajouter ces secrets:

| Secret | Valeur |
|--------|--------|
| `VPS_SSH_KEY` | Clé privée SSH (voir docs/GITHUB_SECRETS.md) |
| `VPS_HOST` | `flotteq.com` |
| `VPS_USER` | `root` ou `flotteq` |
| `SLACK_WEBHOOK_URL` | Webhook Slack (optionnel) |

### Test déploiement automatique

```bash
# Faire un changement trivial
echo "# Test deploy" >> README.md
git add README.md
git commit -m "test: trigger deployment"
git push origin main

# Vérifier sur GitHub Actions
# https://github.com/YOUR_USERNAME/flotteq-v2/actions

# Le workflow "CD - Deploy to Production" devrait se lancer
```

---

## 🔁 MAINTENANCE & BACKUPS

### Backups automatiques

```bash
# Copier scripts sur VPS
chmod +x scripts/backup-db.sh
chmod +x scripts/backup-uploads.sh
chmod +x scripts/renew-ssl.sh

# Configurer crontab
crontab -e

# Ajouter ces lignes:
30 2 * * * /opt/flotteq/scripts/backup-db.sh >> /var/log/flotteq/backup-db.log 2>&1
0 3 * * 0 /opt/flotteq/scripts/backup-uploads.sh >> /var/log/flotteq/backup-uploads.log 2>&1
0 2 * * * /opt/flotteq/scripts/renew-ssl.sh >> /var/log/flotteq/ssl-renew.log 2>&1
```

### Monitoring

```bash
# Logs application
tail -f /var/log/flotteq/deploy-*.log

# Logs Docker
docker compose -f docker-compose.production.yml logs -f backend

# Status services
docker compose -f docker-compose.production.yml ps

# Espace disque
df -h

# Mémoire
free -h
```

---

## 🆘 TROUBLESHOOTING

### Service ne démarre pas

```bash
# Voir les logs
docker compose -f docker-compose.production.yml logs SERVICE_NAME

# Exemples:
docker compose logs backend
docker compose logs postgres
docker compose logs nginx
```

### API retourne 502 Bad Gateway

```bash
# Vérifier backend
docker compose ps backend

# Vérifier logs backend
docker compose logs backend | tail -100

# Vérifier healthcheck
curl http://localhost:3000/api/health
```

### Base de données corrompue

```bash
# Restaurer dernier backup
ls -lh /var/backups/flotteq/db/

# Rollback complet
./scripts/rollback.sh
```

### SSL expiré

```bash
# Renouveler manuellement
docker compose -f docker-compose.production.yml run --rm certbot renew

# Reload Nginx
docker compose exec nginx nginx -s reload
```

### Out of disk space

```bash
# Nettoyer images Docker
docker image prune -a -f

# Nettoyer vieux backups
find /var/backups/flotteq -name "*.gz" -mtime +60 -delete

# Nettoyer logs
find /var/log/flotteq -name "*.log" -mtime +30 -delete
```

---

## 🚨 ROLLBACK D'URGENCE

En cas de bug critique en production:

```bash
cd /opt/flotteq
./scripts/rollback.sh

# Suivre les instructions
# Le script va:
# 1. Arrêter backend
# 2. Restaurer DB (dernier backup)
# 3. Rollback Git (HEAD~1)
# 4. Rebuild + redeploy
# 5. Health check
```

---

## 📊 MONITORING RECOMMANDÉ

### Outils gratuits

- **UptimeRobot**: https://uptimerobot.com (checks HTTP)
- **Sentry**: https://sentry.io (error tracking)
- **PM2 Plus**: https://pm2.io (si PM2 utilisé)
- **Grafana Cloud**: https://grafana.com (métriques)

### Healthchecks à configurer

| URL | Fréquence | Alerte si |
|-----|-----------|-----------|
| https://api.flotteq.com/api/health | 5 min | HTTP ≠ 200 |
| https://app.flotteq.com | 10 min | HTTP ≠ 200 |
| https://partner.flotteq.com | 10 min | HTTP ≠ 200 |

---

## 🎯 CHECKLIST POST-DÉPLOIEMENT

- [ ] Tous les services "healthy" (`docker compose ps`)
- [ ] API health check retourne 200
- [ ] 5 frontends accessibles en HTTPS
- [ ] Certificats SSL valides (90 jours)
- [ ] Backups configurés (crontab)
- [ ] GitHub Actions fonctionne
- [ ] Logs centralisés dans /var/log/flotteq/
- [ ] Monitoring UptimeRobot actif
- [ ] Documentation d'équipe mise à jour
- [ ] Stripe en mode LIVE (pas test!)
- [ ] SMTP envoie emails correctement
- [ ] Test complet: créer compte → ajouter véhicule → upload document

---

## 📞 SUPPORT

En cas de problème:

1. Vérifier logs: `/var/log/flotteq/`
2. Consulter troubleshooting ci-dessus
3. Rollback si critique: `./scripts/rollback.sh`
4. Contacter équipe dev

---

**Bon déploiement! 🚀**
