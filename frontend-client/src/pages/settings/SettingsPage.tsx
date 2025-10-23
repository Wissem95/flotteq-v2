import { useState, useEffect } from 'react';
import { User, CreditCard, Building2, Mail, Shield, ExternalLink } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { api } from '@/config/api';

interface SubscriptionInfo {
  plan: {
    id: number;
    name: string;
    price: number;
    maxVehicles: number;
    maxUsers: number;
    maxDrivers: number;
  };
  status: string;
  currentPeriodEnd?: Date;
}

interface Invoice {
  id: string;
  amountPaid: number;
  currency: string;
  status: string;
  pdfUrl: string;
  number: string;
  created: Date;
}

type TabType = 'account' | 'subscription';

export default function SettingsPage() {
  const { user, tenant } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('account');
  const [subscription, setSubscription] = useState<SubscriptionInfo | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoadingPortal, setIsLoadingPortal] = useState(false);

  useEffect(() => {
    if (activeTab === 'subscription') {
      fetchSubscriptionInfo();
      fetchInvoices();
    }
  }, [activeTab]);

  const fetchSubscriptionInfo = async () => {
    try {
      const response = await api.get('/subscriptions/current');
      setSubscription(response.data);
    } catch (error) {
      console.error('Failed to fetch subscription:', error);
    }
  };

  const fetchInvoices = async () => {
    try {
      const response = await api.get('/billing/invoices');
      setInvoices(response.data);
    } catch (error) {
      console.error('Failed to fetch invoices:', error);
    }
  };

  const handleManageSubscription = async () => {
    setIsLoadingPortal(true);
    try {
      const response = await api.post('/stripe/create-portal-session');
      window.location.href = response.data.url;
    } catch (error) {
      toast.error('Erreur lors de l\'ouverture du portail de facturation');
      setIsLoadingPortal(false);
    }
  };

  const tabs = [
    { id: 'account' as TabType, label: 'Mon compte', icon: User },
    { id: 'subscription' as TabType, label: 'Abonnement', icon: CreditCard },
  ];

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Paramètres</h1>
        <p className="mt-2 text-gray-600">Gérez votre compte et votre abonnement</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors
                  ${activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                `}
              >
                <Icon className="h-5 w-5" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Account Tab */}
      {activeTab === 'account' && (
        <div className="space-y-6">
          {/* User Info Card */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <User className="h-5 w-5" />
              Informations personnelles
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Prénom</label>
                <div className="text-gray-900">{user?.firstName}</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
                <div className="text-gray-900">{user?.lastName}</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Email
                </label>
                <div className="text-gray-900">{user?.email}</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Rôle
                </label>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {user?.role === 'tenant_admin' ? 'Administrateur' :
                   user?.role === 'super_admin' ? 'Super Admin' : 'Utilisateur'}
                </span>
              </div>
            </div>
          </div>

          {/* Tenant Info Card */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Informations entreprise
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nom de l'entreprise</label>
                <div className="text-gray-900">{tenant?.name}</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email entreprise</label>
                <div className="text-gray-900">{tenant?.email}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Subscription Tab */}
      {activeTab === 'subscription' && (
        <div className="space-y-6">
          {/* Current Plan Card */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-200 p-6">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-2">Plan actuel</h2>
                {subscription ? (
                  <>
                    <div className="text-3xl font-bold text-blue-600 mb-4">
                      {subscription.plan.name}
                    </div>
                    <div className="space-y-2 text-sm text-gray-700">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Prix:</span>
                        <span>{subscription.plan.price.toFixed(2)}€/mois</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Statut:</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          subscription.status === 'active'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {subscription.status === 'active' ? 'Actif' : subscription.status}
                        </span>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="text-gray-600">Chargement...</div>
                )}
              </div>
              <button
                onClick={handleManageSubscription}
                disabled={isLoadingPortal}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                <CreditCard className="h-4 w-4" />
                {isLoadingPortal ? 'Chargement...' : 'Gérer l\'abonnement'}
                <ExternalLink className="h-4 w-4" />
              </button>
            </div>

            {subscription && (
              <div className="mt-6 pt-6 border-t border-blue-200">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Limites du plan</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-white/60 rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold text-blue-600">{subscription.plan.maxVehicles}</div>
                    <div className="text-xs text-gray-600 mt-1">Véhicules max</div>
                  </div>
                  <div className="bg-white/60 rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold text-blue-600">{subscription.plan.maxUsers}</div>
                    <div className="text-xs text-gray-600 mt-1">Utilisateurs max</div>
                  </div>
                  <div className="bg-white/60 rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold text-blue-600">{subscription.plan.maxDrivers}</div>
                    <div className="text-xs text-gray-600 mt-1">Conducteurs max</div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Invoices Card */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Factures</h2>
            {invoices.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Numéro
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Montant
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Statut
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {invoices.map((invoice) => (
                      <tr key={invoice.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {invoice.number}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(invoice.created).toLocaleDateString('fr-FR')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {(invoice.amountPaid / 100).toFixed(2)} {invoice.currency.toUpperCase()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                            invoice.status === 'paid'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {invoice.status === 'paid' ? 'Payée' : invoice.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <a
                            href={invoice.pdfUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
                          >
                            Télécharger
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                Aucune facture disponible
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
