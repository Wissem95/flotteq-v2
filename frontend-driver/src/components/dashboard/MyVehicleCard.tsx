import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Car, Gauge, Calendar, Wrench, AlertCircle, Edit, History } from 'lucide-react';
import UpdateMileageModal from '../mileage/UpdateMileageModal';

interface MyVehicleCardProps {
  vehicle: {
    id: string;
    registration: string;
    brand: string;
    model: string;
    year: number;
    currentKm: number;
    status: string;
    photos?: string[];
    lastTechnicalInspection?: Date;
    nextTechnicalInspection?: Date;
  } | null;
}

export default function MyVehicleCard({ vehicle }: MyVehicleCardProps) {
  const navigate = useNavigate();
  const [showMileageModal, setShowMileageModal] = useState(false);
  const formatDate = (date: Date | undefined) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('fr-FR');
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
      case 'available':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'in_use':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'maintenance':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'inactive':
      case 'unavailable':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      active: 'Actif',
      available: 'Disponible',
      in_use: 'En service',
      maintenance: 'En maintenance',
      inactive: 'Inactif',
      unavailable: 'Indisponible',
    };
    return labels[status.toLowerCase()] || status;
  };

  const getDaysUntilCT = () => {
    if (!vehicle?.nextTechnicalInspection) return null;
    const today = new Date();
    const ctDate = new Date(vehicle.nextTechnicalInspection);
    const diffTime = ctDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const daysUntilCT = getDaysUntilCT();

  if (!vehicle) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
          <Car className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun véhicule assigné</h3>
        <p className="text-gray-600">
          Vous n'avez pas encore de véhicule assigné. Contactez votre gestionnaire de flotte.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-flotteq-light rounded-lg">
          <Car className="w-6 h-6 text-flotteq-blue" />
        </div>
        <div className="flex-1">
          <h2 className="text-xl font-semibold text-gray-900">Mon véhicule</h2>
          <p className="text-sm text-gray-600">Véhicule assigné</p>
        </div>
        <span
          className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(vehicle.status)}`}
        >
          {getStatusLabel(vehicle.status)}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Photo et immatriculation */}
        <div className="space-y-4">
          {vehicle.photos && vehicle.photos.length > 0 ? (
            <img
              src={`${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3000'}${vehicle.photos[0]}`}
              alt={`${vehicle.brand} ${vehicle.model}`}
              className="w-full h-48 object-cover rounded-lg border border-gray-200"
            />
          ) : (
            <div className="w-full h-48 bg-gray-100 rounded-lg border border-gray-200 flex items-center justify-center">
              <Car className="w-16 h-16 text-gray-300" />
            </div>
          )}

          <div className="bg-flotteq-blue text-white p-4 rounded-lg text-center">
            <p className="text-sm font-medium opacity-90 mb-1">Immatriculation</p>
            <p className="text-2xl font-bold tracking-wider">{vehicle.registration}</p>
          </div>
        </div>

        {/* Informations véhicule */}
        <div className="space-y-4">
          <div>
            <p className="text-sm text-gray-600 mb-1">Marque & Modèle</p>
            <p className="text-lg font-semibold text-gray-900">
              {vehicle.brand} {vehicle.model}
            </p>
            <p className="text-sm text-gray-500">Année {vehicle.year}</p>
          </div>

          <div className="flex items-center justify-between gap-3 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              <Gauge className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-xs text-gray-600">Kilométrage actuel</p>
                <p className="text-lg font-semibold text-gray-900">
                  {vehicle.currentKm.toLocaleString()} km
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => navigate('/vehicle/mileage')}
                className="flex items-center gap-2 px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium min-h-[40px]"
                title="Voir l'historique"
              >
                <History className="w-4 h-4" />
                <span className="hidden sm:inline">Historique</span>
              </button>
              <button
                onClick={() => setShowMileageModal(true)}
                className="flex items-center gap-2 px-3 py-2 bg-flotteq-blue text-white rounded-lg hover:bg-flotteq-navy transition-colors text-sm font-medium min-h-[40px]"
                title="Mettre à jour le kilométrage"
              >
                <Edit className="w-4 h-4" />
                <span className="hidden sm:inline">Mettre à jour</span>
              </button>
            </div>
          </div>

          {vehicle.nextTechnicalInspection && (
            <div
              className={`flex items-start gap-3 p-4 rounded-lg border ${
                daysUntilCT !== null && daysUntilCT < 0
                  ? 'bg-red-50 border-red-200'
                  : daysUntilCT !== null && daysUntilCT <= 30
                  ? 'bg-yellow-50 border-yellow-200'
                  : 'bg-gray-50 border-gray-200'
              }`}
            >
              {daysUntilCT !== null && daysUntilCT <= 30 ? (
                <AlertCircle
                  className={`w-5 h-5 mt-0.5 ${
                    daysUntilCT < 0 ? 'text-red-600' : 'text-yellow-600'
                  }`}
                />
              ) : (
                <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
              )}
              <div className="flex-1">
                <p className="text-xs text-gray-600 mb-1">Prochain contrôle technique</p>
                <p className="font-semibold text-gray-900">
                  {formatDate(vehicle.nextTechnicalInspection)}
                </p>
                {daysUntilCT !== null && (
                  <p
                    className={`text-xs mt-1 font-medium ${
                      daysUntilCT < 0
                        ? 'text-red-600'
                        : daysUntilCT <= 30
                        ? 'text-yellow-700'
                        : 'text-gray-600'
                    }`}
                  >
                    {daysUntilCT < 0
                      ? `En retard de ${Math.abs(daysUntilCT)} jour${
                          Math.abs(daysUntilCT) > 1 ? 's' : ''
                        }`
                      : daysUntilCT === 0
                      ? "Aujourd'hui !"
                      : `Dans ${daysUntilCT} jour${daysUntilCT > 1 ? 's' : ''}`}
                  </p>
                )}
              </div>
            </div>
          )}

          {vehicle.lastTechnicalInspection && (
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <Wrench className="w-4 h-4 text-gray-400" />
              <div>
                <p className="text-xs text-gray-600">Dernier CT</p>
                <p className="text-sm font-medium text-gray-900">
                  {formatDate(vehicle.lastTechnicalInspection)}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal Update Mileage */}
      {vehicle && (
        <UpdateMileageModal
          isOpen={showMileageModal}
          onClose={() => setShowMileageModal(false)}
          currentMileage={vehicle.currentKm}
          vehicleRegistration={vehicle.registration}
        />
      )}
    </div>
  );
}
