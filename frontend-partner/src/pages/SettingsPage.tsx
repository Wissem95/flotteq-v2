import { useState, useEffect } from 'react';
import { CheckCircle, CreditCard, AlertCircle, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { useAuthStore } from '../stores/authStore';
import axiosInstance from '../lib/axios';

interface StripeStatus {
  completed: boolean;
  accountId?: string;
  chargesEnabled?: boolean;
  payoutsEnabled?: boolean;
}

export default function SettingsPage() {
  const { user } = useAuthStore();
  const [stripeStatus, setStripeStatus] = useState<StripeStatus | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    fetchStripeStatus();

    // Gérer retour Stripe
    const params = new URLSearchParams(window.location.search);
    const stripe = params.get('stripe');

    if (stripe === 'success') {
      toast.success('Configuration Stripe terminée avec succès !');
      fetchStripeStatus();
      window.history.replaceState({}, '', '/settings');
    } else if (stripe === 'refresh') {
      toast.info('Session expirée, veuillez réessayer');
      window.history.replaceState({}, '', '/settings');
    }
  }, []);

  const fetchStripeStatus = async () => {
    try {
      const response = await axiosInstance.get('/api/partners/me/stripe/status');
      setStripeStatus(response.data);
    } catch (error) {
      console.error('Error fetching Stripe status:', error);
    }
  };

  const handleOnboard = async () => {
    setIsLoading(true);
    try {
      const response = await axiosInstance.post('/api/partners/me/stripe/onboard');
      window.location.href = response.data.url; // Redirect to Stripe
    } catch (error: any) {
      if (error.response?.status === 400 && error.response?.data?.message?.includes('already exists')) {
        toast.error('Compte Stripe déjà créé. Utilisez "Continuer configuration" ci-dessous.');
      } else {
        toast.error('Erreur lors de la configuration Stripe');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      const response = await axiosInstance.post('/api/partners/me/stripe/refresh');
      window.location.href = response.data.url;
    } catch (error) {
      toast.error('Erreur lors de la création du lien');
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Paramètres</h1>

      {/* Stripe Onboarding Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
        <div className="flex items-start gap-4">
          <div className={`p-3 rounded-lg ${
            stripeStatus?.completed ? 'bg-green-50' : 'bg-blue-50'
          }`}>
            <CreditCard className={`h-6 w-6 ${
              stripeStatus?.completed ? 'text-green-600' : 'text-blue-600'
            }`} />
          </div>

          <div className="flex-1">
            <h2 className="text-lg font-semibold mb-2">
              Paiements automatiques
            </h2>

            {stripeStatus?.completed ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle className="h-5 w-5" />
                  <span className="font-medium">Paiements activés</span>
                </div>
                <p className="text-sm text-gray-600">
                  Vous recevrez automatiquement 90% du montant de chaque réservation payée par vos clients.
                  FlotteQ prélève une commission de 10%.
                </p>
                <div className="text-xs text-gray-500">
                  ID Compte: {stripeStatus.accountId}
                </div>
              </div>
            ) : stripeStatus?.accountId ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-orange-600">
                  <AlertCircle className="h-5 w-5" />
                  <span className="font-medium">Configuration incomplète</span>
                </div>
                <p className="text-sm text-gray-600 mb-3">
                  Terminez votre configuration Stripe pour recevoir vos paiements.
                </p>
                <button
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                  className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 transition-colors flex items-center gap-2"
                >
                  <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                  {isRefreshing ? 'Chargement...' : 'Continuer la configuration'}
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-gray-600">
                  Connectez votre compte bancaire pour recevoir automatiquement vos paiements
                  après chaque service terminé.
                </p>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800">
                  <strong>Comment ça marche ?</strong>
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>Client paie 100€ pour un service</li>
                    <li>Vous recevez automatiquement 90€</li>
                    <li>FlotteQ garde 10€ de commission</li>
                    <li>Argent disponible sous 2-7 jours</li>
                  </ul>
                </div>
                <button
                  onClick={handleOnboard}
                  disabled={isLoading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                  {isLoading ? 'Chargement...' : '🔗 Connecter mon compte bancaire'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Account Info Card */}
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Informations du compte</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Entreprise</label>
            <p className="mt-1 text-sm text-gray-900">{user?.companyName}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <p className="mt-1 text-sm text-gray-900">{user?.email}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Statut</label>
            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
              user?.status === 'approved' ? 'bg-green-100 text-green-800' :
              user?.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
              'bg-red-100 text-red-800'
            }`}>
              {user?.status === 'approved' ? 'Approuvé' :
               user?.status === 'pending' ? 'En attente' :
               user?.status === 'rejected' ? 'Rejeté' : 'Suspendu'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
