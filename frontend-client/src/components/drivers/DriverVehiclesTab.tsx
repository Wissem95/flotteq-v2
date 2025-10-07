import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { driversService } from '@/api/services/drivers.service';
import type { Driver } from '@/types/driver.types';

interface DriverVehiclesTabProps {
  driver: Driver;
}

export default function DriverVehiclesTab({ driver }: DriverVehiclesTabProps) {
  const queryClient = useQueryClient();

  const { data: vehicles, isLoading } = useQuery({
    queryKey: ['driver', driver.id, 'vehicles'],
    queryFn: () => driversService.getDriverVehicles(driver.id),
  });

  const unassignMutation = useMutation({
    mutationFn: (vehicleId: string) => driversService.unassignVehicle(driver.id, { vehicleId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['driver', driver.id, 'vehicles'] });
      queryClient.invalidateQueries({ queryKey: ['driver', driver.id] });
      queryClient.invalidateQueries({ queryKey: ['drivers'] });
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
    },
  });

  if (isLoading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-flotteq-blue"></div>
        <p className="mt-2 text-gray-600">Chargement...</p>
      </div>
    );
  }

  if (!vehicles || vehicles.length === 0) {
    return (
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="text-center py-12">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">Aucun véhicule assigné</h3>
          <p className="mt-1 text-sm text-gray-500">Ce conducteur n'a aucun véhicule assigné pour le moment</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Véhicules assignés ({vehicles.length})
        </h3>

        <div className="space-y-4">
          {vehicles.map((vehicle) => (
            <div
              key={vehicle.id}
              className="border border-gray-200 rounded-lg p-4 hover:border-flotteq-blue transition-colors"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <Link
                    to={`/vehicles/${vehicle.id}`}
                    className="text-lg font-semibold text-flotteq-blue hover:text-flotteq-navy"
                  >
                    {vehicle.brand} {vehicle.model}
                  </Link>
                  <div className="mt-2 grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">Immatriculation</p>
                      <p className="font-medium text-gray-900">{vehicle.registration}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">VIN</p>
                      <p className="font-medium text-gray-900">{vehicle.vin}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Année</p>
                      <p className="font-medium text-gray-900">{vehicle.year}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Couleur</p>
                      <p className="font-medium text-gray-900">{vehicle.color}</p>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => {
                    if (confirm('Voulez-vous vraiment désassigner ce véhicule ?')) {
                      unassignMutation.mutate(vehicle.id);
                    }
                  }}
                  disabled={unassignMutation.isPending}
                  className="ml-4 px-3 py-1.5 text-sm text-red-600 border border-red-600 rounded-md hover:bg-red-50 disabled:opacity-50"
                >
                  Désassigner
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {unassignMutation.isError && (
        <div className="mx-6 mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          Erreur lors de la désassignation du véhicule
        </div>
      )}
    </div>
  );
}
