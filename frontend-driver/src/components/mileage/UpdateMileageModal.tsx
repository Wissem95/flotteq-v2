import { useState, useEffect } from 'react';
import { X, Gauge, AlertTriangle } from 'lucide-react';
import { useUpdateMileage } from '@/hooks/useMileage';

interface UpdateMileageModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentMileage: number;
  vehicleRegistration: string;
}

export default function UpdateMileageModal({
  isOpen,
  onClose,
  currentMileage,
  vehicleRegistration,
}: UpdateMileageModalProps) {
  const [newMileage, setNewMileage] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const updateMutation = useUpdateMileage();

  const difference = newMileage ? parseInt(newMileage) - currentMileage : 0;
  const isValid = newMileage && parseInt(newMileage) > currentMileage;
  const isLargeDifference = difference > 1000;

  useEffect(() => {
    if (isOpen) {
      setNewMileage('');
      setNotes('');
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isValid) {
      return;
    }

    // Confirmation si grosse différence
    if (isLargeDifference) {
      const confirmed = confirm(
        `Attention : Vous allez ajouter ${difference.toLocaleString()} km. Êtes-vous sûr ?`,
      );
      if (!confirmed) return;
    }

    try {
      await updateMutation.mutateAsync({
        mileage: parseInt(newMileage),
        notes: notes.trim() || undefined,
      });
      onClose();
    } catch (error) {
      // Error handled by hook
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-flotteq-light rounded-lg">
              <Gauge className="w-6 h-6 text-flotteq-blue" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Mettre à Jour le Kilométrage</h2>
              <p className="text-sm text-gray-600">Véhicule : {vehicleRegistration}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            disabled={updateMutation.isPending}
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Kilométrage actuel */}
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <p className="text-sm text-gray-600 mb-1">Kilométrage Actuel</p>
            <p className="text-2xl font-bold text-gray-900">
              {currentMileage.toLocaleString()} km
            </p>
          </div>

          {/* Nouveau kilométrage */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nouveau Kilométrage *
            </label>
            <div className="relative">
              <input
                type="number"
                value={newMileage}
                onChange={(e) => setNewMileage(e.target.value)}
                placeholder={`Ex: ${(currentMileage + 100).toString()}`}
                min={currentMileage + 1}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-flotteq-blue focus:border-flotteq-blue text-base min-h-[48px] pr-12 ${
                  newMileage && !isValid ? 'border-red-500' : 'border-gray-300'
                }`}
                required
                disabled={updateMutation.isPending}
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">
                km
              </span>
            </div>

            {newMileage && !isValid && (
              <p className="text-sm text-red-600 mt-2 flex items-center gap-1">
                <AlertTriangle className="w-4 h-4" />
                Le nouveau kilométrage doit être supérieur à {currentMileage.toLocaleString()} km
              </p>
            )}

            {isValid && (
              <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm font-medium text-blue-900">
                  +{difference.toLocaleString()} km depuis le dernier relevé
                </p>
              </div>
            )}

            {isLargeDifference && (
              <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-2">
                <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-yellow-900">Différence importante</p>
                  <p className="text-xs text-yellow-700 mt-1">
                    Une confirmation sera demandée avant validation
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes (optionnel)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ex: Trajet Paris-Lyon, retour de mission..."
              rows={3}
              maxLength={200}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-flotteq-blue focus:border-flotteq-blue text-base resize-none"
              disabled={updateMutation.isPending}
            />
            <p className="text-xs text-gray-500 mt-1">{notes.length}/200 caractères</p>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={updateMutation.isPending}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium min-h-[48px] disabled:opacity-50"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={!isValid || updateMutation.isPending}
              className="flex-1 px-6 py-3 bg-flotteq-blue text-white rounded-lg hover:bg-flotteq-navy transition-colors font-medium min-h-[48px] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {updateMutation.isPending ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Validation...
                </>
              ) : (
                '✓ Valider'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
