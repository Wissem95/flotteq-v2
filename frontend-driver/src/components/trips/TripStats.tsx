import React from 'react';
import { Gauge, Clock, Fuel, AlertTriangle, TrendingUp, TrendingDown } from 'lucide-react';

interface TripStatsProps {
  startKm: number;
  endKm: number | null;
  startFuelLevel: number;
  endFuelLevel: number | null;
  distanceKm: number | null;
  durationMinutes: number | null;
  defectsCount?: number;
  compact?: boolean;
}

export const TripStats: React.FC<TripStatsProps> = ({
  startKm,
  endKm,
  startFuelLevel,
  endFuelLevel,
  distanceKm,
  durationMinutes,
  defectsCount = 0,
  compact = false,
}) => {
  const fuelDiff = endFuelLevel !== null ? endFuelLevel - startFuelLevel : 0;
  const avgSpeed = distanceKm && durationMinutes && durationMinutes > 0
    ? Math.round((distanceKm / (durationMinutes / 60)) * 10) / 10
    : 0;

  if (compact) {
    // Vue compacte pour liste
    return (
      <div className="flex items-center gap-4 text-sm">
        {distanceKm !== null && (
          <div className="flex items-center gap-1">
            <Gauge className="w-4 h-4 text-blue-600" />
            <span className="font-semibold">{distanceKm.toLocaleString()} km</span>
          </div>
        )}

        {durationMinutes !== null && (
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4 text-purple-600" />
            <span>
              {Math.floor(durationMinutes / 60)}h
              {(durationMinutes % 60).toString().padStart(2, '0')}
            </span>
          </div>
        )}

        {endFuelLevel !== null && (
          <div className="flex items-center gap-1">
            <Fuel className={`w-4 h-4 ${fuelDiff >= 0 ? 'text-green-600' : 'text-red-600'}`} />
            <span className={fuelDiff >= 0 ? 'text-green-700' : 'text-red-700'}>
              {fuelDiff > 0 ? '+' : ''}{fuelDiff}%
            </span>
          </div>
        )}

        {defectsCount > 0 && (
          <div className="flex items-center gap-1">
            <AlertTriangle className="w-4 h-4 text-orange-600" />
            <span className="text-orange-700">{defectsCount}</span>
          </div>
        )}
      </div>
    );
  }

  // Vue détaillée pour card expanded
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      {/* Kilométrage départ */}
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-2">
          <div className="p-2 bg-gray-600 rounded-lg">
            <Gauge className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-xs text-gray-600">Départ</p>
            <p className="text-xl font-bold text-gray-900">{startKm.toLocaleString()} km</p>
          </div>
        </div>
      </div>

      {/* Kilométrage arrivée */}
      {endKm !== null && (
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 bg-gray-600 rounded-lg">
              <Gauge className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-xs text-gray-600">Arrivée</p>
              <p className="text-xl font-bold text-gray-900">{endKm.toLocaleString()} km</p>
            </div>
          </div>
        </div>
      )}

      {/* Distance parcourue */}
      {distanceKm !== null && (
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 bg-blue-600 rounded-lg">
              <Gauge className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-xs text-gray-600">Distance</p>
              <p className="text-xl font-bold text-gray-900">{distanceKm.toLocaleString()} km</p>
            </div>
          </div>
        </div>
      )}

      {/* Durée */}
      {durationMinutes !== null && (
        <div className="bg-purple-50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 bg-purple-600 rounded-lg">
              <Clock className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-xs text-gray-600">Durée</p>
              <p className="text-xl font-bold text-gray-900">
                {Math.floor(durationMinutes / 60)}h{(durationMinutes % 60).toString().padStart(2, '0')}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Consommation carburant */}
      {endFuelLevel !== null && (
        <div className={`rounded-lg p-4 ${fuelDiff >= 0 ? 'bg-green-50' : 'bg-red-50'}`}>
          <div className="flex items-center gap-2 mb-2">
            <div className={`p-2 rounded-lg ${fuelDiff >= 0 ? 'bg-green-600' : 'bg-red-600'}`}>
              {fuelDiff >= 0 ? (
                <TrendingUp className="w-5 h-5 text-white" />
              ) : (
                <TrendingDown className="w-5 h-5 text-white" />
              )}
            </div>
            <div>
              <p className="text-xs text-gray-600">Carburant</p>
              <p className={`text-xl font-bold ${fuelDiff >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                {fuelDiff > 0 ? '+' : ''}{fuelDiff}%
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Vitesse moyenne */}
      {avgSpeed > 0 && (
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 bg-gray-600 rounded-lg">
              <Gauge className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-xs text-gray-600">Vitesse moy.</p>
              <p className="text-xl font-bold text-gray-900">{avgSpeed} km/h</p>
            </div>
          </div>
        </div>
      )}

      {/* Défauts */}
      {defectsCount > 0 && (
        <div className="bg-orange-50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 bg-orange-600 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-xs text-gray-600">Défauts</p>
              <p className="text-xl font-bold text-orange-700">{defectsCount}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
