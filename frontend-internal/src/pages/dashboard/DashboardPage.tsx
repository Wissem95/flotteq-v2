import { useAuth } from '@/hooks/useAuth';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Building2, Car, CheckCircle } from 'lucide-react';

export const DashboardPage = () => {
  const { user, logout } = useAuth();

  // Stats fictives pour l'instant (seront remplacées par de vraies données en FI0-002+)
  const stats = [
    {
      title: 'Tenants Actifs',
      value: '3',
      icon: Building2,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      title: 'Utilisateurs',
      value: '12',
      icon: Users,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      title: 'Véhicules',
      value: '28',
      icon: Car,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
    {
      title: 'Système',
      value: 'Opérationnel',
      icon: CheckCircle,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-100',
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-white shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold flotteq-gradient-text">
              FlotteQ Admin Dashboard
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Architecture Multi-Tenant v2.0
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="font-medium">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-sm text-muted-foreground">{user?.role}</p>
            </div>
            <Button
              onClick={() => logout()}
              variant="outline"
              className="border-flotteq-blue text-flotteq-blue hover:bg-flotteq-blue hover:text-white"
            >
              Déconnexion
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Welcome Card */}
        <Card className="p-6 mb-8 bg-gradient-to-r from-flotteq-navy to-flotteq-blue text-white">
          <h2 className="text-2xl font-bold mb-2">
            Bienvenue, {user?.firstName} !
          </h2>
          <p className="opacity-90">
            Vous êtes connecté en tant que <strong>{user?.role}</strong> sur le
            tenant <strong>#{user?.tenantId}</strong>
          </p>
        </Card>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat) => (
            <Card key={stat.title} className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    {stat.title}
                  </p>
                  <p className="text-3xl font-bold">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-full ${stat.bgColor}`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Informations Système</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Version:</span>
                <span className="font-medium">v2.0.0</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Backend:</span>
                <span className="font-medium flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                  Connecté
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">API:</span>
                <span className="font-medium">http://localhost:3000</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Auth:</span>
                <span className="font-medium">JWT + Refresh Token</span>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Prochaines Étapes</h3>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Setup frontend-internal complété</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Authentification JWT fonctionnelle</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Refresh token implémenté</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="h-4 w-4 rounded-full border-2 border-muted mt-0.5 flex-shrink-0" />
                <span className="text-muted-foreground">
                  FI0-002: Page Tenants à venir
                </span>
              </li>
            </ul>
          </Card>
        </div>
      </main>
    </div>
  );
};
