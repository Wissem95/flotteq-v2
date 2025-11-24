# 🚀 Guide Déploiement FlotteQ sur IP (HTTP) - Scénario B

**VPS OVH** : `vps-c8258b2.vps.ovh.net`
**IP Publique** : `37.59.96.178`
**Specs** : 6 vCPU, 12 GB RAM, 100 GB SSD
**Durée totale** : ~1h30

---

## 📋 PRÉREQUIS

- ✅ VPS OVH actif (6 vCPU, 12 GB RAM)
- ✅ IP publique : `37.59.96.178`
- ✅ Accès SSH root (mot de passe OVH)
- ✅ Clés Stripe TEST configurées
- ✅ Projet FlotteQ-v2 sur GitHub

---

## 🔐 ÉTAPE 1 : CONNEXION SSH AU VPS (5 min)

### 1.1 Récupérer le mot de passe root

#### Option A : Chercher l'email OVH

1. Ouvre ta boîte email
2. Cherche : `"VPS" AND "mot de passe" AND "root"`
3. Email envoyé lors de la création du VPS
4. Note le mot de passe root

#### Option B : Réinitialiser le mot de passe

Si tu ne trouves pas l'email :

1. Va sur ta **page OVH** : https://www.ovh.com/manager/
2. Clique sur **Bare Metal Cloud** → **Serveurs privés virtuels**
3. Sélectionne `vps-c8258b2.vps.ovh.net`
4. Clique sur l'onglet **"Accueil"**
5. Trouve la section **"OS / Distribution"**
6. Clique sur le menu "**...**" → **"Réinstaller votre VPS"**
7. Choisis **Ubuntu 22.04 LTS**
8. Un nouveau mot de passe sera envoyé par email (5-10 min)

### 1.2 Tester la connexion SSH

Sur ton **Mac**, ouvre le **Terminal** (Cmd+Espace → "Terminal") :

```bash
# Se connecter au VPS
ssh root@37.59.96.178
```

**Première connexion** : Si tu vois ce message :
```
The authenticity of host '37.59.96.178' can't be established.
Are you sure you want to continue connecting (yes/no)?
```

→ Tape **`yes`** et appuie sur Entrée

**Entre le mot de passe root** (il ne s'affiche pas quand tu tapes, c'est normal)

✅ **Tu es connecté !** Tu devrais voir :
```
root@vps-c8258b2:~#
```

---

## 🛠️ ÉTAPE 2 : INSTALLER DOCKER SUR LE VPS (15 min)

**Important** : Tu es maintenant **sur le VPS** (via SSH). Toutes les commandes suivantes sont à exécuter sur le VPS.

### 2.1 Mettre à jour le système

```bash
# Mise à jour système
apt update && apt upgrade -y

# Installer outils de base
apt install -y curl git wget vim ufw
```

Durée : ~5 min

### 2.2 Installer Docker

```bash
# Télécharger et installer Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Démarrer Docker
systemctl enable docker
systemctl start docker

# Vérifier installation
docker --version
```

**Résultat attendu** :
```
Docker version 24.0.x, build xxxxx
```

### 2.3 Installer Docker Compose

```bash
# Installer Docker Compose plugin
apt install docker-compose-plugin -y

# Vérifier installation
docker compose version
```

**Résultat attendu** :
```
Docker Compose version v2.x.x
```

### 2.4 Configurer le firewall UFW

```bash
# Configurer UFW (firewall)
ufw default deny incoming
ufw default allow outgoing

# Autoriser SSH (IMPORTANT !)
ufw allow ssh
ufw allow 22/tcp

# Autoriser ports FlotteQ
ufw allow 3000/tcp  # API
ufw allow 5174/tcp  # Frontend Client
ufw allow 5175/tcp  # Frontend Partner
ufw allow 5176/tcp  # Frontend Driver
ufw allow 3001/tcp  # Frontend Admin

# Activer firewall
ufw enable

# Vérifier status
ufw status
```

✅ **Docker et UFW configurés !**

---

## 📦 ÉTAPE 3 : TRANSFÉRER LE PROJET SUR LE VPS (10 min)

Tu as **2 options** :

### Option A : Clone depuis GitHub (RECOMMANDÉ)

Sur le **VPS** (via SSH) :

```bash
# Aller dans /opt
cd /opt

# Cloner le projet (remplace YOUR_USERNAME par ton vrai username GitHub)
git clone https://github.com/Wissem95/flotteq-v2.git

# Entrer dans le projet
cd flotteq-v2

# Vérifier que les fichiers sont là
ls -la
```

Tu devrais voir :
- `docker-compose.ip.yml` ✅
- `.env.production.ip` ✅
- `scripts/deploy-ip.sh` ✅
- `backend/`, `frontend-*/` ✅

