import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ProfileStep from './ProfileStep';
import VehicleStep from './VehicleStep';
import DriverStep from './DriverStep';
import { onboardingService } from '@/api/services/onboarding.service';

export default function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [onboardingData, setOnboardingData] = useState({
    profile: null,
    vehicle: null,
    driver: null,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleProfileNext = (data: any) => {
    setOnboardingData({ ...onboardingData, profile: data });
    setCurrentStep(2);
  };

  const handleVehicleNext = (data: any) => {
    setOnboardingData({ ...onboardingData, vehicle: data });
    setCurrentStep(3);
  };

  const handleVehicleSkip = () => {
    setOnboardingData({ ...onboardingData, vehicle: null });
    setCurrentStep(3);
  };

  const handleDriverNext = async (data: any) => {
    setError('');
    setLoading(true);

    try {
      await onboardingService.completeOnboarding({
        ...onboardingData,
        driver: data,
      } as any);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de l\'enregistrement');
    } finally {
      setLoading(false);
    }
  };

  const handleDriverSkip = async () => {
    setError('');
    setLoading(true);

    try {
      await onboardingService.completeOnboarding({
        ...onboardingData,
        driver: null,
      } as any);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de l\'enregistrement');
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    { number: 1, name: 'Profil' },
    { number: 2, name: 'Véhicule' },
    { number: 3, name: 'Conducteur' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900">Bienvenue sur FlotteQ !</h1>
          <p className="mt-2 text-sm text-gray-600">
            Configurons votre compte en quelques étapes
          </p>
        </div>

        {/* Stepper */}
        <div className="mb-8">
          <div className="flex items-center justify-center">
            {steps.map((step, index) => (
              <div key={step.number} className="flex items-center">
                <div
                  className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                    currentStep >= step.number
                      ? 'border-flotteq-blue bg-flotteq-blue text-white'
                      : 'border-gray-300 bg-white text-gray-500'
                  }`}
                >
                  {step.number}
                </div>
                <span
                  className={`ml-2 text-sm font-medium ${
                    currentStep >= step.number ? 'text-flotteq-blue' : 'text-gray-500'
                  }`}
                >
                  {step.name}
                </span>
                {index < steps.length - 1 && (
                  <div
                    className={`w-16 h-0.5 mx-4 ${
                      currentStep > step.number ? 'bg-flotteq-blue' : 'bg-gray-300'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 rounded-md bg-red-50 p-4">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {/* Content */}
        <div className="bg-white rounded-lg shadow-sm p-8">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-flotteq-blue"></div>
            </div>
          ) : (
            <>
              {currentStep === 1 && (
                <ProfileStep
                  onNext={handleProfileNext}
                  initialData={onboardingData.profile}
                />
              )}
              {currentStep === 2 && (
                <VehicleStep
                  onNext={handleVehicleNext}
                  onSkip={handleVehicleSkip}
                  onBack={() => setCurrentStep(1)}
                  initialData={onboardingData.vehicle}
                />
              )}
              {currentStep === 3 && (
                <DriverStep
                  onNext={handleDriverNext}
                  onSkip={handleDriverSkip}
                  onBack={() => setCurrentStep(2)}
                  initialData={onboardingData.driver}
                />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
