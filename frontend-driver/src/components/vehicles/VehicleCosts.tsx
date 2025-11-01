import { useQuery } from '@tanstack/react-query';
import { vehiclesService } from '../../api/services/vehicles.service';

interface VehicleCostsProps {
  vehicleId: string;
}

const maintenanceTypeLabels: Record<string, string> = {
  'preventive': 'Préventive',
  'corrective': 'Corrective',
  'inspection': 'Contrôle technique',
  'tire_change': 'Changement de pneus',
  'oil_change': 'Vidange',
};

export default function VehicleCosts({ vehicleId }: VehicleCostsProps) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['vehicle-costs', vehicleId],
    queryFn: () => vehiclesService.getVehicleCostAnalysis(vehicleId),
  });

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <p className="text-red-600">Erreur lors du chargement des coûts</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Métriques principales */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <p className="text-sm font-medium text-gray-500">Coût total de possession</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">
            {data?.totalOwnershipCost.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <p className="text-sm font-medium text-gray-500">Total maintenances</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">
            {data?.totalMaintenanceCost.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {data?.totalMaintenanceCount} intervention{data && data.totalMaintenanceCount > 1 ? 's' : ''}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <p className="text-sm font-medium text-gray-500">Coût moyen/maintenance</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">
            {data?.averageMaintenanceCost.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
          </p>
        </div>
      </div>

      {/* Coût par kilomètre */}
      {data?.costPerKm && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <p className="text-sm font-medium text-gray-500">Coût par kilomètre</p>
          <p className="mt-2 text-2xl font-bold text-gray-900">
            {data.costPerKm.toFixed(2)} €/km
          </p>
        </div>
      )}

      {/* Répartition par type */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold mb-4">Répartition des coûts par type</h3>
        {data && data.costsByType.length > 0 ? (
          <div className="space-y-3">
            {data.costsByType.map((costType) => (
              <div key={costType.type} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    {maintenanceTypeLabels[costType.type] || costType.type}
                  </p>
                  <p className="text-xs text-gray-500">{costType.count} intervention{costType.count > 1 ? 's' : ''}</p>
                </div>
                <p className="text-sm font-semibold text-gray-900">
                  {costType.totalCost.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-4">Aucune donnée de maintenance</p>
        )}
      </div>

      {/* Détails achat */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold mb-4">Détails d'achat</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium text-gray-500">Prix d'achat</p>
            <p className="mt-1 text-lg font-semibold text-gray-900">
              {data?.purchasePrice.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
