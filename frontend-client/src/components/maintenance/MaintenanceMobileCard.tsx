import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Car, Calendar, Euro, Eye } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { Maintenance, MaintenanceStatus } from '@/types/maintenance.types';

interface MaintenanceMobileCardProps {
  maintenance: Maintenance;
  onView: (maintenance: Maintenance) => void;
}

export function MaintenanceMobileCard({ maintenance, onView }: MaintenanceMobileCardProps) {
  const getStatusBadge = (status: MaintenanceStatus) => {
    const config = {
      scheduled: { label: 'Planifiée', className: 'bg-blue-100 text-blue-700' },
      in_progress: { label: 'En cours', className: 'bg-yellow-100 text-yellow-700' },
      completed: { label: 'Terminée', className: 'bg-green-100 text-green-700' },
      cancelled: { label: 'Annulée', className: 'bg-gray-100 text-gray-700' },
    };
    const badge = config[status] || config.scheduled;
    return <Badge className={badge.className}>{badge.label}</Badge>;
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      preventive: 'Préventive',
      corrective: 'Corrective',
      inspection: 'Contrôle',
      tire_change: 'Pneus',
      oil_change: 'Vidange',
    };
    return labels[type] || type;
  };

  return (
    <div
      className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm space-y-3 hover:shadow-md transition-shadow cursor-pointer"
      onClick={() => onView(maintenance)}
    >
      {/* Header */}
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <Car className="h-4 w-4 text-gray-500" />
            <h3 className="font-semibold text-base">
              {maintenance.vehicle?.registration || maintenance.vehicleId}
            </h3>
          </div>
          {maintenance.vehicle && (
            <p className="text-sm text-gray-600">
              {maintenance.vehicle.brand} {maintenance.vehicle.model}
            </p>
          )}
        </div>
        {getStatusBadge(maintenance.status)}
      </div>

      {/* Type et Description */}
      <div>
        <span className="inline-block bg-gray-100 text-gray-700 text-xs font-medium px-2 py-1 rounded mb-2">
          {getTypeLabel(maintenance.type)}
        </span>
        <p className="text-sm text-gray-700 line-clamp-2">{maintenance.description}</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3 pt-2 border-t">
        <div>
          <div className="flex items-center gap-1 text-xs text-gray-500 mb-1">
            <Calendar className="h-3 w-3" />
            <span>Date prévue</span>
          </div>
          <p className="text-sm font-medium text-gray-900">
            {format(new Date(maintenance.scheduledDate), 'dd MMM yyyy', { locale: fr })}
          </p>
        </div>
        <div>
          <div className="flex items-center gap-1 text-xs text-gray-500 mb-1">
            <Euro className="h-3 w-3" />
            <span>Coût estimé</span>
          </div>
          <p className="text-sm font-semibold text-gray-900">
            {maintenance.estimatedCost?.toLocaleString('fr-FR')}€
          </p>
        </div>
      </div>

      {/* Action */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onView(maintenance);
        }}
        className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-md transition-colors text-sm font-medium mt-2"
      >
        <Eye className="h-4 w-4" />
        Voir les détails
      </button>
    </div>
  );
}
