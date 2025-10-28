import { useState, useEffect } from 'react';
import { Loader2, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { billingService, type SubscriptionStats } from '@/api/services/billing.service';
import CurrentPlanCard from '@/components/billing/CurrentPlanCard';
import InvoicesTable from '@/components/billing/InvoicesTable';
import PaymentMethodCard from '@/components/billing/PaymentMethodCard';
import UsageAlertBanner from '@/components/billing/UsageAlertBanner';
import UpgradeModal from '@/components/billing/UpgradeModal';

export default function BillingPage() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<SubscriptionStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  useEffect(() => {
    loadSubscriptionStats();
  }, []);

  const loadSubscriptionStats = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await billingService.getSubscriptionStats();
      setStats(data);
    } catch (err: any) {
      console.error('Failed to load subscription stats:', err);
      setError(err.response?.data?.message || 'Erreur de chargement');
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = () => {
    setShowUpgradeModal(true);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-12 w-12 animate-spin text-flotteq-blue" />
        </div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <p className="text-red-700">{error || 'Impossible de charger les informations de facturation'}</p>
          <button
            onClick={() => navigate(-1)}
            className="mt-4 text-flotteq-blue hover:text-flotteq-navy"
          >
            Retour
          </button>
        </div>
      </div>
    );
  }

  const currentPlan = stats.plan;
  const planId = currentPlan ? null : null; // We'd need to get this from stats if available

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
          Retour
        </button>
        <h1 className="text-3xl font-bold text-gray-900">Facturation et abonnement</h1>
        <p className="text-gray-600 mt-2">
          Gérez votre abonnement, consultez vos factures et mettez à jour vos informations de paiement
        </p>
      </div>

      {/* Usage Alert */}
      <UsageAlertBanner stats={stats} onUpgrade={handleUpgrade} />

      {/* Main Content Grid */}
      <div className="mb-6">
        {/* Current Plan */}
        <CurrentPlanCard stats={stats} onUpgrade={handleUpgrade} />
      </div>

      {/* Usage Stats (from existing SubscriptionUsage component) */}
      <div className="mb-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Utilisation du plan</h2>
          <div className="space-y-6">
            {Object.entries(stats.usage).map(([key, value]) => {
              const resourceLabels: Record<string, string> = {
                vehicles: 'Véhicules',
                users: 'Utilisateurs',
                drivers: 'Conducteurs',
              };

              const limit = typeof value.limit === 'number' ? value.limit : '∞';
              const percentage = Math.min(value.percentage, 100);
              const isHigh = percentage >= 80;
              const isCritical = percentage >= 90;

              return (
                <div key={key}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">
                      {resourceLabels[key]}
                    </span>
                    <span className="text-sm font-semibold text-gray-900">
                      {value.current} / {limit}
                    </span>
                  </div>
                  <div className="relative">
                    <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-2 rounded-full transition-all duration-500 ${
                          isCritical
                            ? 'bg-red-500'
                            : isHigh
                            ? 'bg-yellow-500'
                            : 'bg-green-500'
                        }`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span
                      className={`text-xs font-medium mt-1 inline-block ${
                        isCritical
                          ? 'text-red-600'
                          : isHigh
                          ? 'text-yellow-600'
                          : 'text-green-600'
                      }`}
                    >
                      {percentage.toFixed(1)}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Payment Method Section */}
      <div className="mb-6">
        <PaymentMethodCard />
      </div>

      {/* Invoices Table */}
      <InvoicesTable />

      {/* Upgrade Modal */}
      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        currentPlanId={planId || undefined}
      />
    </div>
  );
}
