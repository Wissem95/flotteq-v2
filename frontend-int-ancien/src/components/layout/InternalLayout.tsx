// InternalLayout.tsx - Layout principal pour l'interface d'administration FlotteQ

import React from "react";
import { useLocation } from "react-router-dom";
import InternalSidebar from "./InternalSidebar";
import InternalTopNav from "./InternalTopNav";

interface InternalLayoutProps {
  children: React.ReactNode;
}

const InternalLayout: React.FC<InternalLayoutProps> = ({ children }) => {
  const location = useLocation();

  // Fonction pour générer le titre de la page selon la route
  const getPageTitle = () => {
    const path = location.pathname;
    
    // Dashboard
    if (path.startsWith("/dashboard")) {
      if (path === "/dashboard" || path === "/dashboard/overview") return "Vue d'ensemble";
      if (path === "/dashboard/tenants") return "Tenants actifs";
      if (path === "/dashboard/alerts") return "Alertes système";
      return "Tableau de bord";
    }
    
    // Support
    if (path === "/support") return "Messages Support";
    
    // Employés
    if (path === "/employes") return "Employés FlotteQ";
    
    // Utilisateurs
    if (path === "/utilisateurs/tenants") return "Utilisateurs Tenants";
    
    // Partenaires
    if (path.startsWith("/partenaires")) {
      if (path === "/partenaires/garages") return "Garages Partenaires";
      if (path === "/partenaires/controle-technique") return "Centres de Contrôle Technique";
      if (path === "/partenaires/assurances") return "Compagnies d'Assurance";
      if (path === "/partenaires/carte") return "Carte Interactive des Partenaires";
      return "Partenaires";
    }
    
    // Abonnements
    if (path === "/abonnements") return "Gestion des Abonnements";
    
    // Promotions
    if (path === "/promotions") return "Offres & Promotions";
    
    // Finance
    if (path.startsWith("/finance")) {
      if (path === "/finance/revenus") return "Revenus Globaux";
      if (path === "/finance/commissions") return "Commissions Partenaires";
      if (path === "/finance/rapports") return "Rapports Financiers";
      return "Suivi Financier";
    }
    
    // Analytics
    if (path.startsWith("/analytics")) {
      if (path === "/analytics/usage") return "Usage de la Plateforme";
      if (path === "/analytics/performance") return "Performance Globale";
      if (path === "/analytics/comportement") return "Comportement Utilisateurs";
      return "Analytics";
    }
    
    // Autres sections
    if (path === "/paiements") return "Modes de Paiement";
    if (path === "/parrainage") return "Programme de Parrainage";
    if (path === "/features-bonus") return "Fonctionnalités Bonus";
    if (path === "/permissions") return "Permissions & Rôles";
    
      // Outils
  if (path.startsWith("/outils")) {
    if (path === "/outils/api") return "API Externes";
    if (path === "/outils/monitoring") return "Monitoring Système";
    if (path === "/outils/logs") return "Logs Système";
    return "Outils & Intégrations";
  }
    
    // Paramètres
    if (path === "/parametres") return "Paramètres Globaux";
    if (path === "/profile") return "Mon Profil";
    
    // Default
    return "Administration FlotteQ";
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar */}
      <InternalSidebar />
      
      {/* Contenu principal */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Top Navigation */}
        <InternalTopNav title={getPageTitle()} />
        
        {/* Contenu */}
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default InternalLayout; 