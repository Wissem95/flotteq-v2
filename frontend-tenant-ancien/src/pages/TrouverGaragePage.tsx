import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { MapPin, Car, Wrench, ArrowLeft } from 'lucide-react';
import VehicleSearchFormEnhanced from '../components/Garage/VehicleSearchFormEnhanced';
import GarageSearchMapEnhanced from '../components/Garage/GarageSearchMapEnhanced';
import ReservationPage from './ReservationPage';
import ReservationConfirmation from './ReservationConfirmation';
import { useVehicleSearchPersistence } from '@/hooks/useVehicleSearchPersistence';

interface VehicleInfo {
  licensePlate: string;
  brand: string;
  model: string;
  year: string;
  version: string;
}

type ViewStep = 'form' | 'results' | 'reservation' | 'confirmation';

const TrouverGaragePage: React.FC = () => {
  const { searchData } = useVehicleSearchPersistence();
  const [currentStep, setCurrentStep] = useState<ViewStep>('form');
  const [vehicleInfo, setVehicleInfo] = useState<VehicleInfo | null>(null);
  const [selectedRepairs, setSelectedRepairs] = useState<string[]>([]);
  const [selectedGarage, setSelectedGarage] = useState<any>(null);
  const [reservationData, setReservationData] = useState<any>(null);

  useEffect(() => {
    if (searchData) {
      setVehicleInfo(searchData.vehicleInfo);
      setSelectedRepairs([searchData.selectedService]);
      // Ne pas passer automatiquement aux résultats, laisser l'utilisateur choisir
    }
  }, [searchData]);

  const handleVehicleSelected = (vehicle: VehicleInfo, repairs: string[]) => {
    setVehicleInfo(vehicle);
    setSelectedRepairs(repairs);
    setCurrentStep('results');
  };

  const handleReservationRequest = (garage: any) => {
    setSelectedGarage(garage);
    setCurrentStep('reservation');
  };

  const handleReservationConfirmed = (data: any) => {
    setReservationData(data);
    setCurrentStep('confirmation');
  };

  const handleNewSearch = () => {
    setCurrentStep('form');
    setVehicleInfo(null);
    setSelectedRepairs([]);
    setSelectedGarage(null);
    setReservationData(null);
  };

  const handleBackToResults = () => {
    setCurrentStep('results');
    setSelectedGarage(null);
  };

  const handleViewReservation = () => {
    // Ici, on pourrait rediriger vers une page de gestion des réservations
    // Pour l'instant, on retourne aux résultats
    setCurrentStep('results');
  };

  const handleBackToHome = () => {
    handleNewSearch();
  };

  return (
    <div className="flex-1 p-3 sm:p-6 bg-gradient-to-br from-gray-50 to-blue-50/30">
      <div className="max-w-7xl mx-auto">
        {/* En-tête corrigé avec alignement */}
        {currentStep === 'form' && (
          <div className="mb-8">
            <div className="text-center">
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 flex items-center justify-center gap-3 mb-3">
                <span className="text-2xl">🔧</span>
                Trouver un garage
              </h1>
              <p className="text-lg text-gray-600 max-w-xl mx-auto">
                Trouvez le garage le plus proche et réservez votre créneau en ligne
              </p>
            </div>
          </div>
        )}

        {/* Formulaire de recherche */}
        {currentStep === 'form' && (
          <div className="max-w-4xl mx-auto space-y-8">
            <VehicleSearchFormEnhanced onVehicleSelected={handleVehicleSelected} />
            
            {/* Cartes informatives uniformisées */}
            <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="text-center group hover:shadow-lg hover:-translate-y-1 transition-all duration-300 border-0 shadow-md bg-white h-40 flex flex-col justify-between">
                <CardContent className="p-6 flex-1 flex flex-col justify-center">
                  <div className="bg-blue-100 w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-300">
                    <MapPin className="w-7 h-7 text-blue-600" />
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2">Réseau national</h3>
                  <p className="text-sm text-gray-600">Plus de 2000 garages partenaires dans toute la France</p>
                </CardContent>
              </Card>
              
              <Card className="text-center group hover:shadow-lg hover:-translate-y-1 transition-all duration-300 border-0 shadow-md bg-white h-40 flex flex-col justify-between">
                <CardContent className="p-6 flex-1 flex flex-col justify-center">
                  <div className="bg-green-100 w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-300">
                    <Car className="w-7 h-7 text-green-600" />
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2">Toutes marques</h3>
                  <p className="text-sm text-gray-600">Spécialistes de toutes les marques automobiles</p>
                </CardContent>
              </Card>
              
              <Card className="text-center group hover:shadow-lg hover:-translate-y-1 transition-all duration-300 border-0 shadow-md bg-white h-40 flex flex-col justify-between">
                <CardContent className="p-6 flex-1 flex flex-col justify-center">
                  <div className="bg-purple-100 w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-300">
                    <Wrench className="w-7 h-7 text-purple-600" />
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2">Réservation en ligne</h3>
                  <p className="text-sm text-gray-600">Réservez votre créneau et payez en ligne</p>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Résultats avec récapitulatif */}
        {currentStep === 'results' && vehicleInfo && (
          <div>
            <Card className="mb-6 shadow-md border bg-white">
              <CardContent className="p-6">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex flex-wrap items-center gap-4 text-sm">
                    <div className="flex items-center gap-2 bg-blue-100 px-3 py-2 rounded-full">
                      <Car className="w-4 h-4 text-blue-600" />
                      <span className="font-semibold text-blue-800">
                        {vehicleInfo.brand} {vehicleInfo.model} ({vehicleInfo.year})
                      </span>
                    </div>
                    {vehicleInfo.licensePlate && (
                      <div className="bg-gray-100 text-gray-800 px-3 py-2 rounded-full text-xs font-mono font-bold border">
                        {vehicleInfo.licensePlate}
                      </div>
                    )}
                    <div className="flex items-center gap-2 bg-green-100 px-3 py-2 rounded-full">
                      <Wrench className="w-4 h-4 text-green-600" />
                      <span className="font-semibold text-green-800">{selectedRepairs.length} réparation{selectedRepairs.length > 1 ? 's' : ''}</span>
                    </div>
                  </div>
                  <button
                    onClick={handleNewSearch}
                    className="flex items-center gap-2 text-blue-600 hover:text-blue-800 text-sm font-medium px-4 py-2 rounded-lg hover:bg-blue-50 transition-all duration-200 border border-blue-200 hover:border-blue-300"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Nouvelle recherche
                  </button>
                </div>
              </CardContent>
            </Card>

            <GarageSearchMapEnhanced 
              vehicleInfo={vehicleInfo} 
              selectedRepairs={selectedRepairs}
              onReservationRequest={handleReservationRequest}
            />
          </div>
        )}

        {/* Réservation */}
        {currentStep === 'reservation' && selectedGarage && vehicleInfo && (
          <ReservationPage
            garage={selectedGarage}
            vehicleInfo={vehicleInfo}
            selectedRepairs={selectedRepairs}
            onBack={handleBackToResults}
            onReservationConfirmed={handleReservationConfirmed}
          />
        )}

        {/* Confirmation */}
        {currentStep === 'confirmation' && reservationData && (
          <ReservationConfirmation
            reservationData={reservationData}
            onViewReservation={handleViewReservation}
            onBackToHome={handleBackToHome}
          />
        )}
      </div>
    </div>
  );
};

export default TrouverGaragePage;
