# FlotteQ Frontend Internal - Admin Dashboard

Frontend moderne pour l'administration de FlotteQ v2.0 (Architecture Multi-Tenant)

## 🚀 Technologies

- **React 18** - Framework UI
- **TypeScript** - Type safety
- **Vite** - Build tool & dev server
- **TailwindCSS** - Styling
- **Shadcn UI** - Component library
- **React Router v6** - Routing
- **React Query (TanStack Query)** - Data fetching & caching
- **Zustand** - State management
- **Axios** - HTTP client
- **React Hook Form** - Forms
- **Zod** - Schema validation

## 📁 Structure du projet

```
frontend-internal/
├── src/
│   ├── api/               # API client & endpoints
│   │   ├── client.ts      # Axios instance
│   │   ├── endpoints/     # API endpoints
│   │   └── types/         # TypeScript types
│   ├── components/
│   │   ├── ui/            # Shadcn UI components
│   │   ├── auth/          # Auth components (ProtectedRoute)
│   │   └── layout/        # Layout components
│   ├── pages/             # Pages
│   │   ├── auth/          # Login, etc.
│   │   ├── dashboard/     # Dashboard
│   │   ├── tenants/       # Gestion tenants
│   │   └── users/         # Gestion utilisateurs
│   ├── hooks/             # Custom hooks
│   ├── store/             # Zustand stores
│   ├── lib/               # Utilities
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── public/
├── .env
├── vite.config.ts
├── tailwind.config.ts
└── tsconfig.json
```

## 🔧 Installation

```bash
# Installer les dépendances
npm install

# Lancer le dev server
npm run dev

# Build de production
npm run build

# Prévisualiser le build
npm run preview
```

## 🌐 Configuration

### Variables d'environnement (.env)

```env
VITE_API_URL=http://localhost:3000
```

### Ports

- **Frontend Internal**: http://localhost:3001
- **Backend API**: http://localhost:3000

## 🔐 Authentification

Le système d'authentification utilise :
- JWT tokens stockés dans localStorage
- Intercepteurs Axios pour gérer les tokens
- React Query pour la gestion de l'état auth
- Zustand pour le state global
- ProtectedRoute pour protéger les routes

### Connexion de test

```
Email: admin@flotteq.com
Mot de passe: (voir backend/seeders)
```

## 📦 Composants UI

Les composants UI proviennent de **Shadcn UI** et sont copiés depuis l'ancien frontend.

Pour ajouter un nouveau composant Shadcn :

```bash
npx shadcn-ui@latest add button
```

## 🛣️ Routing

Routes principales :
- `/login` - Page de connexion
- `/dashboard` - Dashboard principal (protégé)
- `/` - Redirige vers /dashboard

## 🔄 Data Fetching

Utilisation de React Query pour toutes les requêtes API :

```typescript
// Example hook
export const useTenants = () => {
  return useQuery({
    queryKey: ['tenants'],
    queryFn: () => tenantsApi.getAll(),
  });
};
```

## 🏗️ Prochaines étapes

- [ ] Page Tenants (liste, création, édition)
- [ ] Page Users (liste, création, édition, gestion des rôles)
- [ ] Page Vehicles (liste depuis tous les tenants)
- [ ] Page Drivers (liste depuis tous les tenants)
- [ ] Dashboard avec statistiques globales
- [ ] Page Subscriptions (gestion Stripe)
- [ ] Page Support (tickets, alertes)
- [ ] Page Analytics (métriques, rapports)

## 📝 Conventions de code

- **Composants** : PascalCase (ex: `DashboardPage.tsx`)
- **Hooks** : camelCase avec préfixe "use" (ex: `useAuth.ts`)
- **Types** : PascalCase (ex: `User`, `LoginDto`)
- **API endpoints** : camelCase (ex: `authApi.login()`)
- **Fichiers CSS** : kebab-case

## 🐛 Debugging

Le dev server Vite affiche les erreurs en temps réel dans le navigateur.

Pour déboguer les requêtes API :
- Ouvrir DevTools > Network
- Filtrer par "Fetch/XHR"
- Les tokens JWT sont visibles dans les headers

## 🔗 Liens utiles

- [Documentation Vite](https://vitejs.dev/)
- [Documentation React Query](https://tanstack.com/query/latest)
- [Documentation Shadcn UI](https://ui.shadcn.com/)
- [Documentation Zustand](https://docs.pmnd.rs/zustand/getting-started/introduction)
- [Backend FlotteQ API](../backend/README.md)

## 📄 Licence

FlotteQ v2.0 - Propriétaire
