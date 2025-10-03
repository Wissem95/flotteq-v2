import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { subscriptionsApi } from '../../api/endpoints/subscriptions';
import type { SubscriptionPlan, CreatePlanDto, UpdatePlanDto } from '../../api/types/subscription.types';
import { CreatePlanDialog } from './components/CreatePlanDialog';
import { EditPlanDialog } from './components/EditPlanDialog';

export const PlansPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null);

  const { data: plans = [], isLoading } = useQuery({
    queryKey: ['subscriptionPlans'],
    queryFn: subscriptionsApi.getPlans,
  });

  const deleteMutation = useMutation({
    mutationFn: subscriptionsApi.deletePlan,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscriptionPlans'] });
    },
  });

  const toggleActiveMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: number; isActive: boolean }) =>
      subscriptionsApi.updatePlan(id, { isActive: !isActive }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscriptionPlans'] });
    },
  });

  const handleDelete = (id: number) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce plan ?')) {
      deleteMutation.mutate(id);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Plans d'abonnement</h1>
          <p className="mt-1 text-sm text-gray-600">
            Gérez les plans disponibles pour vos tenants
          </p>
        </div>
        <button
          onClick={() => setIsCreateOpen(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          + Nouveau Plan
        </button>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow"
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-xl font-bold text-gray-900">{plan.name}</h3>
                <div className="mt-1">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      plan.isActive
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {plan.isActive ? 'Actif' : 'Inactif'}
                  </span>
                </div>
              </div>
            </div>

            {/* Price */}
            <div className="mb-6">
              <div className="flex items-baseline">
                <span className="text-4xl font-bold text-gray-900">{plan.price}€</span>
                <span className="ml-2 text-gray-600">/mois</span>
              </div>
              {plan.trialDays > 0 && (
                <p className="mt-2 text-sm text-gray-600">
                  {plan.trialDays} jours d'essai gratuit
                </p>
              )}
            </div>

            {/* Limits */}
            <div className="space-y-2 mb-6 pb-6 border-b border-gray-200">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Véhicules</span>
                <span className="font-semibold text-gray-900">
                  {plan.maxVehicles === -1 ? 'Illimité' : plan.maxVehicles}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Utilisateurs</span>
                <span className="font-semibold text-gray-900">
                  {plan.maxUsers === -1 ? 'Illimité' : plan.maxUsers}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Conducteurs</span>
                <span className="font-semibold text-gray-900">
                  {plan.maxDrivers === -1 ? 'Illimité' : plan.maxDrivers}
                </span>
              </div>
            </div>

            {/* Features */}
            <div className="mb-6">
              <h4 className="text-sm font-semibold text-gray-900 mb-2">Fonctionnalités</h4>
              <ul className="space-y-1.5">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start text-sm text-gray-600">
                    <svg
                      className="w-4 h-4 text-green-500 mt-0.5 mr-2 flex-shrink-0"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <button
                onClick={() => setEditingPlan(plan)}
                className="flex-1 px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100 transition-colors"
              >
                Éditer
              </button>
              <button
                onClick={() => toggleActiveMutation.mutate({ id: plan.id, isActive: plan.isActive })}
                className="flex-1 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
              >
                {plan.isActive ? 'Désactiver' : 'Activer'}
              </button>
              <button
                onClick={() => handleDelete(plan.id)}
                className="px-3 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-md hover:bg-red-100 transition-colors"
              >
                Supprimer
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {plans.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">Aucun plan d'abonnement</p>
          <button
            onClick={() => setIsCreateOpen(true)}
            className="mt-4 text-blue-600 hover:text-blue-700"
          >
            Créer le premier plan
          </button>
        </div>
      )}

      {/* Dialogs */}
      <CreatePlanDialog
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSuccess={() => {
          setIsCreateOpen(false);
          queryClient.invalidateQueries({ queryKey: ['subscriptionPlans'] });
        }}
      />

      {editingPlan && (
        <EditPlanDialog
          plan={editingPlan}
          isOpen={!!editingPlan}
          onClose={() => setEditingPlan(null)}
          onSuccess={() => {
            setEditingPlan(null);
            queryClient.invalidateQueries({ queryKey: ['subscriptionPlans'] });
          }}
        />
      )}
    </div>
  );
};
