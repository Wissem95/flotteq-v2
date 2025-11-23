# 🚗 FlotteQ - SaaS Multi-Tenant Fleet Management

[![CI](https://github.com/Wissem95/flotteq-v2/workflows/CI/badge.svg)](https://github.com/Wissem95/flotteq-v2/actions)
[![License](https://img.shields.io/badge/license-Proprietary-red.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/node-20.x-green.svg)](https://nodejs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue.svg)](https://www.typescriptlang.org/)
[![NestJS](https://img.shields.io/badge/NestJS-10.x-ea2845.svg)](https://nestjs.com/)
[![React](https://img.shields.io/badge/React-19.x-61dafb.svg)](https://reactjs.org/)

Plateforme SaaS multi-tenant de gestion de flottes automobiles avec marketplace de services (garages, assurances, contrôles techniques).

## 🎯 Features

### Core Platform
- ✅ **Multi-tenant architecture** - Isolation complète des données
- ✅ **4 Applications distinctes** - Client, Partner, Driver, Admin
- ✅ **Authentification sécurisée** - JWT dual-token, bcrypt rounds=12
- ✅ **Système de permissions** - 6 rôles (super_admin, support, tenant_admin, manager, driver, viewer)
- ✅ **Stripe Billing** - Abonnements SaaS (4 plans) avec Customer Portal
- ✅ **Documents quotas** - Gestion documents avec limites par plan

### Fleet Management
- ✅ **Gestion véhicules** - CRUD complet avec photos, historique kilométrique
- ✅ **Maintenances** - Templates, planification, suivi coûts
- ✅ **Conducteurs** - Assignation véhicules, trajets, rapports état des lieux
- ✅ **Statistiques** - Dashboard analytics multi-critères

### Marketplace
- ✅ **Partners** - Garages, assurances, contrôles techniques
- ✅ **Bookings** - Réservation services avec disponibilités
- ✅ **Stripe Connect** - Onboarding partners + split commissions automatique
- ✅ **Ratings** - Système notation 5 étoiles

### Infrastructure
- ✅ **Docker** - Containerisé avec docker-compose
- ✅ **PostgreSQL 15** - Base de données avec 31 migrations
- ✅ **Redis** - Cache + Bull Queue pour emails
- ✅ **Nginx** - Reverse proxy + SSL Let's Encrypt
- ✅ **CI/CD** - GitHub Actions
- ✅ **Monitoring** - Health checks, logs centralisés

## 🏗️ Architecture

```
┌─────────────────────────────────────────────┐
│          INTERNET (HTTPS)                  │
└────────────────┬────────────────────────────┘
                 │
         ┌───────▼────────┐
         │  NGINX REVERSE │
         │     PROXY      │
         │  (SSL/HTTPS)   │
         └───────┬────────┘
                 │
      ┌──────────┼──────────┬────────┐
      │          │          │        │
┌─────▼────┐ ┌──▼──────┐ ┌─▼────┐ ┌─▼──────┐
│ Frontend │ │ Frontend│ │Frontend│Frontend│
│  Client  │ │ Partner │ │ Driver │Internal│
│  :5174   │ │  :5175  │ │ :5176  │ :3001  │
└──────────┘ └─────────┘ └────────┘└────────┘
                 │
          ┌──────▼──────┐
          │   Backend   │
          │   NestJS    │
          │    :3000    │
          └──────┬──────┘
                 │
      ┌──────────┼──────────┐
      │          │          │
┌─────▼──────┐ ┌▼─────┐ ┌──▼──────┐
│ PostgreSQL │ │Redis │ │ Uploads │
│   :5432    │ │:6379 │ │  (S3)   │
└────────────┘ └──────┘ └─────────┘
```

## 📦 Tech Stack

### Backend
- **Framework**: NestJS 10.x
- **Language**: TypeScript 5.9
- **ORM**: TypeORM 0.3
- **Database**: PostgreSQL 15
- **Cache**: Redis 7 (optionnel dev, obligatoire prod)
- **Queue**: Bull (jobs emails asynchrones)
- **Auth**: JWT (access 15m + refresh 7d), Passport
- **Payments**: Stripe (billing + Connect marketplace)
- **Email**: Nodemailer + Handlebars templates
- **Upload**: Multer + Sharp (thumbnails)
- **Security**: Bcrypt, Helmet, Throttler, CORS
- **Docs**: Swagger/OpenAPI

### Frontends
- **Framework**: React 19.x
- **Language**: TypeScript 5.9
- **Build**: Vite 7
- **Styling**: Tailwind CSS + shadcn/ui
- **Data**: TanStack Query v5
- **State**: Zustand (partner, driver)
- **Forms**: React Hook Form + Zod
- **Routing**: React Router v7
- **Charts**: Recharts
- **Maps**: Leaflet (recherche garages)
- **Calendar**: React Big Calendar
- **PDF**: jsPDF

### DevOps
- **Container**: Docker + Docker Compose
- **Reverse Proxy**: Nginx
- **SSL**: Let's Encrypt (Certbot)
- **CI/CD**: GitHub Actions
- **Process Manager**: PM2 (alternative Docker)
- **Logs**: Centralisés /var/log/flotteq/
- **Backups**: Automatiques (cron quotidien)

## 🚀 Quick Start

### Prérequis
- Node.js >= 20
- Docker + Docker Compose
- PostgreSQL 15 (ou via Docker)
- Redis (optionnel en dev)

### Installation Développement

```bash
# 1. Cloner le repo
git clone https://github.com/Wissem95/flotteq-v2.git
cd flotteq-v2

# 2. Démarrer PostgreSQL (Docker)
docker-compose up -d postgres

# 3. Backend
cd backend
cp .env.example .env
npm install
npm run migration:run
npm run seed  # Données de test
npm run start:dev

# 4. Frontend Client (nouveau terminal)
cd frontend-client
cp .env.example .env
npm install
npm run dev

# 5. Accès
# API: http://localhost:3000/api
# Swagger: http://localhost:3000/api/docs
# App Client: http://localhost:5174
```

### URLs Développement

| Application | URL | Port |
|-------------|-----|------|
| Backend API | http://localhost:3000/api | 3000 |
| Swagger Docs | http://localhost:3000/api/docs | 3000 |
| Frontend Client | http://localhost:5174 | 5174 |
| Frontend Partner | http://localhost:5175 | 5175 |
| Frontend Driver | http://localhost:5176 | 5176 |
| Frontend Internal | http://localhost:3001 | 3001 |
| PostgreSQL | localhost:5432 | 5432 |
| Redis | localhost:6379 | 6379 |

## 📚 Documentation

- **[Guide Déploiement Production](DEPLOYMENT_GUIDE.md)** - Déployer sur VPS OVH
- **[Configuration Stripe](GUIDE_CONFIGURATION_STRIPE.md)** - Setup Stripe billing + Connect
- **[Database Setup](GUIDE_DATABASE_SETUP.md)** - PostgreSQL + migrations
- **[Système Permissions](PERMISSIONS_SYSTEM.md)** - Matrice rôles/permissions
- **[Frontend Internal](FRONTEND_INTERNAL_DOCUMENTATION.md)** - Documentation app admin
- **[Tests Manuels](GUIDE_TESTS_MANUELS.md)** - Procédures de test
- **[Architecture](docs/ARCHITECTURE.md)** - Choix Docker vs PM2

### Sprints Déploiement
- **[Sprint D0 - Dockerisation](SPRINT_D0_DOCKERISATION.md)** - Créer Dockerfiles
- **[Sprint D1 - Configuration Production](SPRINT_D1_CONFIGURATION_PRODUCTION.md)** - .env, healthcheck
- **[Sprint D2 - Infrastructure Nginx](SPRINT_D2_INFRASTRUCTURE_NGINX.md)** - Reverse proxy, SSL, backups
- **[Sprint D2.5 - Validation](SPRINT_D2.5_COMPLETION_REPORT.md)** - Corrections bugs critiques
- **[Sprint D3 - CI/CD](SPRINT_D3_CICD_DEPLOIEMENT.md)** - GitHub Actions, scripts deploy

## 🧪 Tests

```bash
# Backend - Unit tests
cd backend
npm test

# Backend - E2E tests
npm run test:e2e

# Backend - Coverage
npm run test:cov

# Frontend Client - Unit tests
cd frontend-client
npm test

# Scripts bash - Tests API
./test-commission-e2e.sh
./test-stripe-booking.sh
./test-ratings-api.sh
```

## 🗄️ Base de Données

### Entités principales (21 tables)

- **Tenants** - Entreprises clientes
- **Users** - Utilisateurs (6 rôles)
- **Vehicles** - Véhicules avec photos
- **Drivers** - Conducteurs
- **Maintenances** - Historique maintenances
- **Documents** - Documents avec quotas
- **Partners** - Partenaires marketplace
- **Bookings** - Réservations services
- **Commissions** - Calcul automatique commissions
- **Ratings** - Notations 5 étoiles
- **Trips** - Trajets conducteurs
- **Reports** - États des lieux photos
- **Subscriptions** - Abonnements SaaS
- **Subscription Plans** - 4 plans (Starter, Standard, Business, Enterprise)

### Migrations

31 migrations TypeORM actives. Voir `backend/src/migrations/`.

## 🔐 Sécurité

- ✅ **Mots de passe**: Bcrypt rounds=12
- ✅ **JWT**: Secrets générés (openssl rand -base64 64)
- ✅ **CORS**: Whitelist domaines autorisés
- ✅ **Helmet**: Security headers HTTP
- ✅ **Rate Limiting**: 10 req/s API, 20 req/s frontends
- ✅ **SQL Injection**: TypeORM parameterized queries
- ✅ **XSS**: React auto-escaping + CSP headers
- ✅ **CSRF**: SameSite cookies
- ✅ **Secrets**: Jamais commités (.gitignore)
- ✅ **SSL/TLS**: HTTPS obligatoire production (Let's Encrypt)
- ✅ **Firewall**: UFW configuré (ports 80, 443, 22)

## 💳 Stripe Integration

### Billing (SaaS Subscriptions)

4 plans disponibles:
- **Starter**: 29€/mois (5 véhicules, 3 utilisateurs)
- **Standard**: 49.99€/mois (15 véhicules, 10 utilisateurs)
- **Business**: 99€/mois (50 véhicules, 30 utilisateurs)
- **Enterprise**: 299€/mois (illimité)

### Marketplace (Stripe Connect)

- Onboarding partners via Connect Express
- Split automatique commissions (plateforme 10%)
- Paiements directs partner → client
- Dashboard commissions temps réel

## 📧 Email Notifications

Templates Handlebars:
- Welcome email (nouveau tenant)
- Booking confirmation (partner + client)
- Booking reminder (24h avant)
- Payment success
- Password reset

Queue Bull pour envois asynchrones.

## 🎨 Design System

- **UI Library**: shadcn/ui (Radix UI + Tailwind)
- **Icons**: Lucide React
- **Colors**: Palette personnalisée FlotteQ
- **Fonts**: Inter (system font)
- **Responsive**: Mobile-first design

## 🚀 Déploiement Production

```bash
# Sur VPS OVH Ubuntu 22.04
# Suivre le guide complet: DEPLOYMENT_GUIDE.md

# Résumé:
1. Configurer DNS (5 domaines)
2. Installer Docker + Nginx
3. Cloner repo + générer secrets
4. Créer .env.production
5. Initialiser SSL Let's Encrypt
6. Lancer déploiement: ./scripts/deploy-production.sh
7. Vérifier: curl https://api.flotteq.com/api/health
```

## 📊 Statistiques Projet

- **85,000+ lignes de code** (backend + 4 frontends)
- **400+ fichiers TypeScript**
- **31 migrations** base de données
- **21 entités** TypeORM
- **24 modules métier** backend
- **27 controllers** API
- **34 services** backend
- **77 fichiers documentation** Markdown
- **41 tests** (11 E2E + 30 unit)
- **17 scripts bash** tests API

## 🤝 Contributing

Ce projet est privé et propriétaire.

## 📄 License

Proprietary - Tous droits réservés

## 👥 Équipe

- **Lead Developer**: Wissem
- **Framework**: NestJS + React
- **Hébergement**: OVH VPS

---

**Made with ❤️ in France** 🇫🇷
