import React from 'react';
import { useForm } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import { subscriptionsApi } from '../../../api/endpoints/subscriptions';
import type { SubscriptionPlan, UpdatePlanDto } from '../../../api/types/subscription.types';

interface EditPlanDialogProps {
  plan: SubscriptionPlan;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const EditPlanDialog: React.FC<EditPlanDialogProps> = ({
  plan,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { register, handleSubmit, formState: { errors } } = useForm<UpdatePlanDto>({
    defaultValues: {
      name: plan.name,
      price: plan.price,
      maxVehicles: plan.maxVehicles,
      maxUsers: plan.maxUsers,
      maxDrivers: plan.maxDrivers,
      isActive: plan.isActive,
      trialDays: plan.trialDays,
    },
  });

  const [featuresInput, setFeaturesInput] = React.useState(plan.features.join('\n'));

  const updateMutation = useMutation({
    mutationFn: (data: UpdatePlanDto) => subscriptionsApi.updatePlan(plan.id, data),
    onSuccess: () => {
      onSuccess();
    },
  });

  const onSubmit = (data: UpdatePlanDto) => {
    const features = featuresInput
      .split('\n')
      .map(f => f.trim())
      .filter(f => f.length > 0);

    // Convertir les strings en numbers pour éviter les erreurs de validation backend
    updateMutation.mutate({
      ...data,
      price: data.price ? Number(data.price) : undefined,
      maxVehicles: data.maxVehicles !== undefined ? Number(data.maxVehicles) : undefined,
      maxUsers: data.maxUsers !== undefined ? Number(data.maxUsers) : undefined,
      maxDrivers: data.maxDrivers !== undefined ? Number(data.maxDrivers) : undefined,
      trialDays: data.trialDays !== undefined ? Number(data.trialDays) : undefined,
      features,
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold mb-6">Éditer le plan "{plan.name}"</h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nom du plan *
            </label>
            <input
              {...register('name', { required: 'Le nom est requis' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
            )}
          </div>

          {/* Price & Trial */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Prix (€/mois) *
              </label>
              <input
                type="number"
                step="0.01"
                {...register('price', { required: true, min: 0 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Jours d'essai
              </label>
              <input
                type="number"
                {...register('trialDays', { min: 0 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Limits */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Max véhicules
              </label>
              <input
                type="number"
                {...register('maxVehicles', { min: -1 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
              <p className="mt-1 text-xs text-gray-500">-1 = illimité</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Max utilisateurs
              </label>
              <input
                type="number"
                {...register('maxUsers', { min: -1 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
              <p className="mt-1 text-xs text-gray-500">-1 = illimité</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Max conducteurs
              </label>
              <input
                type="number"
                {...register('maxDrivers', { min: -1 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
              <p className="mt-1 text-xs text-gray-500">-1 = illimité</p>
            </div>
          </div>

          {/* Features */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fonctionnalités
            </label>
            <textarea
              value={featuresInput}
              onChange={(e) => setFeaturesInput(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              rows={4}
              placeholder="Une fonctionnalité par ligne"
            />
          </div>

          {/* Is Active */}
          <div className="flex items-center">
            <input
              type="checkbox"
              {...register('isActive')}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label className="ml-2 text-sm text-gray-700">
              Plan actif (visible pour les nouveaux tenants)
            </label>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={updateMutation.isPending}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {updateMutation.isPending ? 'Enregistrement...' : 'Enregistrer'}
            </button>
          </div>

          {updateMutation.isError && (
            <div className="p-3 bg-red-50 text-red-700 rounded-md">
              Erreur lors de la mise à jour du plan
            </div>
          )}
        </form>
      </div>
    </div>
  );
};
