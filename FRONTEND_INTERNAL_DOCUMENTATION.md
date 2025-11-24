# Documentation Complète - Frontend Internal FlotteQ

## 📋 Table des matières
1. [Vue d'ensemble](#vue-densemble)
2. [Configuration du projet](#configuration-du-projet)
3. [Architecture](#architecture)
4. [Composants Layout](#composants-layout)
5. [Composants UI (Shadcn)](#composants-ui-shadcn)
6. [Pages et Routes](#pages-et-routes)
7. [Services et API](#services-et-api)
8. [Styles et Design System](#styles-et-design-system)
9. [Patterns de code](#patterns-de-code)
10. [Tickets de reproduction](#tickets-de-reproduction)

---

## 🎯 Vue d'ensemble

**Type**: Interface d'administration interne FlotteQ
**Framework**: React 18 + TypeScript + Vite
**UI Library**: Shadcn/ui (Radix UI + Tailwind CSS)
**Gestion d'état**: TanStack Query (React Query)
**Graphiques**: Recharts
**Routing**: React Router v6
**Total fichiers**: 136 composants TypeScript/JavaScript

### Technologies principales
```json
{
  "react": "^18.3.1",
  "vite": "^5.4.1",
  "typescript": "^5.5.3",
  "tailwindcss": "^3.4.11",
  "@radix-ui/*": "Composants UI primitives",
  "@tanstack/react-query": "^5.56.2",
  "react-router-dom": "^6.26.2",
  "recharts": "^2.12.7",
  "axios": "^1.6.8",
  "lucide-react": "^0.462.0"
}
```

---

## ⚙️ Configuration du projet

### 1. Vite Configuration ([vite.config.ts](frontend-internal/vite.config.ts))

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 8080,
    host: true,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false
      }
    },
    hmr: {
      overlay: false,
      clientPort: 8080
    }
  },
  define: {
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development')
  }
})
```

**Points clés**:
- Port: `8080`
- Proxy API: `/api` → `http://localhost:8000`
- Alias: `@` pointe vers `./src`
- Plugin: React SWC pour compilation rapide

### 2. Tailwind Configuration ([tailwind.config.ts](frontend-internal/tailwind.config.ts))

```typescript
export default {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: { '2xl': '1400px' }
    },
    extend: {
      colors: {
        // Couleurs FlotteQ personnalisées
        flotteq: {
          navy: '#1a3a6c',
          blue: '#2463b0',
          teal: '#14b8a6',
          turquoise: '#0ea5e9',
          light: '#f0f9ff',
        },
        // Couleurs Shadcn (variables CSS)
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))'
        },
        // ... (autres couleurs système)
        sidebar: {
          DEFAULT: 'hsl(var(--sidebar-background))',
          foreground: 'hsl(var(--sidebar-foreground))',
          primary: 'hsl(var(--sidebar-primary))',
          'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
          accent: 'hsl(var(--sidebar-accent))',
          'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
          border: 'hsl(var(--sidebar-border))',
          ring: 'hsl(var(--sidebar-ring))'
        }
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)'
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' }
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' }
        },
        'pulse-light': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' }
        }
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'pulse-light': 'pulse-light 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
      },
      fontFamily: {
        'inter': ['Inter', 'sans-serif'],
      }
    }
  },
  plugins: [require("tailwindcss-animate")],
}
```

### 3. Styles Globaux ([src/index.css](frontend-internal/src/index.css))

```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 210 50% 98%;
    --foreground: 222 47% 11%;
    --card: 0 0% 100%;
    --card-foreground: 222 47% 11%;
    --popover: 0 0% 100%;
    --popover-foreground: 222 47% 11%;
    --primary: 211 100% 40%;
    --primary-foreground: 210 40% 98%;
    --secondary: 210 20% 96%;
    --secondary-foreground: 222 47% 11%;
    --muted: 210 20% 96%;
    --muted-foreground: 215 16% 47%;
    --accent: 196 94% 37%;
    --accent-foreground: 210 40% 98%;
    --destructive: 0 84% 60%;
    --destructive-foreground: 210 40% 98%;
    --border: 214 32% 91%;
    --input: 214 32% 91%;
    --ring: 222 47% 11%;
    --radius: 0.75rem;

    /* Sidebar custom colors */
    --sidebar-background: 210 38% 15%;
    --sidebar-foreground: 210 20% 98%;
    --sidebar-primary: 196 94% 37%;
    --sidebar-primary-foreground: 0 0% 100%;
    --sidebar-accent: 211 100% 20%;
    --sidebar-accent-foreground: 0 0% 100%;
    --sidebar-border: 211 30% 25%;
    --sidebar-ring: 196 94% 43%;
  }

  * {
    @apply border-border;
  }

  body {
    @apply bg-background text-foreground font-inter;
  }

  /* Classes utilitaires FlotteQ */
  .flotteq-gradient {
    @apply bg-gradient-to-r from-flotteq-navy via-flotteq-blue to-flotteq-teal;
  }

  .flotteq-gradient-text {
    @apply flotteq-gradient bg-clip-text text-transparent;
  }

  .flotteq-card {
    @apply bg-white rounded-lg shadow-sm border border-slate-100 p-5 transition-all hover:shadow-md;
  }

  .flotteq-card-highlight {
    @apply flotteq-card border-l-4 border-l-flotteq-teal;
  }

  .flotteq-button {
    @apply rounded-md px-4 py-2 font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-flotteq-teal focus:ring-opacity-50;
  }

  .flotteq-button-primary {
    @apply flotteq-button bg-flotteq-blue text-white hover:bg-flotteq-navy;
  }

  .flotteq-button-secondary {
    @apply flotteq-button bg-slate-100 text-slate-700 hover:bg-slate-200;
  }

  .flotteq-input {
    @apply w-full rounded-md border border-slate-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-flotteq-teal focus:border-transparent;
  }
}
```

---

## 🏗️ Architecture

### Structure des dossiers

```
frontend-internal/
├── src/
│   ├── components/
│   │   ├── layout/                  # Composants de mise en page
│   │   │   ├── InternalLayout.tsx   # Layout principal
│   │   │   ├── InternalSidebar.tsx  # Sidebar navigation
│   │   │   └── InternalTopNav.tsx   # Barre supérieure
│   │   ├── ui/                      # Composants Shadcn UI (42 composants)
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── table.tsx
│   │   │   ├── dialog.tsx
│   │   │   └── ... (39 autres)
│   │   ├── modals/                  # Modals métier
│   │   │   ├── AlertsModal.tsx
│   │   │   ├── TenantModal.tsx
│   │   │   └── TicketModal.tsx
│   │   ├── subscriptions/           # Composants abonnements
│   │   ├── users/                   # Composants utilisateurs
│   │   └── vehicles/                # Composants véhicules
│   ├── pages/                       # Pages de l'application
│   │   ├── admin/                   # Pages administrateur
│   │   ├── analytics/               # Pages analytics
│   │   ├── auth/                    # Pages authentification
│   │   ├── employees/               # Pages employés
│   │   ├── finance/                 # Pages finance
│   │   ├── partners/                # Pages partenaires
│   │   ├── subscriptions/           # Pages abonnements
│   │   └── ... (11 autres dossiers)
│   ├── hooks/                       # Custom hooks
│   │   ├── useAuth.ts
│   │   ├── useInternalAuth.ts
│   │   ├── useInternalUsers.ts
│   │   └── ... (7 autres)
│   ├── services/                    # Services API
│   │   ├── authService.ts
│   │   ├── internalAuthService.ts
│   │   ├── tenantsService.ts
│   │   ├── subscriptionsService.ts
│   │   └── ... (13 autres)
│   ├── lib/                         # Utilitaires
│   │   ├── api.ts                   # Configuration Axios
│   │   └── utils.ts                 # Fonctions utilitaires
│   ├── App.tsx                      # App principale
│   └── main.tsx                     # Point d'entrée
├── vite.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

## 🧩 Composants Layout

### 1. InternalLayout ([src/components/layout/InternalLayout.tsx](frontend-internal/src/components/layout/InternalLayout.tsx:1))

**Rôle**: Wrapper principal avec sidebar + topnav + contenu

```typescript
interface InternalLayoutProps {
  children: React.ReactNode;
}

const InternalLayout: React.FC<InternalLayoutProps> = ({ children }) => {
  const location = useLocation();

  const getPageTitle = () => {
    const path = location.pathname;
    // Mapping de 30+ routes vers leurs titres
    if (path.startsWith("/dashboard")) { /* ... */ }
    if (path.startsWith("/partenaires")) { /* ... */ }
    // ... etc
    return "Administration FlotteQ";
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <InternalSidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <InternalTopNav title={getPageTitle()} />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};
```

**Classes Tailwind utilisées**:
- `flex h-screen bg-gray-50 overflow-hidden`
- `flex-col flex-1 overflow-hidden`
- `overflow-y-auto p-6`
- `max-w-7xl mx-auto`

### 2. InternalSidebar ([src/components/layout/InternalSidebar.tsx](frontend-internal/src/components/layout/InternalSidebar.tsx:1))

**Rôle**: Navigation latérale collapsible avec 15 sections

**Structure**:
```typescript
const InternalSidebar: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [showDashboardMenu, setShowDashboardMenu] = useState(false);
  const [showPartnersMenu, setShowPartnersMenu] = useState(false);
  // ... 4 autres états de menus

  return (
    <div className={`h-full bg-gradient-to-b from-blue-900 to-teal-600 flex flex-col text-white transition-all duration-300 ${collapsed ? "w-20" : "w-72"}`}>
      {/* Header avec logo */}
      <div className="flex items-center justify-between p-4 border-b border-white/10">
        {/* Logo + bouton collapse */}
      </div>

      {/* Navigation */}
      <div className="flex-1 py-4 overflow-y-auto">
        <nav className="px-3 space-y-1">
          {/* Menu Dashboard (collapsible) */}
          {/* Menu Support */}
          {/* Menu Employés */}
          {/* Menu Utilisateurs Tenants */}
          {/* Menu Partenaires (collapsible) */}
          {/* Menu Abonnements (collapsible) */}
          {/* Menu Promotions */}
          {/* Menu Suivi Financier (collapsible) */}
          {/* Menu Analytics (collapsible) */}
          {/* Menu Paiement */}
          {/* Menu Parrainage */}
          {/* Menu Features Bonus */}
          {/* Menu Permissions */}
          {/* Menu Feature Flags */}
          {/* Menu Outils (collapsible) */}
          {/* Menu Paramètres */}
        </nav>
      </div>

      {/* Footer avec déconnexion */}
      <div className="p-3 border-t border-white/10">
        <Button onClick={handleLogout}>Déconnexion</Button>
      </div>
    </div>
  );
};
```

**Icônes utilisées** (lucide-react):
- `LayoutDashboard`, `MessageSquare`, `Users`, `Handshake`
- `CreditCard`, `Gift`, `TrendingUp`, `BarChart3`, `DollarSign`
- `UserPlus`, `Star`, `Shield`, `Settings`, `LogOut`, `Building2`
- `MapPin`, `Wrench`, `CheckCircle`, `AlertTriangle`, `Globe`, `Flag`

**Menus collapsibles**:
1. Tableau de bord (3 sous-menus)
2. Partenaires (4 sous-menus)
3. Abonnements (2 sous-menus)
4. Suivi Financier (3 sous-menus)
5. Analytics (3 sous-menus)
6. Outils (3 sous-menus)

**Classes clés**:
- `bg-gradient-to-b from-blue-900 to-teal-600`
- `transition-all duration-300`
- `w-72` (expanded) / `w-20` (collapsed)
- `border-white/10` (séparateurs)
- `bg-white/20` (items actifs)
- `hover:bg-white/10`

### 3. InternalTopNav ([src/components/layout/InternalTopNav.tsx](frontend-internal/src/components/layout/InternalTopNav.tsx:1))

**Rôle**: Barre supérieure avec titre, statut système, notifications et menu utilisateur

```typescript
interface InternalTopNavProps {
  title: string;
}

const InternalTopNav: React.FC<InternalTopNavProps> = ({ title }) => {
  return (
    <header className="h-16 bg-white border-b border-gray-200 shadow-sm flex items-center justify-between px-6">
      <h1 className="text-xl font-semibold text-gray-900">{title}</h1>

      <div className="flex items-center gap-4">
        {/* Indicateur de statut système */}
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span className="text-sm text-gray-600">Système opérationnel</span>
        </div>

        {/* Notifications (avec badge) */}
        <Button variant="ghost" size="icon" className="relative">
          <Bell size={20} />
          <Badge variant="destructive" className="absolute -top-1 -right-1">3</Badge>
        </Button>

        {/* Menu utilisateur (dropdown) */}
        <DropdownMenu>
          <DropdownMenuTrigger>
            <Avatar />
            <div>{adminUser.name} / {adminUser.role}</div>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {/* 6 items: Profil, Paramètres, Permissions, Monitoring, Aide, Déconnexion */}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};
```

**Classes clés**:
- `h-16 bg-white border-b border-gray-200 shadow-sm`
- `text-xl font-semibold text-gray-900`
- `w-2 h-2 bg-green-500 rounded-full` (indicateur)

---

## 🎨 Composants UI (Shadcn)

Le projet utilise **42 composants Shadcn/ui** complets. Voici les principaux :

### Button ([src/components/ui/button.tsx](frontend-internal/src/components/ui/button.tsx:1))

```typescript
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium...",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-input bg-background hover:bg-accent",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline"
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10"
      }
    },
    defaultVariants: { variant: "default", size: "default" }
  }
);
```

**Usage**:
```tsx
<Button variant="default">Enregistrer</Button>
<Button variant="outline" size="sm">Annuler</Button>
<Button variant="ghost" size="icon"><X /></Button>
```

### Card ([src/components/ui/card.tsx](frontend-internal/src/components/ui/card.tsx:1))

```typescript
const Card = ({ className, ...props }) => (
  <div className={cn("rounded-lg border bg-card text-card-foreground shadow-sm", className)} {...props} />
);

const CardHeader = ({ className, ...props }) => (
  <div className={cn("flex flex-col space-y-1.5 p-6", className)} {...props} />
);

const CardTitle = ({ className, ...props }) => (
  <h3 className={cn("text-2xl font-semibold leading-none tracking-tight", className)} {...props} />
);

const CardDescription = ({ className, ...props }) => (
  <p className={cn("text-sm text-muted-foreground", className)} {...props} />
);

const CardContent = ({ className, ...props }) => (
  <div className={cn("p-6 pt-0", className)} {...props} />
);

const CardFooter = ({ className, ...props }) => (
  <div className={cn("flex items-center p-6 pt-0", className)} {...props} />
);
```

**Usage**:
```tsx
<Card>
  <CardHeader>
    <CardTitle>Titre</CardTitle>
    <CardDescription>Description</CardDescription>
  </CardHeader>
  <CardContent>Contenu</CardContent>
  <CardFooter>Actions</CardFooter>
</Card>
```

### Table ([src/components/ui/table.tsx](frontend-internal/src/components/ui/table.tsx:1))

```typescript
const Table = ({ className, ...props }) => (
  <div className="relative w-full overflow-auto">
    <table className={cn("w-full caption-bottom text-sm", className)} {...props} />
  </div>
);

const TableHeader = ({ className, ...props }) => (
  <thead className={cn("[&_tr]:border-b", className)} {...props} />
);

const TableHead = ({ className, ...props }) => (
  <th className={cn("h-12 px-4 text-left align-middle font-medium text-muted-foreground", className)} {...props} />
);

const TableCell = ({ className, ...props }) => (
  <td className={cn("p-4 align-middle", className)} {...props} />
);
```

**Usage**:
```tsx
<Table>
  <TableHeader>
    <TableRow>
      <TableHead>Colonne 1</TableHead>
      <TableHead>Colonne 2</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    <TableRow>
      <TableCell>Valeur 1</TableCell>
      <TableCell>Valeur 2</TableCell>
    </TableRow>
  </TableBody>
</Table>
```

### Liste complète des composants UI disponibles (42)

```
accordion, alert-dialog, alert, aspect-ratio, avatar, badge, breadcrumb,
button, calendar, card, carousel, chart, checkbox, collapsible, command,
context-menu, dialog, drawer, dropdown-menu, form, hover-card, input-otp,
input, label, menubar, navigation-menu, pagination, popover, progress,
radio-group, resizable, scroll-area, select, separator, sheet, sidebar,
skeleton, slider, sonner, switch, table, tabs, textarea, toast, toaster,
toggle-group, toggle, tooltip
```

---

## 📄 Pages et Routes

### Structure complète des routes ([src/App.tsx](frontend-internal/src/App.tsx:98))

```typescript
<Routes>
  <Route path="/login" element={<LoginPage />} />

  <Route path="/*" element={
    <ProtectedRoute>
      <InternalLayout>
        <Routes>
          {/* Redirection par défaut */}
          <Route path="/" element={<Navigate to="/dashboard/overview" replace />} />

          {/* Dashboard */}
          <Route path="/dashboard/overview" element={<DashboardOverview />} />
          <Route path="/dashboard/tenants" element={<TenantsOverview />} />
          <Route path="/dashboard/alerts" element={<SystemAlerts />} />

          {/* Users */}
          <Route path="/utilisateurs/tenants" element={<TenantUsersOverview />} />

          {/* Support */}
          <Route path="/support" element={<SupportDashboard />} />

          {/* Employés */}
          <Route path="/employes" element={<EmployeesOverview />} />

          {/* Partenaires */}
          <Route path="/partenaires/garages" element={<GaragesOverview />} />
          <Route path="/partenaires/controle-technique" element={<ControleTechniqueOverview />} />
          <Route path="/partenaires/assurances" element={<AssurancesOverview />} />
          <Route path="/partenaires/carte" element={<PartnersMap />} />

          {/* Abonnements */}
          <Route path="/abonnements" element={<SubscriptionsOverview />} />
          <Route path="/abonnements/plans" element={<PlansManagement />} />

          {/* Promotions */}
          <Route path="/promotions" element={<PromotionsOverview />} />

          {/* Finance */}
          <Route path="/finance/revenus" element={<FinanceRevenues />} />
          <Route path="/finance/commissions" element={<FinanceCommissions />} />
          <Route path="/finance/rapports" element={<FinanceReports />} />

          {/* Analytics */}
          <Route path="/analytics/usage" element={<AnalyticsDashboard />} />
          <Route path="/analytics/performance" element={<AnalyticsDashboard />} />
          <Route path="/analytics/comportement" element={<AnalyticsDashboard />} />

          {/* Autres sections */}
          <Route path="/paiements" element={<PaymentMethods />} />
          <Route path="/parrainage" element={<ReferralProgram />} />
          <Route path="/features-bonus" element={<FeaturesBonus />} />
          <Route path="/permissions" element={<RolesPermissions />} />
          <Route path="/flags" element={<FeatureFlags />} />

          {/* Outils */}
          <Route path="/outils/api" element={<APIIntegrations />} />
          <Route path="/outils/monitoring" element={<SystemMonitoring />} />
          <Route path="/outils/logs" element={<SystemMonitoring />} />

          {/* Paramètres */}
          <Route path="/parametres" element={<GlobalSettings />} />
          <Route path="/profile" element={<ProfilePage />} />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </InternalLayout>
    </ProtectedRoute>
  } />
</Routes>
```

### Exemple de page : DashboardOverview

**Structure type d'une page complexe** ([src/pages/admin/DashboardOverview.tsx](frontend-internal/src/pages/admin/DashboardOverview.tsx:1)):

```typescript
const DashboardOverview: React.FC = () => {
  // États
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [chartData, setChartData] = useState<ChartData | null>(null);
  const [loading, setLoading] = useState(true);

  // Chargement des données
  const loadDashboardData = async () => {
    const [stats, revenue, partners, health] = await Promise.all([
      api.get('/internal/dashboard/stats'),
      api.get('/internal/dashboard/revenue'),
      api.get('/internal/dashboard/partners-distribution'),
      api.get('/internal/dashboard/system-health')
    ]);
    // Traitement...
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header avec titre et badge statut */}
      <div className="flex items-center justify-between">
        <h1>Vue d'ensemble</h1>
        <Badge>Système opérationnel</Badge>
      </div>

      {/* Métriques principales (4 cards) */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard title="Tenants" value={metrics.tenants.total} icon={Building2} />
        <MetricCard title="Revenus" value={`${metrics.revenue.monthly}€`} icon={DollarSign} />
        <MetricCard title="Partenaires" value={metrics.partners.total} icon={Users} />
        <MetricCard title="Utilisateurs" value={metrics.users.total} icon={Activity} />
      </div>

      {/* Graphiques (2 colonnes) */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Évolution des revenus</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData.monthly_trends}>
                <Line dataKey="revenue" stroke="#3b82f6" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Répartition des partenaires</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={chartData.partners_distribution} dataKey="value" />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      <div className="flex gap-4">
        <Button onClick={handleGenerateReport}>Voir le rapport complet</Button>
        <Button onClick={handleCheckAlerts}>Vérifier les alertes</Button>
      </div>
    </div>
  );
};
```

---

## 🔌 Services et API

### Configuration API ([src/lib/api.ts](frontend-internal/src/lib/api.ts:1))

```typescript
import axios from "axios";

const InternalAPI = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  withCredentials: false,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  },
});

