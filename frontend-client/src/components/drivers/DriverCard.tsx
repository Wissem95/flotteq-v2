import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import type { Driver } from '@/types/driver.types';
import DriverExpiringBadge from './DriverExpiringBadge';

interface DriverCardProps {
  driver: Driver;
}

const statusConfig = {
  active: { label: 'Actif', className: 'bg-green-100 text-green-800' },
  inactive: { label: 'Inactif', className: 'bg-gray-100 text-gray-800' },
  suspended: { label: 'Suspendu', className: 'bg-red-100 text-red-800' },
  on_leave: { label: 'En congé', className: 'bg-blue-100 text-blue-800' },
};

export default function DriverCard({ driver }: DriverCardProps) {
  const status = statusConfig[driver.status];
  const vehicleCount = driver.vehicles?.length || 0;

  return (
    <Link
      to={`/drivers/${driver.id}`}
      className="block bg-white rounded-lg shadow hover:shadow-md transition-shadow p-6"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-full bg-flotteq-blue text-white flex items-center justify-center text-lg font-semibold">
              {driver.firstName[0]}{driver.lastName[0]}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {driver.firstName} {driver.lastName}
              </h3>
              <p className="text-sm text-gray-500">{driver.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 mt-3">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${status.className}`}>
              {status.label}
            </span>
            <DriverExpiringBadge licenseExpiryDate={driver.licenseExpiryDate} />
          </div>

          <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-500">Téléphone</p>
              <p className="font-medium text-gray-900">{driver.phone}</p>
            </div>
            <div>
              <p className="text-gray-500">Permis</p>
              <p className="font-medium text-gray-900">{driver.licenseNumber}</p>
            </div>
            <div>
              <p className="text-gray-500">Expiration permis</p>
              <p className="font-medium text-gray-900">
                {format(new Date(driver.licenseExpiryDate), 'dd MMM yyyy', { locale: fr })}
              </p>
            </div>
            <div>
              <p className="text-gray-500">Véhicules assignés</p>
              <p className="font-medium text-gray-900">
                {vehicleCount > 0 ? `${vehicleCount} véhicule${vehicleCount > 1 ? 's' : ''}` : 'Aucun'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
