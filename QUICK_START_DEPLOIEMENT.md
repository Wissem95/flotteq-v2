# ⚡ QUICK START - Déploiement FlotteQ en 1 Journée

**Objectif** : Déployer FlotteQ en production sur VPS OVH en **8 heures** chrono ⏱️

---

## 🎯 PLAN DE LA JOURNÉE

```
09:00-11:00  Sprint D0 - Dockerisation (2h)
11:00-11:15  ☕ Pause café
11:15-12:15  Sprint D1 - Configuration (1h)
12:15-13:15  🍽️ Pause déjeuner
13:15-15:15  Sprint D2 - Nginx + Backups (2h)
15:15-15:30  ☕ Pause café
15:30-17:00  Sprint D3 - CI/CD (1h30)
17:00-18:00  🚀 Déploiement VPS (1h)
```

**Total : 7h30 de travail effectif**

---

## 📋 CHECKLIST PRÉ-DÉMARRAGE

### Avant de commencer, vérifier :

- [ ] Node.js 20 installé : `node --version`
- [ ] Docker installé : `docker --version`
- [ ] Git configuré : `git config user.name`
- [ ] VPS OVH loué (ou prévu)
- [ ] Domaines DNS prêts (ou prévoir OVH)
- [ ] Compte Stripe créé (test suffit pour commencer)
- [ ] Compte GitHub avec repo créé

---

## 🚀 DÉMARRAGE RAPIDE - COMMANDES EXACTES

### 📂 Étape 0 : Setup workspace (5 min)

```bash
# Ouvrir le terminal
cd /Users/wissem/Flotteq-v2

# Vérifier que tu es sur la bonne branche
git status

# Créer une branche déploiement
git checkout -b deployment-production

# Ouvrir le récapitulatif
open SPRINTS_DEPLOIEMENT_RECAPITULATIF.md
```

---

## 🐳 SPRINT D0 : DOCKERISATION (2h)

### Ticket D0-001 : Dockerfile Backend (30 min)

```bash
# 1. Ouvrir le sprint D0
open SPRINT_D0_DOCKERISATION.md

# 2. Lire le ticket D0-001 jusqu'à "Code complet"

# 3. Copier EXACTEMENT le contenu du Dockerfile
# 4. Créer le fichier
nano backend/Dockerfile
# Coller le contenu + Ctrl+X + Y + Enter

# 5. Tester le build
cd backend
docker build -t flotteq-backend:test .

# ✅ Si "Successfully built" → OK, passer au suivant
# ❌ Si erreur → Lire les logs, vérifier syntaxe
```

### Ticket D0-002 : Dockerfiles Frontends (1h)

```bash
# Frontend Client
nano frontend-client/Dockerfile
# Coller le contenu du ticket D0-002

nano frontend-client/nginx.conf
# Coller le contenu du ticket D0-002

# Tester
cd frontend-client
docker build -t flotteq-frontend-client:test .

# Répéter pour partner, driver, internal (même contenu)
# ⚡ Astuce : copier-coller les fichiers
cp frontend-client/Dockerfile frontend-partner/
cp frontend-client/nginx.conf frontend-partner/
# Idem pour driver et internal
```

### Ticket D0-003 : .dockerignore (15 min)

```bash
# Backend
nano backend/.dockerignore
# Coller le contenu du ticket D0-003

# Frontends (même contenu pour les 4)
cp frontend-client/.dockerignore frontend-partner/
cp frontend-client/.dockerignore frontend-driver/
cp frontend-client/.dockerignore frontend-internal/

# Vérifier
ls -la backend/.dockerignore
ls -la frontend-*/.dockerignore
```

### Ticket D0-004 : docker-compose.production.yml (45 min)

```bash
# Créer le fichier à la racine
nano docker-compose.production.yml
# Coller le contenu COMPLET du ticket D0-004

# Créer dossier secrets
mkdir -p secrets

# Générer mot de passe DB
openssl rand -base64 32 > secrets/db_password.txt

# Vérifier syntaxe
docker-compose -f docker-compose.production.yml config

# ✅ Si pas d'erreur → Sprint D0 terminé!
```

### ✅ Checkpoint Sprint D0

```bash
# Vérifier que tu as bien créé :
ls backend/Dockerfile
ls frontend-*/Dockerfile
ls frontend-*/nginx.conf
ls backend/.dockerignore
ls frontend-*/.dockerignore
ls docker-compose.production.yml
ls secrets/db_password.txt

# Commit
git add .
git commit -m "feat(deploy): add Docker configuration (Sprint D0)"
```

