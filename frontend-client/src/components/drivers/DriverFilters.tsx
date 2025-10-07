import { DriverStatus } from '@/types/driver.types';

interface DriverFiltersProps {
  status?: DriverStatus;
  onStatusChange: (status?: DriverStatus) => void;
  onSearchChange: (search: string) => void;
}

export default function DriverFilters({ status, onStatusChange, onSearchChange }: DriverFiltersProps) {
  return (
    <div className="bg-white p-4 rounded-lg shadow mb-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
            Rechercher
          </label>
          <input
            type="text"
            id="search"
            placeholder="Nom, email, téléphone..."
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-flotteq-blue focus:border-flotteq-blue"
          />
        </div>

        <div>
          <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
            Statut
          </label>
          <select
            id="status"
            value={status || ''}
            onChange={(e) => onStatusChange(e.target.value ? (e.target.value as DriverStatus) : undefined)}
            className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-flotteq-blue focus:border-flotteq-blue"
          >
            <option value="">Tous les statuts</option>
            <option value={DriverStatus.ACTIVE}>Actif</option>
            <option value={DriverStatus.INACTIVE}>Inactif</option>
            <option value={DriverStatus.SUSPENDED}>Suspendu</option>
            <option value={DriverStatus.ON_LEAVE}>En congé</option>
          </select>
        </div>
      </div>
    </div>
  );
}
