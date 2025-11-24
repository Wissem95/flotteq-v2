# ⚡ QUICK START - Déploiement IP (30 min)

**VPS** : `37.59.96.178` (6 vCPU, 12GB RAM)
**Type** : HTTP sans SSL (parfait pour tests/présentations)

---

## 🚀 ÉTAPES RAPIDES

### 1️⃣ Connexion SSH (2 min)

```bash
# Depuis ton Mac
ssh root@37.59.96.178
# Entre le mot de passe root OVH
```

Si pas de mot de passe → Réinitialise sur OVH Manager

---

### 2️⃣ Installer Docker (10 min)

```bash
# Sur le VPS
apt update && apt upgrade -y
curl -fsSL https://get.docker.com | sh
systemctl enable docker && systemctl start docker
apt install docker-compose-plugin -y

# Vérifier
docker --version
docker compose version
```

---

### 3️⃣ Configurer Firewall (2 min)

```bash
# Sur le VPS
ufw allow ssh && ufw allow 22/tcp
ufw allow 3000/tcp  # API
ufw allow 5174/tcp  # Frontend Client
ufw allow 5175/tcp  # Partner
ufw allow 5176/tcp  # Driver
ufw allow 3001/tcp  # Admin
ufw --force enable
```

---

### 4️⃣ Cloner le projet (3 min)

```bash
# Sur le VPS
cd /opt
git clone https://github.com/Wissem95/flotteq-v2.git
cd flotteq-v2
ls -la  # Vérifier que les fichiers sont là
```

---

### 5️⃣ Déployer (20 min)

```bash
# Sur le VPS
./scripts/deploy-ip.sh
```

Le script va automatiquement :
- ✅ Build les images Docker (~15 min)
- ✅ Démarrer Postgres + Redis
- ✅ Run migrations
- ✅ Démarrer Backend + 4 Frontends
- ✅ Health checks

---

### 6️⃣ Tester (2 min)

**Sur ton Mac**, ouvre ton navigateur :

- API : http://37.59.96.178:3000/api/health ✅
- App Client : http://37.59.96.178:5174 ✅
- Partner : http://37.59.96.178:5175 ✅
- Driver : http://37.59.96.178:5176 ✅
- Admin : http://37.59.96.178:3001 ✅

---

## ✅ SUCCÈS !

Si tu vois les pages de login → **C'EST BON !** 🎉

---

## 📝 Créer un compte admin

```bash
# Sur le VPS
docker exec -it flotteq_db_prod psql -U flotteq_prod -d flotteq_production

# Copier-coller
INSERT INTO users (email, password, first_name, last_name, role, is_active, created_at)
VALUES ('admin@flotteq.com', '$2b$12$KIXxGv7V3wvG8FqHbJ3JQ.7.SvZ0bP9JKHl4hV6jK9wKkJH3yJ3Iq', 'Admin', 'FlotteQ', 'super_admin', true, NOW());

# Quitter
\q
```

**Login** : `admin@flotteq.com` / `password123`

---

## 🆘 Problème ?

### Voir les logs
```bash
docker compose -f docker-compose.ip.yml logs -f
```

### Redémarrer
```bash
docker compose -f docker-compose.ip.yml restart backend
```

### Tout arrêter
```bash
docker compose -f docker-compose.ip.yml down
```

### Tout relancer
```bash
docker compose -f docker-compose.ip.yml up -d
```

---

## 📚 Documentation complète

Voir [GUIDE_DEPLOY_IP.md](GUIDE_DEPLOY_IP.md) pour le guide détaillé (troubleshooting, SMTP, etc.)

---

**Durée totale** : ~30-40 minutes
**Difficulté** : ⭐⭐☆☆☆ (Facile)
