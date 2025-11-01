import React from 'react';
import { CheckCircle } from 'lucide-react';
import { TripSummary } from './TripSummary';
import type { VehicleDefect } from '../../types/trip.types';

interface ValidationStepProps {
  km: number;
  fuelLevel: number;
  photos: {
    front?: string;
    back?: string;
    left?: string;
    right?: string;
  };
  defects: VehicleDefect[];
  notes: string;
  setNotes: (notes: string) => void;
}

export const ValidationStep: React.FC<ValidationStepProps> = ({
  km,
  fuelLevel,
  photos,
  defects,
  notes,
  setNotes,
}) => {
  const photosArray = Object.values(photos).filter(Boolean) as string[];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Validation</h2>
        <p className="text-gray-600">Vérifiez les informations avant de valider</p>
      </div>

      <TripSummary
        km={km}
        fuelLevel={fuelLevel}
        photosCount={photosArray.length}
        defects={defects}
        notes={notes}
      />

      {/* Notes optionnelles */}
      <div className="bg-white rounded-xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <CheckCircle className="w-6 h-6 text-green-600" />
          <h3 className="text-lg font-semibold text-gray-900">Notes (optionnel)</h3>
        </div>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Ajoutez des remarques ou observations supplémentaires..."
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
        />
      </div>

      {/* Avertissement défauts graves */}
      {defects.some((d) => d.severity === 'severe') && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-800">
            ⚠️ <strong>Attention:</strong> Vous avez signalé des défauts graves. Un rapport
            d'incident sera automatiquement créé après la validation.
          </p>
        </div>
      )}
    </div>
  );
};