### Option B : Transférer depuis ton Mac via SCP

Sur ton **Mac** (nouveau terminal, PAS le SSH) :

```bash
# Depuis ton Mac, dans le dossier du projet
cd /Users/wissem/Flotteq-v2

# Créer archive (exclure node_modules)
tar --exclude='node_modules' --exclude='.git' -czf flotteq.tar.gz .

# Transférer sur VPS
scp flotteq.tar.gz root@37.59.96.178:/opt/

# Retourner sur le terminal SSH du VPS
# Extraire l'archive
cd /opt
tar -xzf flotteq.tar.gz -C flotteq-v2
cd flotteq-v2
```

✅ **Projet transféré sur le VPS !**

---

## ⚙️ ÉTAPE 4 : CONFIGURER SMTP (OPTIONNEL - 10 min)

Si tu veux que les emails fonctionnent (notifications, etc.) :

### Configuration Gmail

1. Va sur https://myaccount.google.com/apppasswords
2. Crée un "App Password" nommé "FlotteQ"
3. Note le mot de passe (format : `xxxx xxxx xxxx xxxx`)

Sur le **VPS**, édite `.env.production.ip` :

```bash
nano .env.production.ip
```

Remplace :
```env
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password-here
```

Par :
```env
SMTP_USER=ton-email@gmail.com
SMTP_PASSWORD=xxxx xxxx xxxx xxxx
```

Sauvegarde : **Ctrl+O** → Entrée → **Ctrl+X**

**Si tu ne configures pas SMTP** : Les emails ne seront pas envoyés, mais l'application fonctionnera quand même.

---

## 🚀 ÉTAPE 5 : DÉPLOYER L'APPLICATION (25 min)

Sur le **VPS**, dans `/opt/flotteq-v2` :

```bash
# Vérifier qu'on est dans le bon dossier
pwd
# Résultat attendu : /opt/flotteq-v2

# Lancer le déploiement
./scripts/deploy-ip.sh
```

### Que va faire le script ?

1. ✅ Vérifier Docker et espace disque
2. ✅ Build les 5 images Docker (~15 min)
3. ✅ Démarrer PostgreSQL et Redis
4. ✅ Démarrer Backend + migrations automatiques
5. ✅ Démarrer les 4 Frontends
6. ✅ Health checks

**Durée** : ~20-25 minutes (le build est long la première fois)

### Logs en temps réel

Si tu veux suivre les logs pendant le déploiement :

```bash
# Dans un autre terminal SSH
docker compose -f docker-compose.ip.yml logs -f
```

---

## ✅ ÉTAPE 6 : VÉRIFIER LE DÉPLOIEMENT (5 min)

### 6.1 Vérifier les containers

```bash
# Status des containers
docker compose -f docker-compose.ip.yml ps
```

**Résultat attendu** : Tous les containers doivent être **"Up"** et **"healthy"** :

```
NAME                          STATUS
flotteq_db_prod               Up (healthy)
flotteq_redis_prod            Up (healthy)
flotteq_backend_prod          Up (healthy)
flotteq_frontend_client_prod  Up (healthy)
flotteq_frontend_partner_prod Up (healthy)
flotteq_frontend_driver_prod  Up (healthy)
flotteq_frontend_internal_prod Up (healthy)
```

### 6.2 Tester l'API

```bash
# Test healthcheck API
curl http://localhost:3000/api/health
```

**Résultat attendu** :
```json
{
  "status": "ok",
  "timestamp": "2025-11-23T...",
  "database": "connected",
  "redis": "connected"
}
```

### 6.3 Ouvrir l'application dans le navigateur

**Sur ton Mac**, ouvre ton navigateur et teste :

| Application | URL | Test |
|-------------|-----|------|
| **API** | http://37.59.96.178:3000/api/health | Devrait afficher JSON |
| **Frontend Client** | http://37.59.96.178:5174 | Page de login |
| **Frontend Partner** | http://37.59.96.178:5175 | Page de login partner |
| **Frontend Driver** | http://37.59.96.178:5176 | Page de login driver |
| **Frontend Admin** | http://37.59.96.178:3001 | Page de login admin |

✅ **Si tu vois les pages de login → SUCCÈS !** 🎉

---

## 🧪 ÉTAPE 7 : CRÉER UN COMPTE DE TEST (5 min)

### 7.1 Créer un super admin

Sur le **VPS** :

