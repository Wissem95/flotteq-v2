// /src/components/layout/Sidebar.tsx

import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  Car,
  Bell,
  Settings,
  Menu,
  X,
  PlusCircle,
  LogOut,
  List,
  BarChart3,
  History,
  Wrench,
  User,
  MapPin,
  ArrowUpDown,
  Euro,
  Activity,
  FileImage,
  ClipboardList,
} from "lucide-react";
import * as Collapsible from "@radix-ui/react-collapsible";

const Sidebar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [showVehicleMenu, setShowVehicleMenu] = useState(() =>
    location.pathname.startsWith("/vehicles") || location.pathname === "/add-vehicle"
  );
  const [showUsersMenu, setShowUsersMenu] = useState(false);
  const [showDashboardMenu, setShowDashboardMenu] = useState(() =>
    location.pathname.startsWith("/dashboard")
  );
  const [showEtatDesLieuxMenu, setShowEtatDesLieuxMenu] = useState(() =>
    location.pathname.startsWith("/etat-des-lieux")
  );
  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div
      className={`h-full flotteq-gradient flex flex-col text-white transition-all duration-300 ${
        collapsed ? "w-20" : "w-64"
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4">
        {!collapsed ? (
          <div className="flex items-center gap-2">
            <img src="/images/logo/logo.png" alt="Logo Flotteq" className="w-8 h-8 object-contain" />
            <span className="font-bold text-xl tracking-tight">Flotteq</span>
          </div>
        ) : (
          <img src="/images/logo/logo.png" alt="Logo" className="w-8 h-8 object-contain" />
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          className="text-white hover:bg-white/10"
        >
          {collapsed ? <Menu size={20} /> : <X size={20} />}
        </Button>
      </div>

      {/* Navigation */}
      <div className="flex-1 py-6">
        <nav className="px-2 space-y-1">
          <button
            onClick={() => setShowDashboardMenu((prev) => !prev)}
            className={navLinkGroup("/dashboard", location.pathname, collapsed)}>
            <LayoutDashboard size={20} />
            {!collapsed && <span className="ml-3">Dashboard</span>}
          </button>

          <Collapsible.Root open={showDashboardMenu}>
            <Collapsible.Content>
              {[
                { to: "/dashboard/fleet", label: "État de la flotte", icon: <Activity size={18} /> },
                { to: "/dashboard/financial", label: "État financier", icon: <Euro size={18} /> },
              ].map(({ to, label, icon }) => (
                <Link key={to} to={to} className={subNavLink(to, location.pathname, collapsed)}>
                  {icon}
                  {!collapsed && <span className="ml-3">{label}</span>}
                </Link>
              ))}
            </Collapsible.Content>
          </Collapsible.Root>

          {/* <Link to="/users" className={navLink("/users", location.pathname, collapsed)}>
            <User size={20} />
            {!collapsed && <span className="ml-3">Utilisateurs</span>}
          </Link> */}

          <button
            onClick={() => setShowUsersMenu((prev) => !prev)}
            className={navLinkGroup("/users", location.pathname, collapsed)}>
            <User size={20} />
            {!collapsed && <span className="ml-3">Utilisateurs</span>}
          </button>

          <Collapsible.Root open={showUsersMenu}>
            <Collapsible.Content>
              {[
                { to: "/users", label: "Liste des utilisateurs", icon: <List size={18} /> },
                { to: "/users/stats", label: "Statistiques", icon: <BarChart3 size={18} /> },
              ].map(({ to, label, icon }) => (
                <Link key={to} to={to} className={subNavLink(to, location.pathname, collapsed)}>
                  {icon}
                  {!collapsed && <span className="ml-3">{label}</span>}
                </Link>
              ))}
            </Collapsible.Content>
          </Collapsible.Root>

          <button
            onClick={() => setShowVehicleMenu((prev) => !prev)}
            className={navLinkGroup("/vehicles", location.pathname, collapsed)}
          >
            <Car size={20} />
            {!collapsed && <span className="ml-3">Véhicules</span>}
          </button>

          <Collapsible.Root open={showVehicleMenu}>
            <Collapsible.Content>
              {[
                { to: "/vehicles", label: "Liste des véhicules", icon: <List size={18} /> },
                { to: "/vehicles/maintenance", label: "Maintenance", icon: <Wrench size={18} /> },
                { to: "/vehicles/history", label: "Historique", icon: <History size={18} /> },
                { to: "/vehicles/stats", label: "Statistiques", icon: <BarChart3 size={18} /> },
              ].map(({ to, label, icon }) => (
                <Link key={to} to={to} className={subNavLink(to, location.pathname, collapsed)}>
                  {icon}
                  {!collapsed && <span className="ml-3">{label}</span>}
                </Link>
              ))}
            </Collapsible.Content>
          </Collapsible.Root>

          <button
            onClick={() => setShowEtatDesLieuxMenu((prev) => !prev)}
            className={navLinkGroup("/etat-des-lieux", location.pathname, collapsed)}
          >
            <FileImage size={20} />
            {!collapsed && <span className="ml-3">État des lieux</span>}
          </button>

          <Collapsible.Root open={showEtatDesLieuxMenu}>
            <Collapsible.Content>
              {[
                { to: "/etat-des-lieux/nouveau", label: "Nouvel état des lieux", icon: <ClipboardList size={18} /> },
                { to: "/etat-des-lieux/historique", label: "Historique", icon: <History size={18} /> },
              ].map(({ to, label, icon }) => (
                <Link key={to} to={to} className={subNavLink(to, location.pathname, collapsed)}>
                  {icon}
                  {!collapsed && <span className="ml-3">{label}</span>}
                </Link>
              ))}
            </Collapsible.Content>
          </Collapsible.Root>

          <Link to="/trouver-garage" className={navLink("/trouver-garage", location.pathname, collapsed)}>
            <MapPin size={20} />
            {!collapsed && <span className="ml-3">Trouver un garage</span>}
          </Link>

          <Link to="/transactions" className={navLink("/transactions", location.pathname, collapsed)}>
            <ArrowUpDown size={20} />
            {!collapsed && <span className="ml-3">Achats/Reventes</span>}
          </Link>

          <Link to="/notifications" className={navLink("/notifications", location.pathname, collapsed)}>
            <Bell size={20} />
            {!collapsed && <span className="ml-3">Notifications</span>}
          </Link>

          <Link to="/settings" className={navLink("/settings", location.pathname, collapsed)}>
            <Settings size={20} />
            {!collapsed && <span className="ml-3">Paramètres</span>}
          </Link>
        </nav>
      </div>

     {/* Déconnexion */}
<Button
  variant="ghost"
  className={`w-full text-white hover:bg-white/10 ${
    collapsed ? "justify-center px-0" : ""
  }`}
  onClick={handleLogout}
>
  <LogOut size={20} />
  {!collapsed && <span className="ml-2">Déconnexion</span>}
</Button>

    </div>
  );
};

function navLink(path: string, current: string, collapsed: boolean) {
  return `flex items-center px-3 py-3 rounded-md transition-colors ${
    current === path ? "bg-white/20 text-white" : "text-white/80 hover:bg-white/10 hover:text-white"
  } ${collapsed ? "justify-center" : "justify-start"}`;
}

function navLinkGroup(path: string, current: string, collapsed: boolean) {
  const active = current.startsWith(path);
  return `flex items-center px-3 py-3 rounded-md transition-colors w-full text-left ${
    active ? "bg-white/20 text-white" : "text-white/80 hover:bg-white/10 hover:text-white"
  } ${collapsed ? "justify-center" : "justify-start"}`;
}

function subNavLink(path: string, current: string, collapsed: boolean) {
  return `flex items-center pl-10 py-2 rounded-md text-white/80 hover:bg-white/10 ${
    current === path ? "bg-white/20 text-white" : ""
  }`;
}

export default Sidebar;

