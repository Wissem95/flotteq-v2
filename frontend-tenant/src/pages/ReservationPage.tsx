
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { ArrowLeft, MapPin, Car, Wrench, Clock, Euro, CreditCard } from 'lucide-react';
import { toast } from 'sonner';

interface Garage {
  id: string;
  name: string;
  address: string;
  phone: string;
  priceForService: number;
}

interface VehicleInfo {
  licensePlate: string;
  brand: string;
  model: string;
  year: string;
  version: string;
}

interface ReservationPageProps {
  garage: Garage;
  vehicleInfo: VehicleInfo;
  selectedRepairs: string[];
  onBack: () => void;
  onReservationConfirmed: (reservationData: any) => void;
}

const ReservationPage: React.FC<ReservationPageProps> = ({
  garage,
  vehicleInfo,
  selectedRepairs,
  onBack,
  onReservationConfirmed
}) => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Créneaux horaires disponibles
  const availableTimeSlots = [
    '08:00', '09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00'
  ];

  const reservationFee = 10; // 10€ TTC
  const estimatedTotal = selectedRepairs.length * garage.priceForService;

  const handleConfirmReservation = async () => {
    if (!selectedDate || !selectedTimeSlot) {
      toast.error('Veuillez sélectionner une date et un créneau horaire');
      return;
    }

    setIsProcessing(true);

    try {
      // Simulation du processus de réservation et paiement
      await new Promise(resolve => setTimeout(resolve, 2000));

      const reservationData = {
        id: `RES-${Date.now()}`,
        garage,
        vehicleInfo,
        selectedRepairs,
        date: selectedDate,
        timeSlot: selectedTimeSlot,
        reservationFee,
        estimatedTotal,
        status: 'confirmed',
        createdAt: new Date()
      };

      onReservationConfirmed(reservationData);
      toast.success('Réservation confirmée avec succès !');
    } catch (error) {
      toast.error('Erreur lors de la réservation');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex-1 p-3 sm:p-6 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        {/* En-tête */}
        <div className="flex items-center gap-4 mb-6">
          <Button
            onClick={onBack}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour
          </Button>
          <h1 className="text-2xl font-bold text-gray-900">Réserver un créneau</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Calendrier et créneaux */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-600" />
                Choisir un créneau
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="font-medium mb-3">Date souhaitée</h3>
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  disabled={(date) => date < new Date() || date.getDay() === 0}
                  className="rounded-md border"
                />
              </div>

              {selectedDate && (
                <div>
                  <h3 className="font-medium mb-3">Créneaux disponibles</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {availableTimeSlots.map((slot) => (
                      <button
                        key={slot}
                        onClick={() => setSelectedTimeSlot(slot)}
                        className={`p-2 border rounded-md text-sm transition-colors ${
                          selectedTimeSlot === slot
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'bg-white hover:bg-gray-50 border-gray-200'
                        }`}
                      >
                        {slot}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Récapitulatif */}
          <Card>
            <CardHeader>
              <CardTitle>Récapitulatif de la réservation</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Véhicule */}
              <div>
                <h3 className="font-medium mb-2 flex items-center gap-2">
                  <Car className="w-4 h-4 text-blue-600" />
                  Véhicule
                </h3>
                <p className="text-sm text-gray-600">
                  {vehicleInfo.brand} {vehicleInfo.model} ({vehicleInfo.year})
                </p>
                {vehicleInfo.licensePlate && (
                  <Badge variant="secondary" className="mt-1 font-mono text-xs">
                    {vehicleInfo.licensePlate}
                  </Badge>
                )}
              </div>

              {/* Garage */}
              <div>
                <h3 className="font-medium mb-2 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-green-600" />
                  Garage
                </h3>
                <p className="font-medium">{garage.name}</p>
                <p className="text-sm text-gray-600">{garage.address}</p>
              </div>

              {/* Réparations */}
              <div>
                <h3 className="font-medium mb-2 flex items-center gap-2">
                  <Wrench className="w-4 h-4 text-purple-600" />
                  Réparations demandées
                </h3>
                <div className="flex flex-wrap gap-1">
                  {selectedRepairs.map((repair, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {repair}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Créneau sélectionné */}
              {selectedDate && selectedTimeSlot && (
                <div className="bg-blue-50 p-3 rounded-md">
                  <h3 className="font-medium text-blue-900 mb-1">Créneau réservé</h3>
                  <p className="text-sm text-blue-700">
                    {selectedDate.toLocaleDateString('fr-FR', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })} à {selectedTimeSlot}
                  </p>
                </div>
              )}

              {/* Tarification */}
              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Total estimé réparations</span>
                  <span>{estimatedTotal}€</span>
                </div>
                <div className="flex justify-between text-sm font-medium">
                  <span>Frais de réservation</span>
                  <span className="text-green-600">{reservationFee}€ TTC</span>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  ⚠️ Ce montant vous sera remboursé si le garage annule
                </p>
              </div>

              {/* Bouton de confirmation */}
              <Button
                onClick={handleConfirmReservation}
                disabled={!selectedDate || !selectedTimeSlot || isProcessing}
                className="w-full flex items-center gap-2"
                size="lg"
              >
                <CreditCard className="w-4 h-4" />
                {isProcessing ? 'Traitement en cours...' : `Confirmer le créneau (${reservationFee}€)`}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ReservationPage;
