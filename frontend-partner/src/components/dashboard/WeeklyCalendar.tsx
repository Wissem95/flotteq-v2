import { useState, useMemo } from 'react';
import { Calendar as BigCalendar, dateFnsLocalizer } from 'react-big-calendar';
import {
  format as formatDate,
  parse,
  startOfWeek as startOfWeekFns,
  getDay,
  endOfWeek,
  startOfWeek,
  addWeeks,
  subWeeks,
} from 'date-fns';
import { fr } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, X, Calendar, Clock, User, Car, FileText, CreditCard } from 'lucide-react';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { useBookings } from '../../hooks/useBookings';

// Configure date-fns localizer with French locale
const locales = {
  'fr': fr,
};

const localizer = dateFnsLocalizer({
  format: (date: Date, formatStr: string) => formatDate(date, formatStr, { locale: fr }),
  parse: (dateString: string, formatString: string) => parse(dateString, formatString, new Date(), { locale: fr }),
  startOfWeek: (date: Date) => startOfWeekFns(date, { locale: fr, weekStartsOn: 1 }),
  getDay: (date: Date) => getDay(date),
  locales,
});

interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  resource: any;
}

// Event component with detailed info
const EventComponent = ({ event }: { event: CalendarEvent }) => {
  const booking = event.resource;
  return (
    <div className="text-xs leading-tight p-1">
      <div className="font-semibold">{booking.vehicleRegistration || 'N/A'}</div>
      <div className="truncate">{booking.serviceName}</div>
      {booking.tenantName && (
        <div className="text-white/80 truncate">{booking.tenantName}</div>
      )}
    </div>
  );
};

