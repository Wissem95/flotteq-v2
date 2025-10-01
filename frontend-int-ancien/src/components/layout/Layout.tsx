import React from "react";
import { useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import TopNav from "./TopNav";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const getPageTitle = () => {
    const path = location.pathname;
    if (path === "/dashboard") return "Dashboard";
    if (path === "/vehicles") return "Véhicules";
    if (path.startsWith("/vehicle/")) return "Détails du véhicule";
    if (path === "/profile") return "Profile Utilisateur";
    if (path === "/settings") return "Paramètres";
    if (path === "/register") return "Inscription";
    if (path === "/maintenances") return "maintenances";
    if (path === "/notifications") return "Notifications";
    return "Flotteq";
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <TopNav title={getPageTitle()} />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
};

export default Layout;
