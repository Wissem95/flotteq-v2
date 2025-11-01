import React from 'react';
import { ArrowRight, TrendingUp, TrendingDown } from 'lucide-react';
import type { VehicleDefect } from '../../types/trip.types';

interface ComparisonCardProps {
  startKm: number;
  endKm: number;
  startFuel: number;
  endFuel: number;
  startDefects?: VehicleDefect[];
  endDefects?: VehicleDefect[];
}

export const ComparisonCard: React.FC<ComparisonCardProps> = ({
  startKm,
  endKm,
  startFuel,
  endFuel,
  startDefects = [],
  endDefects = [],
}) => {
  const kmDiff = endKm - startKm;
  const fuelDiff = endFuel - startFuel;

  // Nouveaux défauts = défauts de fin qui n'étaient pas au départ
  const newDefects = endDefects.filter(
    (ed) => !startDefects.some((sd) => sd.id === ed.id)
  );

  return (
    <div className="bg-white rounded-xl p-6 space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">Comparaison</h3>

      {/* Kilométrage */}
      <div className="space-y-2">
        <p className="text-sm font-medium text-gray-700">Kilométrage</p>
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div className="text-center flex-1">
            <p className="text-xs text-gray-600">Départ</p>
            <p className="text-xl font-bold text-gray-900">{startKm.toLocaleString()} km</p>
          </div>
          <ArrowRight className="w-5 h-5 text-gray-400 mx-4" />
          <div className="text-center flex-1">
            <p className="text-xs text-gray-600">Retour</p>
            <p className="text-xl font-bold text-gray-900">{endKm.toLocaleString()} km</p>
          </div>
        </div>
        <div className="flex items-center justify-center gap-2 p-2 bg-green-50 rounded-lg">
          <TrendingUp className="w-4 h-4 text-green-600" />
          <span className="text-sm font-medium text-green-700">
            +{kmDiff.toLocaleString()} km parcourus
          </span>
        </div>
      </div>

      {/* Carburant */}
      <div className="space-y-2">
        <p className="text-sm font-medium text-gray-700">Carburant</p>
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div className="text-center flex-1">
            <p className="text-xs text-gray-600">Départ</p>
            <p className="text-xl font-bold text-gray-900">{startFuel}%</p>
          </div>
          <ArrowRight className="w-5 h-5 text-gray-400 mx-4" />
          <div className="text-center flex-1">
            <p className="text-xs text-gray-600">Retour</p>
            <p className="text-xl font-bold text-gray-900">{endFuel}%</p>
          </div>
        </div>
        <div
          className={`flex items-center justify-center gap-2 p-2 rounded-lg ${
            fuelDiff >= 0 ? 'bg-green-50' : 'bg-red-50'
          }`}
        >
          {fuelDiff >= 0 ? (
            <>
              <TrendingUp className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium text-green-700">
                +{Math.abs(fuelDiff)}% (Ravitaillé)
              </span>
            </>
          ) : (
            <>
              <TrendingDown className="w-4 h-4 text-red-600" />
              <span className="text-sm font-medium text-red-700">
                {fuelDiff}% (Consommé)
              </span>
            </>
          )}
        </div>
      </div>

      {/* Nouveaux défauts */}
      {newDefects.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-700">Nouveaux défauts détectés</p>
          <div className="space-y-2">
            {newDefects.map((defect) => (
              <div
                key={defect.id}
                className="p-3 bg-red-50 border border-red-200 rounded-lg"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium text-gray-900">
                      {defect.type} - {defect.location}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">{defect.description}</p>
                  </div>
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-full ${
                      defect.severity === 'severe'
                        ? 'bg-red-600 text-white'
                        : defect.severity === 'moderate'
                        ? 'bg-orange-500 text-white'
                        : 'bg-yellow-500 text-white'
                    }`}
                  >
                    {defect.severity === 'severe'
                      ? 'GRAVE'
                      : defect.severity === 'moderate'
                      ? 'MODÉRÉ'
                      : 'MINEUR'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
