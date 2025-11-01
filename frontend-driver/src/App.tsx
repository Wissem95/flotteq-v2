import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import DriverLayout from './layouts/DriverLayout';
import LoginPage from './pages/auth/LoginPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import DriverDashboard from './pages/DriverDashboard';
import ProfilePage from './pages/profile/ProfilePage';
import DocumentsPage from './pages/documents/DocumentsPage';
import MyReportsPage from './pages/reports/MyReportsPage';
import VehicleCheckPage from './pages/VehicleCheckPage';
import VehicleMileagePage from './pages/vehicle/VehicleMileagePage';
import { StartTripPage } from './pages/trips/StartTripPage';
import { EndTripPage } from './pages/trips/EndTripPage';
import { TripsPage } from './pages/trips/TripsPage';

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
        <BrowserRouter>
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />

            {/* Protected driver routes */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <DriverLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<DriverDashboard />} />
              <Route path="profile" element={<ProfilePage />} />
              <Route path="documents" element={<DocumentsPage />} />
              <Route path="reports" element={<MyReportsPage />} />
              <Route path="vehicle-check" element={<VehicleCheckPage />} />
              <Route path="vehicle/mileage" element={<VehicleMileagePage />} />
              <Route path="trips" element={<TripsPage />} />
              <Route path="trips/start" element={<StartTripPage />} />
              <Route path="trips/:tripId/end" element={<EndTripPage />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
