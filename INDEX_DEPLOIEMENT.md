# 📚 INDEX - Documentation Déploiement FlotteQ

Bienvenue ! Ce fichier t'aide à naviguer dans toute la documentation de déploiement.

---

## 🚀 TU VEUX DÉPLOYER MAINTENANT ?

### Scénario B : Test sur IP (HTTP - 1h30) ⚡

**Parfait pour** : Tests, présentations, démos clients

**Commence ici** → [QUICK_START_IP.md](QUICK_START_IP.md) (guide 30 min)

**Ou guide détaillé** → [GUIDE_DEPLOY_IP.md](GUIDE_DEPLOY_IP.md) (450 lignes)

---

### Scénario A : Production avec domaine (HTTPS - 2h30) 🌟

**Parfait pour** : Production réelle, clients payants

**Commence ici** → [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) (402 lignes)

---

## 📖 DOCUMENTATION PAR TYPE

### 🚀 Guides Déploiement

| Fichier | Description | Durée | Niveau |
|---------|-------------|-------|--------|
| **[QUICK_START_IP.md](QUICK_START_IP.md)** | Guide ultra-rapide Scénario B | 30 min | ⭐⭐☆☆☆ |
| **[GUIDE_DEPLOY_IP.md](GUIDE_DEPLOY_IP.md)** | Guide complet Scénario B (HTTP/IP) | 1h30 | ⭐⭐☆☆☆ |
| **[DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)** | Guide complet Scénario A (HTTPS/Domaine) | 2h30 | ⭐⭐⭐☆☆ |

---

### 🔧 Configuration & Scripts

| Fichier | Description | Usage |
|---------|-------------|-------|
| **[.env.production](/.env.production)** | Config production (domaine + SSL) | Scénario A |
| **[.env.production.ip](/.env.production.ip)** | Config production (IP sans SSL) | Scénario B |
| **[docker-compose.production.yml](/docker-compose.production.yml)** | Docker Compose avec Nginx/SSL | Scénario A |
| **[docker-compose.ip.yml](/docker-compose.ip.yml)** | Docker Compose sans Nginx/SSL | Scénario B |
| **[scripts/deploy-production.sh](/scripts/deploy-production.sh)** | Script déploiement avec SSL | Scénario A |
| **[scripts/deploy-ip.sh](/scripts/deploy-ip.sh)** | Script déploiement IP | Scénario B |
| **[scripts/rollback.sh](/scripts/rollback.sh)** | Rollback d'urgence | Les 2 |

---

### 🔑 Aide & Référence

| Fichier | Description |
|---------|-------------|
| **[AIDE_MEMOIRE_SSH.md](AIDE_MEMOIRE_SSH.md)** | Infos VPS + commandes SSH |
| **[README.md](README.md)** | Vue d'ensemble projet FlotteQ |
| **[SCENARIO_B_COMPLETION.md](SCENARIO_B_COMPLETION.md)** | Récapitulatif Scénario B |
| **[LANCEMENT_SCENARIO_B.txt](LANCEMENT_SCENARIO_B.txt)** | Récap visuel Scénario B |

---

### ⚙️ Configuration Services

| Fichier | Description |
|---------|-------------|
| **[GUIDE_CONFIGURATION_STRIPE.md](GUIDE_CONFIGURATION_STRIPE.md)** | Setup Stripe billing + Connect |
| **[GUIDE_DATABASE_SETUP.md](GUIDE_DATABASE_SETUP.md)** | PostgreSQL + migrations |
| **[docs/GITHUB_SECRETS.md](docs/GITHUB_SECRETS.md)** | Configuration CI/CD GitHub Actions |

---

### 📊 Sprints & Rapports

| Fichier | Description |
|---------|-------------|
| **[SPRINT_D0_DOCKERISATION.md](SPRINT_D0_DOCKERISATION.md)** | Sprint D0 - Dockerfiles |
| **[SPRINT_D1_CONFIGURATION_PRODUCTION.md](SPRINT_D1_CONFIGURATION_PRODUCTION.md)** | Sprint D1 - .env production |
| **[SPRINT_D2_INFRASTRUCTURE_NGINX.md](SPRINT_D2_INFRASTRUCTURE_NGINX.md)** | Sprint D2 - Nginx + SSL |
| **[SPRINT_D2.5_COMPLETION_REPORT.md](SPRINT_D2.5_COMPLETION_REPORT.md)** | Sprint D2.5 - Corrections |
| **[SPRINT_D3_CICD_DEPLOIEMENT.md](SPRINT_D3_CICD_DEPLOIEMENT.md)** | Sprint D3 - CI/CD |
| **[SPRINT_D3_COMPLETION_REPORT.md](SPRINT_D3_COMPLETION_REPORT.md)** | Rapport Sprint D3 |

