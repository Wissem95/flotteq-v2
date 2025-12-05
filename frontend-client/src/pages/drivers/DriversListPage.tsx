import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { driversService } from '@/api/services/drivers.service';
import { DriverStatus } from '@/types/driver.types';
import { PAGINATION } from '@/config/constants';
import DriverCard from '@/components/drivers/DriverCard';
import DriverFilters from '@/components/drivers/DriverFilters';
import AddDriverModal from '@/components/drivers/AddDriverModal';
import { ProtectedButton } from '@/components/common/ProtectedButton';

export default function DriversListPage() {
  const [page, setPage] = useState<number>(PAGINATION.DEFAULT_PAGE);
  const [status, setStatus] = useState<DriverStatus | undefined>();
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const { data, isLoading, error } = useQuery({
    queryKey: ['drivers', page, status],
    queryFn: () => driversService.getDrivers({ page, limit: PAGINATION.DRIVERS_PER_PAGE, status }),
  });

  const { data: expiringDrivers } = useQuery({
    queryKey: ['drivers', 'expiring'],
    queryFn: () => driversService.getExpiringLicenses(30),
  });

  const filteredDrivers = data?.data.filter((driver) => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      driver.firstName.toLowerCase().includes(search) ||
      driver.lastName.toLowerCase().includes(search) ||
      driver.email.toLowerCase().includes(search) ||
      driver.phone.includes(search) ||
      driver.licenseNumber.toLowerCase().includes(search)
    );
  });

  const totalPages = data ? Math.ceil(data.total / PAGINATION.DRIVERS_PER_PAGE) : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Conducteurs</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">
            {data?.total || 0} conducteur{(data?.total || 0) > 1 ? 's' : ''} au total
          </p>
        </div>
        <ProtectedButton
          onClick={() => setIsAddModalOpen(true)}
          permission="drivers.create"
          className="w-full sm:w-auto bg-flotteq-blue text-white px-4 py-2 rounded-md hover:bg-flotteq-navy focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-flotteq-blue text-sm sm:text-base"
          disabledMessage="Vous n'avez pas la permission de créer des conducteurs"
        >
          Ajouter un conducteur
        </ProtectedButton>
      </div>

      {expiringDrivers && expiringDrivers.length > 0 && (
        <div className="bg-orange-50 border-l-4 border-orange-400 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-orange-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-orange-700">
                <span className="font-medium">{expiringDrivers.length} permis expire{expiringDrivers.length > 1 ? 'nt' : ''} dans les 30 prochains jours</span>
              </p>
            </div>
          </div>
        </div>
      )}

      <DriverFilters
        status={status}
        onStatusChange={setStatus}
        onSearchChange={setSearchTerm}
      />

      {isLoading && (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-flotteq-blue"></div>
          <p className="mt-2 text-gray-600">Chargement...</p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          Erreur lors du chargement des conducteurs
        </div>
      )}

      {!isLoading && !error && filteredDrivers && (
        <>
          {filteredDrivers.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg shadow">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">Aucun conducteur</h3>
              <p className="mt-1 text-sm text-gray-500">Commencez par ajouter votre premier conducteur</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredDrivers.map((driver) => (
                <DriverCard key={driver.id} driver={driver} />
              ))}
            </div>
          )}

          {totalPages > 1 && (
            <div className="mt-6 flex justify-center">
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px flex-wrap gap-y-2">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="relative inline-flex items-center px-3 sm:px-4 py-2 rounded-l-md border border-gray-300 bg-white text-xs sm:text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Précédent
                </button>
                <span className="relative inline-flex items-center px-3 sm:px-4 py-2 border border-gray-300 bg-white text-xs sm:text-sm font-medium text-gray-700">
                  Page {page} sur {totalPages}
                </span>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="relative inline-flex items-center px-3 sm:px-4 py-2 rounded-r-md border border-gray-300 bg-white text-xs sm:text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Suivant
                </button>
              </nav>
            </div>
          )}
        </>
      )}

      <AddDriverModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} />
    </div>
  );
}
