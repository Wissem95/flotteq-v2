import { useQuery } from '@tanstack/react-query';
import { vehiclesService } from '../../api/services/vehicles.service';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { TrendingUp, Wrench, ClipboardCheck, Edit3 } from 'lucide-react';

interface MileageHistoryTimelineProps {
  vehicleId: string;
}

export default function MileageHistoryTimeline({ vehicleId }: MileageHistoryTimelineProps) {
  const { data: history, isLoading, error } = useQuery({
    queryKey: ['mileage-history', vehicleId],
    queryFn: () => vehiclesService.getMileageHistory(vehicleId),
  });

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/3"></div>
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex gap-4">
              <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error || !history) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <p className="text-sm text-red-600">Impossible de charger l'historique</p>
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
        <TrendingUp className="h-12 w-12 mx-auto mb-4 text-gray-400" />
        <p className="text-gray-600">Aucun historique de kilométrage</p>
        <p className="text-sm text-gray-500 mt-1">
          L'historique se remplira automatiquement lors de la mise à jour du kilométrage
        </p>
      </div>
    );
  }

  const getSourceIcon = (source: string) => {
    switch (source) {
      case 'maintenance':
        return Wrench;
      case 'inspection':
        return ClipboardCheck;
      default:
        return Edit3;
    }
  };

  const getSourceLabel = (source: string) => {
    switch (source) {
      case 'maintenance':
        return 'Maintenance';
      case 'inspection':
        return 'Inspection';
      default:
        return 'Modification manuelle';
    }
  };

  const getSourceColor = (source: string) => {
    switch (source) {
      case 'maintenance':
        return {
          icon: 'text-orange-600',
          bg: 'bg-orange-50',
          border: 'border-orange-200',
        };
      case 'inspection':
        return {
          icon: 'text-purple-600',
          bg: 'bg-purple-50',
          border: 'border-purple-200',
        };
      default:
        return {
          icon: 'text-blue-600',
          bg: 'bg-blue-50',
          border: 'border-blue-200',
        };
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      {/* Header */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-1">Historique du kilométrage</h3>
        <p className="text-sm text-gray-500">{history.length} relevé{history.length > 1 ? 's' : ''}</p>
      </div>

      {/* Timeline */}
      <div className="space-y-4">
        {history.map((entry, index) => {
          const Icon = getSourceIcon(entry.source);
          const colors = getSourceColor(entry.source);
          const isLast = index === history.length - 1;

          return (
            <div key={entry.id} className="relative">
              {/* Connector line */}
              {!isLast && (
                <div className="absolute left-6 top-12 bottom-0 w-0.5 bg-gray-200"></div>
              )}

              {/* Timeline item */}
              <div className="flex gap-4">
                {/* Icon */}
                <div className={`relative z-10 flex-shrink-0 w-12 h-12 ${colors.bg} ${colors.border} border-2 rounded-full flex items-center justify-center`}>
                  <Icon className={`h-5 w-5 ${colors.icon}`} />
                </div>

                {/* Content */}
                <div className="flex-1 bg-gray-50 rounded-lg p-4 border border-gray-100">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-lg font-bold text-gray-900">
                          {entry.mileage.toLocaleString('fr-FR')} km
                        </span>
                        {entry.difference > 0 && (
                          <span className="text-xs font-medium px-2 py-1 bg-green-100 text-green-700 rounded-full">
                            +{entry.difference.toLocaleString('fr-FR')} km
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500">
                        {format(new Date(entry.recordedAt), 'dd MMMM yyyy à HH:mm', { locale: fr })}
                      </p>
                    </div>
                    <span className={`text-xs font-medium px-2 py-1 ${colors.bg} ${colors.icon} rounded-md`}>
                      {getSourceLabel(entry.source)}
                    </span>
                  </div>

                  {entry.notes && (
                    <p className="text-sm text-gray-600 mt-2 italic">
                      📝 {entry.notes}
                    </p>
                  )}

                  {entry.previousMileage !== null && entry.previousMileage > 0 && (
                    <p className="text-xs text-gray-500 mt-2">
                      Kilométrage précédent : {entry.previousMileage.toLocaleString('fr-FR')} km
                    </p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
