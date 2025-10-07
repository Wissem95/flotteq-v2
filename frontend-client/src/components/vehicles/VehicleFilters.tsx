import { VehicleStatus, type VehicleFilters } from '../../types/vehicle.types';

interface VehicleFiltersProps {
  filters: VehicleFilters;
  onFiltersChange: (filters: VehicleFilters) => void;
}

export default function VehicleFiltersComponent({ filters, onFiltersChange }: VehicleFiltersProps) {
  const handleStatusChange = (status: string) => {
    onFiltersChange({
      ...filters,
      status: status === 'all' ? undefined : (status as VehicleStatus),
      page: 1,
    });
  };

  const handleBrandChange = (brand: string) => {
    onFiltersChange({
      ...filters,
      brand: brand || undefined,
      page: 1,
    });
  };

  const handleModelChange = (model: string) => {
    onFiltersChange({
      ...filters,
      model: model || undefined,
      page: 1,
    });
  };

  const handleReset = () => {
    onFiltersChange({ page: 1, limit: filters.limit });
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow mb-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
            Statut
          </label>
          <select
            id="status"
            value={filters.status || 'all'}
            onChange={(e) => handleStatusChange(e.target.value)}
            className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-flotteq-blue focus:border-flotteq-blue"
          >
            <option value="all">Tous</option>
            <option value={VehicleStatus.AVAILABLE}>Disponible</option>
            <option value={VehicleStatus.IN_USE}>En service</option>
            <option value={VehicleStatus.MAINTENANCE}>En maintenance</option>
            <option value={VehicleStatus.OUT_OF_SERVICE}>Hors service</option>
          </select>
        </div>

        <div>
          <label htmlFor="brand" className="block text-sm font-medium text-gray-700 mb-1">
            Marque
          </label>
          <input
            type="text"
            id="brand"
            value={filters.brand || ''}
            onChange={(e) => handleBrandChange(e.target.value)}
            placeholder="Ex: Renault"
            className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-flotteq-blue focus:border-flotteq-blue"
          />
        </div>

        <div>
          <label htmlFor="model" className="block text-sm font-medium text-gray-700 mb-1">
            Modèle
          </label>
          <input
            type="text"
            id="model"
            value={filters.model || ''}
            onChange={(e) => handleModelChange(e.target.value)}
            placeholder="Ex: Kangoo"
            className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-flotteq-blue focus:border-flotteq-blue"
          />
        </div>

        <div className="flex items-end">
          <button
            onClick={handleReset}
            className="w-full bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          >
            Réinitialiser
          </button>
        </div>
      </div>
    </div>
  );
}
