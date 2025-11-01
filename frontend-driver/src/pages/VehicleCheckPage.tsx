import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { VehicleChecklistStep } from '@/components/vehicle-check/VehicleChecklistStep';
import { PhotoCheckStep } from '@/components/vehicle-check/PhotoCheckStep';
import { CheckSummaryStep } from '@/components/vehicle-check/CheckSummaryStep';
import { vehicleCheckService } from '@/api/services/vehicle-check.service';
import { CHECKLIST_ITEMS, type ChecklistItem } from '@/types/vehicle-check.types';

export default function VehicleCheckPage() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form data
  const [checklistItems, setChecklistItems] = useState<ChecklistItem[]>(CHECKLIST_ITEMS);
  const [photos, setPhotos] = useState<File[]>([]);
  const [timestamp] = useState<Date>(new Date());
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);

  // Fetch location on mount
  useEffect(() => {
    const fetchLocation = async () => {
      const loc = await vehicleCheckService.getCurrentLocation();
      setLocation(loc);
    };

    fetchLocation();
  }, []);

  // Validation rules
  const canProceedStep1 = () => {
    const checkedCount = checklistItems.filter((item) => item.checked).length;
    const completionRate = (checkedCount / checklistItems.length) * 100;
    return completionRate >= 50; // Au moins 50% pour passer à l'étape suivante
  };

  const canProceedStep2 = () => {
    return photos.length >= 2; // Minimum 2 photos
  };

  const canSubmit = () => {
    const checkedCount = checklistItems.filter((item) => item.checked).length;
    const completionRate = (checkedCount / checklistItems.length) * 100;
    return completionRate >= 50 && photos.length >= 2;
  };

  const handleSubmit = async () => {
    if (!canSubmit()) {
      toast.error('Veuillez compléter toutes les étapes avant de soumettre');
      return;
    }

    setIsSubmitting(true);

    try {
      const checkData = {
        checklistItems,
        photos,
        timestamp,
        location: location || undefined,
      };

      const result = await vehicleCheckService.submitVehicleCheck(checkData);

      toast.success(result.message, {
        duration: 4000,
        icon: <CheckCircle className="text-green-600" />,
      });

      // Redirect to dashboard after 1.5s
      setTimeout(() => {
        navigate('/');
      }, 1500);
    } catch (error: any) {
      console.error('Error submitting vehicle check:', error);
      toast.error(error.message || 'Erreur lors de la soumission du check véhicule');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNext = () => {
    if (currentStep === 1 && !canProceedStep1()) {
      toast.warning('Veuillez vérifier au moins 50% des éléments de la checklist');
      return;
    }
    if (currentStep === 2 && !canProceedStep2()) {
      toast.warning('Veuillez ajouter au moins 2 photos');
      return;
    }
    setCurrentStep((s) => Math.min(3, s + 1));
  };

  const handlePrevious = () => {
    setCurrentStep((s) => Math.max(1, s - 1));
  };

  const getStepTitle = () => {
    switch (currentStep) {
      case 1:
        return 'Checklist du véhicule';
      case 2:
        return 'Photos du véhicule';
      case 3:
        return 'Récapitulatif';
      default:
        return '';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-32">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={() => navigate('/')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Retour au tableau de bord"
            >
              <ArrowLeft className="w-6 h-6 text-gray-600" />
            </button>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900">Check Véhicule</h1>
              <p className="text-sm text-gray-600">{getStepTitle()}</p>
            </div>
          </div>

          {/* Step Indicator */}
          <div className="flex items-center gap-2">
            {[1, 2, 3].map((step) => (
              <div
                key={step}
                className={`flex-1 h-2 rounded-full transition-all ${
                  step === currentStep
                    ? 'bg-flotteq-blue'
                    : step < currentStep
                    ? 'bg-green-600'
                    : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        {currentStep === 1 && (
          <VehicleChecklistStep items={checklistItems} onChange={setChecklistItems} />
        )}

        {currentStep === 2 && <PhotoCheckStep photos={photos} onChange={setPhotos} />}

        {currentStep === 3 && (
          <CheckSummaryStep
            checklistItems={checklistItems}
            photos={photos}
            timestamp={timestamp}
            location={location}
          />
        )}
      </div>

      {/* Navigation Footer */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-20">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            {currentStep > 1 && (
              <button
                onClick={handlePrevious}
                disabled={isSubmitting}
                className="flex-1 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed min-h-[52px]"
              >
                ← Précédent
              </button>
            )}

            {currentStep < 3 ? (
              <button
                onClick={handleNext}
                disabled={
                  (currentStep === 1 && !canProceedStep1()) ||
                  (currentStep === 2 && !canProceedStep2())
                }
                className="flex-1 px-6 py-3 bg-flotteq-blue text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium min-h-[52px]"
              >
                Suivant →
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={isSubmitting || !canSubmit()}
                className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center gap-2 min-h-[52px]"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                    <span>Envoi en cours...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    <span>Confirmer le check</span>
                  </>
                )}
              </button>
            )}
          </div>

          {/* Step Counter */}
          <div className="text-center mt-3">
            <p className="text-xs text-gray-500">
              Étape {currentStep} sur 3
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