---

## ⚙️ SPRINT D1 : CONFIGURATION PRODUCTION (1h)

### Ticket D1-001 : .env.production.example Backend (20 min)

```bash
nano backend/.env.production.example
# Coller le contenu COMPLET du ticket D1-001
```

### Ticket D1-002 : .env.production.example Frontends (10 min)

```bash
# 4 fichiers courts
nano frontend-client/.env.production.example
nano frontend-partner/.env.production.example
nano frontend-driver/.env.production.example
nano frontend-internal/.env.production.example
# Coller le contenu respectif
```

### Ticket D1-003 : Corriger Typo URLs (5 min)

```bash
# Automatique avec script
nano scripts/fix-typo-urls.sh
# Coller le contenu
chmod +x scripts/fix-typo-urls.sh
./scripts/fix-typo-urls.sh

# ✅ Vérifier
grep VITE_API_URL frontend-client/.env.example
# Devrait afficher "3000" (sans 's')
```

### Ticket D1-004 : Corriger CORS (5 min)

```bash
# Automatique avec script
nano scripts/fix-cors.sh
# Coller le contenu
chmod +x scripts/fix-cors.sh
./scripts/fix-cors.sh

# ✅ Vérifier
grep corsOrigin backend/src/main.ts
# Devrait afficher 4 ports : 5174,5175,5176,3001
```

### Ticket D1-005 : Module Healthcheck (20 min)

```bash
# 3 fichiers
mkdir -p backend/src/health
nano backend/src/health/health.controller.ts
nano backend/src/health/health.service.ts
nano backend/src/health/health.module.ts
# Coller le contenu respectif

# Modifier app.module.ts (ajouter import)
nano backend/src/app.module.ts
# Ajouter :
# import { HealthModule } from './health/health.module';
# dans imports: [ ... HealthModule, ... ]

# Tester
cd backend
npm run start:dev
# Dans autre terminal :
curl http://localhost:3000/api/health
# ✅ Devrait retourner {"status":"ok",...}
```

### ✅ Checkpoint Sprint D1

```bash
git add .
git commit -m "feat(deploy): add production configuration (Sprint D1)"
```

---

## 🌐 SPRINT D2 : NGINX + BACKUPS (2h)

### Ticket D2-001 : Nginx Configuration (1h)

```bash
# Créer dossier nginx
mkdir -p nginx/conf.d

# 6 fichiers
nano nginx/nginx.conf
nano nginx/conf.d/api.conf
nano nginx/conf.d/app.conf
nano nginx/conf.d/partner.conf
nano nginx/conf.d/driver.conf
nano nginx/conf.d/admin.conf
# Coller le contenu respectif

# Tester syntaxe
docker run --rm -v $(pwd)/nginx:/etc/nginx:ro nginx:alpine nginx -t
# ✅ "test is successful"
```

### Ticket D2-002 : SSL Scripts (30 min)

```bash
mkdir -p scripts

nano scripts/init-ssl.sh
nano scripts/renew-ssl.sh
nano docs/CRONTAB_SSL.md
# Coller le contenu

chmod +x scripts/init-ssl.sh
chmod +x scripts/renew-ssl.sh
```

### Ticket D2-003 : Backup Scripts (30 min)

```bash
nano scripts/backup-db.sh
nano scripts/backup-uploads.sh
nano scripts/restore-db.sh
nano docs/CRONTAB_BACKUPS.md
# Coller le contenu

chmod +x scripts/backup-*.sh
chmod +x scripts/restore-db.sh
```

### ✅ Checkpoint Sprint D2

```bash
git add .
git commit -m "feat(deploy): add nginx and backup scripts (Sprint D2)"
```

---

## 🔄 SPRINT D3 : CI/CD (1h30)

### Ticket D3-001 : GitHub Actions (30 min)

```bash
mkdir -p .github/workflows

nano .github/workflows/ci.yml
nano .github/workflows/deploy.yml
nano docs/GITHUB_SECRETS.md
# Coller le contenu

# Valider syntaxe YAML
# Installer yamllint si besoin : brew install yamllint
yamllint .github/workflows/*.yml
```

### Ticket D3-002 : Script deploy-production.sh (30 min)

