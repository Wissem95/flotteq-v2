import { useNavigate } from 'react-router-dom';
import { useUpcomingMaintenances } from '../../hooks/useMaintenance';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Wrench, AlertTriangle, Calendar, ChevronRight } from 'lucide-react';

interface UpcomingMaintenancesListProps {
  daysAhead?: number;
}

export default function UpcomingMaintenancesList({ daysAhead = 7 }: UpcomingMaintenancesListProps) {
  const navigate = useNavigate();
  const { data: alerts = [], isLoading } = useUpcomingMaintenances(daysAhead);

  const getAlertColor = (daysUntil: number) => {
    if (daysUntil < 0) return 'bg-red-50 border-red-200';
    if (daysUntil <= 3) return 'bg-orange-50 border-orange-200';
    return 'bg-blue-50 border-blue-200';
  };

  const getAlertIcon = (daysUntil: number) => {
    if (daysUntil < 0) return <AlertTriangle className="h-5 w-5 text-red-600" />;
    if (daysUntil <= 3) return <AlertTriangle className="h-5 w-5 text-orange-600" />;
    return <Calendar className="h-5 w-5 text-blue-600" />;
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <Wrench className="h-5 w-5 text-gray-400" />
          <h3 className="text-lg font-semibold text-gray-900">Maintenances à venir</h3>
        </div>
        <div className="text-center text-gray-500 py-8">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Wrench className="h-5 w-5 text-gray-400" />
          <h3 className="text-lg font-semibold text-gray-900">Maintenances à venir</h3>
        </div>
        <button
          onClick={() => navigate('/maintenances/calendar')}
          className="text-sm text-flotteq-blue hover:text-blue-700 font-medium"
        >
          Voir le calendrier →
        </button>
      </div>

      {alerts.length === 0 ? (
        <div className="text-center py-8">
          <Calendar className="h-12 w-12 mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500">Aucune maintenance prévue dans les {daysAhead} prochains jours</p>
        </div>
      ) : (
        <div className="space-y-3">
          {alerts.slice(0, 5).map((alert) => (
            <div
              key={alert.maintenanceId}
              onClick={() => navigate(`/maintenances/${alert.maintenanceId}`)}
              className={`p-4 rounded-lg border cursor-pointer hover:shadow-md transition-shadow ${getAlertColor(alert.daysUntil)}`}
            >
              <div className="flex items-start gap-3">
                {getAlertIcon(alert.daysUntil)}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="font-medium text-gray-900 truncate">
                      {alert.vehicleRegistration}
                    </h4>
                    <span className="text-sm font-medium text-gray-600 whitespace-nowrap">
                      {alert.daysUntil < 0
                        ? `En retard de ${Math.abs(alert.daysUntil)}j`
                        : alert.daysUntil === 0
                          ? "Aujourd'hui"
                          : `Dans ${alert.daysUntil}j`
                      }
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{alert.alertReason}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xs px-2 py-1 bg-white bg-opacity-60 rounded-full">
                      {alert.type}
                    </span>
                    <span className="text-xs text-gray-500">
                      {format(new Date(alert.scheduledDate), 'dd MMM yyyy', { locale: fr })}
                    </span>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-gray-400 flex-shrink-0" />
              </div>
            </div>
          ))}

          {alerts.length > 5 && (
            <button
              onClick={() => navigate('/maintenances')}
              className="w-full py-2 text-sm text-flotteq-blue hover:text-blue-700 font-medium"
            >
              Voir toutes les maintenances ({alerts.length})
            </button>
          )}
        </div>
      )}
    </div>
  );
}
