import React from 'react';
import { Gauge } from 'lucide-react';
import { FuelGauge } from './FuelGauge';

interface KilometrageStepProps {
  km: number;
  setKm: (km: number) => void;
  fuelLevel: number;
  setFuelLevel: (level: number) => void;
  currentVehicleKm?: number;
}

export const KilometrageStep: React.FC<KilometrageStepProps> = ({
  km,
  setKm,
  fuelLevel,
  setFuelLevel,
  currentVehicleKm,
}) => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Kilométrage et carburant</h2>
        <p className="text-gray-600">
          Indiquez le kilométrage actuel du véhicule et le niveau de carburant
        </p>
      </div>

      {/* Kilométrage */}
      <div className="bg-white rounded-xl p-6 space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <Gauge className="w-6 h-6 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">Kilométrage</h3>
        </div>

        {currentVehicleKm && (
          <div className="p-3 bg-blue-50 rounded-lg mb-4">
            <p className="text-sm text-blue-800">
              <span className="font-medium">Dernier kilométrage enregistré:</span>{' '}
              {currentVehicleKm.toLocaleString()} km
            </p>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Kilométrage actuel (km) *
          </label>
          <input
            type="number"
            value={km || ''}
            onChange={(e) => setKm(parseInt(e.target.value) || 0)}
            placeholder="Ex: 102823"
            min="0"
            className="w-full px-4 py-3 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>

        {km > 0 && (
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-700">
              <span className="font-medium">Kilométrage saisi:</span>{' '}
              <span className="text-xl font-bold text-blue-600">{km.toLocaleString()}</span> km
            </p>
            {currentVehicleKm && km > currentVehicleKm && (
              <p className="text-sm text-green-600 mt-1">
                +{(km - currentVehicleKm).toLocaleString()} km depuis la dernière mise à jour
              </p>
            )}
            {currentVehicleKm && km < currentVehicleKm && (
              <p className="text-sm text-red-600 mt-1">
                ⚠️ Attention: Le kilométrage saisi est inférieur au dernier enregistrement
              </p>
            )}
          </div>
        )}
      </div>

      {/* Carburant */}
      <div className="bg-white rounded-xl p-6">
        <FuelGauge value={fuelLevel} onChange={setFuelLevel} />
      </div>
    </div>
  );
};
