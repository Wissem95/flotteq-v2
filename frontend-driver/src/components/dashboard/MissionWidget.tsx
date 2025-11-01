import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Car, TrendingUp, Gauge, Fuel, Clock } from 'lucide-react';
import { useCurrentTrip } from '../../hooks/useTrips';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

interface MissionWidgetProps {
  currentVehicleKm?: number;
}

export const MissionWidget: React.FC<MissionWidgetProps> = ({ currentVehicleKm }) => {
  const navigate = useNavigate();
  const { data: currentTrip, isLoading } = useCurrentTrip();
  const [duration, setDuration] = useState('');

  useEffect(() => {
    if (currentTrip) {
      const updateDuration = () => {
        const start = new Date(currentTrip.startedAt);
        setDuration(
          formatDistanceToNow(start, {
            locale: fr,
            addSuffix: false,
          })
        );
      };

      updateDuration();
      const interval = setInterval(updateDuration, 60000); // Update every minute

      return () => clearInterval(interval);
    }
  }, [currentTrip]);

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/3"></div>
          <div className="h-8 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  // Pas de mission en cours
  if (!currentTrip) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-50 rounded-full mb-4">
            <Car className="w-8 h-8 text-blue-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucune mission en cours</h3>
          <p className="text-gray-600 mb-4 text-sm">
            Commencez une mission pour enregistrer votre prise en charge du véhicule
          </p>
          <button
            onClick={() => navigate('/trips/start')}
            className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            🚗 Démarrer une mission
          </button>
        </div>
      </div>
    );
  }

  // Mission en cours
  const kmParcourus = currentVehicleKm
    ? currentVehicleKm - currentTrip.startKm
    : 0;

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border-2 border-green-500">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-sm font-medium text-green-700">Mission en cours</span>
        </div>
        <div className="flex items-center gap-1 text-gray-600">
          <Clock className="w-4 h-4" />
          <span className="text-sm">{duration}</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        {/* Départ */}
        <div className="p-3 bg-blue-50 rounded-lg">
          <p className="text-xs text-gray-600 mb-1">Départ</p>
          <div className="flex items-center gap-2">
            <Gauge className="w-4 h-4 text-blue-600" />
            <p className="text-lg font-bold text-gray-900">
              {currentTrip.startKm.toLocaleString()} km
            </p>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <Fuel className="w-3 h-3 text-blue-600" />
            <p className="text-xs text-gray-600">{currentTrip.startFuelLevel}% carburant</p>
          </div>
        </div>

        {/* Distance parcourue */}
        <div className="p-3 bg-green-50 rounded-lg">
          <p className="text-xs text-gray-600 mb-1">Parcouru</p>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-green-600" />
            <p className="text-lg font-bold text-green-700">
              +{kmParcourus.toLocaleString()} km
            </p>
          </div>
        </div>
      </div>

      {/* Défauts signalés au départ */}
      {currentTrip.startDefects && currentTrip.startDefects.length > 0 && (
        <div className="mb-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
          <p className="text-xs text-orange-700">
            ⚠️ {currentTrip.startDefects.length} défaut(s) signalé(s) au départ
          </p>
        </div>
      )}

      {/* Action Button */}
      <button
        onClick={() => navigate(`/trips/${currentTrip.id}/end`)}
        className="w-full bg-red-600 text-white py-3 px-6 rounded-lg hover:bg-red-700 transition-colors font-medium flex items-center justify-center gap-2"
      >
        🏁 Terminer la mission
      </button>

      {/* Notes de départ si présentes */}
      {currentTrip.startNotes && (
        <div className="mt-3 p-3 bg-gray-50 rounded-lg">
          <p className="text-xs text-gray-600 mb-1">Notes de départ</p>
          <p className="text-sm text-gray-900">{currentTrip.startNotes}</p>
        </div>
      )}
    </div>
  );
};