// Intercepteur pour ajouter le token
InternalAPI.interceptors.request.use(async (config) => {
  const token = localStorage.getItem("internal_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  config.headers['X-Internal-Request'] = 'true';
  config.headers['X-Admin-Panel'] = 'true';
  return config;
});

// Intercepteur pour gérer les erreurs 401
InternalAPI.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("internal_token");
      localStorage.removeItem("internal_user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default InternalAPI;
export { InternalAPI as api };
```

### Services disponibles

```
services/
├── alertsService.ts              # Gestion des alertes système
├── analyticsService.ts           # Analytics et métriques
├── authService.ts                # Authentification tenant
├── employeesService.ts           # Gestion des employés FlotteQ
├── featureFlagsService.ts        # Feature flags
├── internalAuthService.ts        # Authentification admin
├── maintenanceService.ts         # Maintenances
├── partnersService.ts            # Partenaires (garages, CT, assurances)
├── paymentMethodsService.ts      # Moyens de paiement
├── permissionsService.ts         # Permissions et rôles
├── promotionsService.ts          # Promotions
├── reportService.ts              # Génération de rapports PDF
├── subscriptionsService.ts       # Abonnements et plans
├── supportService.ts             # Support/tickets
├── tenantService.ts              # Tenant unique
├── tenantUsersService.ts         # Utilisateurs d'un tenant
├── tenantsService.ts             # Liste de tous les tenants
└── vehicleService.ts             # Véhicules
```

### Pattern de service type

```typescript
// Exemple: subscriptionsService.ts
import { api } from '@/lib/api';

export const subscriptionsService = {
  // Liste
  getAllSubscriptions: async () => {
    const response = await api.get('/internal/subscriptions');
    return response.data;
  },

  // Création
  createSubscription: async (data: CreateSubscriptionDto) => {
    const response = await api.post('/internal/subscriptions', data);
    return response.data;
  },

  // Modification
  updateSubscription: async (id: number, data: UpdateSubscriptionDto) => {
    const response = await api.put(`/internal/subscriptions/${id}`, data);
    return response.data;
  },

  // Suppression
  deleteSubscription: async (id: number) => {
    const response = await api.delete(`/internal/subscriptions/${id}`);
    return response.data;
  },

  // Statistiques
  getSubscriptionStats: async () => {
    const response = await api.get('/internal/subscriptions/stats');
    return response.data;
  },
};
```

---

## 🎨 Styles et Design System

### Palette de couleurs utilisée (Tailwind)

**Couleurs les plus utilisées dans le projet**:
```css
/* Backgrounds */
bg-gray-200      (56 occurrences)
bg-green-100     (19)
bg-blue-100      (15)
bg-gray-100      (10)
bg-slate-50      (8)
bg-red-100       (7)
bg-blue-600      (7)
bg-orange-100    (6)
bg-green-600     (6)
bg-yellow-100    (4)
bg-blue-50       (3)
bg-purple-100    (2)

/* Text colors */
text-gray-600    (très fréquent)
text-gray-900    (titres)
text-white       (sidebar)
text-green-600   (positif)
text-red-600     (négatif)
text-blue-600    (liens)

/* Border colors */
border-gray-200
border-white/10  (sidebar)
border-slate-100
```

### Classes utilitaires personnalisées

**Définies dans index.css**:
```css
.flotteq-gradient           /* bg-gradient-to-r from-navy via-blue to-teal */
.flotteq-gradient-text      /* Texte avec gradient */
.flotteq-card               /* Card avec style FlotteQ */
.flotteq-card-highlight     /* Card avec bordure gauche teal */
.flotteq-button             /* Bouton de base */
.flotteq-button-primary     /* Bouton primaire FlotteQ */
.flotteq-button-secondary   /* Bouton secondaire FlotteQ */
.flotteq-input              /* Input avec style FlotteQ */
```

### Variables CSS principales

```css
:root {
  /* Layout */
  --radius: 0.75rem;

  /* Colors (HSL) */
  --background: 210 50% 98%;        /* Fond principal */
  --foreground: 222 47% 11%;        /* Texte principal */
  --primary: 211 100% 40%;          /* Bleu primaire */
  --accent: 196 94% 37%;            /* Teal accent */
  --destructive: 0 84% 60%;         /* Rouge erreur */
  --muted: 210 20% 96%;             /* Gris clair */

  /* Sidebar */
  --sidebar-background: 210 38% 15%;  /* Bleu foncé */
  --sidebar-primary: 196 94% 37%;     /* Teal */
  --sidebar-accent: 211 100% 20%;     /* Bleu plus foncé */
}
```

### Animations disponibles

```css
@keyframes accordion-down { /* Expansion Radix Accordion */ }
@keyframes accordion-up { /* Collapse Radix Accordion */ }
@keyframes pulse-light { /* Pulse doux */ }

/* Classes d'animation */
.animate-accordion-down
.animate-accordion-up
.animate-pulse-light
.animate-pulse         /* Tailwind standard */
.animate-spin          /* Tailwind standard */
```

---

## 🔧 Patterns de code

### 1. Pattern : Chargement de données avec états

```typescript
const MyPage: React.FC = () => {
  const [data, setData] = useState<DataType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/endpoint');
      setData(response.data);
    } catch (error: any) {
      setError(error.message);
      toast({
        title: "Erreur",
        description: "Impossible de charger les données",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading) return <LoadingSkeleton />;
  if (error) return <ErrorDisplay error={error} onRetry={loadData} />;
  if (!data) return null;

  return <DataDisplay data={data} />;
};
```

### 2. Pattern : Table avec pagination

```typescript
const TablePage: React.FC = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [total, setTotal] = useState(0);

  const loadItems = async () => {
    const response = await api.get(`/items?page=${page}&limit=${pageSize}`);
    setItems(response.data.items);
    setTotal(response.data.total);
  };

  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Colonne 1</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map(item => (
            <TableRow key={item.id}>
              <TableCell>{item.name}</TableCell>
              <TableCell>
                <Button variant="ghost" size="icon">
                  <Edit className="w-4 h-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Pagination>
        <PaginationPrevious onClick={() => setPage(p => Math.max(1, p - 1))} />
        <PaginationNext onClick={() => setPage(p => p + 1)} />
      </Pagination>
    </div>
  );
};
```

### 3. Pattern : Modal avec formulaire

```typescript
const CreateModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState<FormType>({});
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/endpoint', formData);
      toast({ title: "Succès", description: "Élément créé" });
      onClose();
    } catch (error) {
      toast({ title: "Erreur", description: "Échec de la création", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Créer un élément</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Nom</Label>
            <Input
              value={formData.name || ''}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Enregistrement...' : 'Enregistrer'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
```

### 4. Pattern : Graphique Recharts

```typescript
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const ChartCard: React.FC = () => {
  const [data, setData] = useState([]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Titre du graphique</CardTitle>
        <CardDescription>Description</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip
              formatter={(value, name) => [
                `${value.toLocaleString()} €`,
                name
              ]}
            />
            <Line
              type="monotone"
              dataKey="revenue"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={{ fill: '#3b82f6' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
```

### 5. Pattern : Authentification protégée

```typescript
// Hook useInternalAuth
export const useInternalAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('internal_token');
    setIsAuthenticated(!!token);
    setIsLoading(false);
  }, []);

  return { isAuthenticated, isLoading };
};

// ProtectedRoute component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useInternalAuth();

  if (isLoading) return <LoadingScreen />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  return <>{children}</>;
};
```

---

## 📦 Tickets de reproduction

### TICKET-001: Setup & Configuration Projet
```
Priorité: CRITIQUE
Dépendances: Aucune

[ ] 1. Initialiser projet Vite + React + TypeScript
    npm create vite@latest frontend-internal -- --template react-ts

[ ] 2. Installer toutes les dépendances exactes
    npm install react@^18.3.1 react-dom@^18.3.1 react-router-dom@^6.26.2
    npm install @tanstack/react-query@^5.56.2
    npm install axios@^1.6.8 date-fns@^3.6.0 lucide-react@^0.462.0
    npm install recharts@^2.12.7 react-hot-toast@^2.4.0
    npm install react-hook-form@^7.53.0 zod@^3.23.8 @hookform/resolvers@^3.9.0
    npm install class-variance-authority@^0.7.1 clsx@^2.1.1 tailwind-merge@^2.5.2

[ ] 3. Installer toutes les dépendances Radix UI (42 packages)
    npm install @radix-ui/react-accordion@^1.2.0
    npm install @radix-ui/react-alert-dialog@^1.1.1
    # ... (voir package.json complet)

[ ] 4. Installer Tailwind + plugins
    npm install -D tailwindcss@^3.4.11 postcss@^8.4.47 autoprefixer@^10.4.20
    npm install -D @tailwindcss/typography@^0.5.15
    npm install tailwindcss-animate@^1.0.7

[ ] 5. Copier configuration exacte
    - vite.config.ts (proxy /api vers localhost:8000)
    - tailwind.config.ts (couleurs FlotteQ + sidebar)
    - tsconfig.json (paths alias @)
    - postcss.config.js

[ ] 6. Copier index.css complet
    - Variables CSS :root
    - Classes .flotteq-*
    - Import font Inter

[ ] 7. Tester le démarrage
    npm run dev
    → Doit afficher sur http://localhost:8080

Validation:
✓ npm run dev fonctionne
✓ Aucun warning de dépendances manquantes
✓ Hot reload fonctionne
```

### TICKET-002: Structure des dossiers et lib/utils
```
Priorité: CRITIQUE
Dépendances: TICKET-001

[ ] 1. Créer l'arborescence src/
    mkdir -p src/{components/{layout,ui,modals,subscriptions,users,vehicles},pages/{admin,analytics,auth,employees,finance,partners,subscriptions,support,tenants,users,flags,features,payments,permissions,profile,promotions,referral,settings,tools,alerts},hooks,services,lib,styles}

[ ] 2. Copier src/lib/utils.ts
    import { type ClassValue, clsx } from "clsx"
    import { twMerge } from "tailwind-merge"
    export function cn(...inputs: ClassValue[]) {
      return twMerge(clsx(inputs))
    }

[ ] 3. Créer src/lib/api.ts
    - Configuration Axios avec baseURL /api
    - Intercepteur pour ajouter Bearer token
    - Intercepteur 401 → redirect /login
    - Headers X-Internal-Request et X-Admin-Panel

[ ] 4. Créer src/hooks/use-toast.ts
    - Hook toast personnalisé (ou utiliser celui de Shadcn)

Validation:
✓ Structure de dossiers complète
✓ Import @/lib/utils fonctionne
✓ Import @/lib/api fonctionne
```

### TICKET-003: Composants UI Shadcn (42 composants)
```
Priorité: HAUTE
Dépendances: TICKET-002

Option A: Utiliser npx shadcn@latest init + add
[ ] 1. Initialiser Shadcn
    npx shadcn@latest init
    → Répondre: TypeScript, style "default", color "blue", @/ pour alias

[ ] 2. Ajouter tous les composants (batch)
    npx shadcn@latest add accordion alert-dialog alert aspect-ratio avatar badge breadcrumb button calendar card carousel chart checkbox collapsible command context-menu dialog drawer dropdown-menu form hover-card input-otp input label menubar navigation-menu pagination popover progress radio-group resizable scroll-area select separator sheet sidebar skeleton slider sonner switch table tabs textarea toast toaster toggle-group toggle tooltip

Option B: Copier manuellement depuis frontend-internal/src/components/ui/
[ ] 1. Copier tous les fichiers .tsx depuis ui/
[ ] 2. Vérifier les imports relatifs

Validation:
✓ Tous les composants dans src/components/ui/
✓ Import { Button } from '@/components/ui/button' fonctionne
✓ Page test affiche tous les composants correctement
```

### TICKET-004: Layout Principal (InternalLayout + Sidebar + TopNav)
```
Priorité: HAUTE
Dépendances: TICKET-003

[ ] 1. Créer InternalLayout.tsx
    - Structure: flex h-screen avec Sidebar + (TopNav + main)
    - Fonction getPageTitle() avec 30+ routes
    - Wrapper children dans max-w-7xl mx-auto

[ ] 2. Créer InternalSidebar.tsx
    - État collapsed (toggle width w-20/w-72)
    - 6 menus collapsibles (Dashboard, Partners, Subscriptions, Finance, Analytics, Outils)
    - 15 liens directs
    - Gradient bg-gradient-to-b from-blue-900 to-teal-600
    - Icônes lucide-react (Building2, LayoutDashboard, Users, etc.)
    - Header avec logo FlotteQ + bouton collapse
    - Footer avec bouton déconnexion
    - Classes actives: bg-white/20

[ ] 3. Créer InternalTopNav.tsx
    - Header h-16 bg-white border-b
    - Titre dynamique (props)
    - Indicateur statut système (point vert + texte)
    - Bouton notifications avec Badge (nombre)
    - Dropdown utilisateur avec Avatar
    - 6 items menu: Profil, Paramètres, Permissions, Monitoring, Aide, Déconnexion

[ ] 4. Tester avec page vide
    <InternalLayout>
      <div>Test Content</div>
    </InternalLayout>

Validation:
✓ Sidebar collapsible fonctionne
✓ Tous les liens de navigation affichés
✓ TopNav affiche le bon titre selon la route
✓ Responsive (sidebar collapse sur mobile)
✓ Dégradé bleu-teal visible
```

### TICKET-005: Authentification et Protection des Routes
```
Priorité: HAUTE
Dépendances: TICKET-004

[ ] 1. Créer src/hooks/useInternalAuth.ts
    - Hook qui vérifie localStorage.internal_token
    - Retourne { isAuthenticated, isLoading }

[ ] 2. Créer src/services/internalAuthService.ts
    - login(email, password) → POST /api/internal/auth/login
    - logout() → supprime token + redirect
    - validateToken() → GET /api/internal/auth/me

[ ] 3. Créer src/pages/auth/LoginPage.tsx
    - Formulaire email/password
    - Logo FlotteQ
    - Gradient background
    - Bouton "Se connecter"
    - Redirection vers /dashboard/overview après succès

[ ] 4. Créer composant ProtectedRoute dans App.tsx
    - useInternalAuth() pour checker auth
    - Si loading: afficher spinner
    - Si non auth: <Navigate to="/login" />
    - Sinon: render children

[ ] 5. Wrapper toutes les routes dans ProtectedRoute

Validation:
✓ /login accessible sans auth
✓ Toutes les autres routes redirigent vers /login si non auth
✓ Après login, redirection vers dashboard
✓ Token stocké dans localStorage
✓ Déconnexion fonctionne
```

### TICKET-006: Page Dashboard Overview (Page complexe de référence)
```
Priorité: HAUTE
Dépendances: TICKET-005

[ ] 1. Créer DashboardOverview.tsx
    - 4 métriques cards (Tenants, Revenus, Partenaires, Utilisateurs)
    - 2 graphiques (LineChart revenus + PieChart partenaires)
    - Card état système (disponibilité, temps réponse)
    - 2 boutons actions (Rapport, Alertes)
    - États: metrics, chartData, loading, error
    - Appels API: Promise.all de 4 endpoints
    - Skeleton loading pendant chargement
    - Error state avec bouton retry

[ ] 2. Créer composant MetricCard réutilisable
    - Props: title, value, subtitle, icon, trend, color
    - Affiche icône colorée
    - Affiche valeur en grand
    - Affiche trend avec flèche + pourcentage

[ ] 3. Intégrer Recharts
    - ResponsiveContainer pour responsive
    - LineChart avec CartesianGrid, XAxis, YAxis, Tooltip
    - PieChart avec labels personnalisés
    - Couleurs: #3b82f6 (bleu), #10b981 (vert)

[ ] 4. Créer AlertsModal.tsx
    - Dialog Shadcn
    - Liste des alertes système
    - Bouton actualiser

[ ] 5. Créer endpoints API mockés (ou connecter au backend)
    - GET /internal/dashboard/stats
    - GET /internal/dashboard/revenue
    - GET /internal/dashboard/partners-distribution
    - GET /internal/dashboard/system-health

Validation:
✓ 4 cards métriques affichées
✓ 2 graphiques rendus correctement
✓ Loading skeleton pendant chargement
✓ Error state si échec API
✓ Boutons actions fonctionnels
✓ Modal alertes s'ouvre
```

### TICKET-007: Services API (17 services)
```
Priorité: MOYENNE
Dépendances: TICKET-002

[ ] 1. Créer la structure de base pour chaque service
    Pattern:
    export const xxxService = {
      getAll: async () => api.get('/internal/xxx'),
      getById: async (id) => api.get(`/internal/xxx/${id}`),
      create: async (data) => api.post('/internal/xxx', data),
      update: async (id, data) => api.put(`/internal/xxx/${id}`, data),
      delete: async (id) => api.delete(`/internal/xxx/${id}`),
      getStats: async () => api.get('/internal/xxx/stats'),
    }

[ ] 2. Créer ces services (copier depuis frontend-internal/src/services/):
    - alertsService.ts
    - analyticsService.ts
    - employeesService.ts
    - featureFlagsService.ts
    - maintenanceService.ts
    - partnersService.ts
    - paymentMethodsService.ts
    - permissionsService.ts
    - promotionsService.ts
    - reportService.ts (génération PDF)
    - subscriptionsService.ts
    - supportService.ts
    - tenantService.ts
    - tenantUsersService.ts
    - tenantsService.ts
    - vehicleService.ts

Validation:
✓ Tous les services exportés
✓ Imports fonctionnent: import { tenantsService } from '@/services/tenantsService'
✓ Appels API retournent des promesses
```

### TICKET-008: Pages principales (30+ pages)
```
Priorité: MOYENNE-BASSE
Dépendances: TICKET-006, TICKET-007

Créer toutes les pages dans src/pages/:

[ ] Dashboard (3 pages)
    - DashboardOverview.tsx (FAIT dans TICKET-006)
    - TenantsOverview.tsx
    - SystemAlerts.tsx

[ ] Support (1 page)
    - SupportDashboard.tsx

[ ] Employés (1 page)
    - EmployeesOverview.tsx

[ ] Utilisateurs (1 page)
    - TenantUsersOverview.tsx

[ ] Partenaires (4 pages)
    - GaragesOverview.tsx
    - ControleTechniqueOverview.tsx
    - AssurancesOverview.tsx
    - PartnersMap.tsx (carte interactive)

[ ] Abonnements (2 pages)
    - SubscriptionsOverview.tsx
    - PlansManagement.tsx

[ ] Promotions (1 page)
    - PromotionsOverview.tsx

[ ] Finance (3 pages)
    - FinanceRevenues.tsx
    - FinanceCommissions.tsx
    - FinanceReports.tsx

[ ] Analytics (1 page, 3 routes)
    - AnalyticsDashboard.tsx

[ ] Autres (10 pages)
    - PaymentMethods.tsx
    - ReferralProgram.tsx
    - FeaturesBonus.tsx
    - RolesPermissions.tsx
    - FeatureFlags.tsx
    - APIIntegrations.tsx
    - SystemMonitoring.tsx
    - GlobalSettings.tsx
    - ProfilePage.tsx

Pattern type pour chaque page:
```tsx
const PageName: React.FC = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const response = await xxxService.getAll();
    setData(response);
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Titre Page</h1>
        <Button>Action principale</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Sous-section</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? <Skeleton /> : <Table data={data} />}
        </CardContent>
      </Card>
    </div>
  );
};
```

Validation:
✓ Toutes les pages créées
✓ Routes dans App.tsx fonctionnent
✓ Navigation sidebar fonctionne
✓ Chaque page charge ses données
```

### TICKET-009: Modals et Composants Métier
```
Priorité: BASSE
Dépendances: TICKET-008

[ ] 1. Modals (src/components/modals/)
    - AlertsModal.tsx (FAIT dans TICKET-006)
    - TenantModal.tsx (création/édition tenant)
    - TicketModal.tsx (détail ticket support)

[ ] 2. Composants Subscriptions (src/components/subscriptions/)
    - CreatePlanModal.tsx
    - CreateSubscriptionModal.tsx
    - DeletePlanDialog.tsx
    - PlanDetailsModal.tsx

[ ] 3. Composants Users (src/components/users/)
    - AddUserModal.tsx
    - EditUserModal.tsx

[ ] 4. Composants Vehicles (src/components/vehicles/)
    - AddVehicleModal.tsx
    - EditVehicleModal.tsx
    - DeleteVehicleModal.tsx
    - HistoryVehicleModal.tsx
    - CtModal.tsx
    - VehicleForm.tsx
    - VehicleEditForm.tsx

[ ] 5. Autres composants
    - DatePicker.tsx (wrapper react-datepicker)
    - Modal.tsx (modal générique)
    - DashboardStats.tsx
    - TenantScopeSelector.tsx

Validation:
✓ Tous les modals fonctionnels
✓ Formulaires avec validation
✓ Submit/Cancel fonctionnent
✓ Modals s'ouvrent/ferment correctement
```

### TICKET-010: Tests et Polish Final
```
Priorité: BASSE
Dépendances: TICKET-009

[ ] 1. Tester toutes les routes
    - Accès direct à chaque URL
    - Navigation via sidebar
    - Retour en arrière (browser back)

[ ] 2. Tester l'authentification
    - Login avec credentials valides
    - Login avec credentials invalides
    - Accès direct à route protégée sans auth
    - Déconnexion

[ ] 3. Responsive design
    - Tester sur mobile (sidebar collapse auto)
    - Tester sur tablette
    - Tester sur desktop large

[ ] 4. Performance
    - Vérifier lazy loading des pages si nécessaire
    - Vérifier temps de chargement initial
    - Optimiser images/assets si gros

[ ] 5. Accessibilité
    - Navigation clavier
    - Labels ARIA
    - Contraste couleurs

[ ] 6. Documentation développeur
    - README.md avec installation
    - Instructions de démarrage
    - Variables d'environnement
    - Guide de contribution

Validation:
✓ Aucun bug critique
✓ Navigation fluide
✓ UI responsive
✓ Documentation à jour
```

---

## 🎯 Checklist Globale de Reproduction

### Phase 1 : Fondations (Critique)
- [ ] TICKET-001: Setup projet + dépendances
- [ ] TICKET-002: Structure + lib/utils + lib/api
- [ ] TICKET-003: 42 composants UI Shadcn

### Phase 2 : Architecture (Haute priorité)
- [ ] TICKET-004: Layout (InternalLayout + Sidebar + TopNav)
- [ ] TICKET-005: Authentification + ProtectedRoute
- [ ] TICKET-006: Page Dashboard Overview (référence)

### Phase 3 : Fonctionnalités (Moyenne priorité)
- [ ] TICKET-007: 17 services API
- [ ] TICKET-008: 30+ pages métier

### Phase 4 : Finitions (Basse priorité)
- [ ] TICKET-009: Modals + composants métier
- [ ] TICKET-010: Tests + polish + docs

---

## 📊 Statistiques du Projet

```
Total fichiers source:         136 fichiers
Composants UI Shadcn:          42 composants
Composants métier:             30+ composants
Pages:                         30+ pages
Services API:                  17 services
Hooks personnalisés:           10 hooks
Routes:                        35+ routes
Icônes lucide-react:           40+ icônes uniques
Dépendances npm:               66 packages
```

---

## 🚀 Commandes Rapides

```bash
# Installation
npm create vite@latest frontend-internal -- --template react-ts
cd frontend-internal
npm install

# Démarrage dev
npm run dev
# → http://localhost:8080

# Build production
npm run build

# Preview production
npm run preview

# Linter
npm run lint
```

---

## 🔗 Références Utiles

- **Shadcn/ui docs**: https://ui.shadcn.com/
- **Radix UI docs**: https://www.radix-ui.com/
- **Tailwind CSS docs**: https://tailwindcss.com/docs
- **React Router v6**: https://reactrouter.com/
- **TanStack Query**: https://tanstack.com/query/latest
- **Recharts**: https://recharts.org/
- **Lucide Icons**: https://lucide.dev/

---

**Fin de la documentation**
*Dernière mise à jour : 2025-09-30*
*Version : 1.0*