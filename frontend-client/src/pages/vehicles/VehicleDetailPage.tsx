import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { vehiclesService } from '../../api/services/vehicles.service';
import VehicleTimeline from '../../components/vehicles/VehicleTimeline';
import VehicleCosts from '../../components/vehicles/VehicleCosts';
import VehiclePhotos from '../../components/vehicles/VehiclePhotos';

export default function VehicleDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState<'info' | 'photos' | 'timeline' | 'costs'>('info');

  const { data: vehicle, isLoading, error } = useQuery({
    queryKey: ['vehicle', id],
    queryFn: () => vehiclesService.getVehicleById(id!),
    enabled: !!id,
  });

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
            <div className="w-48 h-32 bg-gray-200 rounded-lg overflow-hidden">
              <img
                src={vehicle.photos?.[0] || '/placeholder-vehicle.png'}
                alt={vehicle.registration}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/placeholder-vehicle.png';
                }}
              />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {vehicle.registration}
              </h1>
              <p className="text-xl text-gray-600 mb-3">
                {vehicle.brand} {vehicle.model} ({vehicle.year})
              </p>
              <div className="flex items-center gap-4">
                <span
                  className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${
                    statusColors[vehicle.status]
                  }`}
                >
                  {statusLabels[vehicle.status]}
                </span>
                <span className="text-gray-600">{vehicle.currentKm.toLocaleString()} km</span>
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
        </nav>
      </div>

      {/* Content */}
      {activeTab === 'info' && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-4">Détails du véhicule</h2>
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
                {new Date(vehicle.purchaseDate).toLocaleDateString('fr-FR')}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Prix d'achat</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {vehicle.purchasePrice.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
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
              <dd className="mt-1 text-sm text-gray-900">{vehicle.currentKm.toLocaleString()} km</dd>
            </div>
          </dl>
        </div>
      )}

      {activeTab === 'photos' && <VehiclePhotos vehicleId={vehicle.id} />}

      {activeTab === 'timeline' && <VehicleTimeline vehicleId={vehicle.id} />}

      {activeTab === 'costs' && <VehicleCosts vehicleId={vehicle.id} />}
    </div>
  );
}