---

## 🎯 PAR OBJECTIF

### Je veux tester FlotteQ rapidement (30 min)
→ [QUICK_START_IP.md](QUICK_START_IP.md)

### Je veux déployer pour des présentations clients (1h30)
→ [GUIDE_DEPLOY_IP.md](GUIDE_DEPLOY_IP.md)

### Je veux déployer en production HTTPS (2h30)
→ [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)

### J'ai un problème de connexion SSH
→ [AIDE_MEMOIRE_SSH.md](AIDE_MEMOIRE_SSH.md)

### Je veux configurer Stripe
→ [GUIDE_CONFIGURATION_STRIPE.md](GUIDE_CONFIGURATION_STRIPE.md)

### Je veux comprendre les migrations DB
→ [GUIDE_DATABASE_SETUP.md](GUIDE_DATABASE_SETUP.md)

### Je veux activer CI/CD GitHub Actions
→ [docs/GITHUB_SECRETS.md](docs/GITHUB_SECRETS.md)

### J'ai un problème technique
→ [GUIDE_DEPLOY_IP.md](GUIDE_DEPLOY_IP.md) section "Troubleshooting"
→ [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) section "Troubleshooting"

---

## 📝 WORKFLOW RECOMMANDÉ

### Pour débutant (toi maintenant)

```
1. Lis: QUICK_START_IP.md (5 min de lecture)
2. Suis: GUIDE_DEPLOY_IP.md pas-à-pas (1h30)
3. Teste: http://37.59.96.178:5174
4. Réfère: AIDE_MEMOIRE_SSH.md si problème SSH
```

### Pour production (plus tard)

```
1. Achète domaine (flotteq.fr)
2. Configure DNS (5 sous-domaines)
3. Suis: DEPLOYMENT_GUIDE.md pas-à-pas (2h30)
4. Active: CI/CD via docs/GITHUB_SECRETS.md
5. Configure: Stripe LIVE via GUIDE_CONFIGURATION_STRIPE.md
```

---

## 🔗 LIENS EXTERNES UTILES

- **OVH Manager** : https://www.ovh.com/manager/
- **Stripe Dashboard** : https://dashboard.stripe.com
- **GitHub Repo** : https://github.com/Wissem95/flotteq-v2
- **Docker Hub** : https://hub.docker.com
- **Let's Encrypt** : https://letsencrypt.org

---

## 📊 STATISTIQUES DOCUMENTATION

- **Guides déploiement** : 3 fichiers (~1000 lignes)
- **Scripts automatisés** : 9 fichiers bash
- **Fichiers config** : 4 fichiers .env
- **Docker Compose** : 2 versions (avec/sans SSL)
- **Documentation totale** : 77 fichiers Markdown
- **Sprints complétés** : D0, D1, D2, D2.5, D3

---

## ✅ CHECKLIST DÉMARRAGE

- [ ] VPS OVH actif (37.59.96.178)
- [ ] Accès SSH configuré
- [ ] Guide lu (QUICK_START_IP.md)
- [ ] Docker installé sur VPS
- [ ] Projet cloné (/opt/flotteq-v2)
- [ ] Script lancé (./scripts/deploy-ip.sh)
- [ ] Application testée (http://37.59.96.178:5174)

---

## 🆘 AIDE RAPIDE

**Problème SSH** → [AIDE_MEMOIRE_SSH.md](AIDE_MEMOIRE_SSH.md)
**Problème déploiement** → [GUIDE_DEPLOY_IP.md](GUIDE_DEPLOY_IP.md) "Troubleshooting"
**Question Stripe** → [GUIDE_CONFIGURATION_STRIPE.md](GUIDE_CONFIGURATION_STRIPE.md)
**Question Docker** → [SPRINT_D0_DOCKERISATION.md](SPRINT_D0_DOCKERISATION.md)

---

**Dernière mise à jour** : 23 Novembre 2025
**Version** : Scénario B Ready
**Status** : ✅ Prêt à déployer
