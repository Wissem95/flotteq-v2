import { useMemo } from 'react';
import { Calendar as BigCalendar, dateFnsLocalizer } from 'react-big-calendar';
import { format as formatDate, parse, startOfWeek as startOfWeekFns, getDay, endOfWeek, startOfWeek } from 'date-fns';
import { fr } from 'date-fns/locale';
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

export default function WeeklyCalendar() {
  const weekStart = formatDate(startOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd');
  const weekEnd = formatDate(endOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd');

  const { data, isLoading } = useBookings({
    status: 'confirmed',
    startDate: weekStart,
    endDate: weekEnd,
  });

  const events: CalendarEvent[] = useMemo(() => {
    if (!data?.data) return [];

    return data.data
      .filter((booking) => booking.vehicle && booking.service) // Filter out bookings without required data
      .map((booking) => {
        const [hours, minutes] = booking.scheduledTime.split(':');
        const start = new Date(booking.scheduledDate);
        start.setHours(parseInt(hours), parseInt(minutes), 0);

        // Estimate 1 hour duration (can be adjusted based on service)
        const end = new Date(start);
        end.setHours(start.getHours() + 1);

        return {
          id: booking.id,
          title: `${booking.vehicle.brand} ${booking.vehicle.model} - ${booking.service.name}`,
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
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Planning de la semaine</h2>

      <div className="h-96" style={{ minHeight: '400px' }}>
        <BigCalendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          defaultView="week"
          views={['week']}
          toolbar={false}
          culture="fr"
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
          eventPropGetter={() => ({
            style: {
              backgroundColor: '#2563eb',
              borderRadius: '4px',
              opacity: 0.9,
              color: 'white',
              border: 'none',
              display: 'block',
            },
          })}
        />
      </div>

      {events.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <p className="text-sm text-gray-600">
            <span className="font-semibold text-gray-900">{events.length}</span> rendez-vous confirmé{events.length > 1 ? 's' : ''} cette semaine
          </p>
        </div>
      )}
    </div>
  );
}
