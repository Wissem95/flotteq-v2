import React from 'react';
import { Plus } from 'lucide-react';
import { DefectCard } from './DefectCard';
import type { VehicleDefect } from '../../types/trip.types';

interface DefectsListProps {
  defects: VehicleDefect[];
  onAddDefect: () => void;
  onRemoveDefect: (defectId: string) => void;
  readonly?: boolean;
}

export const DefectsList: React.FC<DefectsListProps> = ({
  defects,
  onAddDefect,
  onRemoveDefect,
  readonly = false,
}) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">
          Défauts ({defects.length})
        </h3>
        {!readonly && (
          <button
            onClick={onAddDefect}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            type="button"
          >
            <Plus className="w-4 h-4" />
            <span>Ajouter un défaut</span>
          </button>
        )}
      </div>

      {defects.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <p className="text-gray-600">
            {readonly
              ? 'Aucun défaut signalé'
              : 'Aucun défaut signalé. Utilisez le bouton ci-dessus pour en ajouter.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {defects.map((defect) => (
            <DefectCard
              key={defect.id}
              defect={defect}
              onRemove={readonly ? undefined : () => onRemoveDefect(defect.id)}
              readonly={readonly}
            />
          ))}
        </div>
      )}
    </div>
  );
};