```bash
nano scripts/deploy-production.sh
# Coller le contenu (long fichier ~300 lignes)

chmod +x scripts/deploy-production.sh
bash -n scripts/deploy-production.sh  # Vérifier syntaxe
```

### Ticket D3-003 : Script rollback.sh (15 min)

```bash
nano scripts/rollback.sh
# Coller le contenu

chmod +x scripts/rollback.sh
```

### Ticket D3-004 : DEPLOYMENT_GUIDE.md (15 min)

```bash
nano DEPLOYMENT_GUIDE.md
# Coller le contenu (très long, ~500 lignes)
```

### ✅ Checkpoint Sprint D3

```bash
git add .
git commit -m "feat(deploy): add CI/CD workflows and deployment guide (Sprint D3)"
git push origin deployment-production

# Créer Pull Request sur GitHub
# Merger dans main après review
```

---

## 🚀 DÉPLOIEMENT VPS (1h)

### Étape 1 : Louer VPS OVH (15 min)

```
1. Aller sur https://www.ovhcloud.com/fr/vps/
2. Choisir "VPS Elite" (16GB RAM, 8 vCPU) : ~35€/mois
3. Choisir "Ubuntu 22.04 LTS"
4. Finaliser commande
5. Noter IP du VPS (ex: 51.68.123.45)
6. Récupérer mot de passe root (email OVH)
```

### Étape 2 : Configurer DNS (10 min)

```
# Sur OVH Manager ou votre registrar :
api.flotteq.com     A    51.68.123.45
app.flotteq.com     A    51.68.123.45
partner.flotteq.com A    51.68.123.45
driver.flotteq.com  A    51.68.123.45
admin.flotteq.com   A    51.68.123.45

# Attendre propagation (5-10 min)
dig +short api.flotteq.com
```

### Étape 3 : Setup VPS Initial (20 min)

```bash
# SSH dans le VPS
ssh root@flotteq.com
# Ou : ssh root@51.68.123.45

# Mise à jour système
apt update && apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh
systemctl enable docker

# Install Docker Compose
apt install docker-compose-plugin -y

# Firewall
ufw allow ssh
ufw allow 80/tcp
ufw allow 443/tcp
ufw enable
ufw status

# Clone repo
cd /opt
git clone https://github.com/YOUR_USERNAME/flotteq-v2.git
cd flotteq-v2
```

### Étape 4 : Configuration Production (15 min)

```bash
# Générer secrets
./scripts/generate-secrets.sh

# Créer .env.production backend
cp backend/.env.production.example backend/.env.production
nano backend/.env.production

# Remplacer TOUS les CHANGEME :
# - DB_PASSWORD : copier depuis secrets/db_password.txt
# - JWT_*_SECRET : copier depuis secrets/jwt_*.txt
# - STRIPE_SECRET_KEY : depuis Stripe Dashboard (LIVE)
# - REDIS_PASSWORD : copier depuis secrets/redis_password.txt
# - SMTP_PASSWORD : mot de passe SMTP
# - Vérifier CORS_ORIGIN (5 domaines HTTPS)

# Créer .env.production frontends
cp frontend-client/.env.production.example frontend-client/.env.production
cp frontend-partner/.env.production.example frontend-partner/.env.production
cp frontend-driver/.env.production.example frontend-driver/.env.production
cp frontend-internal/.env.production.example frontend-internal/.env.production

# Modifier clés Stripe LIVE dans client et driver
nano frontend-client/.env.production
nano frontend-driver/.env.production
# Remplacer VITE_STRIPE_PUBLISHABLE_KEY=pk_live_...
```

### Étape 5 : SSL Let's Encrypt (10 min)

```bash
chmod +x scripts/init-ssl.sh
./scripts/init-ssl.sh

# Suivre les instructions
# Vérifier que les 5 certificats sont obtenus
ls -la certbot/conf/live/
# Devrait afficher 5 dossiers
```

### Étape 6 : Premier Déploiement (10 min)

```bash
chmod +x scripts/deploy-production.sh
./scripts/deploy-production.sh

# Le script va :
# 1. Build Docker images (~5 min)
# 2. Démarrer PostgreSQL
# 3. Run migrations
# 4. Démarrer tous les services
# 5. Health check

# Attendre fin du script (logs détaillés)
```

### ✅ Vérification Finale (5 min)

