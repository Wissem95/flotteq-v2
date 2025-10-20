import { useState } from 'react';
import { X } from 'lucide-react';
import { useCreateMaintenance } from '../../hooks/useMaintenance';
import { useVehicles } from '../../hooks/useVehicles';
import { MaintenanceType } from '../../types/maintenance.types';

interface QuickCreateMaintenanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: Date | null;
}

export default function QuickCreateMaintenanceModal({
  isOpen,
  onClose,
  selectedDate,
}: QuickCreateMaintenanceModalProps) {
  const { data: vehicles = [] } = useVehicles();
  const createMutation = useCreateMaintenance();

  const [formData, setFormData] = useState<{
    vehicleId: string;
    type: MaintenanceType;
    description: string;
    estimatedCost: number;
  }>({
    vehicleId: '',
    type: MaintenanceType.PREVENTIVE,
    description: '',
    estimatedCost: 0,
  });

  if (!isOpen || !selectedDate) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await createMutation.mutateAsync({
        vehicleId: formData.vehicleId,
        type: formData.type,
        description: formData.description,
        scheduledDate: selectedDate.toISOString().split('T')[0],
        estimatedCost: formData.estimatedCost,
      });

      // Reset et fermer
      setFormData({
        vehicleId: '',
        type: MaintenanceType.PREVENTIVE,
        description: '',
        estimatedCost: 0,
      });
      onClose();
    } catch (error) {
      console.error('Error creating maintenance:', error);
      alert('Erreur lors de la création de la maintenance');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Nouvelle maintenance
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date prévue
            </label>
            <input
              type="text"
              value={selectedDate.toLocaleDateString('fr-FR')}
              disabled
              className="w-full rounded-lg border-gray-300 bg-gray-50 text-gray-600"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Véhicule *
            </label>
            <select
              value={formData.vehicleId}
              onChange={(e) => setFormData({ ...formData, vehicleId: e.target.value })}
              required
              className="w-full rounded-lg border-gray-300 focus:border-flotteq-blue focus:ring-flotteq-blue"
            >
              <option value="">Sélectionner un véhicule</option>
              {vehicles.map((vehicle) => (
                <option key={vehicle.id} value={vehicle.id}>
                  {vehicle.registration} - {vehicle.brand} {vehicle.model}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Type *
            </label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as MaintenanceType })}
              required
              className="w-full rounded-lg border-gray-300 focus:border-flotteq-blue focus:ring-flotteq-blue"
            >
              <option value={MaintenanceType.PREVENTIVE}>Préventive</option>
              <option value={MaintenanceType.CORRECTIVE}>Corrective</option>
              <option value={MaintenanceType.INSPECTION}>Contrôle technique</option>
              <option value={MaintenanceType.TIRE_CHANGE}>Changement de pneus</option>
              <option value={MaintenanceType.OIL_CHANGE}>Vidange</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
              rows={3}
              className="w-full rounded-lg border-gray-300 focus:border-flotteq-blue focus:ring-flotteq-blue"
              placeholder="Décrivez la maintenance..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Coût estimé (€) *
            </label>
            <input
              type="number"
              step="0.01"
              value={formData.estimatedCost}
              onChange={(e) => setFormData({ ...formData, estimatedCost: parseFloat(e.target.value) })}
              required
              min="0"
              className="w-full rounded-lg border-gray-300 focus:border-flotteq-blue focus:ring-flotteq-blue"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={createMutation.isPending}
              className="px-4 py-2 bg-flotteq-blue text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {createMutation.isPending ? 'Création...' : 'Créer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
