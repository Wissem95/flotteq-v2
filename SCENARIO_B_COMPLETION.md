# ✅ SCÉNARIO B - DÉPLOIEMENT IP COMPLÉTÉ

**Date** : 23 Novembre 2025
**VPS** : `37.59.96.178` (OVH - 6 vCPU, 12GB RAM)
**Type** : Déploiement HTTP sans SSL (tests/présentations)

---

## 📊 AUDIT INITIAL - CE QUI EXISTAIT

✅ **Infrastructure complète**
- Docker Compose production (`docker-compose.production.yml`)
- Backend Dockerfile (multi-stage)
- 4 Frontends Dockerfiles
- Scripts de déploiement complets
- Migrations PostgreSQL (31 migrations)

✅ **Configuration Stripe TEST**
- Clés publiques/secrètes configurées dans `.env`
- Webhook secret configuré

✅ **VPS OVH Performant**
- 6 vCPU (recommandé : 4)
- 12 GB RAM (recommandé : 8 GB)
- 100 GB SSD (recommandé : 80 GB)
- IP : `37.59.96.178`

---

## 🎯 FICHIERS CRÉÉS (SCÉNARIO B)

### 1. `.env.production.ip` (74 lignes)
**Fichier de configuration** pour déploiement sur IP

**Contenu** :
- ✅ IP `37.59.96.178` dans tous les URLs
- ✅ CORS configuré pour l'IP + ports
- ✅ Vraies clés Stripe TEST (depuis `.env` dev)
- ✅ Configuration PostgreSQL production
- ✅ Configuration Redis
- ✅ Variables JWT/SMTP
- ✅ URLs frontends (5174, 5175, 5176, 3001)

**Modifications vs `.env.production`** :
- Remplacé domaines par IP
- Ajouté ports explicites
- Copié vraies clés Stripe

---

### 2. `docker-compose.ip.yml` (213 lignes)
**Docker Compose simplifié** sans Nginx/SSL

**Services inclus** :
- ✅ PostgreSQL 15 (avec healthcheck)
- ✅ Redis 7 (avec password)
- ✅ Backend NestJS (port 3000 exposé)
- ✅ Frontend Client (port 5174 exposé)
- ✅ Frontend Partner (port 5175 exposé)
- ✅ Frontend Driver (port 5176 exposé)
- ✅ Frontend Internal (port 3001 exposé)

**Services RETIRÉS vs production** :
- ❌ Nginx (pas nécessaire)
- ❌ Certbot (pas de SSL)

**Différences** :
- Ports exposés directement (pas de reverse proxy)
- Pas de secrets Docker (passwords dans .env)
- Healthchecks simplifiés

---

### 3. `scripts/deploy-ip.sh` (320 lignes)
**Script de déploiement automatisé** pour IP

**Fonctionnalités** :
- ✅ Vérifications préalables (Docker, espace disque)
- ✅ Arrêt services existants
- ✅ Build images Docker (backend + 4 frontends)
- ✅ Démarrage infrastructure (Postgres + Redis)
- ✅ Démarrage backend + migrations automatiques
- ✅ Démarrage frontends
- ✅ Health checks complets
- ✅ Logs colorés et détaillés
- ✅ Affichage URLs d'accès

**Durée d'exécution** : ~20-25 min (build initial)

---

### 4. `GUIDE_DEPLOY_IP.md` (450+ lignes)
**Guide complet** pas-à-pas

**Sections** :
1. ✅ Connexion SSH au VPS (récupération mot de passe OVH)
2. ✅ Installation Docker + Docker Compose
3. ✅ Configuration Firewall UFW
4. ✅ Transfert projet (Git clone ou SCP)
5. ✅ Configuration SMTP (Gmail App Password)
6. ✅ Déploiement via script
7. ✅ Vérification (healthchecks, URLs)
8. ✅ Création compte super_admin
9. ✅ Commandes utiles
10. ✅ Troubleshooting complet
11. ✅ Upgrade vers HTTPS

---

### 5. `QUICK_START_IP.md` (120 lignes)
**Guide ultra-rapide** (30 min)

**Format** : Étapes numérotées
- ✅ SSH
- ✅ Docker install
- ✅ Firewall
- ✅ Clone
- ✅ Deploy
- ✅ Test

---

## 🚀 RÉSULTAT FINAL

Après exécution du scénario B, tu auras :

### Applications accessibles

| App | URL | Port |
|-----|-----|------|
| **API Backend** | http://37.59.96.178:3000/api/health | 3000 |
| **Frontend Client** | http://37.59.96.178:5174 | 5174 |
| **Frontend Partner** | http://37.59.96.178:5175 | 5175 |
| **Frontend Driver** | http://37.59.96.178:5176 | 5176 |
| **Frontend Admin** | http://37.59.96.178:3001 | 3001 |

### Stack complet déployé

- ✅ **PostgreSQL 15** (flotteq_production)
- ✅ **Redis 7** (cache + Bull Queue)
- ✅ **Backend NestJS** (31 migrations exécutées)
- ✅ **4 Frontends React** (build production)

### Capacités

