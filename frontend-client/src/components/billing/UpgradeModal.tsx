import { useState, useEffect } from 'react';
import { X, Check, Loader2 } from 'lucide-react';
import { subscriptionsService, type SubscriptionPlan } from '@/api/services/subscriptions.service';
import { billingService } from '@/api/services/billing.service';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPlanId?: number;
}

export default function UpgradeModal({ isOpen, onClose, currentPlanId }: UpgradeModalProps) {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [upgrading, setUpgrading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadPlans();
    }
  }, [isOpen]);

  const loadPlans = async () => {
    try {
      setLoading(true);
      const data = await subscriptionsService.getPlans();
      setPlans(data.filter(p => p.price > 0)); // Exclude free plan
    } catch (error) {
      console.error('Failed to load plans:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = async (planId: number) => {
    try {
      setUpgrading(true);
      const { url } = await billingService.createCheckoutSession(planId);
      window.location.href = url; // Redirect to Stripe Checkout
    } catch (error: any) {
      console.error('Failed to create checkout session:', error);
      alert(error.response?.data?.message || 'Échec de création de la session de paiement');
      setUpgrading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-xl shadow-xl max-w-5xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Choisir un plan</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={upgrading}
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-flotteq-blue" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {plans.map((plan) => {
                const isCurrent = plan.id === currentPlanId;
                const isRecommended = plan.name.toLowerCase().includes('professional');

                return (
                  <div
                    key={plan.id}
                    className={`relative border-2 rounded-xl p-6 ${
                      isRecommended
                        ? 'border-flotteq-blue shadow-lg'
                        : 'border-gray-200'
                    } ${isCurrent ? 'bg-gray-50' : 'bg-white'}`}
                  >
                    {isRecommended && (
                      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                        <span className="bg-flotteq-blue text-white px-4 py-1 rounded-full text-xs font-medium">
                          Recommandé
                        </span>
                      </div>
                    )}

                    {isCurrent && (
                      <div className="absolute -top-3 right-4">
                        <span className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-medium">
                          Plan actuel
                        </span>
                      </div>
                    )}

                    <div className="text-center mb-6">
                      <h3 className="text-xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                      <div className="text-3xl font-bold text-flotteq-blue">
                        {plan.price}€
                        <span className="text-base font-normal text-gray-500">/mois</span>
                      </div>
                    </div>

                    <ul className="space-y-3 mb-6">
                      <li className="flex items-start gap-2 text-sm text-gray-700">
                        <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <span>
                          {plan.maxVehicles === -1
                            ? 'Véhicules illimités'
                            : `Jusqu'à ${plan.maxVehicles} véhicules`}
                        </span>
                      </li>
                      <li className="flex items-start gap-2 text-sm text-gray-700">
                        <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <span>
                          {plan.maxUsers === -1
                            ? 'Utilisateurs illimités'
                            : `Jusqu'à ${plan.maxUsers} utilisateurs`}
                        </span>
                      </li>
                      <li className="flex items-start gap-2 text-sm text-gray-700">
                        <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <span>
                          {plan.maxDrivers === -1
                            ? 'Conducteurs illimités'
                            : `Jusqu'à ${plan.maxDrivers} conducteurs`}
                        </span>
                      </li>
                    </ul>

                    <button
                      onClick={() => handleUpgrade(plan.id)}
                      disabled={isCurrent || upgrading}
                      className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                        isCurrent
                          ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                          : isRecommended
                          ? 'bg-flotteq-blue text-white hover:bg-flotteq-navy'
                          : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                      }`}
                    >
                      {upgrading ? (
                        <div className="flex items-center justify-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Chargement...
                        </div>
                      ) : isCurrent ? (
                        'Plan actuel'
                      ) : (
                        'Choisir ce plan'
                      )}
                    </button>

                    {plan.trialDays > 0 && !isCurrent && (
                      <p className="text-xs text-center text-gray-500 mt-3">
                        {plan.trialDays} jours d'essai gratuit
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
