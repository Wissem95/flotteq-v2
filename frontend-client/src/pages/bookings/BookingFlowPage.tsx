import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { useVehicles } from '@/hooks/useVehicles';
import { usePartnerDetails } from '@/hooks/useMarketplace';
import { bookingsService } from '@/api/services/bookings.service';
import { StepIndicator } from '@/components/booking/StepIndicator';
import { VehicleSelectionStep } from '@/components/booking/shared/VehicleSelectionStep';
import { ServiceSelectionStep } from '@/components/booking/shared/ServiceSelectionStep';
import { SlotSelectionStep } from '@/components/booking/shared/SlotSelectionStep';
import { BookingSummaryStep } from '@/components/booking/shared/BookingSummaryStep';

export default function BookingFlowPage() {
  const { partnerId, serviceId } = useParams<{ partnerId: string; serviceId?: string }>();
  const navigate = useNavigate();

  const [currentStep, setCurrentStep] = useState(1);
  const [bookingData, setBookingData] = useState<{
    vehicleId: string | null;
    serviceId: string | null;
    date: string | null;
    slot: { time: string; endTime: string } | null;
  }>({
    vehicleId: null,
    serviceId: serviceId || null,
    date: null,
    slot: null,
  });
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: vehicles } = useVehicles();
  const { data: partner } = usePartnerDetails(partnerId);

  // Auto-select first vehicle if only one and skip to service/slot selection
  useEffect(() => {
    if (vehicles && vehicles.length === 1 && !bookingData.vehicleId) {
      setBookingData((prev) => ({ ...prev, vehicleId: vehicles[0].id }));
      if (serviceId) {
        setCurrentStep(3); // Skip to slot selection if service is pre-selected
      } else {
        setCurrentStep(2); // Skip to service selection
      }
    }
  }, [vehicles, bookingData.vehicleId, serviceId]);

  const steps = serviceId
    ? ['Véhicule', 'Date & Heure', 'Confirmation']
    : ['Véhicule', 'Service', 'Date & Heure', 'Confirmation'];

  const totalSteps = steps.length;

  const handleSubmit = async () => {
    if (!partnerId || !bookingData.vehicleId || !bookingData.serviceId || !bookingData.slot || !bookingData.date) {
      toast.error('Veuillez compléter toutes les étapes');
      return;
    }

    setIsSubmitting(true);

    try {
      const startDate = new Date(`${bookingData.date}T${bookingData.slot.time}`);
      const endDate = new Date(`${bookingData.date}T${bookingData.slot.endTime}`);

      await bookingsService.createBooking({
        partnerId,
        serviceId: bookingData.serviceId,
        vehicleId: bookingData.vehicleId,
        scheduledDate: format(startDate, 'yyyy-MM-dd'),
        scheduledTime: format(startDate, 'HH:mm'),
        endTime: format(endDate, 'HH:mm'),
        customerNotes: notes.trim() || undefined,
      });

      toast.success('Réservation créée avec succès !');
      navigate('/my-bookings');
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
    if (serviceId) {
      // If service is pre-selected, step 2 is slot selection
      if (currentStep === 2) return bookingData.slot !== null && bookingData.date !== null;
    } else {
      // If service is not pre-selected, step 2 is service selection
      if (currentStep === 2) return bookingData.serviceId !== null;
      if (currentStep === 3) return bookingData.slot !== null && bookingData.date !== null;
    }
    return true;
  };

  const handleNext = () => {
    setCurrentStep((s) => Math.min(totalSteps, s + 1));
  };

  const handlePrevious = () => {
    setCurrentStep((s) => Math.max(1, s - 1));
  };

  if (!partnerId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 font-semibold">Partenaire non spécifié</p>
          <button
            onClick={() => navigate('/marketplace')}
            className="mt-4 text-flotteq-blue hover:underline"
          >
            Retour à la marketplace
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-8 px-4">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors mb-4"
          >
            <ArrowLeft className="h-5 w-5" />
            <span className="font-medium">Retour</span>
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Nouvelle réservation</h1>
          {partner && (
            <p className="text-gray-600 mt-2">
              Réservation chez <span className="font-semibold">{partner.companyName}</span>
            </p>
          )}
        </div>

        {/* Step Indicator */}
        <StepIndicator currentStep={currentStep} totalSteps={totalSteps} steps={steps} />

        {/* Content Card */}
        <div className="bg-white rounded-xl shadow-lg p-8 min-h-[500px]">
          {currentStep === 1 && (
            <VehicleSelectionStep
              value={bookingData.vehicleId}
              onChange={(vehicleId) =>
                setBookingData((prev) => ({ ...prev, vehicleId }))
              }
            />
          )}

          {currentStep === 2 && !serviceId && (
            <ServiceSelectionStep
              partnerId={partnerId}
              value={bookingData.serviceId}
              onChange={(selectedServiceId) =>
                setBookingData((prev) => ({ ...prev, serviceId: selectedServiceId }))
              }
            />
          )}

          {((currentStep === 2 && serviceId) || (currentStep === 3 && !serviceId)) && bookingData.serviceId && (
            <SlotSelectionStep
              partnerId={partnerId}
              serviceId={bookingData.serviceId}
              serviceDuration={partner?.services?.find(s => s.id === bookingData.serviceId)?.durationMinutes || 60}
              value={{ date: bookingData.date, slot: bookingData.slot }}
              onChange={(data) =>
                setBookingData((prev) => ({ ...prev, date: data.date, slot: data.slot }))
              }
            />
          )}

          {currentStep === totalSteps &&
            bookingData.vehicleId &&
            bookingData.serviceId &&
            bookingData.date &&
            bookingData.slot && (
              <BookingSummaryStep
                partnerId={partnerId}
                bookingData={{
                  vehicleId: bookingData.vehicleId,
                  serviceId: bookingData.serviceId,
                  date: bookingData.date,
                  slot: bookingData.slot,
                }}
                notes={notes}
                onNotesChange={setNotes}
              />
            )}
        </div>

        {/* Navigation Footer */}
        <div className="flex justify-between mt-6">
          {currentStep < totalSteps ? (
            <>
              <button
                onClick={handlePrevious}
                disabled={currentStep === 1}
                className="px-6 py-3 border-2 border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium text-gray-700"
              >
                ← Précédent
              </button>

              <button
                onClick={handleNext}
                disabled={!canProceedToNextStep()}
                className="px-6 py-3 bg-flotteq-blue text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
              >
                Suivant →
              </button>
            </>
          ) : (
            <>
              <button
                onClick={handlePrevious}
                className="px-6 py-3 border-2 border-gray-300 rounded-lg hover:bg-gray-100 transition-colors font-medium text-gray-700"
              >
                ← Précédent
              </button>

              <button
                onClick={() => handleSubmit()}
                disabled={isSubmitting}
                className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                    <span>Création en cours...</span>
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
