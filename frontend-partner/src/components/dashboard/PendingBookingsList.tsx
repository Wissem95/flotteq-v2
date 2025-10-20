import { useBookings } from '../../hooks/useBookings';
import PendingBookingCard from './PendingBookingCard';
import { AlertCircle } from 'lucide-react';

export default function PendingBookingsList() {
  const { data, isLoading, error } = useBookings({ status: 'pending', limit: 10 });

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Réservations en attente</h2>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-flotteq-blue"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Réservations en attente</h2>
        <div className="rounded-lg bg-red-50 border border-red-200 p-4">
          <p className="text-sm text-red-800">Erreur de chargement des réservations</p>
        </div>
      </div>
    );
  }

  if (!data?.data || data.data.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Réservations en attente</h2>
        <div className="flex flex-col items-center justify-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
          <AlertCircle className="h-12 w-12 text-gray-400 mb-3" />
          <p className="text-gray-500 text-sm">Aucune réservation en attente</p>
          <p className="text-gray-400 text-xs mt-1">Les nouvelles demandes apparaîtront ici</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Réservations en attente</h2>
        <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-sm font-medium rounded-full">
          {data.data.length} en attente
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {data.data.map((booking) => (
          <PendingBookingCard key={booking.id} booking={booking} />
        ))}
      </div>
    </div>
  );
}
