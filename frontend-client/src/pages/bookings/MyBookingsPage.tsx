import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Star } from 'lucide-react';
import BookingCard from '@/components/bookings/BookingCard';
import RatingModal from '@/components/bookings/RatingModal';
import { useMyBookings, useCancelBooking } from '@/hooks/useBookingsClient';
import type { Booking } from '@/types/booking.types';

type TabType = 'upcoming' | 'past';

export default function MyBookingsPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>('upcoming');
  const [ratingModal, setRatingModal] = useState<{ isOpen: boolean; booking: Booking | null }>({
    isOpen: false,
    booking: null,
  });

  const { data, isLoading, error } = useMyBookings();
  const cancelMutation = useCancelBooking();

  const handleCancel = (id: string) => {
    const reason = prompt("Raison de l'annulation :");
    if (reason) {
      cancelMutation.mutate({ id, reason });
    }
  };

  const handleOpenRatingModal = (booking: Booking) => {
    setRatingModal({ isOpen: true, booking });
  };

  const handleCloseRatingModal = () => {
    setRatingModal({ isOpen: false, booking: null });
  };

  // Filter bookings based on active tab (date + status)
  const filteredBookings = data?.bookings.filter((booking) => {
    const scheduledDate = new Date(booking.scheduledDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const isPastDate = scheduledDate < today;
    const isActiveStatus = ['pending', 'confirmed', 'in_progress'].includes(booking.status);
    const isTerminalStatus = ['completed', 'cancelled', 'rejected'].includes(booking.status);

    if (activeTab === 'upcoming') {
      // À venir : Date future ET statut actif
      return !isPastDate && isActiveStatus;
    } else {
      // Historique : Date passée OU statut terminal
      return isPastDate || isTerminalStatus;
    }
  });

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

        {/* Bouton Calendrier */}
        <button
          onClick={() => navigate('/bookings/calendar')}
          className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-flotteq-blue text-flotteq-blue rounded-lg hover:bg-blue-50 transition-colors font-medium"
        >
          <Calendar className="h-5 w-5" />
          Vue Calendrier
        </button>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <div className="flex">
            <button
              onClick={() => setActiveTab('upcoming')}
              className={`px-6 py-3 text-sm font-medium transition-colors border-b-2 ${
                activeTab === 'upcoming'
                  ? 'border-flotteq-blue text-flotteq-blue'
                  : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
              }`}
            >
              À venir
            </button>
            <button
              onClick={() => setActiveTab('past')}
              className={`px-6 py-3 text-sm font-medium transition-colors border-b-2 ${
                activeTab === 'past'
                  ? 'border-flotteq-blue text-flotteq-blue'
                  : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
              }`}
            >
              Historique
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
          <div className="m-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">
              Erreur : {(error as any).response?.data?.message || 'Erreur inconnue'}
            </p>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && filteredBookings && filteredBookings.length === 0 && (
          <div className="text-center py-12">
            <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune réservation</h3>
            <p className="text-gray-600 mb-4">
              {activeTab === 'upcoming'
                ? "Vous n'avez pas de réservation à venir"
                : "Vous n'avez pas encore d'historique de réservations"}
            </p>
            {activeTab === 'upcoming' && (
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
        {!isLoading && filteredBookings && filteredBookings.length > 0 && (
          <div className="p-6">
            <p className="text-sm text-gray-600 mb-4">
              {filteredBookings.length} réservation(s) trouvée(s)
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredBookings.map((booking) => (
                <BookingCard
                  key={booking.id}
                  booking={booking}
                  onCancel={handleCancel}
                  actions={
                    activeTab === 'past' &&
                    booking.status === 'completed' &&
                    !booking.hasRating ? (
                      <button
                        onClick={() => handleOpenRatingModal(booking)}
                        className="flex items-center gap-2 px-4 py-2 bg-yellow-50 text-yellow-700 rounded-lg hover:bg-yellow-100 transition-colors font-medium"
                      >
                        <Star className="h-4 w-4" />
                        Noter
                      </button>
                    ) : null
                  }
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Rating Modal */}
      {ratingModal.booking && (
        <RatingModal
          isOpen={ratingModal.isOpen}
          onClose={handleCloseRatingModal}
          bookingId={ratingModal.booking.id}
          partnerName={ratingModal.booking.partnerName}
        />
      )}
    </div>
  );
}
