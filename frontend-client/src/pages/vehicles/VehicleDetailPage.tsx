import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { vehiclesService } from '../../api/services/vehicles.service';
import VehicleTimeline from '../../components/vehicles/VehicleTimeline';
import VehicleCosts from '../../components/vehicles/VehicleCosts';
import VehiclePhotos from '../../components/vehicles/VehiclePhotos';
import { EntityDocumentsTab } from '../../components/documents/EntityDocumentsTab';
import { DocumentEntityType } from '../../types/document.types';
import { AssignEntityModal } from '../../components/common/AssignEntityModal';
import EditVehicleModal from '../../components/vehicles/EditVehicleModal';
import { ProtectedButton } from '@/components/common/ProtectedButton';

export default function VehicleDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState<'info' | 'photos' | 'timeline' | 'costs' | 'documents'>('info');
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const queryClient = useQueryClient();

  const { data: vehicle, isLoading, error } = useQuery({
    queryKey: ['vehicle', id],
    queryFn: () => vehiclesService.getVehicleById(id!),
    enabled: !!id,
  });

  const assignDriverMutation = useMutation({
    mutationFn: (driverId: string) =>
      vehiclesService.updateVehicle(id!, { assignedDriverId: driverId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicle', id] });
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      queryClient.invalidateQueries({ queryKey: ['drivers'] });
      setShowAssignModal(false);
    },
  });

  const unassignDriverMutation = useMutation({
    mutationFn: () => vehiclesService.unassignDriver(id!),
    onSuccess: (data) => {
      queryClient.setQueryData(['vehicle', id], data);
      queryClient.invalidateQueries({ queryKey: ['vehicle', id] });
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      queryClient.invalidateQueries({ queryKey: ['drivers'] });
    },
    onError: (error) => {
      console.error('Erreur désassignation:', error);
    },
  });

  const handleAssignDriver = (driverId: string) => {
    assignDriverMutation.mutate(driverId);
  };

  const handleUnassignDriver = () => {
    if (confirm('Voulez-vous vraiment désassigner ce conducteur ?')) {
      unassignDriverMutation.mutate();
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-flotteq-blue"></div>
      </div>
    );
  }

  if (error || !vehicle) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          Véhicule non trouvé
        </div>
      </div>
    );
  }

  const statusColors = {
    available: 'bg-green-100 text-green-800',
    in_use: 'bg-blue-100 text-blue-800',
    maintenance: 'bg-yellow-100 text-yellow-800',
    out_of_service: 'bg-red-100 text-red-800',
  };

  const statusLabels = {
    available: 'Disponible',
    in_use: 'En service',
    maintenance: 'En maintenance',
    out_of_service: 'Hors service',
  };

  return (
    <div className="p-6">
      {/* Breadcrumb */}
      <nav className="mb-6 text-sm">
        <Link to="/vehicles" className="text-flotteq-blue hover:underline">
          Véhicules
        </Link>
        <span className="mx-2 text-gray-400">/</span>
        <span className="text-gray-600">{vehicle.registration}</span>
      </nav>

      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex items-start justify-between">
          <div className="flex gap-6">
            <div className="w-48 h-32 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg overflow-hidden flex items-center justify-center">
              {vehicle.photos && vehicle.photos.length > 0 ? (
                <img
                  src={vehicle.photos[0]}
                  alt={vehicle.registration}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              ) : (
                <svg
                  className="w-20 h-20 text-gray-400"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/>
                </svg>
              )}
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {vehicle.brand} {vehicle.model}
              </h1>
              <p className="text-xl text-gray-600 mb-3">
                {vehicle.registration} • {vehicle.year}
              </p>
              <div className="flex items-center gap-4">
                <span
                  className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${
                    statusColors[vehicle.status]
                  }`}
                >
                  {statusLabels[vehicle.status]}
                </span>
                <span className="text-gray-600">
                  {(vehicle.mileage || vehicle.currentKm || 0).toLocaleString()} km
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('info')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'info'
                ? 'border-flotteq-blue text-flotteq-blue'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Informations
          </button>
          <button
            onClick={() => setActiveTab('photos')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'photos'
                ? 'border-flotteq-blue text-flotteq-blue'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Photos
          </button>
          <button
            onClick={() => setActiveTab('timeline')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'timeline'
                ? 'border-flotteq-blue text-flotteq-blue'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Historique
          </button>
          <button
            onClick={() => setActiveTab('costs')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'costs'
                ? 'border-flotteq-blue text-flotteq-blue'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Coûts
          </button>
          <button
            onClick={() => setActiveTab('documents')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'documents'
                ? 'border-flotteq-blue text-flotteq-blue'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Documents
          </button>
        </nav>
      </div>

      {/* Content */}
      {activeTab === 'info' && (
        <div className="space-y-6">
          {/* Conducteur assigné */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4">Conducteur assigné</h2>
            {vehicle.assignedDriver ? (
              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-flotteq-blue rounded-full flex items-center justify-center text-white font-semibold">
                    {vehicle.assignedDriver.firstName[0]}
                    {vehicle.assignedDriver.lastName[0]}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      {vehicle.assignedDriver.firstName} {vehicle.assignedDriver.lastName}
                    </p>
                    <Link
                      to={`/drivers/${vehicle.assignedDriver.id}`}
                      className="text-sm text-flotteq-blue hover:underline"
                    >
                      Voir le profil
                    </Link>
                  </div>
                </div>
                <div className="flex gap-2">
                  <ProtectedButton
                    onClick={() => setShowAssignModal(true)}
                    permission="vehicles.update"
                    disabledMessage="Vous n'avez pas la permission de modifier l'assignation des véhicules"
                    className="px-4 py-2 text-sm text-flotteq-blue border border-flotteq-blue rounded-md hover:bg-blue-50 transition-colors"
                  >
                    Changer
                  </ProtectedButton>
                  <ProtectedButton
                    onClick={handleUnassignDriver}
                    disabled={unassignDriverMutation.isPending}
                    permission="vehicles.update"
                    disabledMessage="Vous n'avez pas la permission de modifier l'assignation des véhicules"
                    className="px-4 py-2 text-sm text-red-600 border border-red-600 rounded-md hover:bg-red-50 disabled:opacity-50 transition-colors"
                  >
                    Désassigner
                  </ProtectedButton>
                </div>
              </div>
            ) : (
              <ProtectedButton
                onClick={() => setShowAssignModal(true)}
                permission="vehicles.update"
                disabledMessage="Vous n'avez pas la permission d'assigner des conducteurs"
                className="w-full p-6 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-flotteq-blue hover:text-flotteq-blue transition-colors flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                Assigner un conducteur
              </ProtectedButton>
            )}
          </div>

          {/* Détails du véhicule */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Détails du véhicule</h2>
              <ProtectedButton
                onClick={() => setShowEditModal(true)}
                permission="vehicles.update"
                disabledMessage="Vous n'avez pas la permission de modifier les véhicules"
                className="px-4 py-2 text-sm bg-flotteq-blue text-white rounded-md hover:bg-flotteq-navy transition-colors flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Modifier
              </ProtectedButton>
            </div>
            <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
              <div>
                <dt className="text-sm font-medium text-gray-500">VIN</dt>
                <dd className="mt-1 text-sm text-gray-900">{vehicle.vin}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Couleur</dt>
                <dd className="mt-1 text-sm text-gray-900">{vehicle.color}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Date d'achat</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {vehicle.purchaseDate ? new Date(vehicle.purchaseDate).toLocaleDateString('fr-FR') : 'N/A'}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Prix d'achat</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {vehicle.purchasePrice ? vehicle.purchasePrice.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' }) : 'N/A'}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Kilométrage initial</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {vehicle.initialMileage?.toLocaleString() || 'N/A'} km
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Kilométrage actuel</dt>
                <dd className="mt-1 text-sm text-gray-900">{((vehicle.mileage || vehicle.currentKm) || 0).toLocaleString()} km</dd>
              </div>
            </dl>
          </div>
        </div>
      )}

      {activeTab === 'photos' && <VehiclePhotos vehicleId={vehicle.id} />}

      {activeTab === 'timeline' && <VehicleTimeline vehicleId={vehicle.id} />}

      {activeTab === 'costs' && <VehicleCosts vehicleId={vehicle.id} />}

      {activeTab === 'documents' && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <EntityDocumentsTab
            entityType={DocumentEntityType.VEHICLE}
            entityId={vehicle.id}
            entityName={`${vehicle.brand} ${vehicle.model} (${vehicle.registration})`}
          />
        </div>
      )}

      {/* Modal d'assignation */}
      <AssignEntityModal
        isOpen={showAssignModal}
        onClose={() => setShowAssignModal(false)}
        onAssign={handleAssignDriver}
        type="driver"
        excludeIds={vehicle.assignedDriverId ? [vehicle.assignedDriverId] : []}
      />

      {/* Modal d'édition */}
      <EditVehicleModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        vehicle={vehicle}
      />
    </div>
  );
}