- ✅ Créer comptes / Tenants
- ✅ Gérer véhicules
- ✅ Upload documents
- ✅ Maintenances
- ✅ Stripe subscriptions (TEST mode)
- ✅ Parfait pour **présentations/démos**

---

## ⚠️ LIMITATIONS SCÉNARIO B

| Limitation | Impact | Solution |
|------------|--------|----------|
| **HTTP uniquement** | Données non chiffrées | ✅ OK pour tests, ❌ PAS prod |
| **Pas de certificat SSL** | Browsers warning | Upgrade Scénario A (domaine) |
| **Stripe webhooks limités** | Certains events refusés | Utiliser ngrok OU domaine |
| **IP publique exposée** | Moins professionnel | Acheter domaine (~10€/an) |

---

## 📈 UPGRADE VERS PRODUCTION (SCÉNARIO A)

Quand prêt pour production HTTPS :

### Étape 1 : Acheter domaine
- Sur OVH : ~10€/an pour `.fr`
- Exemple : `flotteq.fr`

### Étape 2 : Configurer DNS (5 sous-domaines)
```
api.flotteq.fr     → 37.59.96.178
app.flotteq.fr     → 37.59.96.178
partner.flotteq.fr → 37.59.96.178
driver.flotteq.fr  → 37.59.96.178
admin.flotteq.fr   → 37.59.96.178
```

### Étape 3 : Reconfigurer .env
```bash
# Copier .env.production.example
cp backend/.env.production.example backend/.env.production

# Remplacer IPs par domaines
nano backend/.env.production
```

### Étape 4 : Initialiser SSL
```bash
./scripts/init-ssl.sh
```

### Étape 5 : Déployer avec SSL
```bash
./scripts/deploy-production.sh
```

**Guide complet** : [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)

---

## 🎯 PROCHAINES ÉTAPES (POUR TOI)

### Maintenant (dans les 2h)

1. **Se connecter au VPS**
   ```bash
   ssh root@37.59.96.178
   ```

2. **Installer Docker**
   ```bash
   curl -fsSL https://get.docker.com | sh
   apt install docker-compose-plugin -y
   ```

3. **Cloner le projet**
   ```bash
   cd /opt
   git clone https://github.com/Wissem95/flotteq-v2.git
   cd flotteq-v2
   ```

4. **Déployer**
   ```bash
   ./scripts/deploy-ip.sh
   ```

5. **Tester**
   - Ouvrir http://37.59.96.178:5174 dans le navigateur

### Guide à suivre

**Guide détaillé** : [GUIDE_DEPLOY_IP.md](GUIDE_DEPLOY_IP.md)
**Guide rapide** : [QUICK_START_IP.md](QUICK_START_IP.md)

---

## 📦 RÉCAPITULATIF FICHIERS

```
Flotteq-v2/
├── .env.production.ip              ← Configuration IP (74 lignes)
├── docker-compose.ip.yml           ← Docker Compose simplifié (213 lignes)
├── scripts/
│   └── deploy-ip.sh                ← Script déploiement (320 lignes)
├── GUIDE_DEPLOY_IP.md              ← Guide complet (450 lignes)
├── QUICK_START_IP.md               ← Guide rapide (120 lignes)
└── SCENARIO_B_COMPLETION.md        ← Ce fichier
```

**Total** : **5 fichiers** | **~1200 lignes de code/doc**

---

## ✅ CHECKLIST FINALE

**Fichiers créés** :
- [x] `.env.production.ip` avec vraies clés Stripe
- [x] `docker-compose.ip.yml` sans Nginx/SSL
- [x] `scripts/deploy-ip.sh` exécutable
- [x] `GUIDE_DEPLOY_IP.md` complet
- [x] `QUICK_START_IP.md` rapide

**Documentation** :
- [x] Étapes SSH détaillées
- [x] Installation Docker
- [x] Configuration Firewall
- [x] Troubleshooting complet
- [x] Commandes utiles
- [x] Guide upgrade HTTPS

**Prêt à déployer** :
- [x] VPS specs validées (6 vCPU, 12GB RAM)
- [x] IP publique notée (37.59.96.178)
- [x] Stripe configuré (mode TEST)
- [x] Scripts testés syntaxiquement

---

## 🎉 CONCLUSION

**SCÉNARIO B COMPLÉTÉ À 100%** ✅

Tu as maintenant **tout ce qu'il faut** pour déployer FlotteQ sur ton VPS OVH en HTTP.

**Ce que tu peux faire maintenant** :
- ✅ Démos clients (via IP)
- ✅ Présentations
- ✅ Tests fonctionnels complets
- ✅ Valider Stripe TEST
- ✅ Montrer l'application à des investisseurs

**Prochaine étape recommandée** :
- Acheter domaine `flotteq.fr` (~10€)
- Passer en Scénario A (HTTPS)
- Production-ready !

---

**Suis maintenant** : [QUICK_START_IP.md](QUICK_START_IP.md) pour déployer en 30 min ! 🚀

---

**Durée totale Scénario B** : ~1h30 (incluant build Docker)
**Difficulté** : ⭐⭐☆☆☆ (Facile avec les guides)
**Support** : Voir GUIDE_DEPLOY_IP.md section Troubleshooting
