import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { driversService } from '@/api/services/drivers.service';
import { DriverStatus } from '@/types/driver.types';
import DriverInfoTab from '@/components/drivers/DriverInfoTab';
import DriverVehiclesTab from '@/components/drivers/DriverVehiclesTab';
import DriverExpiringBadge from '@/components/drivers/DriverExpiringBadge';
import DriverAvatar from '@/components/drivers/DriverAvatar';
import { EntityDocumentsTab } from '@/components/documents/EntityDocumentsTab';
import { DocumentEntityType } from '@/types/document.types';

type TabType = 'info' | 'vehicles' | 'documents';

const statusConfig = {
  active: { label: 'Actif', className: 'bg-green-100 text-green-800' },
  inactive: { label: 'Inactif', className: 'bg-gray-100 text-gray-800' },
  suspended: { label: 'Suspendu', className: 'bg-red-100 text-red-800' },
  on_leave: { label: 'En congé', className: 'bg-blue-100 text-blue-800' },
};

export default function DriverDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<TabType>('info');

  const { data: driver, isLoading, error } = useQuery({
    queryKey: ['driver', id],
    queryFn: () => driversService.getDriver(id!),
    enabled: !!id,
    refetchInterval: 60000, // Refresh toutes les 60 secondes pour voir updates profil driver
    refetchOnWindowFocus: true, // Refresh au retour focus
  });

  const deleteMutation = useMutation({
    mutationFn: () => driversService.deleteDriver(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['drivers'] });
      navigate('/drivers');
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: (status: DriverStatus) => driversService.updateDriver(id!, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['driver', id] });
      queryClient.invalidateQueries({ queryKey: ['drivers'] });
    },
  });

  const handleDelete = () => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce conducteur ? Cette action est irréversible.')) {
      deleteMutation.mutate();
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-flotteq-blue"></div>
          <p className="mt-2 text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  if (error || !driver) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          Conducteur non trouvé
        </div>
      </div>
    );
  }

  const status = statusConfig[driver.status];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <nav className="mb-6">
        <ol className="flex items-center space-x-2 text-sm">
          <li>
            <Link to="/drivers" className="text-gray-500 hover:text-gray-700">
              Conducteurs
            </Link>
          </li>
          <li className="text-gray-400">/</li>
          <li className="text-gray-900 font-medium">
            {driver.firstName} {driver.lastName}
          </li>
        </ol>
      </nav>

      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <DriverAvatar
              photoUrl={driver.profilePhotoUrl}
              photoThumbnail={driver.profilePhotoThumbnail}
              firstName={driver.firstName}
              lastName={driver.lastName}
              size="lg"
            />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {driver.firstName} {driver.lastName}
              </h1>
              <p className="text-gray-600 mt-1">{driver.email}</p>
              <div className="flex items-center gap-2 mt-3">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${status.className}`}>
                  {status.label}
                </span>
                <DriverExpiringBadge licenseExpiryDate={driver.licenseExpiryDate} />
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <div className="relative">
              <select
                value={driver.status}
                onChange={(e) => updateStatusMutation.mutate(e.target.value as DriverStatus)}
                disabled={updateStatusMutation.isPending}
                className="appearance-none px-4 py-2 border border-gray-300 rounded-md text-sm hover:bg-gray-50 disabled:opacity-50 pr-8"
              >
                <option value={DriverStatus.ACTIVE}>Actif</option>
                <option value={DriverStatus.INACTIVE}>Inactif</option>
                <option value={DriverStatus.SUSPENDED}>Suspendu</option>
                <option value={DriverStatus.ON_LEAVE}>En congé</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                  <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                </svg>
              </div>
            </div>

            <button
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
              className="px-4 py-2 border border-red-600 text-red-600 rounded-md hover:bg-red-50 disabled:opacity-50"
            >
              Supprimer
            </button>
          </div>
        </div>

        {deleteMutation.isError && (
          <div className="mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            Impossible de supprimer ce conducteur (vérifiez qu'aucun véhicule n'est assigné)
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('info')}
            className={`pb-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'info'
                ? 'border-flotteq-blue text-flotteq-blue'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Informations
          </button>
          <button
            onClick={() => setActiveTab('vehicles')}
            className={`pb-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'vehicles'
                ? 'border-flotteq-blue text-flotteq-blue'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Véhicules
            {driver.vehicles && driver.vehicles.length > 0 && (
              <span className="ml-2 bg-gray-100 text-gray-900 py-0.5 px-2 rounded-full text-xs">
                {driver.vehicles.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('documents')}
            className={`pb-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'documents'
                ? 'border-flotteq-blue text-flotteq-blue'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Documents
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'info' && <DriverInfoTab driver={driver} />}
      {activeTab === 'vehicles' && <DriverVehiclesTab driver={driver} />}
      {activeTab === 'documents' && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <EntityDocumentsTab
            entityType={DocumentEntityType.DRIVER}
            entityId={driver.id}
            entityName={`${driver.firstName} ${driver.lastName}`}
          />
        </div>
      )}
    </div>
  );
}
