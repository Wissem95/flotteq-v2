import { useState, useMemo } from 'react';
import { useDrivers } from '../../hooks/useDrivers';
import { useVehicles } from '../../hooks/useVehicles';
import type { Driver } from '../../types/driver.types';
import type { Vehicle } from '../../types/vehicle.types';

interface AssignEntityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAssign: (entityId: string) => void;
  type: 'driver' | 'vehicle';
  excludeIds?: string[];
  title?: string;
}

export function AssignEntityModal({
  isOpen,
  onClose,
  onAssign,
  type,
  excludeIds = [],
  title,
}: AssignEntityModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const { data: driversData, isLoading: driversLoading } = useDrivers();
  const { data: vehiclesData, isLoading: vehiclesLoading } = useVehicles();

  const drivers = driversData?.data || [];
  const vehicles = vehiclesData || [];

  const isLoading = type === 'driver' ? driversLoading : vehiclesLoading;

  const filteredEntities = useMemo(() => {
    const entities = type === 'driver' ? drivers : vehicles;

    // Étape 1: Exclure les IDs déjà assignés
    const afterExclude = entities.filter((entity) => !excludeIds.includes(entity.id));

    // Étape 2: Filtre de recherche
    if (!searchQuery) {
      return afterExclude;
    }

    return afterExclude.filter((entity) => {
      if (type === 'driver') {
        const driver = entity as Driver;
        const searchLower = searchQuery.toLowerCase();
        return (
          driver.firstName.toLowerCase().includes(searchLower) ||
          driver.lastName.toLowerCase().includes(searchLower) ||
          driver.email.toLowerCase().includes(searchLower)
        );
      } else {
        const vehicle = entity as Vehicle;
        const searchLower = searchQuery.toLowerCase();
        return (
          vehicle.registration.toLowerCase().includes(searchLower) ||
          vehicle.brand.toLowerCase().includes(searchLower) ||
          vehicle.model.toLowerCase().includes(searchLower)
        );
      }
    });
  }, [type, drivers, vehicles, excludeIds, searchQuery]);

  const handleAssign = () => {
    if (selectedId) {
      onAssign(selectedId);
      setSelectedId(null);
      setSearchQuery('');
      // Note: onClose() est appelé par la mutation dans le parent
    }
  };

  if (!isOpen) return null;

  const modalTitle =
    title || (type === 'driver' ? 'Assigner un conducteur' : 'Assigner un véhicule');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">{modalTitle}</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="p-6 border-b border-gray-200">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg
                className="h-5 w-5 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={
                type === 'driver'
                  ? 'Rechercher par nom, email...'
                  : 'Rechercher par immatriculation, marque, modèle...'
              }
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-flotteq-blue focus:border-flotteq-blue sm:text-sm"
            />
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-6">
          {isLoading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-flotteq-blue"></div>
              <p className="mt-2 text-gray-600">Chargement...</p>
            </div>
          ) : filteredEntities.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">
                {searchQuery
                  ? 'Aucun résultat trouvé'
                  : type === 'driver'
                  ? 'Aucun conducteur disponible'
                  : 'Aucun véhicule disponible'}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredEntities.map((entity) => {
                const isDriver = type === 'driver';
                const driver = entity as Driver;
                const vehicle = entity as Vehicle;

                return (
                  <label
                    key={entity.id}
                    className={`flex items-center p-4 border rounded-lg cursor-pointer transition-all ${
                      selectedId === entity.id
                        ? 'border-flotteq-blue bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="entity"
                      value={entity.id}
                      checked={selectedId === entity.id}
                      onChange={() => setSelectedId(entity.id)}
                      className="h-4 w-4 text-flotteq-blue focus:ring-flotteq-blue border-gray-300"
                    />
                    <div className="ml-4 flex-1">
                      {isDriver ? (
                        <>
                          <div className="font-medium text-gray-900">
                            {driver.firstName} {driver.lastName}
                          </div>
                          <div className="text-sm text-gray-500">{driver.email}</div>
                          <div className="text-sm text-gray-400 mt-1">
                            Permis: {driver.licenseNumber || 'N/A'}
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="font-medium text-gray-900">
                            {vehicle.brand} {vehicle.model}
                          </div>
                          <div className="text-sm text-gray-500">
                            {vehicle.registration} • {vehicle.year}
                          </div>
                          <div className="text-sm text-gray-400 mt-1">
                            {vehicle.status === 'available' ? 'Disponible' : 'En service'}
                          </div>
                        </>
                      )}
                    </div>
                  </label>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Annuler
          </button>
          <button
            onClick={handleAssign}
            disabled={!selectedId}
            className="px-4 py-2 bg-flotteq-blue text-white rounded-md hover:bg-flotteq-navy disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Assigner
          </button>
        </div>
      </div>
    </div>
  );
}
