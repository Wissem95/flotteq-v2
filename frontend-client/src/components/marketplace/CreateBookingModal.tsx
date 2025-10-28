import { useState, useEffect } from 'react';
import { X, Calendar, Clock, Car, AlertCircle, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useVehicles } from '@/hooks/useVehicles';
import { useAvailableSlots } from '@/hooks/useMarketplace';
import { bookingsService } from '@/api/services/bookings.service';
import { toast } from 'sonner';

interface CreateBookingModalProps {
  partnerId: string;
  serviceId: string;
  partnerName: string;
  serviceName: string;
  onClose: () => void;
}

export default function CreateBookingModal({
  partnerId,
  serviceId,
  partnerName,
  serviceName,
  onClose,
}: CreateBookingModalProps) {
  const [selectedDate, setSelectedDate] = useState<string>(
    format(new Date(), 'yyyy-MM-dd')
  );
  const [selectedSlot, setSelectedSlot] = useState<{ start: string; end: string } | null>(null);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: vehicles } = useVehicles();
  const { data: slotsData, isLoading: slotsLoading } = useAvailableSlots(
    partnerId,
    serviceId,
    selectedDate
  );

  // Auto-select first vehicle if only one
  useEffect(() => {
    if (vehicles && vehicles.length === 1 && !selectedVehicleId) {
      setSelectedVehicleId(vehicles[0].id);
    }
  }, [vehicles, selectedVehicleId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedSlot || !selectedVehicleId) {
      toast.error('Veuillez sélectionner un créneau et un véhicule');
      return;
    }

    setIsSubmitting(true);

    try {
      const startDate = new Date(selectedSlot.start);
      const endDate = new Date(selectedSlot.end);

      await bookingsService.createBooking({
        partnerId,
        serviceId,
        vehicleId: selectedVehicleId,
        scheduledDate: format(startDate, 'yyyy-MM-dd'),
        scheduledTime: format(startDate, 'HH:mm'),
        endTime: format(endDate, 'HH:mm'),
        customerNotes: notes.trim() || undefined,
      });

      toast.success('Réservation créée avec succès !');
      onClose();
    } catch (error: any) {
      console.error('Error creating booking:', error);
      toast.error(
        error.response?.data?.message || 'Erreur lors de la création de la réservation'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const availableSlots = slotsData?.slots.filter(slot => slot.available) || [];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Nouvelle réservation</h2>
            <p className="text-sm text-gray-600 mt-1">
              {serviceName} chez {partnerName}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-6 w-6 text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Vehicle Selection */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <Car className="h-5 w-5 text-flotteq-blue" />
              Véhicule <span className="text-red-500">*</span>
            </label>
            {!vehicles || vehicles.length === 0 ? (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-yellow-800">
                  Vous devez d'abord ajouter un véhicule pour pouvoir réserver un service.
                </div>
              </div>
            ) : (
              <select
                value={selectedVehicleId}
                onChange={(e) => setSelectedVehicleId(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-flotteq-blue"
              >
                <option value="">Sélectionnez un véhicule</option>
                {vehicles.map((vehicle) => (
                  <option key={vehicle.id} value={vehicle.id}>
                    {vehicle.brand} {vehicle.model} - {vehicle.registration}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Date Selection */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <Calendar className="h-5 w-5 text-flotteq-blue" />
              Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => {
                setSelectedDate(e.target.value);
                setSelectedSlot(null); // Reset slot when date changes
              }}
              min={format(new Date(), 'yyyy-MM-dd')}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-flotteq-blue"
            />
          </div>

          {/* Time Slot Selection */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <Clock className="h-5 w-5 text-flotteq-blue" />
              Créneau horaire <span className="text-red-500">*</span>
            </label>

            {slotsLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-flotteq-blue mx-auto"></div>
                <p className="text-sm text-gray-600 mt-2">Chargement des créneaux...</p>
              </div>
            ) : availableSlots.length === 0 ? (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center text-gray-600">
                Aucun créneau disponible pour cette date
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-64 overflow-y-auto p-1">
                {availableSlots.map((slot, idx) => {
                  const isSelected =
                    selectedSlot?.start === slot.start && selectedSlot?.end === slot.end;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setSelectedSlot({ start: slot.start, end: slot.end })}
                      className={`px-4 py-3 rounded-lg border-2 transition-all ${
                        isSelected
                          ? 'border-flotteq-blue bg-blue-50 text-flotteq-blue font-semibold'
                          : 'border-gray-200 hover:border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <div className="font-medium">
                        {format(new Date(slot.start), 'HH:mm', { locale: fr })}
                      </div>
                      <div className="text-xs opacity-75">
                        {format(new Date(slot.end), 'HH:mm', { locale: fr })}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes (optionnel)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Informations complémentaires pour le partenaire..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-flotteq-blue resize-none"
            />
          </div>

          {/* Summary */}
          {selectedSlot && selectedVehicleId && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-green-800">
                  <p className="font-semibold mb-1">Récapitulatif de la réservation</p>
                  <ul className="space-y-1">
                    <li>
                      • {serviceName} chez {partnerName}
                    </li>
                    <li>
                      • Véhicule:{' '}
                      {vehicles?.find(v => v.id === selectedVehicleId)?.registration}
                    </li>
                    <li>
                      • Date: {format(new Date(selectedDate), 'dd MMMM yyyy', { locale: fr })}
                    </li>
                    <li>
                      • Heure:{' '}
                      {format(new Date(selectedSlot.start), 'HH:mm', { locale: fr })} -{' '}
                      {format(new Date(selectedSlot.end), 'HH:mm', { locale: fr })}
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </form>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors font-medium disabled:opacity-50"
          >
            Annuler
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || !selectedSlot || !selectedVehicleId}
            className="px-6 py-2 bg-flotteq-blue text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center gap-2"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                <span>Création...</span>
              </>
            ) : (
              'Confirmer la réservation'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
