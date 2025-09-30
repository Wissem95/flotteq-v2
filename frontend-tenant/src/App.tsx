
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";

import Layout from "./components/layout/Layout";
import TenantSetupModal from "./components/TenantSetupModal";
import { needsTenantSetup, completeTenantSetup, getCurrentUser, type TenantSetupData } from "./services/authService";
import { SubscriptionProvider, useSubscription } from "./contexts/SubscriptionContext";
import SubscriptionManager from "./components/subscriptions/SubscriptionManager";

// Pages publiques
import Login from "./pages/Login";
import VerifyAccount from "./pages/VerifyAccount";
import Logout from "./pages/Logout";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import GoogleCallback from "./pages/GoogleCallback";
import EmailEnterForgotPassword from "./pages/EmailEnterForgotPassword";
import RegisterSuccess from "./pages/RegisterSuccess";
import LoginSuccess from "./pages/LoginSuccess";
import CGU from "./pages/CGU";
import CGUPopup from "./pages/CGUPopup";

// Pages privées
import Dashboard from "./pages/Dashboard";
import VehiclesList from "./pages/VehiclesList";
import VehicleDetail from "./pages/VehicleDetail";
import AddVehicle from "./pages/AddVehicle";
import Notifications from "./pages/Notifications";
import Settings from "./pages/Settings";
import Profile from "./pages/Profile";
import Maintenances from "./pages/Maintenances";
import EditMaintenance from "./pages/EditMaintenance";
import AddMaintenance from "./pages/AddMaintenance";
import VehiclesHistory from "./pages/VehiclesHistory";
import Statistics from "./pages/statistics2";
import UserManagement from "./pages/UserManagement";
import CodeVerification from "./pages/Verification/CodeVerification";
import SaisieVerification from "./pages/Verification/SaisieVerification";
import TrouverGaragePage from "./pages/TrouverGaragePage";
import Transactions from "./pages/Transactions";
import FleetStatus from "./pages/FleetStatus";
import FinancialStatus from "./pages/FinancialStatus";
import NouvelEtatDesLieux from "./pages/EtatDesLieux/NouvelEtatDesLieux";
import HistoriqueEtatDesLieux from "./pages/EtatDesLieux/HistoriqueEtatDesLieux";

// Vérification de l'authentification
const isAuthenticated = () => {
  try {
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user");
    
    return !!(token && user);
  } catch (error) {
    console.error("Erreur vérification authentification:", error);
    return false;
  }
};

const PrivateRoute = ({ children }: { children: JSX.Element }) => {
  const authenticated = isAuthenticated();
  const needsSetup = needsTenantSetup();

  if (!authenticated) {
    return <Navigate to="/login" replace />;
  }

  // Si l'utilisateur a besoin du setup, bloquer la navigation
  if (needsSetup) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Configuration en cours...</p>
          <p className="text-sm text-gray-500 mt-2">
            Veuillez compléter la configuration de votre entreprise pour continuer.
          </p>
        </div>
      </div>
    );
  }

  return children;
};

const queryClient = new QueryClient();

