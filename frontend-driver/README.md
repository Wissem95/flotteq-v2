# FlotteQ Frontend Tenant

Interface client pour les tenants de FlotteQ.

## Stack

- Vite + React 18 + TypeScript
- React Router v6
- TanStack Query (React Query)
- Tailwind CSS
- Axios
- Vitest + React Testing Library (tests)

## Installation

```bash
npm install
```

## Configuration

Créer `.env` :

```env
VITE_API_URL=http://localhost:3000/api
```

## Développement

```bash
npm run dev  # Port 5174
```

Le serveur de développement démarre sur http://localhost:5174

## Build

```bash
npm run build
npm run preview
```

## Tests

### Lancer les tests

```bash
npm test              # Mode watch
npm run test:ui       # Interface UI (nécessite @vitest/ui)
npm run test:coverage # Avec coverage
```

### Structure des tests

```
src/
├── config/
│   └── api.test.ts           # Tests API client + interceptors
├── layouts/
│   └── TenantLayout.test.tsx # Tests layout + navigation
├── pages/
│   ├── auth/
│   │   └── LoginPage.test.tsx
│   └── DashboardPage.test.tsx
├── test/
│   └── setup.ts              # Configuration Vitest
└── App.test.tsx              # Tests routing
```

### Coverage actuel

- **TenantLayout**: 6/6 tests ✓
- **API Client**: 7/7 tests ✓
- **App Routing**: 4/4 tests ✓
- **LoginPage**: 2/2 tests ✓
- **DashboardPage**: 3/3 tests ✓

**Total: 22/22 tests passent** ✅

## Structure

```
src/
├── config/       # Configuration (API client)
├── layouts/      # Layouts (TenantLayout)
├── pages/        # Pages (routes)
│   └── auth/     # Pages d'authentification
├── test/         # Configuration tests
├── types/        # Types TypeScript
└── App.tsx       # Application principale
```

## Routes

- `/login` - Page de connexion (placeholder)
- `/dashboard` - Tableau de bord tenant (placeholder)
- `/vehicles` - Gestion des véhicules (à venir)
- `/drivers` - Gestion des conducteurs (à venir)
- `/maintenances` - Gestion des maintenances (à venir)

## API Client

Le client API (`src/config/api.ts`) inclut :
- Intercepteurs JWT automatiques
- Gestion du refresh token
- Header X-Tenant-ID automatique
- Redirection vers login en cas d'échec d'authentification

## Prochaines étapes

- FT1-002 : Implémentation de l'authentification
- FT1-003 : Dashboard tenant avec statistiques
- FT1-004 : Gestion des véhicules
