import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { vehiclesService } from '../../api/services/vehicles.service';
import VehicleCard from '../../components/vehicles/VehicleCard';
import VehicleFilters from '../../components/vehicles/VehicleFilters';
import AddVehicleModal from '../../components/vehicles/AddVehicleModal';
import { ProtectedButton } from '../../components/common/ProtectedButton';
import type { VehicleFilters as VehicleFiltersType } from '../../types/vehicle.types';

export default function VehiclesListPage() {
  const [filters, setFilters] = useState<VehicleFiltersType>({
    page: 1,
    limit: 12,
  });
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data, isLoading, error } = useQuery({
    queryKey: ['vehicles', filters],
    queryFn: () => vehiclesService.getVehicles(filters),
  });

  const handlePageChange = (newPage: number) => {
    setFilters({ ...filters, page: newPage });
  };

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          Une erreur est survenue lors du chargement des véhicules.
        </div>
      </div>
    );
  }

  const totalPages = data ? Math.ceil(data.total / filters.limit!) : 0;

  return (
    <div className="px-4 sm:px-6 py-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Véhicules</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">
            {data?.total || 0} véhicule{data && data.total > 1 ? 's' : ''}
          </p>
        </div>
        <ProtectedButton
          permission="vehicles.create"
          onClick={() => setIsModalOpen(true)}
          className="w-full sm:w-auto bg-flotteq-blue text-white px-4 sm:px-6 py-2 rounded-md hover:bg-flotteq-navy focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-flotteq-blue text-sm sm:text-base"
          disabledMessage="Seuls les managers et admins peuvent ajouter des véhicules"
        >
          <span className="sm:hidden">+</span>
          <span className="hidden sm:inline">+ Ajouter un véhicule</span>
        </ProtectedButton>
      </div>

      <AddVehicleModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />

      <VehicleFilters filters={filters} onFiltersChange={setFilters} />

      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-flotteq-blue"></div>
        </div>
      ) : data && data.data.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
            {data.data.map((vehicle) => (
              <VehicleCard key={vehicle.id} vehicle={vehicle} />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 flex-wrap">
              <button
                onClick={() => handlePageChange(filters.page! - 1)}
                disabled={filters.page === 1}
                className="px-3 sm:px-4 py-2 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 text-sm sm:text-base"
              >
                Précédent
              </button>
              <span className="px-3 sm:px-4 py-2 text-gray-700 text-sm sm:text-base">
                Page {filters.page} sur {totalPages}
              </span>
              <button
                onClick={() => handlePageChange(filters.page! + 1)}
                disabled={filters.page === totalPages}
                className="px-3 sm:px-4 py-2 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 text-sm sm:text-base"
              >
                Suivant
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-12">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
            />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">Aucun véhicule</h3>
          <p className="mt-1 text-sm text-gray-500">
            Commencez par ajouter un véhicule à votre flotte.
          </p>
        </div>
      )}
    </div>
  );
}
