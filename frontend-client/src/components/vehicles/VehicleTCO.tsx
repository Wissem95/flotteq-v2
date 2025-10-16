import { useQuery } from '@tanstack/react-query';
import { vehiclesService } from '../../api/services/vehicles.service';
import { DollarSign, TrendingDown, Fuel, Calculator } from 'lucide-react';

interface VehicleTCOProps {
  vehicleId: string;
}

export default function VehicleTCO({ vehicleId }: VehicleTCOProps) {
  const { data: tco, isLoading, error } = useQuery({
    queryKey: ['vehicle-tco', vehicleId],
    queryFn: () => vehiclesService.getVehicleTCO(vehicleId),
  });

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/3"></div>
          <div className="h-8 bg-gray-200 rounded w-1/2"></div>
          <div className="grid grid-cols-2 gap-4">
            <div className="h-16 bg-gray-200 rounded"></div>
            <div className="h-16 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !tco) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <p className="text-sm text-red-600">Impossible de calculer le TCO</p>
      </div>
    );
  }

  const costItems = [
    {
      label: 'Prix d\'achat',
      value: tco.purchasePrice,
      icon: DollarSign,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      label: 'Maintenances',
      value: tco.totalMaintenanceCosts,
      icon: Calculator,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
    {
      label: 'Carburant estimé',
      value: tco.estimatedFuelCosts,
      icon: Fuel,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      label: 'Valeur actuelle',
      value: -tco.currentValue,
      icon: TrendingDown,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
  ];

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-1">
          Coût Total de Possession (TCO)
        </h3>
        <p className="text-sm text-gray-500">
          Analyse financière complète du véhicule
        </p>
      </div>

      {/* TCO Total - Highlighted */}
      <div className="bg-gradient-to-r from-flotteq-blue to-blue-600 rounded-lg p-6 text-white">
        <div className="text-sm font-medium mb-1 opacity-90">TCO Total</div>
        <div className="text-4xl font-bold">{tco.totalTCO.toLocaleString('fr-FR')} €</div>
        <div className="text-sm mt-2 opacity-90">
          {tco.tcoPerKm.toFixed(4)} €/km • {tco.kmTraveled.toLocaleString('fr-FR')} km parcourus
        </div>
      </div>

      {/* Breakdown */}
      <div className="grid grid-cols-2 gap-4">
        {costItems.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.label}
              className="bg-gray-50 rounded-lg p-4 border border-gray-100"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className={`${item.bgColor} p-2 rounded-lg`}>
                  <Icon className={`h-5 w-5 ${item.color}`} />
                </div>
                <span className="text-xs font-medium text-gray-600">{item.label}</span>
              </div>
              <div className="text-xl font-bold text-gray-900">
                {item.value < 0 && '-'}
                {Math.abs(item.value).toLocaleString('fr-FR')} €
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer Info */}
      <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
        <p className="text-xs text-blue-800">
          <strong>💡 Info :</strong> Le TCO inclut le prix d'achat, les maintenances réelles,
          le carburant estimé (0,08 €/km) et déduit la valeur actuelle du véhicule.
        </p>
      </div>
    </div>
  );
}
