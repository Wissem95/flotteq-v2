import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { format } from 'date-fns';
import { useVehicles } from '@/hooks/useVehicles';
import { bookingsService } from '@/api/services/bookings.service';
import { toast } from 'sonner';
import { VehicleSelectionStep } from './shared/VehicleSelectionStep';
import { SlotSelectionStep } from './shared/SlotSelectionStep';
import { BookingSummaryStep } from './shared/BookingSummaryStep';

interface CreateBookingModalV2Props {
  partnerId: string;
  serviceId: string;
  serviceDuration: number;
  partnerName: string;
  serviceName: string;
  onClose: () => void;
}

export default function CreateBookingModalV2({
  partnerId,
  serviceId,
  serviceDuration,
  partnerName,
  serviceName,
  onClose,
}: CreateBookingModalV2Props) {
  const [currentStep, setCurrentStep] = useState(1);
  const [bookingData, setBookingData] = useState<{
    vehicleId: string | null;
    date: string | null;
    slot: { time: string; endTime: string } | null;
  }>({
    vehicleId: null,
    date: null,
    slot: null,
  });
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: vehicles } = useVehicles();

  // Auto-select first vehicle if only one
  useEffect(() => {
    if (vehicles && vehicles.length === 1 && !bookingData.vehicleId) {
      setBookingData((prev) => ({ ...prev, vehicleId: vehicles[0].id }));
      setCurrentStep(2); // Skip to slot selection
    }
  }, [vehicles, bookingData.vehicleId]);

  const handleSubmit = async () => {
    if (!bookingData.vehicleId || !bookingData.slot || !bookingData.date) {
      toast.error('Veuillez compléter toutes les étapes');
      return;
    }

    setIsSubmitting(true);

    try {
      const startDate = new Date(`${bookingData.date}T${bookingData.slot.time}`);
      const endDate = new Date(`${bookingData.date}T${bookingData.slot.endTime}`);

      await bookingsService.createBooking({
        partnerId,
        serviceId,
        vehicleId: bookingData.vehicleId,
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

  const canProceedToNextStep = () => {
    if (currentStep === 1) return bookingData.vehicleId !== null;
    if (currentStep === 2) return bookingData.slot !== null && bookingData.date !== null;
    return true;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
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

        {/* Mini Step Indicator (dots) */}
        <div className="flex justify-center items-center gap-2 py-4 bg-gray-50">
          {[1, 2, 3].map((step) => (
            <div
              key={step}
              className={`transition-all ${
                step === currentStep
                  ? 'w-8 h-2 bg-flotteq-blue rounded-full'
                  : step < currentStep
                  ? 'w-2 h-2 bg-green-600 rounded-full'
                  : 'w-2 h-2 bg-gray-300 rounded-full'
              }`}
            />
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {currentStep === 1 && (
            <VehicleSelectionStep
              value={bookingData.vehicleId}
              onChange={(vehicleId) =>
                setBookingData((prev) => ({ ...prev, vehicleId }))
              }
            />
          )}

          {currentStep === 2 && (
            <SlotSelectionStep
              partnerId={partnerId}
              serviceId={serviceId}
              serviceDuration={serviceDuration}
              value={{ date: bookingData.date, slot: bookingData.slot }}
              onChange={(data) =>
                setBookingData((prev) => ({ ...prev, date: data.date, slot: data.slot }))
              }
            />
          )}

          {currentStep === 3 && bookingData.vehicleId && bookingData.date && bookingData.slot && (
            <BookingSummaryStep
              partnerId={partnerId}
              bookingData={{
                vehicleId: bookingData.vehicleId,
                serviceId,
                date: bookingData.date,
                slot: bookingData.slot,
              }}
              notes={notes}
              onNotesChange={setNotes}
            />
          )}
        </div>

        {/* Footer Navigation */}
        <div className="flex items-center justify-between gap-3 p-6 border-t border-gray-200 bg-gray-50">
          {currentStep < 3 ? (
            <>
              <button
                type="button"
                onClick={() => setCurrentStep((s) => Math.max(1, s - 1))}
                disabled={currentStep === 1}
                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ← Précédent
              </button>
              <button
                onClick={() => setCurrentStep((s) => s + 1)}
                disabled={!canProceedToNextStep()}
                className="px-6 py-2 bg-flotteq-blue text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
              >
                Suivant →
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => setCurrentStep((s) => Math.max(1, s - 1))}
                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors font-medium"
              >
                ← Précédent
              </button>
              <button
                onClick={() => handleSubmit()}
                disabled={isSubmitting}
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                    <span>Création...</span>
                  </>
                ) : (
                  'Confirmer la réservation'
                )}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
