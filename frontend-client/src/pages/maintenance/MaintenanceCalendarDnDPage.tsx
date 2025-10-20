import { useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar as BigCalendar, momentLocalizer } from 'react-big-calendar';
import type { View, SlotInfo } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';

// Set moment locale to French
moment.locale('fr');
import '../../styles/calendar.css';
import { useMaintenances } from '../../hooks/useMaintenance';
import { MaintenanceStatus, MaintenanceType } from '../../types/maintenance.types';
import type { Maintenance } from '../../types/maintenance.types';
import { ArrowLeft, Plus, FileDown } from 'lucide-react';
import { exportMonthlyCalendarPDF } from '../../utils/pdfExport';
import QuickCreateMaintenanceModal from '../../components/maintenance/QuickCreateMaintenanceModal';

moment.locale('fr');
const localizer = momentLocalizer(moment);

interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  resource: Maintenance;
}

export default function MaintenanceCalendarDnDPage() {
  const navigate = useNavigate();
  const { data: maintenances = [], isLoading } = useMaintenances();

  const [view, setView] = useState<View>('month');
  const [date, setDate] = useState(new Date());
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<SlotInfo | null>(null);

  // Convertir les maintenances en événements calendrier
  const events = useMemo((): CalendarEvent[] => {
    return maintenances.map((m) => {
      const vehicleLabel = m.vehicle?.registration || m.vehicleId.substring(0, 8);
      const typeLabels: Record<MaintenanceType, string> = {
        [MaintenanceType.PREVENTIVE]: 'Prév.',
        [MaintenanceType.CORRECTIVE]: 'Corr.',
        [MaintenanceType.INSPECTION]: 'Ctrl.',
        [MaintenanceType.TIRE_CHANGE]: 'Pneus',
        [MaintenanceType.OIL_CHANGE]: 'Vid.',
      };

      return {
        id: m.id,
        title: `${vehicleLabel} - ${typeLabels[m.type]}`,
        start: new Date(m.scheduledDate),
        end: new Date(m.scheduledDate),
        resource: m,
      };
    });
  }, [maintenances]);

  // Gérer le clic sur un slot vide (créer nouvelle maintenance)
  const handleSelectSlot = useCallback((slotInfo: SlotInfo) => {
    setSelectedSlot(slotInfo);
    setShowCreateModal(true);
  }, []);

  // Gérer le clic sur un événement (ouvrir détails)
  const handleSelectEvent = useCallback(
    (event: CalendarEvent) => {
      navigate(`/maintenances/${event.id}`);
    },
    [navigate]
  );

  // Style des événements selon statut
  const eventStyleGetter = (event: CalendarEvent) => {
    const { status } = event.resource;
    let backgroundColor = '#3b82f6'; // blue

    switch (status) {
      case MaintenanceStatus.SCHEDULED:
        backgroundColor = '#3b82f6'; // blue
        break;
      case MaintenanceStatus.IN_PROGRESS:
        backgroundColor = '#f59e0b'; // amber
        break;
      case MaintenanceStatus.COMPLETED:
        backgroundColor = '#10b981'; // green
        break;
      case MaintenanceStatus.CANCELLED:
        backgroundColor = '#6b7280'; // gray
        break;
    }

    return {
      style: {
        backgroundColor,
        borderRadius: '5px',
        opacity: 0.9,
        color: 'white',
        border: '0',
        display: 'block',
      },
    };
  };

  const messages = {
    allDay: 'Journée',
    previous: 'Précédent',
    next: 'Suivant',
    today: "Aujourd'hui",
    month: 'Mois',
    week: 'Semaine',
    day: 'Jour',
    agenda: 'Agenda',
    date: 'Date',
    time: 'Heure',
    event: 'Événement',
    noEventsInRange: 'Aucune maintenance dans cette période',
    showMore: (total: number) => `+${total} autre(s)`,
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
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/maintenances/calendar')}
            className="text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Calendrier Interactif</h1>
            <p className="text-gray-500 mt-1">Glissez-déposez pour réorganiser</p>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => exportMonthlyCalendarPDF(maintenances, date)}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <FileDown className="h-5 w-5" />
            Exporter PDF
          </button>
          <button
            onClick={() => navigate('/maintenances/new')}
            className="flex items-center gap-2 px-4 py-2 bg-flotteq-blue text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-5 w-5" />
            Nouvelle
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div style={{ height: '700px' }}>
          <BigCalendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            style={{ height: '100%' }}
            messages={messages}
            views={['month', 'week', 'day', 'agenda']}
            view={view}
            onView={setView}
            date={date}
            onNavigate={setDate}
            onSelectEvent={handleSelectEvent}
            onSelectSlot={handleSelectSlot}
            eventPropGetter={eventStyleGetter}
            selectable
          />
        </div>
      </div>

      {/* Legend */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <h3 className="text-sm font-medium text-gray-700 mb-3">Légende</h3>
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: '#3b82f6' }}></div>
            <span className="text-sm text-gray-600">Planifiée</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: '#f59e0b' }}></div>
            <span className="text-sm text-gray-600">En cours</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: '#10b981' }}></div>
            <span className="text-sm text-gray-600">Terminée</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: '#6b7280' }}></div>
            <span className="text-sm text-gray-600">Annulée</span>
          </div>
        </div>
        <p className="text-sm text-gray-500 mt-3">
          💡 Glissez-déposez une maintenance pour changer sa date • Cliquez sur un jour vide pour créer
        </p>
      </div>

      {/* Quick Create Modal */}
      <QuickCreateMaintenanceModal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          setSelectedSlot(null);
        }}
        selectedDate={selectedSlot?.start || null}
      />
    </div>
  );
}
