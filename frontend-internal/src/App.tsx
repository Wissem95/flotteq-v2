// App.tsx - Application principale pour l'interface d'administration FlotteQ

import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";

// Layout
import InternalLayout from "./components/layout/InternalLayout";

// Pages d'authentification
import LoginPage from "./pages/auth/LoginPage";

// Pages principales
import DashboardOverview from "./pages/admin/DashboardOverview";
import GaragesOverview from "./pages/partners/GaragesOverview";
import ControleTechniqueOverview from "./pages/partners/ControleTechniqueOverview";
import AssurancesOverview from "./pages/partners/AssurancesOverview";
import PartnersMap from "./pages/partners/PartnersMap";
import SupportDashboard from "./pages/support/SupportDashboard";
import EmployeesOverview from "./pages/employees/EmployeesOverview";
import SubscriptionsOverview from "./pages/subscriptions/SubscriptionsOverview";
import PlansManagement from "./pages/subscriptions/PlansManagement";
import AnalyticsDashboard from "./pages/analytics/AnalyticsDashboard";
import SystemMonitoring from "./pages/tools/SystemMonitoring";
import GlobalSettings from "./pages/settings/GlobalSettings";
import RolesPermissions from "./pages/permissions/RolesPermissions";
import APIIntegrations from "./pages/tools/APIIntegrations";

// Pages Finance
import FinanceRevenues from "./pages/finance/FinanceRevenues";
import FinanceCommissions from "./pages/finance/FinanceCommissions";
import FinanceReports from "./pages/finance/FinanceReports";

// Pages Promotions
import PromotionsOverview from "./pages/promotions/PromotionsOverview";

// Pages existantes (à conserver)
import AdminRoutes from "./pages/admin/AdminRoutes";

// Pages Dashboard
import TenantsOverview from "./pages/tenants/TenantsOverview";
import SystemAlerts from "./pages/alerts/SystemAlerts";

// Pages Users
import TenantUsersOverview from "./pages/users/TenantUsersOverview";

// Pages Nouvelles
import PaymentMethods from "./pages/payments/PaymentMethods";
import ReferralProgram from "./pages/referral/ReferralProgram";
import FeaturesBonus from "./pages/features/FeaturesBonus";
import ProfilePage from "./pages/profile/ProfilePage";
import FeatureFlags from "./pages/flags/FeatureFlags";

// Hook d'authentification
import { useInternalAuth } from "./hooks/useInternalAuth";

// Configuration TanStack Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// Composant de protection des routes
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useInternalAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <Routes>
            {/* Page de connexion (publique) */}
            <Route path="/login" element={<LoginPage />} />
            
            {/* Routes protégées avec layout */}
            <Route 
              path="/*" 
              element={
                <ProtectedRoute>
                  <InternalLayout>
                    <Routes>
                      {/* Redirection par défaut */}
                      <Route path="/" element={<Navigate to="/dashboard/overview" replace />} />
                      
                      {/* Dashboard */}
                      <Route path="/dashboard/overview" element={<DashboardOverview />} />
                      <Route path="/dashboard/tenants" element={<TenantsOverview />} />
                      <Route path="/dashboard/alerts" element={<SystemAlerts />} />
                      
                      {/* Users - Gestion des utilisateurs */}
                      <Route path="/utilisateurs/tenants" element={<TenantUsersOverview />} />
                      
                      {/* Support */}
                      <Route path="/support" element={<SupportDashboard />} />
                      
                      {/* Employés */}
                      <Route path="/employes" element={<EmployeesOverview />} />
                      
                      {/* Partenaires */}
                      <Route path="/partenaires/garages" element={<GaragesOverview />} />
                      <Route path="/partenaires/controle-technique" element={<ControleTechniqueOverview />} />
                      <Route path="/partenaires/assurances" element={<AssurancesOverview />} />
                      <Route path="/partenaires/carte" element={<PartnersMap />} />
                      
                      {/* Abonnements */}
                      <Route path="/abonnements" element={<SubscriptionsOverview />} />
                      <Route path="/abonnements/plans" element={<PlansManagement />} />
                      
                      {/* Promotions */}
                      <Route path="/promotions" element={<PromotionsOverview />} />
                      
                      {/* Finance */}
                      <Route path="/finance/revenus" element={<FinanceRevenues />} />
                      <Route path="/finance/commissions" element={<FinanceCommissions />} />
                      <Route path="/finance/rapports" element={<FinanceReports />} />
                      
                      {/* Analytics */}
                      <Route path="/analytics/usage" element={<AnalyticsDashboard />} />
                      <Route path="/analytics/performance" element={<AnalyticsDashboard />} />
                      <Route path="/analytics/comportement" element={<AnalyticsDashboard />} />
                      
                      {/* Autres sections */}
                      <Route path="/paiements" element={<PaymentMethods />} />
                      <Route path="/parrainage" element={<ReferralProgram />} />
                      <Route path="/features-bonus" element={<FeaturesBonus />} />
                      <Route path="/permissions" element={<RolesPermissions />} />
                      <Route path="/flags" element={<FeatureFlags />} />
                      
                      {/* Outils */}
                      <Route path="/outils/api" element={<APIIntegrations />} />
                      <Route path="/outils/monitoring" element={<SystemMonitoring />} />
                      <Route path="/outils/logs" element={<SystemMonitoring />} />
                      
                      {/* Paramètres */}
                      <Route path="/parametres" element={<GlobalSettings />} />
                      <Route path="/profile" element={<ProfilePage />} />
                      
                      {/* Routes admin existantes (compatibilité) */}
                      <Route path="/admin/*" element={<AdminRoutes />} />
                      
                      {/* Route 404 */}
                      <Route path="*" element={
                        <div className="p-8 text-center">
                          <h2 className="text-xl font-semibold mb-4">Page non trouvée</h2>
                          <p className="text-gray-600">La page demandée n'existe pas</p>
                        </div>
                      } />
                    </Routes>
                  </InternalLayout>
                </ProtectedRoute>
              } 
            />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;

