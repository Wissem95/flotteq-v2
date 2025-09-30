import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import TopNav from "./TopNav";
import ProfileIncompleteAlert from "@/components/ui/ProfileIncompleteAlert";
import { useAuth } from "@/hooks/useAuth";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const { hasIncompleteProfile, missingFields } = useAuth();
  const [showProfileAlert, setShowProfileAlert] = useState(() => {
    // Vérifier si l'utilisateur a déjà fermé l'alerte dans cette session
    return sessionStorage.getItem('profile_alert_dismissed') !== 'true';
  });

  // Ne pas afficher l'alerte sur la page de profil
  const shouldShowAlert = hasIncompleteProfile && 
                          showProfileAlert && 
                          location.pathname !== "/profile";

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

  const handleDismissAlert = () => {
    setShowProfileAlert(false);
    // Sauvegarder la préférence de l'utilisateur pour cette session
    sessionStorage.setItem('profile_alert_dismissed', 'true');
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <TopNav title={getPageTitle()} />
        <main className="flex-1 overflow-y-auto p-6">
          {shouldShowAlert && (
            <ProfileIncompleteAlert
              isVisible={shouldShowAlert}
              missingFields={missingFields}
              onDismiss={handleDismissAlert}
            />
          )}
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
