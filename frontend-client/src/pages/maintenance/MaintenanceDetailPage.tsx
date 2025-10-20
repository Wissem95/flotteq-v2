import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useMaintenance, useUpdateMaintenance, useCreateMaintenance } from '../../hooks/useMaintenance';
import { useVehicles } from '../../hooks/useVehicles';
import { MaintenanceType, MaintenanceStatus } from '../../types/maintenance.types';
import type { CreateMaintenanceDto, UpdateMaintenanceDto } from '../../types/maintenance.types';
import { ArrowLeft, Save, AlertCircle } from 'lucide-react';
import { ProtectedButton } from '@/components/common/ProtectedButton';

export default function MaintenanceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isNew = id === 'new';

  const { data: maintenance, isLoading } = useMaintenance(id || '', { enabled: !isNew && !!id });
  const { data: vehicles = [] } = useVehicles();
  const updateMutation = useUpdateMaintenance();
  const createMutation = useCreateMaintenance();

  const [formData, setFormData] = useState<{
    vehicleId: string;
    type: MaintenanceType;
    description: string;
    scheduledDate: string;
    estimatedCost: number;
    actualCost?: number;
    status: MaintenanceStatus;
    performedBy: string;
    nextMaintenanceKm?: number;
  }>({
    vehicleId: '',
    type: MaintenanceType.PREVENTIVE,
    description: '',
    scheduledDate: '',
    estimatedCost: 0,
    actualCost: undefined,
    status: MaintenanceStatus.SCHEDULED,
    performedBy: '',
    nextMaintenanceKm: undefined,
  });

  useEffect(() => {
    if (maintenance && !isNew) {
      setFormData({
        vehicleId: maintenance.vehicleId,
        type: maintenance.type,
        description: maintenance.description,
        scheduledDate: maintenance.scheduledDate.split('T')[0],
        estimatedCost: Number(maintenance.estimatedCost) || 0,
        actualCost: maintenance.actualCost ? Number(maintenance.actualCost) : undefined,
        status: maintenance.status,
        performedBy: maintenance.performedBy || '',
        nextMaintenanceKm: maintenance.nextMaintenanceKm || undefined,
      });
    }
  }, [maintenance, isNew]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (isNew) {
        const dto: CreateMaintenanceDto = {
          vehicleId: formData.vehicleId,
          type: formData.type,
          description: formData.description,
          scheduledDate: formData.scheduledDate,
          estimatedCost: formData.estimatedCost,
          actualCost: formData.actualCost,
          performedBy: formData.performedBy || undefined,
          nextMaintenanceKm: formData.nextMaintenanceKm,
        };
        await createMutation.mutateAsync(dto);
      } else {
        const dto: UpdateMaintenanceDto = {
          type: formData.type,
          description: formData.description,
          scheduledDate: formData.scheduledDate,
          estimatedCost: Number(formData.estimatedCost),
          status: formData.status,
        };

        // Only add optional fields if they have values
        if (formData.actualCost !== undefined && !isNaN(formData.actualCost)) {
          dto.actualCost = Number(formData.actualCost);
        }
        if (formData.performedBy) dto.performedBy = formData.performedBy;
        if (formData.nextMaintenanceKm !== undefined && !isNaN(formData.nextMaintenanceKm)) {
          dto.nextMaintenanceKm = Number(formData.nextMaintenanceKm);
        }

        await updateMutation.mutateAsync({ id: id!, dto });
      }
      navigate('/maintenances');
    } catch (error: any) {
      console.error('Error saving maintenance:', error);
      console.error('Error response:', error.response?.data);
      alert(`Erreur: ${error.response?.data?.message || error.message}`);
    }
  };

  if (isLoading && !isNew) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Chargement...</div>
      </div>
    );
  }

  const costDifference = formData.actualCost && formData.estimatedCost
    ? formData.actualCost - formData.estimatedCost
    : 0;

  return (
    <div className="max-w-4xl">
      <div className="mb-6">
        <button
          onClick={() => navigate('/maintenances')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="h-5 w-5" />
          Retour
        </button>
        <h1 className="text-2xl font-bold text-gray-900">
          {isNew ? 'Nouvelle maintenance' : 'Modifier la maintenance'}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
          {/* Vehicle Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Véhicule *
            </label>
            <select
              value={formData.vehicleId}
              onChange={(e) => setFormData({ ...formData, vehicleId: e.target.value })}
              required
              disabled={!isNew}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-flotteq-blue focus:border-flotteq-blue disabled:bg-gray-100 disabled:text-gray-500"
            >
              <option value="">Sélectionner un véhicule</option>
              {vehicles.map((vehicle) => (
                <option key={vehicle.id} value={vehicle.id}>
                  {vehicle.registration} - {vehicle.brand} {vehicle.model}
                </option>
              ))}
            </select>
          </div>

          {/* Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Type de maintenance *
            </label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as MaintenanceType })}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-flotteq-blue focus:border-flotteq-blue"
            >
              <option value={MaintenanceType.PREVENTIVE}>Préventive</option>
              <option value={MaintenanceType.CORRECTIVE}>Corrective</option>
              <option value={MaintenanceType.INSPECTION}>Contrôle technique</option>
              <option value={MaintenanceType.TIRE_CHANGE}>Changement de pneus</option>
              <option value={MaintenanceType.OIL_CHANGE}>Vidange</option>
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
              rows={3}
              className="w-full rounded-lg border-gray-300 focus:border-flotteq-blue focus:ring-flotteq-blue"
              placeholder="Décrivez la maintenance à effectuer..."
            />
          </div>

          {/* Date & Status */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date prévue *
              </label>
              <input
                type="date"
                value={formData.scheduledDate}
                onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
                required
                className="w-full rounded-lg border-gray-300 focus:border-flotteq-blue focus:ring-flotteq-blue"
              />
            </div>

            {!isNew && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Statut
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as MaintenanceStatus })}
                  className="w-full rounded-lg border-gray-300 focus:border-flotteq-blue focus:ring-flotteq-blue"
                >
                  <option value={MaintenanceStatus.SCHEDULED}>Planifiée</option>
                  <option value={MaintenanceStatus.IN_PROGRESS}>En cours</option>
                  <option value={MaintenanceStatus.COMPLETED}>Terminée</option>
                  <option value={MaintenanceStatus.CANCELLED}>Annulée</option>
                </select>
              </div>
            )}
          </div>

          {/* Costs */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Coût estimé (€) *
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.estimatedCost}
                onChange={(e) => setFormData({ ...formData, estimatedCost: parseFloat(e.target.value) || 0 })}
                required
                className="w-full rounded-lg border-gray-300 focus:border-flotteq-blue focus:ring-flotteq-blue"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Coût réel (€)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.actualCost ?? ''}
                onChange={(e) => setFormData({ ...formData, actualCost: e.target.value ? (parseFloat(e.target.value) || 0) : undefined })}
                className="w-full rounded-lg border-gray-300 focus:border-flotteq-blue focus:ring-flotteq-blue"
              />
              {costDifference !== 0 && (
                <p className={`text-sm mt-1 ${costDifference > 0 ? 'text-red-600' : 'text-green-600'}`}>
                  {costDifference > 0 ? '+' : ''}{costDifference.toFixed(2)} € vs estimé
                </p>
              )}
            </div>
          </div>

          {/* Performed By & Next KM */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Garage / Mécanicien
              </label>
              <input
                type="text"
                value={formData.performedBy}
                onChange={(e) => setFormData({ ...formData, performedBy: e.target.value })}
                className="w-full rounded-lg border-gray-300 focus:border-flotteq-blue focus:ring-flotteq-blue"
                placeholder="Nom du garage"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Prochaine maintenance à (km)
              </label>
              <input
                type="number"
                value={formData.nextMaintenanceKm || ''}
                onChange={(e) => setFormData({ ...formData, nextMaintenanceKm: e.target.value ? parseInt(e.target.value) : undefined })}
                className="w-full rounded-lg border-gray-300 focus:border-flotteq-blue focus:ring-flotteq-blue"
                placeholder="50000"
              />
            </div>
          </div>

          {/* Cost comparison info */}
          {formData.actualCost && formData.estimatedCost && (
            <div className={`p-4 rounded-lg ${costDifference > 0 ? 'bg-red-50 border border-red-200' : 'bg-green-50 border border-green-200'}`}>
              <div className="flex items-start gap-3">
                <AlertCircle className={`h-5 w-5 mt-0.5 ${costDifference > 0 ? 'text-red-600' : 'text-green-600'}`} />
                <div>
                  <h4 className={`font-medium ${costDifference > 0 ? 'text-red-900' : 'text-green-900'}`}>
                    {costDifference > 0 ? 'Dépassement budgétaire' : 'Économie réalisée'}
                  </h4>
                  <p className={`text-sm mt-1 ${costDifference > 0 ? 'text-red-700' : 'text-green-700'}`}>
                    {costDifference > 0
                      ? `Le coût réel dépasse l'estimation de ${costDifference.toFixed(2)} €`
                      : `Économie de ${Math.abs(costDifference).toFixed(2)} € par rapport à l'estimation`
                    }
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate('/maintenances')}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Annuler
          </button>
          <ProtectedButton
            type="submit"
            disabled={createMutation.isPending || updateMutation.isPending}
            permission={isNew ? "maintenances.create" : "maintenances.update"}
            disabledMessage={isNew ? "Seuls les managers peuvent créer des maintenances" : "Seuls les managers peuvent modifier des maintenances"}
            className="flex items-center gap-2 px-4 py-2 bg-flotteq-blue text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            <Save className="h-5 w-5" />
            {createMutation.isPending || updateMutation.isPending ? 'Enregistrement...' : 'Enregistrer'}
          </ProtectedButton>
        </div>
      </form>
    </div>
  );
}
