import { useState } from 'react';
import { Check, X, Car, Calendar, Clock, User } from 'lucide-react';
import type { Booking } from '../../types/partner';
import { useConfirmBooking, useRejectBooking } from '../../hooks/useBookings';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface PendingBookingCardProps {
  booking: Booking;
}

export default function PendingBookingCard({ booking }: PendingBookingCardProps) {
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  const confirmMutation = useConfirmBooking();
  const rejectMutation = useRejectBooking();

  const handleConfirm = () => {
    confirmMutation.mutate(booking.id);
  };

  const handleReject = () => {
    if (!rejectReason.trim()) {
      alert('Veuillez indiquer une raison de refus');
      return;
    }
    rejectMutation.mutate(
      { bookingId: booking.id, reason: rejectReason },
      {
        onSuccess: () => {
          setShowRejectModal(false);
          setRejectReason('');
        },
      }
    );
  };

  const formattedDate = format(new Date(booking.scheduledDate), 'EEEE dd MMMM yyyy', { locale: fr });

  return (
    <>
      <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <Car className="h-5 w-5 text-flotteq-blue" />
            <div>
              <p className="font-semibold text-gray-900">
                {booking.vehicle.brand} {booking.vehicle.model}
              </p>
              <p className="text-sm text-gray-500">{booking.vehicle.registration}</p>
            </div>
          </div>
          <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded">
            En attente
          </span>
        </div>

        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <User className="h-4 w-4" />
            <span>{booking.tenant.name}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Calendar className="h-4 w-4" />
            <span className="capitalize">{formattedDate}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Clock className="h-4 w-4" />
            <span>{booking.scheduledTime}</span>
          </div>
        </div>

        <div className="mb-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-sm font-medium text-gray-900">{booking.service.name}</p>
          <p className="text-lg font-bold text-flotteq-blue">{Number(booking.service.price).toFixed(2)}€</p>
        </div>

        {booking.notes && (
          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-500 mb-1">Notes du client :</p>
            <p className="text-sm text-gray-700">{booking.notes}</p>
          </div>
        )}

        <div className="flex gap-2">
          <button
            onClick={handleConfirm}
            disabled={confirmMutation.isPending}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Check className="h-4 w-4" />
            {confirmMutation.isPending ? 'Confirmation...' : 'Accepter'}
          </button>
          <button
            onClick={() => setShowRejectModal(true)}
            disabled={rejectMutation.isPending}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <X className="h-4 w-4" />
            Refuser
          </button>
        </div>
      </div>

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Refuser la réservation</h3>
            <p className="text-sm text-gray-600 mb-4">
              Veuillez indiquer la raison du refus :
            </p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-flotteq-blue"
              rows={4}
              placeholder="Ex: Pas de disponibilité à cette date..."
            />
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => setShowRejectModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleReject}
                disabled={rejectMutation.isPending || !rejectReason.trim()}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {rejectMutation.isPending ? 'Refus...' : 'Confirmer le refus'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
