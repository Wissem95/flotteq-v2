import { type ReactNode, useState } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import {
  LayoutDashboard,
  FileText,
  AlertCircle,
  User,
  LogOut,
  Menu,
  X,
  Route,
} from 'lucide-react';

interface DriverLayoutProps {
  children?: ReactNode;
}

export default function DriverLayout({ children }: DriverLayoutProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const menuItems: Array<{
    icon: React.ComponentType<{ className?: string }>;
    label: string;
    path: string;
  }> = [
    {
      icon: LayoutDashboard,
      label: 'Tableau de bord',
      path: '/dashboard',
    },
    {
      icon: Route,
      label: 'Mes Trajets',
      path: '/trips',
    },
    {
      icon: User,
      label: 'Mon Profil',
      path: '/profile',
    },
    {
      icon: FileText,
      label: 'Documents',
      path: '/documents',
    },
    {
      icon: AlertCircle,
      label: 'Signalements',
      path: '/reports',
    },
  ];

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar - Mobile First */}
      <aside
        className={`${
          isSidebarOpen ? 'w-64' : 'w-20'
        } flotteq-gradient flex flex-col transition-all duration-300 shadow-xl`}
      >
        {/* Logo & Toggle */}
        <div className="p-6 border-b border-white/20 flex items-center justify-between">
          {isSidebarOpen ? (
            <>
              <div>
                <h1 className="text-2xl font-bold text-white">Flotteq</h1>
                <p className="text-sm text-white/80">Conducteur</p>
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

        {/* Navigation - Large touch-friendly buttons */}
        <nav className="flex-1 px-3 py-4 space-y-2">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;

            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center gap-4 px-4 py-4 rounded-lg transition-colors min-h-[48px] ${
                  isActive
                    ? 'bg-white/20 text-white font-semibold'
                    : 'text-white/80 hover:bg-white/10 hover:text-white'
                }`}
                title={!isSidebarOpen ? item.label : ''}
              >
                <Icon className="h-6 w-6 flex-shrink-0" />
                {isSidebarOpen && <span className="text-base font-medium">{item.label}</span>}
              </button>
            );
          })}
        </nav>

        {/* User Section */}
        <div className="p-4 border-t border-white/20">
          {isSidebarOpen ? (
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-white/20 text-white flex items-center justify-center font-semibold text-lg">
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
                className="p-2 hover:bg-white/10 rounded-lg transition-colors min-h-[48px] min-w-[48px]"
                title="Déconnexion"
              >
                <LogOut className="h-5 w-5 text-white" />
              </button>
            </div>
          ) : (
            <button
              onClick={handleLogout}
              className="w-full p-2 hover:bg-white/10 rounded-lg transition-colors min-h-[48px]"
              title="Déconnexion"
            >
              <LogOut className="h-5 w-5 text-white mx-auto" />
            </button>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="container mx-auto p-4 md:p-8 max-w-7xl">
          {children || <Outlet />}
        </div>
      </main>
    </div>
  );
}
