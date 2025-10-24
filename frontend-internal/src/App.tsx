import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage } from './pages/auth/LoginPage';
import { DashboardPage } from './pages/dashboard/DashboardPage';
import { TenantsListPage } from './pages/tenants/TenantsListPage';
import { TenantDetailPage } from './pages/tenants/TenantDetailPage';
import { TenantFormPage } from './pages/tenants/TenantFormPage';
import { PlansPage } from './pages/subscriptions/PlansPage';
import { ActiveSubscriptionsPage } from './pages/subscriptions/ActiveSubscriptionsPage';
import { UsersListPage } from './pages/users/UsersListPage';
import { VehiclesListPage } from './pages/vehicles/VehiclesListPage';
import { DriversListPage } from './pages/drivers/DriversListPage';
import { PartnersListPage } from './pages/partners/PartnersListPage';
import { CommissionsDashboardPage } from './pages/commissions/CommissionsDashboardPage';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { MainLayout } from './components/layout/MainLayout';
import { Toaster } from './components/ui/toaster';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            element={
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/tenants" element={<TenantsListPage />} />
            <Route path="/tenants/:id" element={<TenantDetailPage />} />
            <Route path="/tenants/:id/edit" element={<TenantFormPage />} />
            <Route path="/subscriptions/plans" element={<PlansPage />} />
            <Route path="/subscriptions/active" element={<ActiveSubscriptionsPage />} />
            <Route path="/users" element={<UsersListPage />} />
            <Route path="/vehicles" element={<VehiclesListPage />} />
            <Route path="/drivers" element={<DriversListPage />} />
            <Route path="/partners" element={<PartnersListPage />} />
            <Route path="/commissions" element={<CommissionsDashboardPage />} />
          </Route>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
