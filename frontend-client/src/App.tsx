import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import TenantLayout from './layouts/TenantLayout';
import { ResponsiveTest } from './components/ResponsiveTest';
import { ShadcnTest } from './components/ShadcnTest';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import AcceptInvitationPage from './pages/auth/AcceptInvitationPage';
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
import { DocumentsPage } from './pages/documents/DocumentsPage';
import { UsersPage } from './pages/users/UsersPage';
import BillingPage from './pages/billing/BillingPage';
import CheckoutSuccessPage from './pages/billing/CheckoutSuccessPage';
import SettingsPage from './pages/settings/SettingsPage';
import MarketplacePage from './pages/marketplace/MarketplacePage';
import PartnerDetailPage from './pages/marketplace/PartnerDetailPage';
import MyBookingsPage from './pages/bookings/MyBookingsPage';
import BookingDetailPage from './pages/bookings/BookingDetailPage';
import BookingFlowPage from './pages/bookings/BookingFlowPage';
import BookingsCalendarPage from './pages/bookings/BookingsCalendarPage';
import { TripsHistoryPage } from './pages/trips/TripsHistoryPage';
import { TripsReportsPage } from './pages/trips/TripsReportsPage';

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
        <Toaster position="top-right" richColors closeButton />
        {/* Composants de test - à supprimer après validation */}
        {import.meta.env.DEV && (
          <>
            <ResponsiveTest />
            <ShadcnTest />
          </>
        )}
        <BrowserRouter>
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/accept-invitation" element={<AcceptInvitationPage />} />
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
              <Route path="trips-history" element={<TripsHistoryPage />} />
              <Route path="trips-reports" element={<TripsReportsPage />} />
              <Route path="maintenances" element={<MaintenancesListPage />} />
              <Route path="maintenances/:id" element={<MaintenanceDetailPage />} />
              <Route path="maintenances/calendar" element={<MaintenanceCalendarPage />} />
              <Route path="maintenances/calendar-interactive" element={<MaintenanceCalendarDnDPage />} />
              <Route path="documents" element={<DocumentsPage />} />
              <Route path="users" element={<UsersPage />} />
              <Route path="billing" element={<BillingPage />} />
              <Route path="billing/success" element={<CheckoutSuccessPage />} />
              <Route path="settings" element={<SettingsPage />} />
              <Route path="marketplace" element={<MarketplacePage />} />
              <Route path="marketplace/:partnerId" element={<PartnerDetailPage />} />
              <Route path="my-bookings" element={<MyBookingsPage />} />
              <Route path="my-bookings/:id" element={<BookingDetailPage />} />
              <Route path="bookings/calendar" element={<BookingsCalendarPage />} />
              <Route path="booking/new/:partnerId/:serviceId?" element={<BookingFlowPage />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
