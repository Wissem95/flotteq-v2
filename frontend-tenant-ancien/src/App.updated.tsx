import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Layout from "./components/layout/Layout";

// Subscription context and manager
import { SubscriptionProvider } from "./contexts/SubscriptionContext";
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
  return authenticated ? children : <Navigate to="/register" replace />;
};

// Component wrapper for authenticated routes with subscription
const AuthenticatedRoute = ({ children }: { children: JSX.Element }) => (
  <SubscriptionProvider autoCheckOnLoad={true}>
    <PrivateRoute>
      <>
        {children}
        <SubscriptionManager />
      </>
    </PrivateRoute>
  </SubscriptionProvider>
);

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Routes>
          {/* Racine → login */}
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

          {/* Privées avec gestion d'abonnement */}
          <Route path="/dashboard" element={<Navigate to="/dashboard/fleet" replace />} />
          <Route path="/dashboard/fleet" element={<AuthenticatedRoute><Layout><FleetStatus /></Layout></AuthenticatedRoute>} />
          <Route path="/dashboard/financial" element={<AuthenticatedRoute><Layout><FinancialStatus /></Layout></AuthenticatedRoute>} />
          <Route path="/vehicles" element={<AuthenticatedRoute><Layout><VehiclesList /></Layout></AuthenticatedRoute>} />
          <Route path="/vehicles/add" element={<AuthenticatedRoute><Layout><AddVehicle /></Layout></AuthenticatedRoute>} />
          <Route path="/vehicle/:id" element={<AuthenticatedRoute><Layout><VehicleDetail /></Layout></AuthenticatedRoute>} />
          <Route path="/vehicles/history" element={<AuthenticatedRoute><Layout><VehiclesHistory /></Layout></AuthenticatedRoute>} />
          <Route path="/vehicles/maintenance" element={<AuthenticatedRoute><Layout><Maintenances /></Layout></AuthenticatedRoute>} />
          <Route path="/vehicles/maintenance/add" element={<AuthenticatedRoute><Layout><AddMaintenance /></Layout></AuthenticatedRoute>} />
          <Route path="/vehicles/maintenance/edit/:id" element={<AuthenticatedRoute><Layout><EditMaintenance /></Layout></AuthenticatedRoute>} />
          <Route path="/vehicles/stats" element={<AuthenticatedRoute><Layout><Statistics /></Layout></AuthenticatedRoute>} />
          <Route path="/trouver-garage" element={<AuthenticatedRoute><Layout><TrouverGaragePage /></Layout></AuthenticatedRoute>} />
          <Route path="/transactions" element={<AuthenticatedRoute><Layout><Transactions /></Layout></AuthenticatedRoute>} />
          <Route path="/notifications" element={<AuthenticatedRoute><Layout><Notifications /></Layout></AuthenticatedRoute>} />
          <Route path="/settings" element={<AuthenticatedRoute><Layout><Settings /></Layout></AuthenticatedRoute>} />
          <Route path="/profile" element={<AuthenticatedRoute><Layout><Profile /></Layout></AuthenticatedRoute>} />
          <Route path="/users" element={<AuthenticatedRoute><Layout><UserManagement /></Layout></AuthenticatedRoute>} />
          <Route path="/users/stats" element={<AuthenticatedRoute><Layout><Statistics /></Layout></AuthenticatedRoute>} />
          <Route path="/etat-des-lieux/nouveau" element={<AuthenticatedRoute><Layout><NouvelEtatDesLieux /></Layout></AuthenticatedRoute>} />
          <Route path="/etat-des-lieux/historique" element={<AuthenticatedRoute><Layout><HistoriqueEtatDesLieux /></Layout></AuthenticatedRoute>} />

          {/* Fallback vers login si non connecté, dashboard si connecté */}
          <Route path="*" element={
            isAuthenticated() ? 
            <Navigate to="/dashboard" replace /> : 
            <Navigate to="/login" replace />
          } />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;