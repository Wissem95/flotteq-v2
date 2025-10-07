import { Link } from 'react-router-dom';
import type { Vehicle } from '../../types/vehicle.types';

interface VehicleCardProps {
  vehicle: Vehicle;
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

export default function VehicleCard({ vehicle }: VehicleCardProps) {
  const photoUrl = vehicle.photos?.[0] || '/placeholder-vehicle.png';

  return (
    <Link
      to={`/vehicles/${vehicle.id}`}
      className="block bg-white rounded-lg shadow hover:shadow-md transition-shadow overflow-hidden"
    >
      <div className="aspect-video bg-gray-200 relative">
        <img
          src={photoUrl}
          alt={`${vehicle.brand} ${vehicle.model}`}
          className="w-full h-full object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/placeholder-vehicle.png';
          }}
        />
        <div className="absolute top-2 right-2">
          <span
            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
              statusColors[vehicle.status]
            }`}
          >
            {statusLabels[vehicle.status]}
          </span>
        </div>
      </div>

      <div className="p-4">
        <h3 className="text-xl font-bold text-gray-900 mb-1">
          {vehicle.registration}
        </h3>
        <p className="text-gray-600 mb-2">
          {vehicle.brand} {vehicle.model} ({vehicle.year})
        </p>

        <div className="flex items-center justify-between text-sm text-gray-500">
          <span className="flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            {vehicle.currentKm.toLocaleString()} km
          </span>

          {vehicle.assignedDriver && (
            <span className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              {vehicle.assignedDriver.firstName} {vehicle.assignedDriver.lastName}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
