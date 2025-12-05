import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMaintenances, useDeleteMaintenance } from '../../hooks/useMaintenance';
import { MaintenanceType, MaintenanceStatus } from '../../types/maintenance.types';
import { format } from 'date-fns';
import { Plus, Trash2, Edit, Wrench, AlertCircle, FileDown } from 'lucide-react';
import { exportMaintenancesToPDF } from '../../utils/pdfExport';
import { ProtectedButton } from '@/components/common/ProtectedButton';
import { MaintenanceMobileCard } from '@/components/maintenance/MaintenanceMobileCard';

export default function MaintenancesListPage() {
  const navigate = useNavigate();
  const { data: maintenances = [], isLoading, error } = useMaintenances();
  const deleteMutation = useDeleteMaintenance();

  const [statusFilter, setStatusFilter] = useState<MaintenanceStatus | 'all'>('all');
  const [typeFilter, setTypeFilter] = useState<MaintenanceType | 'all'>('all');

  const filteredMaintenances = maintenances.filter((m) => {
    if (statusFilter !== 'all' && m.status !== statusFilter) return false;
    if (typeFilter !== 'all' && m.type !== typeFilter) return false;
    return true;
  });

  const handleDelete = async (id: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette maintenance ?')) {
      await deleteMutation.mutateAsync(id);
    }
  };

  const getStatusColor = (status: MaintenanceStatus) => {
    switch (status) {
      case MaintenanceStatus.SCHEDULED:
        return 'bg-blue-100 text-blue-800';
      case MaintenanceStatus.IN_PROGRESS:
        return 'bg-yellow-100 text-yellow-800';
      case MaintenanceStatus.COMPLETED:
        return 'bg-green-100 text-green-800';
      case MaintenanceStatus.CANCELLED:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: MaintenanceStatus) => {
    switch (status) {
      case MaintenanceStatus.SCHEDULED:
        return 'Planifiée';
      case MaintenanceStatus.IN_PROGRESS:
        return 'En cours';
      case MaintenanceStatus.COMPLETED:
        return 'Terminée';
      case MaintenanceStatus.CANCELLED:
        return 'Annulée';
    }
  };

  const getTypeLabel = (type: MaintenanceType) => {
    switch (type) {
      case MaintenanceType.PREVENTIVE:
        return 'Préventive';
      case MaintenanceType.CORRECTIVE:
        return 'Corrective';
      case MaintenanceType.INSPECTION:
        return 'Contrôle';
      case MaintenanceType.TIRE_CHANGE:
        return 'Pneus';
      case MaintenanceType.OIL_CHANGE:
        return 'Vidange';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Chargement...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-red-500 flex items-center gap-2">
          <AlertCircle className="h-5 w-5" />
          Erreur de chargement
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-2xl font-bold text-gray-900">Maintenances</h1>
          <p className="text-sm sm:text-base text-gray-500 mt-1">Gérez les maintenances de votre flotte</p>
        </div>
        <div className="flex gap-2 sm:gap-3">
          <ProtectedButton
            permission="maintenances.export"
            disabledMessage="Vous n'avez pas la permission d'exporter les maintenances"
            onClick={() => exportMaintenancesToPDF(filteredMaintenances)}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 sm:px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm"
          >
            <FileDown className="h-4 sm:h-5 w-4 sm:w-5" />
            <span className="hidden xs:inline">Exporter PDF</span>
          </ProtectedButton>
          <ProtectedButton
            permission="maintenances.create"
            disabledMessage="Vous n'avez pas la permission de créer des maintenances"
            onClick={() => navigate('/maintenances/new')}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 sm:px-4 py-2 bg-flotteq-blue text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
          >
            <Plus className="h-4 sm:h-5 w-4 sm:w-5" />
            <span className="hidden xs:inline">Nouvelle</span>
          </ProtectedButton>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg border border-gray-200 flex flex-col sm:flex-row gap-3 sm:gap-4">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">Statut</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as MaintenanceStatus | 'all')}
            className="w-full rounded-lg border-gray-300 focus:border-flotteq-blue focus:ring-flotteq-blue"
          >
            <option value="all">Tous les statuts</option>
            <option value={MaintenanceStatus.SCHEDULED}>Planifiée</option>
            <option value={MaintenanceStatus.IN_PROGRESS}>En cours</option>
            <option value={MaintenanceStatus.COMPLETED}>Terminée</option>
            <option value={MaintenanceStatus.CANCELLED}>Annulée</option>
          </select>
        </div>

        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as MaintenanceType | 'all')}
            className="w-full rounded-lg border-gray-300 focus:border-flotteq-blue focus:ring-flotteq-blue"
          >
            <option value="all">Tous les types</option>
            <option value={MaintenanceType.PREVENTIVE}>Préventive</option>
            <option value={MaintenanceType.CORRECTIVE}>Corrective</option>
            <option value={MaintenanceType.INSPECTION}>Contrôle</option>
            <option value={MaintenanceType.TIRE_CHANGE}>Pneus</option>
            <option value={MaintenanceType.OIL_CHANGE}>Vidange</option>
          </select>
        </div>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-4">
        {filteredMaintenances.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <Wrench className="h-12 w-12 mx-auto mb-3 text-gray-400" />
            <p className="text-gray-500">Aucune maintenance trouvée</p>
          </div>
        ) : (
          filteredMaintenances.map((maintenance) => (
            <MaintenanceMobileCard
              key={maintenance.id}
              maintenance={maintenance}
              onView={(m) => navigate(`/maintenances/${m.id}`)}
            />
          ))
        )}
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Véhicule
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date prévue
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Coût estimé
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredMaintenances.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    <Wrench className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                    Aucune maintenance trouvée
                  </td>
                </tr>
              ) : (
                filteredMaintenances.map((maintenance) => (
                  <tr
                    key={maintenance.id}
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => navigate(`/maintenances/${maintenance.id}`)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {maintenance.vehicle?.registration || maintenance.vehicleId}
                      </div>
                      {maintenance.vehicle && (
                        <div className="text-sm text-gray-500">
                          {maintenance.vehicle.brand} {maintenance.vehicle.model}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">{getTypeLabel(maintenance.type)}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-900">{maintenance.description}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">
                        {format(new Date(maintenance.scheduledDate), 'dd/MM/yyyy')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-gray-900">
                        {maintenance.estimatedCost ? Number(maintenance.estimatedCost).toFixed(2) : '0.00'} €
                      </span>
                      {maintenance.actualCost && (
                        <div className="text-xs text-gray-500">
                          Réel: {Number(maintenance.actualCost).toFixed(2)} €
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(maintenance.status)}`}>
                        {getStatusLabel(maintenance.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <ProtectedButton
                          permission="maintenances.update"
                          disabledMessage="Vous n'avez pas la permission de modifier les maintenances"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/maintenances/${maintenance.id}`);
                          }}
                          className="text-flotteq-blue hover:text-blue-700"
                        >
                          <Edit className="h-4 w-4" />
                        </ProtectedButton>
                        <ProtectedButton
                          permission="maintenances.delete"
                          disabledMessage="Vous n'avez pas la permission de supprimer les maintenances"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(maintenance.id);
                          }}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="h-4 w-4" />
                        </ProtectedButton>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
