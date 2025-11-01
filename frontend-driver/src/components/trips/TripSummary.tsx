import React from 'react';
import { Gauge, Fuel, Image as ImageIcon, AlertTriangle } from 'lucide-react';
import type { VehicleDefect } from '../../types/trip.types';

interface TripSummaryProps {
  km: number;
  fuelLevel: number;
  photosCount: number;
  defects?: VehicleDefect[];
  notes?: string;
}

export const TripSummary: React.FC<TripSummaryProps> = ({
  km,
  fuelLevel,
  photosCount,
  defects = [],
  notes,
}) => {
  const getFuelColor = () => {
    if (fuelLevel < 25) return 'text-red-600';
    if (fuelLevel < 50) return 'text-orange-500';
    return 'text-green-600';
  };

  return (
    <div className="bg-white rounded-xl p-6 space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Résumé</h3>

      <div className="grid grid-cols-2 gap-4">
        {/* Kilométrage */}
        <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
          <div className="p-2 bg-blue-600 rounded-lg">
            <Gauge className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-xs text-gray-600">Kilométrage</p>
            <p className="text-lg font-bold text-gray-900">{km.toLocaleString()} km</p>
          </div>
        </div>

        {/* Carburant */}
        <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
          <div className="p-2 bg-green-600 rounded-lg">
            <Fuel className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-xs text-gray-600">Carburant</p>
            <p className={`text-lg font-bold ${getFuelColor()}`}>{fuelLevel}%</p>
          </div>
        </div>

        {/* Photos */}
        <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
          <div className="p-2 bg-purple-600 rounded-lg">
            <ImageIcon className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-xs text-gray-600">Photos</p>
            <p className="text-lg font-bold text-gray-900">{photosCount}</p>
          </div>
        </div>

        {/* Défauts */}
        <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg">
          <div className="p-2 bg-orange-600 rounded-lg">
            <AlertTriangle className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-xs text-gray-600">Défauts</p>
            <p className="text-lg font-bold text-gray-900">{defects.length}</p>
          </div>
        </div>
      </div>

      {/* Notes */}
      {notes && (
        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <p className="text-xs text-gray-600 mb-1">Notes</p>
          <p className="text-sm text-gray-900">{notes}</p>
        </div>
      )}

      {/* Liste des défauts */}
      {defects.length > 0 && (
        <div className="mt-4">
          <p className="text-xs text-gray-600 mb-2">Défauts signalés :</p>
          <ul className="space-y-2">
            {defects.map((defect) => (
              <li key={defect.id} className="flex items-start gap-2 text-sm">
                <AlertTriangle className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-gray-900">
                    {defect.type} - {defect.location}
                  </p>
                  <p className="text-gray-600 text-xs">{defect.description}</p>
                  <span
                    className={`inline-block mt-1 px-2 py-0.5 text-xs rounded-full ${
                      defect.severity === 'severe'
                        ? 'bg-red-100 text-red-700'
                        : defect.severity === 'moderate'
                        ? 'bg-orange-100 text-orange-700'
                        : 'bg-yellow-100 text-yellow-700'
                    }`}
                  >
                    {defect.severity === 'severe'
                      ? 'Grave'
                      : defect.severity === 'moderate'
                      ? 'Modéré'
                      : 'Mineur'}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
