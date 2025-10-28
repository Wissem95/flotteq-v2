import { Car, AlertCircle } from 'lucide-react';
import { useVehicles } from '@/hooks/useVehicles';

interface VehicleSelectionStepProps {
  value: string | null;
  onChange: (vehicleId: string) => void;
}

export function VehicleSelectionStep({ value, onChange }: VehicleSelectionStepProps) {
  const { data: vehicles, isLoading } = useVehicles();

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-flotteq-blue mx-auto"></div>
        <p className="text-sm text-gray-600 mt-2">Chargement des véhicules...</p>
      </div>
    );
  }

  if (!vehicles || vehicles.length === 0) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start gap-3">
        <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-yellow-800">
          <p className="font-semibold mb-1">Aucun véhicule disponible</p>
          <p>Vous devez d'abord ajouter un véhicule pour pouvoir réserver un service.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Car className="h-6 w-6 text-flotteq-blue" />
        <h3 className="text-lg font-semibold text-gray-900">Sélectionnez un véhicule</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {vehicles.map((vehicle) => (
          <div
            key={vehicle.id}
            onClick={() => onChange(vehicle.id)}
            className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
              value === vehicle.id
                ? 'border-flotteq-blue bg-blue-50'
                : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="font-semibold text-gray-900">
                  {vehicle.brand} {vehicle.model}
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  Immatriculation: <span className="font-medium">{vehicle.registration}</span>
                </p>
                {vehicle.currentKm && (
                  <p className="text-sm text-gray-500 mt-1">
                    {vehicle.currentKm.toLocaleString()} km
                  </p>
                )}
              </div>
              {value === vehicle.id && (
                <div className="w-5 h-5 bg-flotteq-blue rounded-full flex items-center justify-center flex-shrink-0">
                  <svg
                    className="w-3 h-3 text-white"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
