# Frontend Partner - FlotteQ

Application web pour les partenaires (garages, prestataires de services) de la plateforme FlotteQ.

## 🚀 Démarrage rapide

```bash
# Installer les dépendances
npm install

# Lancer en mode développement (port 5175)
npm run dev

# Build pour production
npm run build
```

## 📁 Structure du projet

```
frontend-partner/
├── src/
│   ├── components/       # Composants réutilisables
│   │   ├── common/      # Composants communs (Pagination)
│   │   └── ProtectedRoute.tsx
│   ├── config/          # Configuration API
│   ├── layouts/         # Layouts (Auth, Partner)
│   ├── lib/             # Utilitaires (axios)
│   ├── pages/           # Pages de l'application
│   │   ├── LoginPage.tsx
│   │   ├── RegisterPage.tsx
│   │   ├── DashboardPage.tsx
│   │   ├── BookingsPage.tsx
│   │   ├── PlanningPage.tsx
│   │   ├── FinancePage.tsx
│   │   └── SettingsPage.tsx
│   ├── stores/          # Zustand stores
│   ├── types/           # Types TypeScript
│   └── utils/           # Fonctions utilitaires
├── tailwind.config.ts   # Configuration Tailwind (thème bleu)
├── vite.config.ts       # Configuration Vite (port 5175)
└── package.json
```

## 🔌 Endpoints API

### Authentification
- `POST /partners` - Inscription partenaire
- `POST /partners/auth/login` - Connexion
- `GET /partners/auth/profile` - Profil utilisateur

### Gestion partenaire
- `PATCH /partners/me` - Mise à jour profil
- `GET /partners/me/services` - Liste services
- `POST /partners/me/services` - Ajouter service
- `PATCH /partners/services/:id` - Modifier service
- `DELETE /partners/services/:id` - Supprimer service

### Réservations
- `GET /api/bookings` - Liste réservations
- `GET /api/bookings/upcoming` - Prochaines 7 jours
- `PATCH /api/bookings/:id/confirm` - Confirmer réservation

### Disponibilités
- `GET /api/availabilities` - Liste disponibilités
- `POST /api/availabilities` - Créer disponibilité

### Commissions
- `GET /api/commissions` - Liste commissions
- `GET /api/commissions/stats` - Statistiques

## 🎨 Thème

Le frontend-partner utilise un **thème bleu** (`primary-500: #3b82f6`) pour se différencier du frontend-client (navy/teal).

## 🔐 Authentification

L'authentification utilise:
- JWT tokens stockés dans `localStorage`
- Zustand pour la gestion d'état
- Axios interceptors pour l'ajout automatique du token
- Redirection automatique vers `/login` en cas de 401

## 🛠️ Technologies

- **React 19** + **TypeScript**
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **React Router DOM** - Routing
- **Zustand** - State management
- **Axios** - HTTP client
- **Lucide React** - Icons
- **React Big Calendar** - Calendrier (à implémenter)
- **Recharts** - Graphiques (à implémenter)

## 📝 Todo

- [ ] Implémenter react-big-calendar pour le planning
- [ ] Implémenter recharts pour les graphiques financiers
- [ ] Ajouter gestion complète des services
- [ ] Ajouter filtres/recherche sur les réservations
- [ ] Ajouter notifications temps réel (WebSocket)
- [ ] Tests E2E avec Playwright

## 🌐 Ports

- **Frontend Partner**: http://localhost:5175
- **Frontend Client**: http://localhost:5174
- **Backend API**: http://localhost:3000
