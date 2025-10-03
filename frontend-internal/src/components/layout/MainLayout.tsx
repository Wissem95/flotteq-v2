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
      disabled: true, // FI0-003
    },
    {
      icon: Car,
      label: 'Véhicules',
      path: '/vehicles',
      disabled: true, // FI0-004
    },
    {
      icon: UserCheck,
      label: 'Conducteurs',
      path: '/drivers',
      disabled: true, // FI0-004
    },
  ];

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <aside className="w-64 bg-sidebar border-r flex flex-col">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-sidebar-foreground">
            FlotteQ
          </h1>
          <p className="text-sm text-sidebar-foreground/60">Admin Dashboard</p>
        </div>

        <nav className="flex-1 px-3 space-y-1">
          {menuItems.map((item) => (
            <div key={item.path}>
              <button
                onClick={() => {
                  if (item.hasSubmenu) {
                    setIsSubscriptionsOpen(!isSubscriptionsOpen);
                  } else if (!item.disabled) {
                    navigate(item.path);
                  }
                }}
                disabled={item.disabled}
                className={cn(
                  'w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors',
                  location.pathname.startsWith(item.path)
                    ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                    : 'text-sidebar-foreground/60 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground',
                  item.disabled && 'opacity-50 cursor-not-allowed'
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
                          ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                          : 'text-sidebar-foreground/60 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'
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

        <div className="p-4 border-t border-sidebar-border">
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="flex-1">
              <p className="text-sm font-medium text-sidebar-foreground">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-xs text-sidebar-foreground/60">{user?.role}</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => logout()}
              className="text-sidebar-foreground/60 hover:text-sidebar-foreground"
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
