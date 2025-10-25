import { useState } from 'react';
import { Calendar, Filter } from 'lucide-react';
import BookingCard from '@/components/bookings/BookingCard';
import { useMyBookings, useCancelBooking } from '@/hooks/useBookingsClient';
import type { BookingStatus } from '@/types/booking.types';

export default function MyBookingsPage() {
  const [statusFilter, setStatusFilter] = useState<BookingStatus | undefined>(undefined);

  const { data, isLoading, error } = useMyBookings({ status: statusFilter });
  const cancelMutation = useCancelBooking();

  const handleCancel = (id: string) => {
    const reason = prompt('Raison de l\'annulation :');
    if (reason) {
      cancelMutation.mutate({ id, reason });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Calendar className="h-7 w-7 text-flotteq-blue" />
            Mes réservations
          </h1>
          <p className="text-gray-600 mt-1">Gérez vos réservations avec les partenaires</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex items-center gap-2 mb-3">
          <Filter className="h-5 w-5 text-gray-600" />
          <h2 className="text-sm font-semibold text-gray-900">Filtres</h2>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setStatusFilter(undefined)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              statusFilter === undefined
                ? 'bg-flotteq-blue text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Toutes
          </button>
          <button
            onClick={() => setStatusFilter('pending' as BookingStatus)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              statusFilter === 'pending'
                ? 'bg-yellow-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            En attente
          </button>
          <button
            onClick={() => setStatusFilter('confirmed' as BookingStatus)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              statusFilter === 'confirmed'
                ? 'bg-green-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Confirmées
          </button>
          <button
            onClick={() => setStatusFilter('completed' as BookingStatus)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              statusFilter === 'completed'
                ? 'bg-gray-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Terminées
          </button>
        </div>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-flotteq-blue mx-auto"></div>
          <p className="text-gray-600 mt-4">Chargement...</p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">
            Erreur : {(error as any).response?.data?.message || 'Erreur inconnue'}
          </p>
        </div>
      )}

      {/* Empty State */}
      {data && data.bookings.length === 0 && (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune réservation</h3>
          <p className="text-gray-600 mb-4">
            {statusFilter ? 'Aucune réservation avec ce statut' : 'Vous n\'avez pas encore de réservation'}
          </p>
          {!statusFilter && (
            <a
              href="/marketplace"
              className="inline-block bg-flotteq-blue text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Explorer le marketplace
            </a>
          )}
        </div>
      )}

      {/* Bookings List */}
      {data && data.bookings.length > 0 && (
        <div>
          <p className="text-sm text-gray-600 mb-4">
            {data.total} réservation(s) trouvée(s)
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.bookings.map((booking) => (
              <BookingCard key={booking.id} booking={booking} onCancel={handleCancel} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