```bash
# Connexion à PostgreSQL
docker exec -it flotteq_db_prod psql -U flotteq_prod -d flotteq_production

# Créer un compte super_admin
INSERT INTO users (email, password, first_name, last_name, role, is_active, created_at)
VALUES (
  'admin@flotteq.com',
  '$2b$12$KIXxGv7V3wvG8FqHbJ3JQ.7.SvZ0bP9JKHl4hV6jK9wKkJH3yJ3Iq',
  'Admin',
  'FlotteQ',
  'super_admin',
  true,
  NOW()
);

# Quitter PostgreSQL
\q
```

**Mot de passe** : `password123`

### 7.2 Se connecter

1. Va sur http://37.59.96.178:3001 (Frontend Admin)
2. Email : `admin@flotteq.com`
3. Mot de passe : `password123`

✅ **Tu es connecté !**

---

## 📝 COMMANDES UTILES

### Voir les logs

```bash
# Tous les services
docker compose -f docker-compose.ip.yml logs -f

# Un service spécifique
docker compose -f docker-compose.ip.yml logs -f backend
docker compose -f docker-compose.ip.yml logs -f frontend-client
```

### Redémarrer un service

```bash
# Redémarrer backend
docker compose -f docker-compose.ip.yml restart backend

# Redémarrer frontend client
docker compose -f docker-compose.ip.yml restart frontend-client
```

### Arrêter tous les services

```bash
docker compose -f docker-compose.ip.yml down
```

### Redémarrer tous les services

```bash
docker compose -f docker-compose.ip.yml up -d
```

### Status des containers

```bash
docker compose -f docker-compose.ip.yml ps
```

### Voir l'espace disque

```bash
df -h
```

### Nettoyer les images Docker non utilisées

```bash
docker image prune -a -f
```

---

## 🆘 TROUBLESHOOTING

### Problème : Container backend ne démarre pas

```bash
# Voir les logs
docker logs flotteq_backend_prod

# Vérifier que Postgres est UP
docker ps | grep postgres

# Redémarrer backend
docker compose -f docker-compose.ip.yml restart backend
```

### Problème : API retourne 502 Bad Gateway

```bash
# Vérifier healthcheck backend
docker inspect flotteq_backend_prod | grep Health

# Vérifier logs
docker logs flotteq_backend_prod | tail -50
```

### Problème : Frontend affiche page blanche

1. Ouvre la **Console du navigateur** (F12)
2. Regarde les erreurs
3. Vérifie que l'API est accessible : http://37.59.96.178:3000/api/health
4. Redémarre le frontend :
```bash
docker compose -f docker-compose.ip.yml restart frontend-client
```

### Problème : Out of disk space

```bash
# Voir espace disque
df -h

# Nettoyer images Docker
docker system prune -a -f

# Nettoyer logs
docker compose -f docker-compose.ip.yml logs --no-log-prefix | head -1000 > /dev/null
```

---

## ⚡ UPGRADE VERS DOMAINE + HTTPS

Quand tu veux passer en production avec HTTPS :

1. Achète un domaine (ex: `flotteq.fr`)
2. Configure les 5 sous-domaines DNS
3. Utilise `docker-compose.production.yml` au lieu de `docker-compose.ip.yml`
4. Lance `./scripts/init-ssl.sh` pour SSL Let's Encrypt
5. Lance `./scripts/deploy-production.sh`

Guide complet : [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)

---

## ✅ CHECKLIST POST-DÉPLOIEMENT

- [ ] Tous les containers "Up (healthy)"
- [ ] API répond sur http://37.59.96.178:3000/api/health
- [ ] Frontend Client accessible sur http://37.59.96.178:5174
- [ ] Frontend Partner accessible sur http://37.59.96.178:5175
- [ ] Frontend Driver accessible sur http://37.59.96.178:5176
- [ ] Frontend Admin accessible sur http://37.59.96.178:3001
- [ ] Compte admin créé et connexion OK
- [ ] Stripe fonctionne (création abonnement test)

---

## 📞 AIDE

### Logs détaillés

```bash
# Emplacement
/var/log/flotteq/deploy-ip-*.log

# Voir le dernier log
ls -lt /var/log/flotteq/ | head -2
tail -100 /var/log/flotteq/deploy-ip-*.log
```

### Contacts

- **Documentation** : Voir [README.md](README.md)
- **Guide production** : [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)
- **Troubleshooting** : Voir section ci-dessus

---

## 🎯 RÉSUMÉ

Tu as déployé FlotteQ sur ton VPS OVH avec :

- ✅ IP : `37.59.96.178`
- ✅ HTTP (pas HTTPS)
- ✅ 5 applications (API + 4 frontends)
- ✅ PostgreSQL + Redis
- ✅ Docker Compose
- ✅ Parfait pour tests et présentations

**Prochaine étape** : Acheter un domaine et passer en HTTPS pour la production réelle !

---

**Bon déploiement ! 🚀**
