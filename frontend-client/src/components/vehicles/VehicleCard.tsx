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
  const hasPhoto = vehicle.photos && vehicle.photos.length > 0;
  const photoUrl = vehicle.photos?.[0];

  return (
    <Link
      to={`/vehicles/${vehicle.id}`}
      className="block bg-white rounded-lg shadow hover:shadow-md transition-shadow overflow-hidden"
    >
      <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 relative flex items-center justify-center">
        {hasPhoto ? (
          <img
            src={photoUrl}
            alt={`${vehicle.brand} ${vehicle.model}`}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        ) : (
          <svg
            className="w-24 h-24 text-gray-400"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/>
          </svg>
        )}
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
          {(vehicle.currentKm !== undefined || vehicle.mileage !== undefined) && (
            <span className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              {(vehicle.mileage || vehicle.currentKm || 0).toLocaleString()} km
            </span>
          )}

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
