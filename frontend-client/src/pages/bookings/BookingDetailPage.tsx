import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Calendar,
  Clock,
  Car,
  User,
  DollarSign,
  MapPin,
  Phone,
  FileText,
  AlertCircle,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { useBookingDetails } from '@/hooks/useBookingsClient';
import type { BookingStatus } from '@/types/booking.types';

const statusConfig: Record<BookingStatus, { label: string; color: string; icon: any }> = {
  pending: { label: 'En attente', color: 'bg-yellow-100 text-yellow-800 border-yellow-200', icon: Clock },
  confirmed: { label: 'Confirmé', color: 'bg-green-100 text-green-800 border-green-200', icon: CheckCircle },
  in_progress: { label: 'En cours', color: 'bg-blue-100 text-blue-800 border-blue-200', icon: Clock },
  completed: { label: 'Terminé', color: 'bg-gray-100 text-gray-800 border-gray-200', icon: CheckCircle },
  cancelled: { label: 'Annulé', color: 'bg-red-100 text-red-800 border-red-200', icon: XCircle },
  rejected: { label: 'Refusé', color: 'bg-red-100 text-red-800 border-red-200', icon: XCircle },
};

const paymentStatusLabels: Record<string, { label: string; color: string }> = {
  pending: { label: 'En attente', color: 'bg-yellow-100 text-yellow-800' },
  paid: { label: 'Payé', color: 'bg-green-100 text-green-800' },
  failed: { label: 'Échoué', color: 'bg-red-100 text-red-800' },
  refunded: { label: 'Remboursé', color: 'bg-gray-100 text-gray-800' },
};

export default function BookingDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: booking, isLoading, error } = useBookingDetails(id);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-flotteq-blue"></div>
        <p className="text-gray-600 mt-4 ml-4">Chargement...</p>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="space-y-4">
        <button
          onClick={() => navigate('/my-bookings')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
          <span className="font-medium">Retour aux réservations</span>
        </button>
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-6 w-6 text-red-600" />
            <div>
              <h3 className="font-semibold text-red-900">Réservation introuvable</h3>
              <p className="text-red-700 text-sm mt-1">
                {(error as any)?.response?.data?.message || 'Cette réservation n\'existe pas ou a été supprimée.'}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Vérification supplémentaire pour éviter les crashes
  if (!booking.id) {
    return (
      <div className="space-y-4">
        <button
          onClick={() => navigate('/my-bookings')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
          <span className="font-medium">Retour aux réservations</span>
        </button>
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-6 w-6 text-red-600" />
            <div>
              <h3 className="font-semibold text-red-900">Réservation invalide</h3>
              <p className="text-red-700 text-sm mt-1">Les données de cette réservation sont incomplètes.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const status = statusConfig[booking.status] || statusConfig.pending;
  const StatusIcon = status.icon;
  const paymentStatus = paymentStatusLabels[booking.paymentStatus] || paymentStatusLabels.pending;

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <button
        onClick={() => navigate('/my-bookings')}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
      >
        <ArrowLeft className="h-5 w-5" />
        <span className="font-medium">Retour aux réservations</span>
      </button>

      {/* Header Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Réservation #{booking.id?.slice(0, 8) || 'N/A'}
            </h1>
            <p className="text-gray-600">{booking.partnerName} - {booking.serviceName}</p>
          </div>
          <div className="flex flex-col gap-2 items-end">
            <span className={`px-4 py-2 ${status.color} text-sm font-medium rounded-lg border flex items-center gap-2`}>
              <StatusIcon className="h-4 w-4" />
              {status.label}
            </span>
            <span className={`px-3 py-1 ${paymentStatus.color} text-xs font-medium rounded`}>
              {paymentStatus.label}
            </span>
          </div>
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Date & Time */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Calendar className="h-5 w-5 text-flotteq-blue" />
            Date et heure
          </h2>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-500">Date</p>
              <p className="text-base font-medium text-gray-900">
                {new Date(booking.scheduledDate).toLocaleDateString('fr-FR', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Horaire</p>
              <p className="text-base font-medium text-gray-900">
                {booking.scheduledTime}
                {booking.endTime && ` - ${booking.endTime}`}
              </p>
            </div>
          </div>
        </div>

        {/* Vehicle */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Car className="h-5 w-5 text-flotteq-blue" />
            Véhicule
          </h2>
          <div>
            <p className="text-sm text-gray-500">Immatriculation</p>
            <p className="text-lg font-bold text-gray-900">{booking.vehicleRegistration}</p>
          </div>
        </div>

        {/* Driver */}
        {booking.driverName && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <User className="h-5 w-5 text-flotteq-blue" />
              Conducteur
            </h2>
            <p className="text-base font-medium text-gray-900">{booking.driverName}</p>
          </div>
        )}

        {/* Price */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-flotteq-blue" />
            Tarification
          </h2>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Prix du service</span>
              <span className="text-xl font-bold text-flotteq-blue">{booking.price.toFixed(2)} €</span>
            </div>
            {booking.commissionAmount && booking.commissionAmount > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Commission</span>
                <span className="text-gray-700">{booking.commissionAmount.toFixed(2)} €</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Service Description */}
      {booking.serviceDescription && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <FileText className="h-5 w-5 text-flotteq-blue" />
            Description du service
          </h2>
          <p className="text-gray-700">{booking.serviceDescription}</p>
        </div>
      )}

      {/* Notes */}
      {(booking.customerNotes || booking.partnerNotes) && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <FileText className="h-5 w-5 text-flotteq-blue" />
            Notes
          </h2>
          <div className="space-y-4">
            {booking.customerNotes && (
              <div className="bg-blue-50 rounded-lg p-4">
                <p className="text-sm font-medium text-blue-900 mb-1">Vos notes</p>
                <p className="text-gray-700">{booking.customerNotes}</p>
              </div>
            )}
            {booking.partnerNotes && (
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm font-medium text-gray-900 mb-1">Notes du partenaire</p>
                <p className="text-gray-700">{booking.partnerNotes}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Rejection/Cancellation Reason */}
      {(booking.rejectionReason || booking.cancellationReason) && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-red-900 mb-3 flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            {booking.rejectionReason ? 'Raison du refus' : 'Raison de l\'annulation'}
          </h2>
          <p className="text-red-800">{booking.rejectionReason || booking.cancellationReason}</p>
        </div>
      )}

      {/* Timestamps */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Historique</h2>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Créé le</span>
            <span className="text-gray-900">
              {new Date(booking.createdAt).toLocaleString('fr-FR')}
            </span>
          </div>
          {booking.confirmedAt && (
            <div className="flex justify-between">
              <span className="text-gray-600">Confirmé le</span>
              <span className="text-gray-900">
                {new Date(booking.confirmedAt).toLocaleString('fr-FR')}
              </span>
            </div>
          )}
          {booking.completedAt && (
            <div className="flex justify-between">
              <span className="text-gray-600">Terminé le</span>
              <span className="text-gray-900">
                {new Date(booking.completedAt).toLocaleString('fr-FR')}
              </span>
            </div>
          )}
          {booking.paidAt && (
            <div className="flex justify-between">
              <span className="text-gray-600">Payé le</span>
              <span className="text-gray-900">
                {new Date(booking.paidAt).toLocaleString('fr-FR')}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