const AppContent = () => {
  const [showSetupModal, setShowSetupModal] = useState(false);
  const { refreshSubscription, checkSubscriptionRequired } = useSubscription();

  useEffect(() => {
    // Vérifier si l'utilisateur connecté a besoin du setup
    const checkSetupNeeded = () => {
      if (isAuthenticated() && needsTenantSetup()) {
        setShowSetupModal(true);
      }
    };

    checkSetupNeeded();

    // Écouter les changements de localStorage pour détecter les nouvelles connexions
    const handleStorageChange = () => {
      checkSetupNeeded();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('focus', checkSetupNeeded);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('focus', checkSetupNeeded);
    };
  }, []);

  const handleSetupComplete = async (data: TenantSetupData) => {
    try {
      await completeTenantSetup(data);
      setShowSetupModal(false);

      // Déclencher une vérification d'abonnement après setup
      setTimeout(async () => {
        await refreshSubscription();
        await checkSubscriptionRequired();
      }, 500); // Petit délai pour laisser le backend se synchroniser

    } catch (error) {
      console.error('Setup failed:', error);
      throw error; // Re-throw pour que le modal affiche l'erreur
    }
  };

  return (
    <>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Routes>
          {/* Racine → register */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/verification" element={<CodeVerification />} />
          <Route path="/verification/saisie" element={<SaisieVerification />} />



          {/* Publiques */}
          <Route path="/login" element={<Login />} />
          <Route path="/VerifyAccount" element={<VerifyAccount />} />
          <Route path="/logout" element={<Logout />} />
          <Route path="/register-success" element={<RegisterSuccess />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/google-callback" element={<GoogleCallback />} />
          <Route path="/Enter-new-password" element={<EmailEnterForgotPassword />} />
          <Route path="/login-success" element={<LoginSuccess />} />
          <Route path="/cgu" element={<CGU />} />
          <Route path="/cgupopup" element={<Layout><CGUPopup /></Layout>} />

          {/* Privées */}
          <Route path="/dashboard" element={<Navigate to="/dashboard/fleet" replace />} />
          <Route path="/dashboard/fleet" element={<PrivateRoute><Layout><FleetStatus /></Layout></PrivateRoute>} />
          <Route path="/dashboard/financial" element={<PrivateRoute><Layout><FinancialStatus /></Layout></PrivateRoute>} />
          <Route path="/vehicles" element={<PrivateRoute><Layout><VehiclesList /></Layout></PrivateRoute>} />
          <Route path="/vehicles/add" element={<PrivateRoute><Layout><AddVehicle /></Layout></PrivateRoute>} />
          <Route path="/vehicle/:id" element={<PrivateRoute><Layout><VehicleDetail /></Layout></PrivateRoute>} />
          <Route path="/vehicles/history" element={<PrivateRoute><Layout><VehiclesHistory /></Layout></PrivateRoute>} />
          <Route path="/vehicles/maintenance" element={<PrivateRoute><Layout><Maintenances /></Layout></PrivateRoute>} />
          <Route path="/vehicles/maintenance/add" element={<PrivateRoute><Layout><AddMaintenance /></Layout></PrivateRoute>} />
          <Route path="/vehicles/maintenance/edit/:id" element={<PrivateRoute><Layout><EditMaintenance /></Layout></PrivateRoute>} />
          <Route path="/vehicles/stats" element={<PrivateRoute><Layout><Statistics /></Layout></PrivateRoute>} />
          <Route path="/trouver-garage" element={<PrivateRoute><Layout><TrouverGaragePage /></Layout></PrivateRoute>} />
          <Route path="/transactions" element={<PrivateRoute><Layout><Transactions /></Layout></PrivateRoute>} />
          <Route path="/notifications" element={<PrivateRoute><Layout><Notifications /></Layout></PrivateRoute>} />
          <Route path="/settings" element={<PrivateRoute><Layout><Settings /></Layout></PrivateRoute>} />
          <Route path="/profile" element={<PrivateRoute><Layout><Profile /></Layout></PrivateRoute>} />
          <Route path="/users" element={<PrivateRoute><Layout><UserManagement /></Layout></PrivateRoute>} />
          <Route path="/users/stats" element={<PrivateRoute><Layout><Statistics /></Layout></PrivateRoute>} />
          <Route path="/etat-des-lieux/nouveau" element={<PrivateRoute><Layout><NouvelEtatDesLieux /></Layout></PrivateRoute>} />
          <Route path="/etat-des-lieux/historique" element={<PrivateRoute><Layout><HistoriqueEtatDesLieux /></Layout></PrivateRoute>} />

          {/* Fallback vers register si non connecté, dashboard si connecté */}
          <Route path="*" element={
            isAuthenticated() ?
            <Navigate to="/dashboard" replace /> :
            <Navigate to="/login" replace />
          } />
        </Routes>

        {/* Modal de setup obligatoire */}
        <TenantSetupModal
          isOpen={showSetupModal}
          onComplete={handleSetupComplete}
        />

        {/* Manager des abonnements - détection automatique */}
        <SubscriptionManager />
      </BrowserRouter>
    </TooltipProvider>
    </>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <SubscriptionProvider autoCheckOnLoad={true}>
      <AppContent />
    </SubscriptionProvider>
  </QueryClientProvider>
);

export default App;

