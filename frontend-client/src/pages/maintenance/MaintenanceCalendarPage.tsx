import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMaintenances } from '../../hooks/useMaintenance';
import { MaintenanceStatus, MaintenanceType } from '../../types/maintenance.types';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths } from 'date-fns';
import { fr } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Calendar, FileDown } from 'lucide-react';
import { exportMonthlyCalendarPDF } from '../../utils/pdfExport';

export default function MaintenanceCalendarPage() {
  const navigate = useNavigate();
  const { data: maintenances = [], isLoading } = useMaintenances();
  const [currentDate, setCurrentDate] = useState(new Date());

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Préparer les jours de la grille (incluant les jours du mois précédent/suivant)
  const calendarDays = useMemo(() => {
    const startDay = monthStart.getDay(); // 0 = Dimanche
    const days = [...daysInMonth];

    // Ajouter les jours du mois précédent
    const prevMonthEnd = subMonths(monthStart, 1);
    const prevMonthDays = eachDayOfInterval({
      start: new Date(prevMonthEnd.getFullYear(), prevMonthEnd.getMonth(), prevMonthEnd.getDate() - startDay + 1),
      end: prevMonthEnd,
    });
    days.unshift(...prevMonthDays);

    // Compléter avec les jours du mois suivant
    while (days.length < 42) {
      const lastDay = days[days.length - 1];
      days.push(new Date(lastDay.getFullYear(), lastDay.getMonth(), lastDay.getDate() + 1));
    }

    return days;
  }, [currentDate, daysInMonth, monthStart]);

  const getMaintenancesForDay = (day: Date) => {
    return maintenances.filter((m) =>
      isSameDay(new Date(m.scheduledDate), day)
    );
  };

  const getStatusColor = (status: MaintenanceStatus) => {
    switch (status) {
      case MaintenanceStatus.SCHEDULED:
        return 'bg-blue-500';
      case MaintenanceStatus.IN_PROGRESS:
        return 'bg-yellow-500';
      case MaintenanceStatus.COMPLETED:
        return 'bg-green-500';
      case MaintenanceStatus.CANCELLED:
        return 'bg-gray-400';
    }
  };

  const getTypeLabel = (type: MaintenanceType) => {
    switch (type) {
      case MaintenanceType.PREVENTIVE:
        return 'Prév.';
      case MaintenanceType.CORRECTIVE:
        return 'Corr.';
      case MaintenanceType.INSPECTION:
        return 'Ctrl.';
      case MaintenanceType.TIRE_CHANGE:
        return 'Pneus';
      case MaintenanceType.OIL_CHANGE:
        return 'Vid.';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <Calendar className="h-7 w-7" />
            Calendrier des maintenances
          </h1>
          <p className="text-gray-500 mt-1">Vue mensuelle des maintenances planifiées</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => navigate('/maintenances/calendar-interactive')}
            className="flex items-center gap-2 px-4 py-2 bg-flotteq-blue text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Mode Interactif
          </button>
          <button
            onClick={() => {
              const monthMaintenances = maintenances.filter(m =>
                isSameMonth(new Date(m.scheduledDate), currentDate)
              );
              exportMonthlyCalendarPDF(monthMaintenances, currentDate);
            }}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <FileDown className="h-5 w-5" />
            Exporter le mois
          </button>
        </div>
      </div>

      {/* Calendar Header */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => setCurrentDate(subMonths(currentDate, 1))}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>

          <h2 className="text-xl font-semibold capitalize">
            {format(currentDate, 'MMMM yyyy', { locale: fr })}
          </h2>

          <button
            onClick={() => setCurrentDate(addMonths(currentDate, 1))}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>

        {/* Days of Week */}
        <div className="grid grid-cols-7 gap-2 mb-2">
          {['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'].map((day) => (
            <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-2">
          {calendarDays.map((day, index) => {
            const dayMaintenances = getMaintenancesForDay(day);
            const isCurrentMonth = isSameMonth(day, currentDate);
            const isToday = isSameDay(day, new Date());

            return (
              <div
                key={index}
                className={`min-h-[100px] p-2 border rounded-lg ${
                  isCurrentMonth ? 'bg-white' : 'bg-gray-50'
                } ${isToday ? 'border-flotteq-blue border-2' : 'border-gray-200'}`}
              >
                <div className={`text-sm font-medium mb-1 ${
                  isCurrentMonth ? 'text-gray-900' : 'text-gray-400'
                }`}>
                  {format(day, 'd')}
                </div>

                <div className="space-y-1">
                  {dayMaintenances.slice(0, 2).map((maintenance) => (
                    <div
                      key={maintenance.id}
                      onClick={() => navigate(`/maintenances/${maintenance.id}`)}
                      className={`text-xs p-1 rounded cursor-pointer ${getStatusColor(maintenance.status)} bg-opacity-10 hover:bg-opacity-20 transition-colors`}
                    >
                      <div className="font-medium truncate">
                        {getTypeLabel(maintenance.type)}
                      </div>
                      <div className="truncate text-gray-600">
                        {maintenance.vehicle?.registration || 'N/A'}
                      </div>
                    </div>
                  ))}
                  {dayMaintenances.length > 2 && (
                    <div className="text-xs text-gray-500 font-medium">
                      +{dayMaintenances.length - 2} autre{dayMaintenances.length - 2 > 1 ? 's' : ''}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <h3 className="text-sm font-medium text-gray-700 mb-3">Légende</h3>
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-blue-500 bg-opacity-20 border-2 border-blue-500"></div>
            <span className="text-sm text-gray-600">Planifiée</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-yellow-500 bg-opacity-20 border-2 border-yellow-500"></div>
            <span className="text-sm text-gray-600">En cours</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-green-500 bg-opacity-20 border-2 border-green-500"></div>
            <span className="text-sm text-gray-600">Terminée</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-gray-400 bg-opacity-20 border-2 border-gray-400"></div>
            <span className="text-sm text-gray-600">Annulée</span>
          </div>
        </div>
      </div>
    </div>
  );
}
