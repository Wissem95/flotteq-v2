import React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Building2,
  Users,
  Car,
  UserCheck,
  CreditCard,
  ChevronDown,
  LogOut,
  Handshake,
  DollarSign,
  Settings,
  ShieldCheck,
  BarChart3,
  Menu,
} from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';

export const MainLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSubscriptionsOpen, setIsSubscriptionsOpen] = React.useState(false);
  const [isMobileNavigationOpen, setIsMobileNavigationOpen] =
    React.useState(false);

  const menuItems = [
    {
      icon: LayoutDashboard,
      label: 'Dashboard',
      path: '/dashboard',
    },
    {
      icon: Building2,
      label: 'Tenants',
      path: '/tenants',
    },
    {
      icon: CreditCard,
      label: 'Abonnements',
      path: '/subscriptions',
      hasSubmenu: true,
      submenu: [
        { label: 'Plans', path: '/subscriptions/plans' },
        { label: 'Abonnements actifs', path: '/subscriptions/active' },
      ],
    },
    {
      icon: Users,
      label: 'Utilisateurs',
      path: '/users',
    },
    {
      icon: ShieldCheck,
      label: 'Équipe FlotteQ',
      path: '/team',
    },
    {
      icon: Car,
      label: 'Véhicules',
      path: '/vehicles',
    },
    {
      icon: UserCheck,
      label: 'Conducteurs',
      path: '/drivers',
    },
    {
      icon: Handshake,
      label: 'Partenaires',
      path: '/partners',
    },
    {
      icon: DollarSign,
      label: 'Commissions',
      path: '/commissions',
    },
    {
      icon: BarChart3,
      label: 'Analytics',
      path: '/analytics',
    },
    {
      icon: Settings,
      label: 'Paramètres',
      path: '/settings',
    },
  ];

  const renderNavigation = (onNavigate?: () => void) => (
    <>
      <div className="p-6 border-b border-white/20">
        <h1 className="text-2xl font-bold text-white">Flotteq</h1>
        <p className="text-sm text-white/80">Admin Dashboard</p>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {menuItems.map((item) => (
          <div key={item.path}>
            <button
              onClick={() => {
                if (item.hasSubmenu) {
                  setIsSubscriptionsOpen(!isSubscriptionsOpen);
                } else {
                  navigate(item.path);
                  onNavigate?.();
                }
              }}
              className={cn(
                'w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors',
                location.pathname.startsWith(item.path)
                  ? 'bg-white/20 text-white font-semibold'
                  : 'text-white/80 hover:bg-white/10 hover:text-white',
              )}
            >
              <item.icon className="h-5 w-5" />
              <span className="flex-1 text-left">{item.label}</span>
              {item.hasSubmenu && (
                <ChevronDown
                  className={cn(
                    'h-4 w-4 transition-transform',
                    isSubscriptionsOpen && 'rotate-180',
                  )}
                />
              )}
            </button>

            {/* Submenu */}
            {item.hasSubmenu && isSubscriptionsOpen && (
              <div className="ml-8 mt-1 space-y-1">
                {item.submenu?.map((subItem) => (
                  <button
                    key={subItem.path}
                    onClick={() => {
                      navigate(subItem.path);
                      onNavigate?.();
                    }}
                    className={cn(
                      'w-full flex items-center px-3 py-2 rounded-lg text-sm transition-colors',
                      location.pathname === subItem.path
                        ? 'bg-white/20 text-white font-semibold'
                        : 'text-white/80 hover:bg-white/10 hover:text-white',
                    )}
                  >
                    {subItem.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>

      <div className="p-4 border-t border-white/20">
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="flex-1">
            <p className="text-sm font-medium text-white">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="text-xs text-white/70">{user?.role}</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => logout()}
            aria-label="Se déconnecter"
            className="text-white/80 hover:text-white hover:bg-white/10"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </>
  );

  return (
    <div className="flex h-screen min-w-0 bg-background">
      <aside className="flotteq-gradient hidden w-64 shrink-0 flex-col shadow-xl md:flex">
        {renderNavigation()}
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-4 shadow-sm md:hidden">
          <div>
            <p className="font-bold text-slate-950">FlotteQ Admin</p>
            <p className="text-xs text-slate-500">{user?.role}</p>
          </div>
          <Sheet
            open={isMobileNavigationOpen}
            onOpenChange={setIsMobileNavigationOpen}
          >
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                aria-label="Ouvrir la navigation administrateur"
              >
                <Menu className="h-5 w-5" aria-hidden="true" />
              </Button>
            </SheetTrigger>
            <SheetContent
              side="left"
              className="flotteq-gradient flex w-72 flex-col border-0 p-0 text-white"
            >
              <SheetHeader className="sr-only">
                <SheetTitle>Navigation administrateur</SheetTitle>
                <SheetDescription>
                  Accédez aux différentes sections de l’administration FlotteQ.
                </SheetDescription>
              </SheetHeader>
              {renderNavigation(() => setIsMobileNavigationOpen(false))}
            </SheetContent>
          </Sheet>
        </header>

        <main className="min-w-0 flex-1 overflow-auto">
          <div className="container mx-auto p-4 sm:p-6 lg:p-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};
