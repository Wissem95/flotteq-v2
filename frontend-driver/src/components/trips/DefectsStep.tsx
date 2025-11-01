import React, { useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { DefectsList } from './DefectsList';
import { AddDefectModal } from './AddDefectModal';
import type { VehicleDefect } from '../../types/trip.types';

interface DefectsStepProps {
  defects: VehicleDefect[];
  onAddDefect: (defect: VehicleDefect) => void;
  onRemoveDefect: (defectId: string) => void;
}

export const DefectsStep: React.FC<DefectsStepProps> = ({
  defects,
  onAddDefect,
  onRemoveDefect,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Défauts constatés</h2>
        <p className="text-gray-600">
          Signalez les défauts visibles sur le véhicule (optionnel)
        </p>
      </div>

      <div className="bg-white rounded-xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle className="w-6 h-6 text-orange-600" />
          <h3 className="text-lg font-semibold text-gray-900">Inspection visuelle</h3>
        </div>

        <div className="mb-4 p-4 bg-orange-50 border border-orange-200 rounded-lg">
          <p className="text-sm text-orange-800">
            💡 <strong>Conseil:</strong> Signalez tous les défauts visibles pour vous protéger.
            Les défauts graves déclencheront automatiquement un rapport d'incident.
          </p>
        </div>

        <DefectsList
          defects={defects}
          onAddDefect={() => setIsModalOpen(true)}
          onRemoveDefect={onRemoveDefect}
        />
      </div>

      <AddDefectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAdd={onAddDefect}
      />
    </div>
  );
};
