import { CheckCircle, MapPin, Wrench, Calendar, Clock, Car } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { usePartnerDetails } from '@/hooks/useMarketplace';
import { useVehicles } from '@/hooks/useVehicles';

interface BookingData {
  vehicleId: string;
  serviceId: string;
  date: string;
  slot: { start: string; end: string };
}

interface BookingSummaryStepProps {
  partnerId: string;
  bookingData: BookingData;
  notes?: string;
  onNotesChange?: (notes: string) => void;
}

export function BookingSummaryStep({
  partnerId,
  bookingData,
  notes = '',
  onNotesChange,
}: BookingSummaryStepProps) {
  const { data: partner } = usePartnerDetails(partnerId);
  const { data: vehicles } = useVehicles();

  const selectedVehicle = vehicles?.find((v) => v.id === bookingData.vehicleId);
  const selectedService = partner?.services?.find((s) => s.id === bookingData.serviceId);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <CheckCircle className="h-6 w-6 text-green-600" />
        <h3 className="text-lg font-semibold text-gray-900">Récapitulatif de votre réservation</h3>
      </div>

      {/* Summary Card */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-6 space-y-4">
        {/* Partner Info */}
        <div className="flex items-start gap-3">
          <MapPin className="h-5 w-5 text-flotteq-blue flex-shrink-0 mt-1" />
          <div>
            <p className="text-sm text-gray-600">Partenaire</p>
            <p className="font-semibold text-gray-900">{partner?.companyName}</p>
            <p className="text-sm text-gray-600">
              {partner?.address}, {partner?.city}
            </p>
          </div>
        </div>

        {/* Service Info */}
        <div className="flex items-start gap-3">
          <Wrench className="h-5 w-5 text-flotteq-blue flex-shrink-0 mt-1" />
          <div>
            <p className="text-sm text-gray-600">Service</p>
            <p className="font-semibold text-gray-900">{selectedService?.name}</p>
            {selectedService?.description && (
              <p className="text-sm text-gray-600">{selectedService.description}</p>
            )}
          </div>
        </div>

        {/* Date and Time */}
        <div className="flex items-start gap-3">
          <Calendar className="h-5 w-5 text-flotteq-blue flex-shrink-0 mt-1" />
          <div>
            <p className="text-sm text-gray-600">Date et heure</p>
            <p className="font-semibold text-gray-900">
              {format(new Date(bookingData.date), 'EEEE dd MMMM yyyy', { locale: fr })}
            </p>
            <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
              <Clock className="h-4 w-4" />
              {format(new Date(bookingData.slot.start), 'HH:mm', { locale: fr })} -{' '}
              {format(new Date(bookingData.slot.end), 'HH:mm', { locale: fr })}
            </p>
          </div>
        </div>

        {/* Vehicle Info */}
        <div className="flex items-start gap-3">
          <Car className="h-5 w-5 text-flotteq-blue flex-shrink-0 mt-1" />
          <div>
            <p className="text-sm text-gray-600">Véhicule</p>
            <p className="font-semibold text-gray-900">
              {selectedVehicle?.brand} {selectedVehicle?.model}
            </p>
            <p className="text-sm text-gray-600">{selectedVehicle?.registration}</p>
          </div>
        </div>

        {/* Price */}
        {selectedService && (
          <div className="pt-4 border-t-2 border-blue-200">
            <div className="flex items-center justify-between">
              <span className="text-lg font-semibold text-gray-900">Total</span>
              <span className="text-2xl font-bold text-flotteq-blue">
                {selectedService.price.toFixed(2)} €
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Notes Section */}
      {onNotesChange && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Notes (optionnel)
          </label>
          <textarea
            value={notes}
            onChange={(e) => onNotesChange(e.target.value)}
            rows={3}
            placeholder="Informations complémentaires pour le partenaire..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-flotteq-blue resize-none"
          />
        </div>
      )}

    </div>
  );
}
