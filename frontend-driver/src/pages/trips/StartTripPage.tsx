import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';
import { useStartTrip } from '../../hooks/useTrips';
import { KilometrageStep } from '../../components/trips/KilometrageStep';
import { PhotosStep } from '../../components/trips/PhotosStep';
import { DefectsStep } from '../../components/trips/DefectsStep';
import { ValidationStep } from '../../components/trips/ValidationStep';
import type { VehicleDefect, StartTripData } from '../../types/trip.types';
import { prepareImageForUpload, uploadPhoto } from '../../utils/photo-utils';
import { toast } from 'react-hot-toast';
import api from '../../config/api';

interface DriverProfile {
  assignedVehicle?: {
    id: string;
    currentKm: number;
  };
}

export const StartTripPage: React.FC = () => {
  const navigate = useNavigate();
  const startTripMutation = useStartTrip();

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
  const [vehicleId, setVehicleId] = useState<string>('');
  const [currentVehicleKm, setCurrentVehicleKm] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  // Charger le profil du driver pour récupérer le véhicule assigné
  useEffect(() => {
    const loadDriverProfile = async () => {
      try {
        const response = await api.get<DriverProfile>('/driver/profile');
        if (response.data.assignedVehicle) {
          setVehicleId(response.data.assignedVehicle.id);
          setCurrentVehicleKm(response.data.assignedVehicle.currentKm || 0);
          setKm(response.data.assignedVehicle.currentKm || 0);
        } else {
          toast.error('Aucun véhicule assigné');
          navigate('/dashboard');
        }
      } catch (error) {
        console.error('Error loading driver profile:', error);
        toast.error('Erreur lors du chargement du profil');
        navigate('/dashboard');
      } finally {
        setLoading(false);
      }
    };

    loadDriverProfile();
  }, [navigate]);

  const handlePhotoSelect = async (position: 'front' | 'back' | 'left' | 'right', file: File) => {
    // Créer preview local
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
    return km > 0 && fuelLevel >= 0 && fuelLevel <= 100;
  };

  const canProceedStep2 = () => {
    return Object.values(photos).filter(Boolean).length === 4;
  };

  const canSubmit = () => {
    return canProceedStep1() && canProceedStep2();
  };

  const handleNext = () => {
    if (currentStep === 1 && !canProceedStep1()) {
      toast.error('Veuillez remplir le kilométrage et le niveau de carburant');
      return;
    }
    if (currentStep === 2 && !canProceedStep2()) {
      toast.error('Veuillez prendre les 4 photos obligatoires');
      return;
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

      if (!vehicleId) {
        throw new Error('Aucun véhicule assigné');
      }

      const data: StartTripData = {
        vehicleId,
        startKm: km,
        startFuelLevel: fuelLevel,
        startPhotos: photoUrls,
        startDefects: defects.length > 0 ? defects : undefined,
        startNotes: notes || undefined,
      };

      await startTripMutation.mutateAsync(data);
      navigate('/dashboard');
    } catch (error: any) {
      console.error('Error starting trip:', error);
      toast.error(error.message || 'Erreur lors du démarrage de la mission');
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

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
              <h1 className="text-xl font-bold text-gray-900">Démarrer une mission</h1>
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
      <div className="max-w-4xl mx-auto px-4 py-6">
        {currentStep === 1 && (
          <KilometrageStep
            km={km}
            setKm={setKm}
            fuelLevel={fuelLevel}
            setFuelLevel={setFuelLevel}
            currentVehicleKm={currentVehicleKm}
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
                  Démarrage...
                </>
              ) : (
                <>
                  <Check className="w-5 h-5" />
                  Démarrer la mission
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
