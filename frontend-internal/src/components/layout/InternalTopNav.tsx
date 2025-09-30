// InternalTopNav.tsx - Barre de navigation supérieure pour l'interface d'administration

import React from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Bell,
  Settings,
  User,
  HelpCircle,
  Activity,
  Shield,
  LogOut,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

interface InternalTopNavProps {
  title: string;
}

const InternalTopNav: React.FC<InternalTopNavProps> = ({ title }) => {
  const navigate = useNavigate();

  // TODO: Récupérer les données admin depuis le hook useAuth
  const adminUser = {
    name: "Admin FlotteQ",
    email: "admin@flotteq.com",
    role: "Super Admin",
    avatar: null,
  };

  const handleLogout = () => {
    localStorage.removeItem("internal_token");
    localStorage.removeItem("internal_user");
    navigate("/login");
  };

  return (
    <header className="h-16 bg-white border-b border-gray-200 shadow-sm flex items-center justify-between px-6">
      {/* Titre de la page */}
      <div className="flex items-center">
        <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
      </div>

      {/* Actions de droite */}
      <div className="flex items-center gap-4">
        {/* Indicateur de statut système */}
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span className="text-sm text-gray-600">Système opérationnel</span>
        </div>

        {/* Notifications */}
        <Button variant="ghost" size="icon" className="relative">
          <Bell size={20} />
          <Badge
            variant="destructive"
            className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center text-xs p-0"
          >
            3
          </Badge>
        </Button>

        {/* Menu admin */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2 p-2">
              <Avatar className="w-8 h-8">
                <AvatarImage src={adminUser.avatar || undefined} />
                <AvatarFallback className="bg-blue-100 text-blue-700">
                  {adminUser.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div className="text-left">
                <div className="text-sm font-medium">{adminUser.name}</div>
                <div className="text-xs text-gray-500">{adminUser.role}</div>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col">
                <span>{adminUser.name}</span>
                <span className="text-xs text-gray-500 font-normal">{adminUser.email}</span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            
            <DropdownMenuItem onClick={() => navigate("/profile")}>
              <User className="mr-2 h-4 w-4" />
              <span>Mon profil</span>
            </DropdownMenuItem>
            
            <DropdownMenuItem onClick={() => navigate("/parametres")}>
              <Settings className="mr-2 h-4 w-4" />
              <span>Paramètres</span>
            </DropdownMenuItem>
            
            <DropdownMenuItem onClick={() => navigate("/permissions")}>
              <Shield className="mr-2 h-4 w-4" />
              <span>Permissions</span>
            </DropdownMenuItem>
            
            <DropdownMenuItem onClick={() => navigate("/outils/monitoring")}>
              <Activity className="mr-2 h-4 w-4" />
              <span>Monitoring système</span>
            </DropdownMenuItem>
            
            <DropdownMenuSeparator />
            
            <DropdownMenuItem>
              <HelpCircle className="mr-2 h-4 w-4" />
              <span>Aide & Support</span>
            </DropdownMenuItem>
            
            <DropdownMenuSeparator />
            
            <DropdownMenuItem onClick={handleLogout} className="text-red-600">
              <LogOut className="mr-2 h-4 w-4" />
              <span>Déconnexion</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

export default InternalTopNav; 