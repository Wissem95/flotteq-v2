import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { driversService } from '@/api/services/drivers.service';
import type { Driver } from '@/types/driver.types';
import { AssignEntityModal } from '../common/AssignEntityModal';
import { getErrorMessage } from '@/utils/error-messages';

interface DriverVehiclesTabProps {
  driver: Driver;
}

export default function DriverVehiclesTab({ driver }: DriverVehiclesTabProps) {
  const queryClient = useQueryClient();
  const [showAssignModal, setShowAssignModal] = useState(false);

  const { data: vehicles, isLoading } = useQuery({
    queryKey: ['driver', driver.id, 'vehicles'],
    queryFn: () => driversService.getDriverVehicles(driver.id),
  });

  const assignMutation = useMutation({
    mutationFn: (vehicleId: string) => driversService.assignVehicle(driver.id, { vehicleId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['driver', driver.id, 'vehicles'] });
      queryClient.invalidateQueries({ queryKey: ['driver', driver.id] });
      queryClient.invalidateQueries({ queryKey: ['drivers'] });
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      setShowAssignModal(false); // Fermer le modal après succès
    },
    onError: (error: any) => {
      console.error('Erreur assignation véhicule:', error?.response?.data || error);
    },
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

  const handleAssignVehicle = (vehicleId: string) => {
    assignMutation.mutate(vehicleId);
  };

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
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Véhicules assignés (0)</h3>
          <button
            onClick={() => setShowAssignModal(true)}
            className="px-4 py-2 bg-flotteq-blue text-white rounded-md hover:bg-flotteq-navy transition-colors flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Assigner un véhicule
          </button>
        </div>
        <div className="text-center py-12">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">Aucun véhicule assigné</h3>
          <p className="mt-1 text-sm text-gray-500">Ce conducteur n'a aucun véhicule assigné pour le moment</p>
        </div>

        <AssignEntityModal
          isOpen={showAssignModal}
          onClose={() => setShowAssignModal(false)}
          onAssign={handleAssignVehicle}
          type="vehicle"
          excludeIds={[]}
        />
      </div>
    );
  }

  const assignedVehicleIds = vehicles.map((v) => v.id);

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Véhicules assignés ({vehicles.length})
          </h3>
          <button
            onClick={() => setShowAssignModal(true)}
            className="px-4 py-2 bg-flotteq-blue text-white rounded-md hover:bg-flotteq-navy transition-colors flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Assigner un véhicule
          </button>
        </div>

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
        <div className="mx-6 mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded flex items-start gap-3">
          <svg className="w-5 h-5 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          <div>
            <p className="font-medium">Erreur lors de la désassignation</p>
            <p className="text-sm mt-1">{getErrorMessage(unassignMutation.error)}</p>
          </div>
        </div>
      )}

      {assignMutation.isError && (
        <div className="mx-6 mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded flex items-start gap-3">
          <svg className="w-5 h-5 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          <div>
            <p className="font-medium">Erreur lors de l'assignation</p>
            <p className="text-sm mt-1">{getErrorMessage(assignMutation.error)}</p>
          </div>
        </div>
      )}

      <AssignEntityModal
        isOpen={showAssignModal}
        onClose={() => setShowAssignModal(false)}
        onAssign={handleAssignVehicle}
        type="vehicle"
        excludeIds={assignedVehicleIds}
      />
    </div>
  );
}
