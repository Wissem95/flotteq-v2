
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, MapPin, Car, Wrench, Clock, Phone, Calendar } from 'lucide-react';

interface ReservationConfirmationProps {
  reservationData: any;
  onViewReservation: () => void;
  onBackToHome: () => void;
}

const ReservationConfirmation: React.FC<ReservationConfirmationProps> = ({
  reservationData,
  onViewReservation,
  onBackToHome
}) => {
  const navigate = useNavigate();

  // Sauvegarder la réservation au montage du composant
  useEffect(() => {
    if (reservationData) {
      // Récupérer les réservations existantes
      const existingReservations = JSON.parse(localStorage.getItem('userReservations') || '[]');
      
      // Créer la nouvelle réservation
      const newReservation = {
        ...reservationData,
        status: 'confirmed',
        canCancel: true // Permettre l'annulation
      };
      
      // Ajouter la nouvelle réservation
      const updatedReservations = [newReservation, ...existingReservations];
      localStorage.setItem('userReservations', JSON.stringify(updatedReservations));
      
      // Ajouter une notification
      const notifications = JSON.parse(localStorage.getItem('notifications') || '[]');
      notifications.unshift({
        id: Date.now().toString(),
        title: 'Réservation confirmée',
        message: `Votre réservation chez ${reservationData.garage.name} a été confirmée pour le ${reservationData.date.toLocaleDateString('fr-FR')} à ${reservationData.timeSlot}`,
        type: 'success',
        timestamp: new Date().toISOString(),
        read: false
      });
      localStorage.setItem('notifications', JSON.stringify(notifications));
    }
  }, [reservationData]);

  // Fonction pour rediriger vers la page des réservations
  const handleViewReservations = () => {
    navigate('/mes-reservations');
  };

  return (
    <div className="flex-1 p-3 sm:p-6 bg-gray-50">
      <div className="max-w-2xl mx-auto">
        {/* Confirmation visuelle */}
        <div className="text-center mb-8">
          <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Réservation confirmée !</h1>
          <p className="text-gray-600">
            Votre créneau a été réservé avec succès
          </p>
        </div>

        {/* Détails de la réservation */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-600" />
              Détails de votre réservation
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Référence */}
            <div className="bg-blue-50 p-4 rounded-md">
              <h3 className="font-medium text-blue-900 mb-1">Référence de réservation</h3>
              <p className="text-lg font-mono text-blue-700">{reservationData.id}</p>
            </div>

            {/* Créneau */}
            <div>
              <h3 className="font-medium mb-2 flex items-center gap-2">
                <Clock className="w-4 h-4 text-green-600" />
                Créneau réservé
              </h3>
              <p className="text-lg">
                {reservationData.date.toLocaleDateString('fr-FR', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })} à {reservationData.timeSlot}
              </p>
            </div>

            {/* Garage */}
            <div>
              <h3 className="font-medium mb-2 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-purple-600" />
                Garage partenaire
              </h3>
              <p className="font-medium">{reservationData.garage.name}</p>
              <p className="text-sm text-gray-600">{reservationData.garage.address}</p>
              <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                <Phone className="w-3 h-3" />
                {reservationData.garage.phone}
              </p>
            </div>

            {/* Véhicule */}
            <div>
              <h3 className="font-medium mb-2 flex items-center gap-2">
                <Car className="w-4 h-4 text-blue-600" />
                Véhicule concerné
              </h3>
              <p>
                {reservationData.vehicleInfo.brand} {reservationData.vehicleInfo.model} ({reservationData.vehicleInfo.year})
              </p>
              {reservationData.vehicleInfo.licensePlate && (
                <Badge variant="secondary" className="mt-1 font-mono text-xs">
                  {reservationData.vehicleInfo.licensePlate}
                </Badge>
              )}
            </div>

            {/* Réparations */}
            <div>
              <h3 className="font-medium mb-2 flex items-center gap-2">
                <Wrench className="w-4 h-4 text-orange-600" />
                Réparations demandées
              </h3>
              <div className="flex flex-wrap gap-2">
                {reservationData.selectedRepairs.map((repair: string, index: number) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {repair}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Montants */}
            <div className="border-t pt-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm">Frais de réservation payés</span>
                <span className="font-medium text-green-600">{reservationData.reservationFee}€ TTC</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Total estimé réparations</span>
                <span className="text-sm text-gray-600">{reservationData.estimatedTotal}€ (à confirmer)</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex gap-3">
          <Button onClick={handleViewReservations} className="flex-1">
            Voir mes réservations
          </Button>
          <Button onClick={onBackToHome} variant="outline" className="flex-1">
            Retour à l'accueil
          </Button>
        </div>

        {/* Informations importantes */}
        <Card className="mt-6">
          <CardContent className="p-4">
            <h3 className="font-medium mb-2">Informations importantes</h3>
            <ul className="space-y-1 text-sm text-gray-600">
              <li>• Le garage vous contactera pour confirmer votre rendez-vous</li>
              <li>• Les frais de réservation (10€) vous seront remboursés si le garage annule</li>
              <li>• Vous pouvez modifier ou annuler votre réservation jusqu'à 24h avant</li>
              <li>• Un e-mail de confirmation vous a été envoyé</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ReservationConfirmation;
