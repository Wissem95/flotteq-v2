// InternalSidebar.tsx - Navigation principale pour l'interface d'administration FlotteQ

import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  MessageSquare,
  Users,
  Handshake,
  CreditCard,
  Gift,
  TrendingUp,
  BarChart3,
  DollarSign,
  UserPlus,
  Star,
  Shield,
  Settings,
  LogOut,
  Menu,
  X,
  Building2,
  Car,
  MapPin,
  Wrench,
  CheckCircle,
  AlertTriangle,
  Globe,
  Flag,
} from "lucide-react";
import * as Collapsible from "@radix-ui/react-collapsible";

const InternalSidebar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  
  // États pour les menus déroulants
  const [showDashboardMenu, setShowDashboardMenu] = useState(() =>
    location.pathname.startsWith("/dashboard")
  );
  const [showPartnersMenu, setShowPartnersMenu] = useState(() =>
    location.pathname.startsWith("/partenaires")
  );
  const [showSubscriptionsMenu, setShowSubscriptionsMenu] = useState(() =>
    location.pathname.startsWith("/abonnements")
  );
  const [showFinanceMenu, setShowFinanceMenu] = useState(() =>
    location.pathname.startsWith("/finance")
  );
  const [showAnalyticsMenu, setShowAnalyticsMenu] = useState(() =>
    location.pathname.startsWith("/analytics")
  );
  const [showToolsMenu, setShowToolsMenu] = useState(() =>
    location.pathname.startsWith("/outils")
  );

  const handleLogout = () => {
    localStorage.removeItem("internal_token");
    localStorage.removeItem("internal_user");
    navigate("/login");
  };

  // Styles pour les liens de navigation
  const navLinkGroup = (path: string, currentPath: string, isCollapsed: boolean) => {
    const isActive = currentPath.startsWith(path);
    return `w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
      isActive 
        ? "bg-white/20 text-white" 
        : "text-white/80 hover:bg-white/10 hover:text-white"
    } ${isCollapsed ? "justify-center" : "justify-start"}`;
  };

  const navLink = (path: string, currentPath: string, isCollapsed: boolean) => {
    const isActive = currentPath === path;
    return `w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
      isActive 
        ? "bg-white/20 text-white" 
        : "text-white/80 hover:bg-white/10 hover:text-white"
    } ${isCollapsed ? "justify-center" : "justify-start"}`;
  };

  const subNavLink = (path: string, currentPath: string, isCollapsed: boolean) => {
    const isActive = currentPath === path;
    return `w-full flex items-center px-6 py-1.5 text-sm rounded-lg transition-colors ${
      isActive 
        ? "bg-white/20 text-white" 
        : "text-white/70 hover:bg-white/10 hover:text-white"
    } ${isCollapsed ? "justify-center px-3" : "justify-start"}`;
  };

  return (
    <div
      className={`h-full bg-gradient-to-b from-blue-900 to-teal-600 flex flex-col text-white transition-all duration-300 ${
        collapsed ? "w-20" : "w-72"
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/10">
        {!collapsed ? (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
              <Building2 className="w-5 h-5 text-blue-800" />
            </div>
            <div>
              <span className="font-bold text-lg tracking-tight">FlotteQ</span>
              <div className="text-xs text-white/70">Administration</div>
            </div>
          </div>
        ) : (
          <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
            <Building2 className="w-5 h-5 text-blue-800" />
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          className="text-white hover:bg-white/10"
        >
          {collapsed ? <Menu size={18} /> : <X size={18} />}
        </Button>
      </div>

      {/* Navigation */}
      <div className="flex-1 py-4 overflow-y-auto">
        <nav className="px-3 space-y-1">
          {/* Tableau de bord */}
          <button
            onClick={() => setShowDashboardMenu((prev) => !prev)}
            className={navLinkGroup("/dashboard", location.pathname, collapsed)}
          >
            <LayoutDashboard size={20} />
            {!collapsed && <span className="ml-3">Tableau de bord</span>}
          </button>

          <Collapsible.Root open={showDashboardMenu}>
            <Collapsible.Content>
              {[
                { to: "/dashboard/overview", label: "Vue d'ensemble", icon: <BarChart3 size={16} /> },
                { to: "/dashboard/tenants", label: "Tenants actifs", icon: <Building2 size={16} /> },
                { to: "/dashboard/alerts", label: "Alertes système", icon: <AlertTriangle size={16} /> },
              ].map(({ to, label, icon }) => (
                <Link key={to} to={to} className={subNavLink(to, location.pathname, collapsed)}>
                  {icon}
                  {!collapsed && <span className="ml-3">{label}</span>}
                </Link>
              ))}
            </Collapsible.Content>
          </Collapsible.Root>

          {/* Messages Support */}
          <Link to="/support" className={navLink("/support", location.pathname, collapsed)}>
            <MessageSquare size={20} />
            {!collapsed && <span className="ml-3">Messages Support</span>}
          </Link>

          {/* Employés FlotteQ */}
          <Link to="/employes" className={navLink("/employes", location.pathname, collapsed)}>
            <Users size={20} />
            {!collapsed && <span className="ml-3">Employés FlotteQ</span>}
          </Link>

          {/* Utilisateurs Tenants */}
          <Link to="/utilisateurs/tenants" className={navLink("/utilisateurs/tenants", location.pathname, collapsed)}>
            <UserPlus size={20} />
            {!collapsed && <span className="ml-3">Utilisateurs Tenants</span>}
          </Link>

          {/* Partenaires */}
          <button
            onClick={() => setShowPartnersMenu((prev) => !prev)}
            className={navLinkGroup("/partenaires", location.pathname, collapsed)}
          >
            <Handshake size={20} />
            {!collapsed && <span className="ml-3">Partenaires</span>}
          </button>

          <Collapsible.Root open={showPartnersMenu}>
            <Collapsible.Content>
              {[
                { to: "/partenaires/garages", label: "Garages", icon: <Wrench size={16} /> },
                { to: "/partenaires/controle-technique", label: "Centres CT", icon: <CheckCircle size={16} /> },
                { to: "/partenaires/assurances", label: "Assurances", icon: <Shield size={16} /> },
                { to: "/partenaires/carte", label: "Carte interactive", icon: <MapPin size={16} /> },
              ].map(({ to, label, icon }) => (
                <Link key={to} to={to} className={subNavLink(to, location.pathname, collapsed)}>
                  {icon}
                  {!collapsed && <span className="ml-3">{label}</span>}
                </Link>
              ))}
            </Collapsible.Content>
          </Collapsible.Root>

          {/* Abonnements */}
          <button
            onClick={() => setShowSubscriptionsMenu((prev) => !prev)}
            className={navLinkGroup("/abonnements", location.pathname, collapsed)}
          >
            <CreditCard size={20} />
            {!collapsed && <span className="ml-3">Abonnements</span>}
          </button>

          <Collapsible.Root open={showSubscriptionsMenu}>
            <Collapsible.Content>
              {[
                { to: "/abonnements", label: "Vue d'ensemble", icon: <BarChart3 size={16} /> },
                { to: "/abonnements/plans", label: "Plans tarifaires", icon: <Star size={16} /> },
              ].map(({ to, label, icon }) => (
                <Link key={to} to={to} className={subNavLink(to, location.pathname, collapsed)}>
                  {icon}
                  {!collapsed && <span className="ml-3">{label}</span>}
                </Link>
              ))}
            </Collapsible.Content>
          </Collapsible.Root>

          {/* Offres & Promotions */}
          <Link to="/promotions" className={navLink("/promotions", location.pathname, collapsed)}>
            <Gift size={20} />
            {!collapsed && <span className="ml-3">Offres & Promotions</span>}
          </Link>

          {/* Suivi Financier */}
          <button
            onClick={() => setShowFinanceMenu((prev) => !prev)}
            className={navLinkGroup("/finance", location.pathname, collapsed)}
          >
            <TrendingUp size={20} />
            {!collapsed && <span className="ml-3">Suivi Financier</span>}
          </button>

          <Collapsible.Root open={showFinanceMenu}>
            <Collapsible.Content>
              {[
                { to: "/finance/revenus", label: "Revenus globaux", icon: <DollarSign size={16} /> },
                { to: "/finance/commissions", label: "Commissions", icon: <TrendingUp size={16} /> },
                { to: "/finance/rapports", label: "Rapports", icon: <BarChart3 size={16} /> },
              ].map(({ to, label, icon }) => (
                <Link key={to} to={to} className={subNavLink(to, location.pathname, collapsed)}>
                  {icon}
                  {!collapsed && <span className="ml-3">{label}</span>}
                </Link>
              ))}
            </Collapsible.Content>
          </Collapsible.Root>

          {/* Analytics */}
          <button
            onClick={() => setShowAnalyticsMenu((prev) => !prev)}
            className={navLinkGroup("/analytics", location.pathname, collapsed)}
          >
            <BarChart3 size={20} />
            {!collapsed && <span className="ml-3">Analytics</span>}
          </button>

          <Collapsible.Root open={showAnalyticsMenu}>
            <Collapsible.Content>
              {[
                { to: "/analytics/usage", label: "Usage plateforme", icon: <Globe size={16} /> },
                { to: "/analytics/performance", label: "Performance", icon: <TrendingUp size={16} /> },
                { to: "/analytics/comportement", label: "Comportement", icon: <Users size={16} /> },
              ].map(({ to, label, icon }) => (
                <Link key={to} to={to} className={subNavLink(to, location.pathname, collapsed)}>
                  {icon}
                  {!collapsed && <span className="ml-3">{label}</span>}
                </Link>
              ))}
            </Collapsible.Content>
          </Collapsible.Root>

          {/* Mode de Paiement */}
          <Link to="/paiements" className={navLink("/paiements", location.pathname, collapsed)}>
            <DollarSign size={20} />
            {!collapsed && <span className="ml-3">Mode de Paiement</span>}
          </Link>

          {/* Parrainage */}
          <Link to="/parrainage" className={navLink("/parrainage", location.pathname, collapsed)}>
            <UserPlus size={20} />
            {!collapsed && <span className="ml-3">Parrainage</span>}
          </Link>

          {/* Fonctionnalités Bonus */}
          <Link to="/features-bonus" className={navLink("/features-bonus", location.pathname, collapsed)}>
            <Star size={20} />
            {!collapsed && <span className="ml-3">Features Bonus</span>}
          </Link>

          {/* Permissions & Rôles */}
          <Link to="/permissions" className={navLink("/permissions", location.pathname, collapsed)}>
            <Shield size={20} />
            {!collapsed && <span className="ml-3">Permissions & Rôles</span>}
          </Link>

          {/* Feature Flags */}
          <Link to="/flags" className={navLink("/flags", location.pathname, collapsed)}>
            <Flag size={20} />
            {!collapsed && <span className="ml-3">Feature Flags</span>}
          </Link>

          {/* Outils & Intégrations */}
          <button
            onClick={() => setShowToolsMenu((prev) => !prev)}
            className={navLinkGroup("/outils", location.pathname, collapsed)}
          >
            <Settings size={20} />
            {!collapsed && <span className="ml-3">Outils & Intégrations</span>}
          </button>

          <Collapsible.Root open={showToolsMenu}>
            <Collapsible.Content>
                                    {[
                        { to: "/outils/api", label: "API externes", icon: <Globe size={16} /> },
                        { to: "/outils/monitoring", label: "Monitoring", icon: <BarChart3 size={16} /> },
                        { to: "/outils/logs", label: "Logs système", icon: <Shield size={16} /> },
                      ].map(({ to, label, icon }) => (
                <Link key={to} to={to} className={subNavLink(to, location.pathname, collapsed)}>
                  {icon}
                  {!collapsed && <span className="ml-3">{label}</span>}
                </Link>
              ))}
            </Collapsible.Content>
          </Collapsible.Root>

          {/* Paramètres */}
          <Link to="/parametres" className={navLink("/parametres", location.pathname, collapsed)}>
            <Settings size={20} />
            {!collapsed && <span className="ml-3">Paramètres</span>}
          </Link>
        </nav>
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-white/10">
        <Button
          onClick={handleLogout}
          variant="ghost"
          className={`w-full text-white hover:bg-white/10 ${
            collapsed ? "justify-center px-0" : "justify-start"
          }`}
        >
          <LogOut size={20} />
          {!collapsed && <span className="ml-3">Déconnexion</span>}
        </Button>
      </div>
    </div>
  );
};

export default InternalSidebar; 