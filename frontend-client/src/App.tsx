import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import TenantLayout from './layouts/TenantLayout';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import DashboardPage from './pages/DashboardPage';
import OnboardingPage from './pages/onboarding/OnboardingPage';
import VehiclesListPage from './pages/vehicles/VehiclesListPage';
import VehicleDetailPage from './pages/vehicles/VehicleDetailPage';
import DriversListPage from './pages/drivers/DriversListPage';
import DriverDetailPage from './pages/drivers/DriverDetailPage';
import MaintenancesListPage from './pages/maintenance/MaintenancesListPage';
import MaintenanceDetailPage from './pages/maintenance/MaintenanceDetailPage';
import MaintenanceCalendarPage from './pages/maintenance/MaintenanceCalendarPage';
import MaintenanceCalendarDnDPage from './pages/maintenance/MaintenanceCalendarDnDPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />

            {/* Onboarding route (protected but standalone) */}
            <Route
              path="/onboarding"
              element={
                <ProtectedRoute>
                  <OnboardingPage />
                </ProtectedRoute>
              }
            />

            {/* Protected routes */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <TenantLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<DashboardPage />} />
              <Route path="vehicles" element={<VehiclesListPage />} />
              <Route path="vehicles/:id" element={<VehicleDetailPage />} />
              <Route path="drivers" element={<DriversListPage />} />
              <Route path="drivers/:id" element={<DriverDetailPage />} />
              <Route path="maintenances" element={<MaintenancesListPage />} />
              <Route path="maintenances/:id" element={<MaintenanceDetailPage />} />
              <Route path="maintenances/calendar" element={<MaintenanceCalendarPage />} />
              <Route path="maintenances/calendar-interactive" element={<MaintenanceCalendarDnDPage />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