// Modal component for booking details
const BookingModal = ({ booking, onClose }: { booking: any; onClose: () => void }) => {
  if (!booking) return null;

  const statusLabels: Record<string, string> = {
    pending: 'En attente',
    confirmed: 'Confirmé',
    in_progress: 'En cours',
    completed: 'Terminé',
    cancelled: 'Annulé',
    rejected: 'Rejeté',
  };

  const statusColors: Record<string, string> = {
    pending: 'bg-orange-100 text-orange-800',
    confirmed: 'bg-blue-100 text-blue-800',
    in_progress: 'bg-purple-100 text-purple-800',
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
    rejected: 'bg-red-100 text-red-800',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div
        className="bg-white rounded-lg shadow-xl w-full max-w-md m-4 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Détails du rendez-vous</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Status */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Statut</span>
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[booking.status] || 'bg-gray-100 text-gray-800'}`}>
              {statusLabels[booking.status] || booking.status}
            </span>
          </div>

          {/* Date & Time */}
          <div className="space-y-2">
            <div className="flex items-start gap-3">
              <Calendar className="h-5 w-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm text-gray-600">Date</p>
                <p className="text-sm font-medium text-gray-900">
                  {formatDate(new Date(booking.scheduledDate), 'EEEE dd MMMM yyyy', { locale: fr })}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Clock className="h-5 w-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm text-gray-600">Horaire</p>
                <p className="text-sm font-medium text-gray-900">
                  {booking.scheduledTime?.slice(0, 5)} - {booking.endTime?.slice(0, 5) || 'N/A'}
                </p>
              </div>
            </div>
          </div>

          {/* Vehicle */}
          <div className="flex items-start gap-3">
            <Car className="h-5 w-5 text-gray-400 mt-0.5" />
            <div>
              <p className="text-sm text-gray-600">Véhicule</p>
              <p className="text-sm font-medium text-gray-900">
                {booking.vehicleRegistration || 'N/A'}
              </p>
              {booking.vehicleBrand && booking.vehicleModel && (
                <p className="text-xs text-gray-500">
                  {booking.vehicleBrand} {booking.vehicleModel}
                </p>
              )}
            </div>
          </div>

          {/* Service */}
          <div className="flex items-start gap-3">
            <FileText className="h-5 w-5 text-gray-400 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm text-gray-600">Prestation</p>
              <p className="text-sm font-medium text-gray-900">
                {booking.serviceName || 'N/A'}
              </p>
              {booking.serviceDescription && (
                <p className="text-xs text-gray-500 mt-1">
                  {booking.serviceDescription}
                </p>
              )}
            </div>
          </div>

          {/* Client */}
          {booking.tenantName && (
            <div className="flex items-start gap-3">
              <User className="h-5 w-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm text-gray-600">Client</p>
                <p className="text-sm font-medium text-gray-900">
                  {booking.tenantName}
                </p>
              </div>
            </div>
          )}

          {/* Price */}
          {booking.totalAmount && (
            <div className="flex items-start gap-3">
              <CreditCard className="h-5 w-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm text-gray-600">Montant</p>
                <p className="text-sm font-medium text-gray-900">
                  {booking.totalAmount.toFixed(2)} €
                </p>
              </div>
            </div>
          )}

          {/* Notes */}
          {booking.notes && (
            <div className="pt-3 border-t border-gray-200">
              <p className="text-sm text-gray-600 mb-1">Notes</p>
              <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded">
                {booking.notes}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};

export default function WeeklyCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedBooking, setSelectedBooking] = useState<any>(null);

  const weekStart = formatDate(startOfWeek(currentDate, { weekStartsOn: 1 }), 'yyyy-MM-dd');
  const weekEnd = formatDate(endOfWeek(currentDate, { weekStartsOn: 1 }), 'yyyy-MM-dd');

  const { data, isLoading } = useBookings({
    // Show all bookings (not just confirmed)
    startDate: weekStart,
    endDate: weekEnd,
  });

  const handlePrevWeek = () => setCurrentDate(prev => subWeeks(prev, 1));
  const handleNextWeek = () => setCurrentDate(prev => addWeeks(prev, 1));
  const handleToday = () => setCurrentDate(new Date());

  const events: CalendarEvent[] = useMemo(() => {
    if (!data?.bookings) return [];

    return data.bookings
      .filter((booking) => booking.scheduledTime) // Filter out bookings without required data
      .map((booking) => {
        // Parse scheduled_time (ex: "10:00:00")
        const [startHours, startMinutes] = booking.scheduledTime.split(':');
        const start = new Date(booking.scheduledDate);
        start.setHours(parseInt(startHours), parseInt(startMinutes), 0);

        // Use end_time if available, otherwise default to +1h
        let end: Date;
        if (booking.endTime) {
          const [endHours, endMinutes] = booking.endTime.split(':');
          end = new Date(booking.scheduledDate);
          end.setHours(parseInt(endHours), parseInt(endMinutes), 0);
        } else {
          // Fallback: +1h if no end_time
          end = new Date(start);
          end.setHours(start.getHours() + 1);
        }

        return {
          id: booking.id,
          title: `${booking.vehicleRegistration || 'N/A'} - ${booking.serviceName}`,
          start,
          end,
          resource: booking,
        };
      });
  }, [data]);

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Planning de la semaine</h2>
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-flotteq-blue"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      {/* Custom Toolbar */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">
          Planning de la semaine
        </h2>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrevWeek}
            className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
            Précédent
          </button>
          <button
            onClick={handleToday}
            className="px-4 py-1.5 text-sm font-medium text-white bg-flotteq-blue hover:bg-flotteq-navy rounded-md transition-colors"
          >
            Aujourd'hui
          </button>
          <button
            onClick={handleNextWeek}
            className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
          >
            Suivant
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Week range display */}
      <div className="mb-3 text-sm text-gray-600">
        {formatDate(startOfWeek(currentDate, { weekStartsOn: 1 }), 'dd MMM', { locale: fr })} - {formatDate(endOfWeek(currentDate, { weekStartsOn: 1 }), 'dd MMM yyyy', { locale: fr })}
      </div>

      <div className="h-[700px]" style={{ minHeight: '700px' }}>
        <BigCalendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          defaultView="week"
          views={['week']}
          toolbar={false}
          culture="fr"
          date={currentDate}
          onNavigate={(date) => setCurrentDate(date)}
          onSelectEvent={(event) => setSelectedBooking(event.resource)}
          min={new Date(0, 0, 0, 7, 0, 0)}   // Start at 7:00
          max={new Date(0, 0, 0, 22, 0, 0)}  // End at 22:00
          step={30}  // 30-minute intervals
          timeslots={2}  // 2 slots per hour
          style={{ height: '100%' }}
          formats={{
            dayFormat: 'EEE dd',
            dayHeaderFormat: 'EEEE dd MMM',
            weekdayFormat: 'EEE',
            timeGutterFormat: 'HH:mm',
            eventTimeRangeFormat: ({ start, end }) =>
              `${formatDate(start, 'HH:mm', { locale: fr })} - ${formatDate(end, 'HH:mm', { locale: fr })}`,
          }}
          messages={{
            today: "Aujourd'hui",
            previous: 'Précédent',
            next: 'Suivant',
            month: 'Mois',
            week: 'Semaine',
            day: 'Jour',
            agenda: 'Agenda',
            date: 'Date',
            time: 'Heure',
            event: 'Événement',
            noEventsInRange: 'Aucun rendez-vous cette semaine',
            showMore: (total) => `+ ${total} de plus`,
            allDay: 'Toute la journée',
            work_week: 'Semaine de travail',
            yesterday: 'Hier',
            tomorrow: 'Demain',
          }}
          components={{
            event: EventComponent,
          }}
          eventPropGetter={(event) => {
            const booking = event.resource;
            let backgroundColor = '#6b7280'; // gray (default)

            switch (booking.status) {
              case 'pending':
                backgroundColor = '#f59e0b'; // orange
                break;
              case 'confirmed':
                backgroundColor = '#2563eb'; // blue
                break;
              case 'in_progress':
                backgroundColor = '#8b5cf6'; // purple
                break;
              case 'completed':
                backgroundColor = '#10b981'; // green
                break;
              case 'cancelled':
              case 'rejected':
                backgroundColor = '#ef4444'; // red
                break;
            }

            return {
              style: {
                backgroundColor,
                borderRadius: '6px',
                opacity: 0.95,
                color: 'white',
                border: 'none',
                padding: '6px 10px',
                fontSize: '13px',
                fontWeight: '500',
                cursor: 'pointer',
                minHeight: '60px',
              },
            };
          }}
        />
      </div>

      {/* Summary */}
      {events.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="flex items-center gap-6 text-sm">
            <p className="text-gray-600">
              <span className="font-semibold text-gray-900">{events.length}</span> rendez-vous cette semaine
            </p>

            {/* Status legend */}
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded bg-orange-500"></div>
                <span className="text-xs text-gray-600">En attente</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded bg-blue-600"></div>
                <span className="text-xs text-gray-600">Confirmé</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded bg-purple-600"></div>
                <span className="text-xs text-gray-600">En cours</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded bg-green-600"></div>
                <span className="text-xs text-gray-600">Terminé</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Booking Details Modal */}
      {selectedBooking && (
        <BookingModal
          booking={selectedBooking}
          onClose={() => setSelectedBooking(null)}
        />
      )}
    </div>
  );
}
