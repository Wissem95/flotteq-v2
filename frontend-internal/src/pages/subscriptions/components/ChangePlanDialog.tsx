import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { subscriptionsApi } from '../../../api/endpoints/subscriptions';
import { tenantsApi } from '../../../api/endpoints/tenants';
import type { Subscription } from '../../../api/types/subscription.types';

interface ChangePlanDialogProps {
  subscription: Subscription;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const ChangePlanDialog: React.FC<ChangePlanDialogProps> = ({
  subscription,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [selectedPlanId, setSelectedPlanId] = useState<number | null>(null);

  const { data: plans = [], isLoading } = useQuery({
    queryKey: ['subscriptionPlans'],
    queryFn: subscriptionsApi.getPlans,
    enabled: isOpen,
  });

  const changePlanMutation = useMutation({
    mutationFn: (planId: number) => tenantsApi.changePlan(subscription.tenantId, planId),
    onSuccess: () => {
      onSuccess();
      onClose();
    },
  });

  const currentPlan = subscription.plan;
  const selectedPlan = plans.find(p => p.id === selectedPlanId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedPlanId) {
      changePlanMutation.mutate(selectedPlanId);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold mb-2">Changer le plan d'abonnement</h2>
        <p className="text-sm text-gray-600 mb-6">
          Tenant: <span className="font-medium">{subscription.tenant?.name || `#${subscription.tenantId}`}</span>
          {' '} | Plan actuel: <span className="font-medium">{currentPlan?.name}</span>
        </p>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="text-lg">Chargement des plans...</div>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            {/* Plans Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              {plans
                .filter(plan => plan.isActive)
                .map((plan) => {
                  const isCurrentPlan = plan.id === currentPlan?.id;
                  const isSelected = plan.id === selectedPlanId;
                  const isUpgrade = currentPlan && Number(plan.price) > Number(currentPlan.price);
                  const isDowngrade = currentPlan && Number(plan.price) < Number(currentPlan.price);

                  return (
                    <div
                      key={plan.id}
                      onClick={() => !isCurrentPlan && setSelectedPlanId(plan.id)}
                      className={`
                        relative border-2 rounded-lg p-4 cursor-pointer transition-all
                        ${isCurrentPlan ? 'border-gray-300 bg-gray-50 cursor-not-allowed opacity-60' : ''}
                        ${isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-300'}
                      `}
                    >
                      {/* Badge actuel/upgrade/downgrade */}
                      {isCurrentPlan && (
                        <div className="absolute -top-2 -right-2 bg-gray-500 text-white text-xs px-2 py-1 rounded-full">
                          Actuel
                        </div>
                      )}
                      {isUpgrade && !isCurrentPlan && (
                        <div className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                          Upgrade
                        </div>
                      )}
                      {isDowngrade && !isCurrentPlan && (
                        <div className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs px-2 py-1 rounded-full">
                          Downgrade
                        </div>
                      )}

                      <h3 className="text-lg font-bold mb-2">{plan.name}</h3>
                      <div className="text-2xl font-bold text-blue-600 mb-3">
                        {plan.price === 0 ? (
                          <span className="text-green-600">Gratuit</span>
                        ) : (
                          <>{plan.price}€<span className="text-sm text-gray-600">/mois</span></>
                        )}
                      </div>

                      {/* Limites */}
                      <div className="space-y-1 text-sm text-gray-600 mb-3">
                        <div>🚗 {plan.maxVehicles === -1 ? 'Illimité' : plan.maxVehicles} véhicules</div>
                        <div>👥 {plan.maxUsers === -1 ? 'Illimité' : plan.maxUsers} utilisateurs</div>
                        <div>👤 {plan.maxDrivers === -1 ? 'Illimité' : plan.maxDrivers} conducteurs</div>
                      </div>

                      {/* Selection indicator */}
                      {isSelected && !isCurrentPlan && (
                        <div className="mt-2 flex items-center justify-center">
                          <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </div>
                  );
                })}
            </div>

            {/* Comparison */}
            {selectedPlan && selectedPlan.id !== currentPlan?.id && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <h4 className="font-semibold mb-2">Résumé du changement</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Plan actuel:</span>
                    <span className="font-medium">{currentPlan?.name} ({currentPlan?.price}€/mois)</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Nouveau plan:</span>
                    <span className="font-medium">{selectedPlan.name} ({selectedPlan.price}€/mois)</span>
                  </div>
                  <div className="flex justify-between border-t pt-2">
                    <span>Différence:</span>
                    <span className={`font-bold ${Number(selectedPlan.price) > Number(currentPlan?.price || 0) ? 'text-red-600' : 'text-green-600'}`}>
                      {Number(selectedPlan.price) > Number(currentPlan?.price || 0) ? '+' : ''}
                      {(Number(selectedPlan.price) - Number(currentPlan?.price || 0)).toFixed(2)}€/mois
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={!selectedPlanId || selectedPlanId === currentPlan?.id || changePlanMutation.isPending}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {changePlanMutation.isPending ? 'Changement...' : 'Confirmer le changement'}
              </button>
            </div>

            {changePlanMutation.isError && (
              <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-md">
                Erreur lors du changement de plan
              </div>
            )}
          </form>
        )}
      </div>
    </div>
  );
};
