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
} from 'lucide-react';

export const MainLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSubscriptionsOpen, setIsSubscriptionsOpen] = React.useState(false);

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
  ];

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <aside className="w-64 flotteq-gradient flex flex-col shadow-xl">
        <div className="p-6 border-b border-white/20">
          <h1 className="text-2xl font-bold text-white">
            Flotteq
          </h1>
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
                  }
                }}
                className={cn(
                  'w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors',
                  location.pathname.startsWith(item.path)
                    ? 'bg-white/20 text-white font-semibold'
                    : 'text-white/80 hover:bg-white/10 hover:text-white'
                )}
              >
                <item.icon className="h-5 w-5" />
                <span className="flex-1 text-left">{item.label}</span>
                {item.hasSubmenu && (
                  <ChevronDown
                    className={cn(
                      'h-4 w-4 transition-transform',
                      isSubscriptionsOpen && 'rotate-180'
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
                      onClick={() => navigate(subItem.path)}
                      className={cn(
                        'w-full flex items-center px-3 py-2 rounded-lg text-sm transition-colors',
                        location.pathname === subItem.path
                          ? 'bg-white/20 text-white font-semibold'
                          : 'text-white/80 hover:bg-white/10 hover:text-white'
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
              className="text-white/80 hover:text-white hover:bg-white/10"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="container mx-auto p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};
