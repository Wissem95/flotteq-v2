import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMyBookings } from '@/hooks/useBookingsClient';
import type { BookingStatus } from '@/types/booking.types';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths } from 'date-fns';
import { fr } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Calendar, ArrowLeft } from 'lucide-react';

export default function BookingsCalendarPage() {
  const navigate = useNavigate();
  const { data, isLoading } = useMyBookings();
  const [currentDate, setCurrentDate] = useState(new Date());

  const bookings = data?.bookings || [];

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

  const getBookingsForDay = (day: Date) => {
    return bookings.filter((b) =>
      isSameDay(new Date(b.scheduledDate), day)
    );
  };

  const getStatusColor = (status: BookingStatus) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-500';
      case 'confirmed':
        return 'bg-green-500';
      case 'in_progress':
        return 'bg-blue-500';
      case 'completed':
        return 'bg-gray-500';
      case 'cancelled':
      case 'rejected':
        return 'bg-red-500';
      default:
        return 'bg-gray-400';
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
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/my-bookings')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            <span className="font-medium">Retour</span>
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              <Calendar className="h-7 w-7 text-flotteq-blue" />
              Calendrier des réservations
            </h1>
            <p className="text-gray-500 mt-1">Vue mensuelle de vos réservations</p>
          </div>
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
            const dayBookings = getBookingsForDay(day);
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
                  {dayBookings.slice(0, 2).map((booking) => (
                    <div
                      key={booking.id}
                      onClick={() => navigate(`/my-bookings/${booking.id}`)}
                      className={`text-xs p-1 rounded cursor-pointer ${getStatusColor(booking.status)} bg-opacity-10 hover:bg-opacity-20 transition-colors border ${getStatusColor(booking.status)} border-opacity-30`}
                    >
                      <div className="font-medium truncate text-gray-900">
                        {booking.scheduledTime}
                      </div>
                      <div className="truncate text-gray-700 font-medium">
                        {booking.partnerName}
                      </div>
                      <div className="truncate text-gray-600 text-[10px]">
                        {booking.serviceName}
                      </div>
                    </div>
                  ))}
                  {dayBookings.length > 2 && (
                    <div className="text-xs text-gray-500 font-medium">
                      +{dayBookings.length - 2} autre{dayBookings.length - 2 > 1 ? 's' : ''}
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
        <h3 className="text-sm font-medium text-gray-700 mb-3">Légende des statuts</h3>
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-yellow-500 bg-opacity-20 border-2 border-yellow-500"></div>
            <span className="text-sm text-gray-600">En attente</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-green-500 bg-opacity-20 border-2 border-green-500"></div>
            <span className="text-sm text-gray-600">Confirmé</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-blue-500 bg-opacity-20 border-2 border-blue-500"></div>
            <span className="text-sm text-gray-600">En cours</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-gray-500 bg-opacity-20 border-2 border-gray-500"></div>
            <span className="text-sm text-gray-600">Terminé</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-red-500 bg-opacity-20 border-2 border-red-500"></div>
            <span className="text-sm text-gray-600">Annulé/Refusé</span>
          </div>
        </div>
      </div>
    </div>
  );
}
