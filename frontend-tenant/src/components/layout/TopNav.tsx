// /src/components/layout/TopNav.tsx

import React from "react";
import {
  Bell,
  Search,
  User,
  LogOut,
  Settings as SettingsIcon,
  List,
  Clock,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { useNotifications } from "@/hooks/useNotifications";

interface TopNavProps {
  title: string;
}

const TopNav: React.FC<TopNavProps> = ({ title }) => {
  const navigate = useNavigate();
  const { notifications, counts, markAsRead, loading } = useNotifications();
  const safeNotifications = notifications || [];

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'À l\'instant';
    if (diffInHours < 24) return `Il y a ${diffInHours}h`;
    return date.toLocaleDateString('fr-FR');
  };

  return (
    <header className="bg-white border-b border-slate-200 p-4 flex items-center justify-between">
      <h1 className="text-2xl font-semibold text-slate-800">{title}</h1>

      <div className="flex items-center space-x-2">
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Rechercher..."
            className="pl-10 pr-4 py-2 w-64 rounded-md border border-slate-200 focus:outline-none focus:ring-2 focus:ring-flotteq-teal focus:border-transparent"
          />
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell size={20} />
              {((counts?.urgent || 0) + (counts?.critical || 0)) > 0 && (
                <Badge 
                  className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs bg-red-500 text-white"
                >
                  {((counts?.urgent || 0) + (counts?.critical || 0)) > 9 ? '9+' : ((counts?.urgent || 0) + (counts?.critical || 0))}
                </Badge>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-96 max-h-96 overflow-y-auto">
            <div className="p-3 font-medium border-b flex items-center justify-between">
              <span>Notifications</span>
              {((counts?.urgent || 0) + (counts?.critical || 0)) > 0 && (
                <Badge variant="destructive" className="text-xs">
                  {((counts?.urgent || 0) + (counts?.critical || 0))} non lue{((counts?.urgent || 0) + (counts?.critical || 0)) > 1 ? 's' : ''}
                </Badge>
              )}
            </div>
            
            {safeNotifications.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                <Bell className="mx-auto mb-2 h-8 w-8 text-gray-300" />
                <p>Aucune notification</p>
              </div>
            ) : (
              safeNotifications.slice(0, 5).map((notification) => (
                <DropdownMenuItem 
                  key={notification.id}
                  className={`p-3 cursor-pointer border-l-2 ${
                    notification.status === 'completed' ? 'border-l-transparent bg-gray-50' : 'border-l-blue-500 bg-blue-50'
                  }`}
                  onClick={() => markAsRead(notification.id)}
                >
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm">
                          {notification.type === 'ct' && '🔧'}
                          {notification.type === 'maintenance' && '⚙️'}
                          {notification.type === 'insurance' && '🛡️'}
                          {notification.type === 'issue' && '⚠️'}
                          {notification.type === 'document' && '📄'}
                          {notification.type === 'status_change' && '🔄'}
                        </span>
                        <p className={`font-medium text-sm ${
                          notification.priority === 'critical' ? 'text-red-600' :
                          notification.priority === 'high' ? 'text-amber-600' :
                          notification.priority === 'medium' ? 'text-sky-600' : 'text-slate-600'
                        }`}>
                          {notification.vehicle} - {notification.plate}
                        </p>
                        {notification.status !== 'completed' && (
                          <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                        )}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-gray-400">
                        <Clock size={12} />
                        {formatDate(notification.created)}
                      </div>
                    </div>
                    <p className="text-xs text-slate-600 line-clamp-2">
                      {notification.message}
                    </p>
                    {notification.dueDate && (
                      <p className="text-xs text-blue-600 mt-1">
                        📅 Échéance: {new Date(notification.dueDate).toLocaleDateString('fr-FR')}
                      </p>
                    )}
                  </div>
                </DropdownMenuItem>
              ))
            )}
            
            {safeNotifications.length > 0 && (
              <div 
                className="p-2 text-center text-sm text-blue-500 border-t cursor-pointer hover:bg-gray-50 flex items-center justify-center gap-2"
                onClick={() => navigate('/notifications')}
              >
                <Eye size={14} />
                Voir toutes les notifications ({counts?.total || safeNotifications.length})
              </div>
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full bg-slate-100">
              <User size={20} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => navigate("/profile")}>
              <User className="mr-2 h-4 w-4" />
              Profil
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate("/settings")}>
              <SettingsIcon className="mr-2 h-4 w-4" />
              Paramètres
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate("/users")}>
              <List className="mr-2 h-4 w-4" />
              Utilisateurs
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleLogout} className="text-red-500">
              <LogOut className="mr-2 h-4 w-4" />
              Déconnexion
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

export default TopNav;

