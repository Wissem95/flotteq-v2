import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, isAuthenticated, loading } = useAuth();
  const [redirectCountdown, setRedirectCountdown] = useState(3);

  useEffect(() => {
    // Si l'utilisateur est authentifié mais n'est pas un chauffeur
    if (isAuthenticated && user && user.role !== 'driver') {

      // Démarrer le compte à rebours
      const countdown = setInterval(() => {
        setRedirectCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(countdown);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(countdown);
    }
  }, [isAuthenticated, user]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div role="status" className="inline-block animate-spin rounded-full h-16 w-16 border-b-4 border-flotteq-blue"></div>
          <p className="mt-4 text-lg text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Vérifier le rôle driver
  if (user && user.role !== 'driver') {
    if (redirectCountdown === 0) {
      return <Navigate to="/login" replace />;
    }

    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="mb-6">
            <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-3">
            Accès non autorisé
          </h2>

          <p className="text-lg text-gray-600 mb-6">
            Cette application est réservée aux chauffeurs uniquement.
          </p>

          <div className="bg-blue-50 rounded-lg p-4 mb-4">
            <p className="text-base text-blue-900">
              Redirection vers la page de connexion dans <span className="font-bold text-xl">{redirectCountdown}</span> seconde{redirectCountdown > 1 ? 's' : ''}...
            </p>
          </div>

          <p className="text-sm text-gray-500">
            Votre rôle actuel : <span className="font-semibold">{user.role}</span>
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
