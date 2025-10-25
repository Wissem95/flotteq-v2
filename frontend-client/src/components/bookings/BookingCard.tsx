import { Calendar, Clock, Car, DollarSign, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { Booking, BookingStatus } from '@/types/booking.types';

interface BookingCardProps {
  booking: Booking;
  onCancel?: (id: string) => void;
}

const statusLabels: Record<BookingStatus, { label: string; color: string }> = {
  pending: { label: 'En attente', color: 'bg-yellow-100 text-yellow-800' },
  confirmed: { label: 'Confirmé', color: 'bg-green-100 text-green-800' },
  in_progress: { label: 'En cours', color: 'bg-blue-100 text-blue-800' },
  completed: { label: 'Terminé', color: 'bg-gray-100 text-gray-800' },
  cancelled: { label: 'Annulé', color: 'bg-red-100 text-red-800' },
  rejected: { label: 'Refusé', color: 'bg-red-100 text-red-800' },
};

export default function BookingCard({ booking, onCancel }: BookingCardProps) {
  const navigate = useNavigate();
  const status = statusLabels[booking.status];

  const canCancel = ['pending', 'confirmed'].includes(booking.status);

  const handleViewDetails = () => {
    navigate(`/my-bookings/${booking.id}`);
  };

  const handleCancel = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onCancel && window.confirm('Êtes-vous sûr de vouloir annuler cette réservation ?')) {
      onCancel(booking.id);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">{booking.partnerName}</h3>
          <p className="text-sm text-gray-600">{booking.serviceName}</p>
        </div>
        <span className={`px-3 py-1 ${status.color} text-xs font-medium rounded`}>
          {status.label}
        </span>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Calendar className="h-4 w-4" />
          <span>{new Date(booking.scheduledDate).toLocaleDateString('fr-FR')}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Clock className="h-4 w-4" />
          <span>{booking.scheduledTime}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Car className="h-4 w-4" />
          <span>{booking.vehicleRegistration}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <DollarSign className="h-4 w-4" />
          <span className="font-medium">{booking.price.toFixed(2)}€</span>
        </div>
      </div>

      {booking.customerNotes && (
        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <p className="text-xs text-gray-500 mb-1">Notes :</p>
          <p className="text-sm text-gray-700">{booking.customerNotes}</p>
        </div>
      )}

      <div className="flex gap-2">
        <button
          onClick={handleViewDetails}
          className="flex-1 px-4 py-2 bg-flotteq-blue text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          Voir détails
        </button>
        {canCancel && onCancel && (
          <button
            onClick={handleCancel}
            className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors flex items-center gap-2"
          >
            <X className="h-4 w-4" />
            Annuler
          </button>
        )}
      </div>
    </div>
  );
}
