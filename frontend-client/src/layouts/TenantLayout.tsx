import { type ReactNode, useState } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import {
  LayoutDashboard,
  Car,
  Users,
  Wrench,
  FileText,
  LogOut,
  Menu,
  X,
  UserCog,
  CreditCard,
  Settings,
  ShoppingBag,
  Calendar,
  Route,
} from 'lucide-react';
import { MobileSidebar } from './components/MobileSidebar';

interface TenantLayoutProps {
  children?: ReactNode;
}

export default function TenantLayout({ children }: TenantLayoutProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const menuItems: Array<{
    icon: React.ComponentType<{ className?: string }>;
    label: string;
    path: string;
    disabled?: boolean;
  }> = [
    {
      icon: LayoutDashboard,
      label: 'Tableau de bord',
      path: '/dashboard',
    },
    {
      icon: Car,
      label: 'Véhicules',
      path: '/vehicles',
    },
    {
      icon: Users,
      label: 'Conducteurs',
      path: '/drivers',
    },
    {
      icon: Route,
      label: 'Historique trajets',
      path: '/trips-history',
    },
    {
      icon: Wrench,
      label: 'Maintenances',
      path: '/maintenances',
    },
    {
      icon: FileText,
      label: 'Documents',
      path: '/documents',
    },
    {
      icon: ShoppingBag,
      label: 'Marketplace',
      path: '/marketplace',
    },
    {
      icon: Calendar,
      label: 'Mes réservations',
      path: '/my-bookings',
    },
    {
      icon: UserCog,
      label: 'Utilisateurs',
      path: '/users',
    },
    {
      icon: CreditCard,
      label: 'Facturation',
      path: '/billing',
    },
    {
      icon: Settings,
      label: 'Paramètres',
      path: '/settings',
    },
  ];

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Desktop Sidebar - Hidden on mobile (< 768px) */}
      <aside
        className={`${
          isSidebarOpen ? 'w-64' : 'w-20'
        } hidden md:flex flotteq-gradient flex-col transition-all duration-300 shadow-xl`}
      >
        {/* Logo & Toggle */}
        <div className="p-6 border-b border-white/20 flex items-center justify-between">
          {isSidebarOpen ? (
            <>
              <div>
                <h1 className="text-2xl font-bold text-white">Flotteq</h1>
                <p className="text-sm text-white/80">Gestion de flotte</p>
              </div>
              <button
                onClick={() => setIsSidebarOpen(false)}
                className="p-1 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="h-5 w-5 text-white" />
              </button>
            </>
          ) : (
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="p-1 hover:bg-white/10 rounded-lg mx-auto transition-colors"
            >
              <Menu className="h-5 w-5 text-white" />
            </button>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;

            return (
              <button
                key={item.path}
                onClick={() => !item.disabled && navigate(item.path)}
                disabled={item.disabled}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-white/20 text-white font-semibold'
                    : item.disabled
                      ? 'text-white/40 cursor-not-allowed'
                      : 'text-white/80 hover:bg-white/10 hover:text-white'
                }`}
                title={!isSidebarOpen ? item.label : ''}
              >
                <Icon className="h-5 w-5 flex-shrink-0" />
                {isSidebarOpen && <span className="text-sm font-medium">{item.label}</span>}
              </button>
            );
          })}
        </nav>

        {/* User Section */}
        <div className="p-4 border-t border-white/20">
          {isSidebarOpen ? (
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-white/20 text-white flex items-center justify-center font-semibold">
                {user?.firstName?.[0]}{user?.lastName?.[0]}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-xs text-white/70 truncate">{user?.email}</p>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                title="Déconnexion"
              >
                <LogOut className="h-4 w-4 text-white" />
              </button>
            </div>
          ) : (
            <button
              onClick={handleLogout}
              className="w-full p-2 hover:bg-white/10 rounded-lg transition-colors"
              title="Déconnexion"
            >
              <LogOut className="h-5 w-5 text-white mx-auto" />
            </button>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {/* Mobile Header with MobileSidebar - Visible only on mobile (< 768px) */}
        <div className="md:hidden sticky top-0 z-40 flotteq-gradient px-4 py-3 flex items-center justify-between shadow-xl">
          <MobileSidebar />
          <h1 className="text-lg font-bold text-white">Flotteq</h1>
          <div className="w-10" /> {/* Spacer for centering */}
        </div>

        <div className="container mx-auto p-8 max-w-7xl">
          {children || <Outlet />}
        </div>
      </main>
    </div>
  );
}