```bash
# 1. Check services
docker compose -f docker-compose.production.yml ps
# Tous doivent être "Up" et "healthy"

# 2. Test API
curl https://api.flotteq.com/api/health
# {"status":"ok",...}

# 3. Test frontends
curl -I https://app.flotteq.com      # HTTP 200
curl -I https://partner.flotteq.com  # HTTP 200
curl -I https://driver.flotteq.com   # HTTP 200
curl -I https://admin.flotteq.com    # HTTP 200

# 4. Ouvrir navigateur
open https://app.flotteq.com
# ✅ L'app devrait charger !

# 5. Configurer backups cron
crontab -e
# Ajouter (copier depuis docs/CRONTAB_BACKUPS.md):
30 2 * * * /opt/flotteq-v2/scripts/backup-db.sh >> /var/log/flotteq/backup-db.log 2>&1
0 3 * * 0 /opt/flotteq-v2/scripts/backup-uploads.sh >> /var/log/flotteq/backup-uploads.log 2>&1
0 2 * * * /opt/flotteq-v2/scripts/renew-ssl.sh >> /var/log/flotteq/ssl-renew.log 2>&1
```

---

## 🎉 TERMINÉ !

### Ce qui fonctionne maintenant :

✅ **5 domaines HTTPS** actifs (Let's Encrypt SSL)
✅ **API Backend** accessible : https://api.flotteq.com/api/health
✅ **App Client** : https://app.flotteq.com
✅ **App Partner** : https://partner.flotteq.com
✅ **App Driver** : https://driver.flotteq.com
✅ **App Admin** : https://admin.flotteq.com
✅ **PostgreSQL** avec 31 migrations
✅ **Redis** pour cache + queues
✅ **Backups automatiques** (cron quotidien)
✅ **SSL auto-renewal** (cron quotidien)
✅ **CI/CD** avec GitHub Actions

### Prochaines actions (post-déploiement) :

1. **Configurer monitoring**
   - UptimeRobot : https://uptimerobot.com (gratuit)
   - Ajouter checks HTTP pour les 5 domaines

2. **Configurer GitHub Secrets**
   - Suivre `docs/GITHUB_SECRETS.md`
   - Ajouter VPS_SSH_KEY, VPS_HOST, VPS_USER
   - Tester déploiement automatique (push sur main)

3. **Tests complets**
   - Créer compte tenant
   - Ajouter véhicule
   - Upload document
   - Tester Stripe (mode test d'abord)

4. **Documentation équipe**
   - Partager accès VPS
   - Partager secrets (1Password, Vault)
   - Documenter procédures (rollback, backup restore)

---

## 🆘 EN CAS DE PROBLÈME

### Service ne démarre pas

```bash
docker compose -f docker-compose.production.yml logs SERVICE_NAME
# Exemples :
docker compose logs backend
docker compose logs postgres
```

### API 502 Bad Gateway

```bash
# Vérifier backend
docker compose ps backend

# Redémarrer backend
docker compose restart backend

# Vérifier healthcheck
curl http://localhost:3000/api/health
```

### Rollback d'urgence

```bash
cd /opt/flotteq-v2
./scripts/rollback.sh
# Suivre instructions
```

### Tout casser et recommencer

```bash
# Arrêter tout
docker compose -f docker-compose.production.yml down -v

# Supprimer images
docker image prune -a -f

# Relancer déploiement
./scripts/deploy-production.sh
```

---

## 📞 CONTACTS

### Support
- Email : support@flotteq.com
- Slack : #tech-support

### Ressources
- [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) - Guide complet
- [SPRINTS_DEPLOIEMENT_RECAPITULATIF.md](SPRINTS_DEPLOIEMENT_RECAPITULATIF.md) - Récap détaillé
- GitHub Actions : https://github.com/YOUR_USERNAME/flotteq-v2/actions

---

## ⏱️ TEMPS RÉEL ESTIMÉ

| Étape | Temps prévu | Temps réel |
|-------|-------------|------------|
| Sprint D0 | 2h | ___ h |
| Sprint D1 | 1h | ___ h |
| Sprint D2 | 2h | ___ h |
| Sprint D3 | 1h30 | ___ h |
| Déploiement | 1h | ___ h |
| **TOTAL** | **7h30** | **___ h** |

*Remplis cette colonne en temps réel pour tracker ta progression !*

---

**Bon courage ! Tu vas y arriver ! 🚀**

*Note : Si tu bloques > 30 min sur un ticket, passe au suivant et reviens après.*
