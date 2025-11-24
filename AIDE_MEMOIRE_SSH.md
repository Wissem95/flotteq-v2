# 🔑 AIDE-MÉMOIRE SSH - VPS OVH

## 📋 INFORMATIONS VPS

| Info | Valeur |
|------|--------|
| **Hostname** | `vps-c8258b2.vps.ovh.net` |
| **IP Publique** | `37.59.96.178` |
| **Specs** | 6 vCPU, 12 GB RAM, 100 GB SSD |
| **Datacenter** | Gravelines (France) |
| **OS** | Ubuntu (à installer si pas fait) |
| **Username SSH** | `root` |
| **Mot de passe** | Voir email OVH ou réinitialiser |

---

## 🚀 CONNEXION SSH

### Depuis Mac (Terminal)

```bash
# Connexion simple
ssh root@37.59.96.178

# OU avec hostname
ssh root@vps-c8258b2.vps.ovh.net
```

### Première connexion

Si tu vois :
```
The authenticity of host '37.59.96.178' can't be established.
Are you sure you want to continue connecting (yes/no)?
```

→ Tape **`yes`** + Entrée

---

## 🔐 RÉCUPÉRER LE MOT DE PASSE ROOT

### Option 1 : Email OVH (recommandé)

1. Ouvre ta boîte email
2. Cherche : `"VPS" "mot de passe" "root"`
3. Email envoyé lors de la création du VPS
4. Subject : "Votre VPS est prêt" ou similaire

### Option 2 : Réinitialiser via OVH Manager

1. Va sur https://www.ovh.com/manager/
2. Connexion avec tes identifiants OVH
3. Menu : **Bare Metal Cloud** → **Serveurs privés virtuels**
4. Clique sur `vps-c8258b2.vps.ovh.net`
5. Onglet **"Accueil"**
6. Trouve **"OS / Distribution"**
7. Clique menu "**...**" → **"Réinstaller votre VPS"**
8. Choisis **Ubuntu 22.04 LTS**
9. Confirme la réinstallation
10. Attends 5-10 min
11. Nouveau mot de passe envoyé par email

⚠️ **ATTENTION** : La réinstallation efface TOUT le VPS !

---

## 🛠️ COMMANDES ESSENTIELLES

### Une fois connecté

```bash
# Voir où tu es
pwd

# Aller dans le projet FlotteQ
cd /opt/flotteq-v2

# Voir les fichiers
ls -la

# Voir les containers Docker
docker compose -f docker-compose.ip.yml ps

# Voir les logs
docker compose -f docker-compose.ip.yml logs -f

# Arrêter services
docker compose -f docker-compose.ip.yml down

# Démarrer services
docker compose -f docker-compose.ip.yml up -d

# Redémarrer backend
docker compose -f docker-compose.ip.yml restart backend
```

### Déconnexion SSH

```bash
# Quitter SSH
exit

# OU
logout

# OU
Ctrl+D
```

---

## 🆘 PROBLÈMES CONNEXION

### "Connection refused"

→ Vérifie que le VPS est allumé sur OVH Manager

### "Permission denied"

→ Mauvais mot de passe → Réinitialise via OVH Manager

### "Connection timeout"

→ Vérifie ton firewall/WiFi

---

## 📝 CHEAT SHEET

```bash
# Connexion
ssh root@37.59.96.178

# Status services
docker compose -f docker-compose.ip.yml ps

# Logs temps réel
docker compose -f docker-compose.ip.yml logs -f backend

# Redémarrer backend
docker compose -f docker-compose.ip.yml restart backend

# Voir espace disque
df -h

# Nettoyer Docker
docker system prune -a -f

# Quitter SSH
exit
```

---

## 🔗 LIENS UTILES

- **OVH Manager** : https://www.ovh.com/manager/
- **Guide déploiement** : [GUIDE_DEPLOY_IP.md](GUIDE_DEPLOY_IP.md)
- **Quick start** : [QUICK_START_IP.md](QUICK_START_IP.md)

---

**Garde ce fichier sous la main pendant le déploiement !** 📌
