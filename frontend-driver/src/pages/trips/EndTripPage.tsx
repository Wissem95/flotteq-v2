import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';
import { useEndTrip, useCurrentTrip } from '../../hooks/useTrips';
import { KilometrageStep } from '../../components/trips/KilometrageStep';
import { PhotosStep } from '../../components/trips/PhotosStep';
import { DefectsStep } from '../../components/trips/DefectsStep';
import { ValidationStep } from '../../components/trips/ValidationStep';
import { ComparisonCard } from '../../components/trips/ComparisonCard';
import type { VehicleDefect, EndTripData } from '../../types/trip.types';
import { prepareImageForUpload, uploadPhoto } from '../../utils/photo-utils';
import { toast } from 'react-hot-toast';

export const EndTripPage: React.FC = () => {
  const navigate = useNavigate();
  const { data: currentTrip, isLoading } = useCurrentTrip();
  const endTripMutation = useEndTrip();

  const [currentStep, setCurrentStep] = useState(1);
  const [km, setKm] = useState(0);
  const [fuelLevel, setFuelLevel] = useState(50);
  const [photos, setPhotos] = useState<{
    front?: string;
    back?: string;
    left?: string;
    right?: string;
  }>({});
  const [photoFiles, setPhotoFiles] = useState<{
    front?: File;
    back?: File;
    left?: File;
    right?: File;
  }>({});
  const [defects, setDefects] = useState<VehicleDefect[]>([]);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isLoading && !currentTrip) {
      toast.error('Aucune mission en cours');
      navigate('/dashboard');
    }
  }, [isLoading, currentTrip, navigate]);

  if (isLoading || !currentTrip) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  const handlePhotoSelect = async (position: 'front' | 'back' | 'left' | 'right', file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      setPhotos({ ...photos, [position]: reader.result as string });
      setPhotoFiles({ ...photoFiles, [position]: file });
    };
    reader.readAsDataURL(file);
  };

  const handlePhotoRemove = (position: 'front' | 'back' | 'left' | 'right') => {
    const newPhotos = { ...photos };
    const newFiles = { ...photoFiles };
    delete newPhotos[position];
    delete newFiles[position];
    setPhotos(newPhotos);
    setPhotoFiles(newFiles);
  };

  const handleAddDefect = (defect: VehicleDefect) => {
    setDefects([...defects, defect]);
  };

  const handleRemoveDefect = (defectId: string) => {
    setDefects(defects.filter((d) => d.id !== defectId));
  };

  const canProceedStep1 = () => {
    return km >= currentTrip.startKm && fuelLevel >= 0 && fuelLevel <= 100;
  };

  const canProceedStep2 = () => {
    return Object.values(photos).filter(Boolean).length === 4;
  };

  const canSubmit = () => {
    return canProceedStep1() && canProceedStep2();
  };

  const handleNext = () => {
    if (currentStep === 1 && !canProceedStep1()) {
      if (km < currentTrip.startKm) {
        toast.error(
          `Le kilométrage de fin (${km} km) ne peut pas être inférieur au kilométrage de départ (${currentTrip.startKm} km)`
        );
      } else {
        toast.error('Veuillez remplir le kilométrage et le niveau de carburant');
      }
      return;
    }
    if (currentStep === 2 && !canProceedStep2()) {
      toast.error('Veuillez prendre les 4 photos obligatoires');
      return;
    }

    // Warning si trajet très long
    if (currentStep === 1 && km - currentTrip.startKm > 1000) {
      if (!confirm(`Distance très importante (${km - currentTrip.startKm} km). Confirmez-vous ce kilométrage ?`)) {
        return;
      }
    }

    setCurrentStep(currentStep + 1);
  };

  const handlePrevious = () => {
    setCurrentStep(currentStep - 1);
  };

  const handleSubmit = async () => {
    if (!canSubmit()) {
      toast.error('Veuillez compléter toutes les étapes obligatoires');
      return;
    }

    setIsSubmitting(true);

    try {
      // Upload toutes les photos
      const photoUrls: string[] = [];
      for (const file of Object.values(photoFiles)) {
        if (file) {
          const compressed = await prepareImageForUpload(file);
          const url = await uploadPhoto(compressed);
          photoUrls.push(url);
        }
      }

      const data: EndTripData = {
        endKm: km,
        endFuelLevel: fuelLevel,
        endPhotos: photoUrls,
        endDefects: defects.length > 0 ? defects : undefined,
        endNotes: notes || undefined,
      };

      await endTripMutation.mutateAsync({ tripId: currentTrip.id, data });
      navigate('/dashboard');
    } catch (error: any) {
      console.error('Error ending trip:', error);
      toast.error(error.message || 'Erreur lors de la fin de la mission');
    } finally {
      setIsSubmitting(false);
    }
  };

  const steps = [
    { number: 1, label: 'Kilométrage' },
    { number: 2, label: 'Photos' },
    { number: 3, label: 'Défauts' },
    { number: 4, label: 'Validation' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Terminer la mission</h1>
              <p className="text-sm text-gray-600">Étape {currentStep} sur 4</p>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-4 flex gap-2">
            {steps.map((step) => (
              <div
                key={step.number}
                className={`flex-1 h-2 rounded-full ${
                  step.number <= currentStep ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Comparaison card (visible à toutes les étapes) */}
        {km > 0 && (
          <ComparisonCard
            startKm={currentTrip.startKm}
            endKm={km}
            startFuel={currentTrip.startFuelLevel}
            endFuel={fuelLevel}
            startDefects={currentTrip.startDefects || []}
            endDefects={defects}
          />
        )}

        {currentStep === 1 && (
          <KilometrageStep
            km={km}
            setKm={setKm}
            fuelLevel={fuelLevel}
            setFuelLevel={setFuelLevel}
            currentVehicleKm={currentTrip.startKm}
          />
        )}

        {currentStep === 2 && (
          <PhotosStep
            photos={photos}
            onPhotoSelect={handlePhotoSelect}
            onPhotoRemove={handlePhotoRemove}
          />
        )}

        {currentStep === 3 && (
          <DefectsStep
            defects={defects}
            onAddDefect={handleAddDefect}
            onRemoveDefect={handleRemoveDefect}
          />
        )}

        {currentStep === 4 && (
          <ValidationStep
            km={km}
            fuelLevel={fuelLevel}
            photos={photos}
            defects={defects}
            notes={notes}
            setNotes={setNotes}
          />
        )}
      </div>

      {/* Footer navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4">
        <div className="max-w-4xl mx-auto flex gap-3">
          {currentStep > 1 && (
            <button
              onClick={handlePrevious}
              disabled={isSubmitting}
              className="flex items-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              <ArrowLeft className="w-5 h-5" />
              Précédent
            </button>
          )}

          {currentStep < 4 ? (
            <button
              onClick={handleNext}
              disabled={isSubmitting}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              Suivant
              <ArrowRight className="w-5 h-5" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={!canSubmit() || isSubmitting}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Finalisation...
                </>
              ) : (
                <>
                  <Check className="w-5 h-5" />
                  Terminer la mission
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
