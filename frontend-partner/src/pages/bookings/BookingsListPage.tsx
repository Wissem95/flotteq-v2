import { useState } from 'react';
import { Search, Calendar, Filter, Eye, Check, X, Clock, Car, User, Mail, Phone } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import type { Booking, RescheduleBookingDto, CompleteBookingDto } from '../../types/partner';
import {
  useBookings,
  useConfirmBooking,
  useRejectBooking,
  useRescheduleBooking,
  useStartBooking,
  useCompleteBooking,
} from '../../hooks/useBookings';
import { Pagination } from '../../components/common/Pagination';
import { Modal } from '../../components/common/Modal';
import { FileUpload } from '../../components/FileUpload';

// Status badge helper
const getStatusBadge = (status: Booking['status']) => {
  const badges = {
    pending: { label: 'En attente', className: 'bg-yellow-100 text-yellow-800' },
    confirmed: { label: 'Confirmée', className: 'bg-green-100 text-green-800' },
    in_progress: { label: 'En cours', className: 'bg-blue-100 text-blue-800' },
    completed: { label: 'Terminée', className: 'bg-gray-100 text-gray-800' },
    rejected: { label: 'Refusée', className: 'bg-red-100 text-red-800' },
    cancelled: { label: 'Annulée', className: 'bg-gray-100 text-gray-800' },
  };

  const badge = badges[status] || badges.pending;
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${badge.className}`}>
      {badge.label}
    </span>
  );
};

export default function BookingsListPage() {
  // Filters state
  const [filters, setFilters] = useState({
    status: '',
    startDate: '',
    endDate: '',
    search: '',
    page: 1,
    limit: 20,
  });

  // Detail modal state
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [showRescheduleForm, setShowRescheduleForm] = useState(false);
  const [showCompleteForm, setShowCompleteForm] = useState(false);

  // Fetch bookings
  const { data, isLoading, error } = useBookings(filters);
  const bookings = data?.bookings || [];
  const total = data?.total || 0;
  const totalPages = data?.totalPages || 1;

  const handleFilterChange = (key: string, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value, page: 1 }));
  };

  const handlePageChange = (page: number) => {
    setFilters((prev) => ({ ...prev, page }));
  };

  const openDetailModal = (booking: Booking) => {
    setSelectedBooking(booking);
    setShowRejectForm(false);
    setShowRescheduleForm(false);
    setShowCompleteForm(booking.status === 'in_progress');
  };

  const closeDetailModal = () => {
    setSelectedBooking(null);
    setShowRejectForm(false);
    setShowRescheduleForm(false);
    setShowCompleteForm(false);
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Réservations</h1>

      {/* Filters */}
      <div className="bg-white shadow rounded-lg p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Status filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <Filter className="inline h-4 w-4 mr-1" />
              Statut
            </label>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-flotteq-blue"
            >
              <option value="">Tous</option>
              <option value="pending">En attente</option>
              <option value="confirmed">Confirmées</option>
              <option value="in_progress">En cours</option>
              <option value="completed">Terminées</option>
              <option value="rejected">Refusées</option>
              <option value="cancelled">Annulées</option>
            </select>
          </div>

          {/* Start date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <Calendar className="inline h-4 w-4 mr-1" />
              Date début
            </label>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => handleFilterChange('startDate', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-flotteq-blue"
            />
          </div>

          {/* End date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <Calendar className="inline h-4 w-4 mr-1" />
              Date fin
            </label>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => handleFilterChange('endDate', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-flotteq-blue"
            />
          </div>

          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <Search className="inline h-4 w-4 mr-1" />
              Recherche
            </label>
            <input
              type="text"
              placeholder="Client ou immatriculation..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-flotteq-blue"
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-gray-500">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-flotteq-blue"></div>
            <p className="mt-2">Chargement...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center text-red-600">
            Erreur lors du chargement des réservations
          </div>
        ) : bookings.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            Aucune réservation trouvée
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Heure</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Client</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Véhicule</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Service</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Prix</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {bookings.map((booking) => (
                    <tr key={booking.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {format(new Date(booking.scheduledDate), 'dd/MM/yyyy', { locale: fr })}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">{booking.scheduledTime}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{booking.tenant?.name || booking.tenantName || 'N/A'}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {booking.vehicle ? `${booking.vehicle.brand} ${booking.vehicle.model}` : booking.vehicleRegistration || 'N/A'}
                        <br />
                        <span className="text-xs text-gray-500">{booking.vehicle?.registration || booking.vehicleRegistration || 'N/A'}</span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">{booking.service?.name || booking.serviceName || 'N/A'}</td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">
                        {Number(booking.price || booking.service?.price || 0).toFixed(2)}€
                      </td>
                      <td className="px-4 py-3">{getStatusBadge(booking.status)}</td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => openDetailModal(booking)}
                          className="flex items-center gap-1 px-3 py-1 bg-flotteq-blue text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                        >
                          <Eye className="h-4 w-4" />
                          Détails
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="md:hidden divide-y divide-gray-200">
              {bookings.map((booking) => (
                <div key={booking.id} className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div className="text-sm font-medium text-gray-900">
                      {format(new Date(booking.scheduledDate), 'dd/MM/yyyy', { locale: fr })} - {booking.scheduledTime}
                    </div>
                    {getStatusBadge(booking.status)}
                  </div>
                  <div className="text-sm text-gray-600 space-y-1 mb-3">
                    <div>{booking.tenant?.name || booking.tenantName || 'N/A'}</div>
                    <div>
                      {booking.vehicle ? `${booking.vehicle.brand} ${booking.vehicle.model} (${booking.vehicle.registration})` : booking.vehicleRegistration || 'N/A'}
                    </div>
                    <div className="font-medium">
                      {booking.service?.name || booking.serviceName || 'N/A'} - {Number(booking.price || booking.service?.price || 0).toFixed(2)}€
                    </div>
                  </div>
                  <button
                    onClick={() => openDetailModal(booking)}
                    className="w-full flex items-center justify-center gap-1 px-3 py-2 bg-flotteq-blue text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                  >
                    <Eye className="h-4 w-4" />
                    Voir détails
                  </button>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <Pagination
                currentPage={filters.page}
                totalPages={totalPages}
                onPageChange={handlePageChange}
                hasNextPage={filters.page < totalPages}
                hasPreviousPage={filters.page > 1}
                total={total}
              />
            )}
          </>
        )}
      </div>

      {/* Detail Modal */}
      {selectedBooking && (
        <BookingDetailModal
          booking={selectedBooking}
          isOpen={!!selectedBooking}
          onClose={closeDetailModal}
          showRejectForm={showRejectForm}
          setShowRejectForm={setShowRejectForm}
          showRescheduleForm={showRescheduleForm}
          setShowRescheduleForm={setShowRescheduleForm}
          showCompleteForm={showCompleteForm}
          setShowCompleteForm={setShowCompleteForm}
        />
      )}
    </div>
  );
}

// Booking Detail Modal Component
interface BookingDetailModalProps {
  booking: Booking;
  isOpen: boolean;
  onClose: () => void;
  showRejectForm: boolean;
  setShowRejectForm: (show: boolean) => void;
  showRescheduleForm: boolean;
  setShowRescheduleForm: (show: boolean) => void;
  showCompleteForm: boolean;
  setShowCompleteForm: (show: boolean) => void;
}

function BookingDetailModal({
  booking,
  isOpen,
  onClose,
  showRejectForm,
  setShowRejectForm,
  showRescheduleForm,
  setShowRescheduleForm,
  showCompleteForm,
  setShowCompleteForm,
}: BookingDetailModalProps) {
  const confirmMutation = useConfirmBooking();
  const rejectMutation = useRejectBooking();
  const rescheduleMutation = useRescheduleBooking();
  const startMutation = useStartBooking();
  const completeMutation = useCompleteBooking();

  // Reject form state
  const [rejectReason, setRejectReason] = useState('');
  const [customReason, setCustomReason] = useState('');

  // Reschedule form state
  const [rescheduleData, setRescheduleData] = useState({
    scheduledDate: booking.scheduledDate,
    scheduledTime: booking.scheduledTime,
    endTime: booking.endTime || '',
  });

  // Complete form state
  const [completeData, setCompleteData] = useState({
    partnerNotes: '',
    photos: [] as File[],
  });

  const handleConfirm = () => {
    confirmMutation.mutate(booking.id, {
      onSuccess: () => {
        onClose();
      },
    });
  };

  const handleReject = () => {
    const finalReason = rejectReason === 'Autre' ? customReason : rejectReason;
    if (!finalReason.trim()) {
      return;
    }

    rejectMutation.mutate(
      { bookingId: booking.id, reason: finalReason },
      {
        onSuccess: () => {
          onClose();
        },
      }
    );
  };

  const handleReschedule = () => {
    if (!rescheduleData.scheduledDate || !rescheduleData.scheduledTime) {
      return;
    }

    rescheduleMutation.mutate(
      { bookingId: booking.id, data: rescheduleData as RescheduleBookingDto },
      {
        onSuccess: () => {
          onClose();
        },
      }
    );
  };

  const handleStart = () => {
    startMutation.mutate(booking.id, {
      onSuccess: () => {
        onClose();
      },
    });
  };

  const handleComplete = () => {
    if (!completeData.partnerNotes.trim()) {
      return;
    }

    completeMutation.mutate(
      { bookingId: booking.id, data: completeData },
      {
        onSuccess: () => {
          onClose();
        },
      }
    );
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Réservation #${booking.id.slice(0, 8)}`} maxWidth="2xl">
      <div className="space-y-6">
        {/* Booking Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Client Info */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <User className="h-5 w-5 text-flotteq-blue" />
              Client
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <span className="font-medium">{booking.tenant?.name || booking.tenantName || 'N/A'}</span>
              </div>
              {(booking.tenant?.email || booking.tenantEmail) && (
                <div className="flex items-center gap-2 text-gray-600">
                  <Mail className="h-4 w-4" />
                  {booking.tenant?.email || booking.tenantEmail}
                </div>
              )}
              {booking.tenant?.phone && (
                <div className="flex items-center gap-2 text-gray-600">
                  <Phone className="h-4 w-4" />
                  {booking.tenant.phone}
                </div>
              )}
            </div>
          </div>

          {/* Vehicle Info */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Car className="h-5 w-5 text-flotteq-blue" />
              Véhicule
            </h3>
            <div className="space-y-2 text-sm">
              <div className="font-medium">
                {booking.vehicle ? `${booking.vehicle.brand} ${booking.vehicle.model}` : 'N/A'}
              </div>
              <div className="text-gray-600">
                Immatriculation: {booking.vehicle?.registration || booking.vehicleRegistration || 'N/A'}
              </div>
            </div>
          </div>

          {/* Service Info */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-3">Service</h3>
            <div className="space-y-2 text-sm">
              <div className="font-medium">{booking.service?.name || booking.serviceName || 'N/A'}</div>
              {(booking.service?.description || booking.serviceDescription) && (
                <div className="text-gray-600">{booking.service?.description || booking.serviceDescription}</div>
              )}
              <div className="text-lg font-bold text-flotteq-blue">
                {Number(booking.price || booking.service?.price || 0).toFixed(2)}€
              </div>
              {booking.commissionAmount && (
                <div className="text-sm text-green-600">
                  Commission: {Number(booking.commissionAmount).toFixed(2)}€
                </div>
              )}
            </div>
          </div>

          {/* Date/Time Info */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Clock className="h-5 w-5 text-flotteq-blue" />
              Date & Heure
            </h3>
            <div className="space-y-2 text-sm">
              <div className="font-medium">
                {format(new Date(booking.scheduledDate), 'EEEE dd MMMM yyyy', { locale: fr })}
              </div>
              <div className="text-gray-600">
                {booking.scheduledTime} {booking.endTime && `- ${booking.endTime}`}
              </div>
              <div className="mt-2">{getStatusBadge(booking.status)}</div>
            </div>
          </div>
        </div>

        {/* Customer Notes */}
        {booking.customerNotes && (
          <div className="bg-blue-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-2">Notes du client</h3>
            <p className="text-sm text-gray-700">{booking.customerNotes}</p>
          </div>
        )}

        {/* Partner Notes (if completed) */}
        {booking.partnerNotes && (
          <div className="bg-green-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-2">Notes partenaire</h3>
            <p className="text-sm text-gray-700">{booking.partnerNotes}</p>
          </div>
        )}

        {/* Rejection/Cancellation Reasons */}
        {booking.rejectionReason && (
          <div className="bg-red-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-2">Raison du refus</h3>
            <p className="text-sm text-gray-700">{booking.rejectionReason}</p>
          </div>
        )}

        {booking.cancellationReason && (
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-2">Raison de l'annulation</h3>
            <p className="text-sm text-gray-700">{booking.cancellationReason}</p>
          </div>
        )}

        {/* ACTIONS - Conditional based on status */}

        {/* PENDING Actions */}
        {booking.status === 'pending' && !showRejectForm && !showRescheduleForm && (
          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleConfirm}
              disabled={confirmMutation.isPending}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
            >
              <Check className="h-4 w-4" />
              {confirmMutation.isPending ? 'Confirmation...' : 'Accepter'}
            </button>
            <button
              onClick={() => setShowRejectForm(true)}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <X className="h-4 w-4" />
              Refuser
            </button>
            <button
              onClick={() => setShowRescheduleForm(true)}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Calendar className="h-4 w-4" />
              Reporter
            </button>
          </div>
        )}

        {/* Reject Form */}
        {showRejectForm && (
          <div className="bg-red-50 rounded-lg p-4 space-y-4">
            <h3 className="font-semibold text-gray-900">Refuser la réservation</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Raison</label>
              <select
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="">Sélectionnez une raison</option>
                <option value="Indisponible">Indisponible</option>
                <option value="Manque de pièces">Manque de pièces</option>
                <option value="Trop de demandes">Trop de demandes</option>
                <option value="Autre">Autre</option>
              </select>
            </div>
            {rejectReason === 'Autre' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Précisez</label>
                <textarea
                  value={customReason}
                  onChange={(e) => setCustomReason(e.target.value)}
                  rows={3}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="Décrivez la raison..."
                />
              </div>
            )}
            <div className="flex gap-3">
              <button
                onClick={() => setShowRejectForm(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleReject}
                disabled={rejectMutation.isPending || !rejectReason}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
              >
                {rejectMutation.isPending ? 'Refus...' : 'Confirmer le refus'}
              </button>
            </div>
          </div>
        )}

        {/* Reschedule Form */}
        {showRescheduleForm && (
          <div className="bg-blue-50 rounded-lg p-4 space-y-4">
            <h3 className="font-semibold text-gray-900">Reporter la réservation</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <input
                  type="date"
                  value={rescheduleData.scheduledDate}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) =>
                    setRescheduleData((prev) => ({ ...prev, scheduledDate: e.target.value }))
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Heure début</label>
                <input
                  type="time"
                  value={rescheduleData.scheduledTime}
                  onChange={(e) =>
                    setRescheduleData((prev) => ({ ...prev, scheduledTime: e.target.value }))
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Heure fin</label>
                <input
                  type="time"
                  value={rescheduleData.endTime}
                  onChange={(e) =>
                    setRescheduleData((prev) => ({ ...prev, endTime: e.target.value }))
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowRescheduleForm(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleReschedule}
                disabled={rescheduleMutation.isPending || !rescheduleData.scheduledDate || !rescheduleData.scheduledTime}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {rescheduleMutation.isPending ? 'Report...' : 'Confirmer le report'}
              </button>
            </div>
          </div>
        )}

        {/* CONFIRMED Actions */}
        {booking.status === 'confirmed' && (
          <div className="flex gap-3">
            <button
              onClick={handleStart}
              disabled={startMutation.isPending}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              <Clock className="h-4 w-4" />
              {startMutation.isPending ? 'Démarrage...' : 'Démarrer les travaux'}
            </button>
          </div>
        )}

        {/* IN_PROGRESS - Complete Form */}
        {booking.status === 'in_progress' && showCompleteForm && (
          <div className="bg-green-50 rounded-lg p-4 space-y-4">
            <h3 className="font-semibold text-gray-900">Terminer la réservation</h3>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes partenaire (travaux effectués) *
              </label>
              <textarea
                value={completeData.partnerNotes}
                onChange={(e) =>
                  setCompleteData((prev) => ({ ...prev, partnerNotes: e.target.value }))
                }
                rows={4}
                placeholder="Décrivez les travaux effectués, pièces remplacées, etc."
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Photos (optionnel)</label>
              <FileUpload
                onFilesSelected={(files) =>
                  setCompleteData((prev) => ({ ...prev, photos: files }))
                }
                maxFiles={10}
                acceptedTypes={['image/jpeg', 'image/png', 'image/webp']}
              />
            </div>

            {booking.commissionAmount && (
              <div className="bg-white rounded-lg p-3 text-center">
                <div className="text-sm text-gray-600">Commission estimée</div>
                <div className="text-2xl font-bold text-green-600">
                  {Number(booking.commissionAmount).toFixed(2)}€
                </div>
              </div>
            )}

            <button
              onClick={handleComplete}
              disabled={completeMutation.isPending || !completeData.partnerNotes.trim()}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
            >
              <Check className="h-4 w-4" />
              {completeMutation.isPending ? 'Finalisation...' : 'Terminer la réservation'}
            </button>
          </div>
        )}
      </div>
    </Modal>
  );
}
