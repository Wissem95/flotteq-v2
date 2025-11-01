import React from 'react';
import { X, AlertTriangle, Image as ImageIcon } from 'lucide-react';
import type { VehicleDefect, DefectType, DefectSeverity } from '../../types/trip.types';

interface DefectCardProps {
  defect: VehicleDefect;
  onRemove?: () => void;
  readonly?: boolean;
}

const defectTypeLabels: Record<DefectType, string> = {
  scratch: 'Rayure',
  dent: 'Bosse',
  broken: 'Cassé',
  dirty: 'Sale',
  missing: 'Manquant',
  other: 'Autre',
};

const severityConfig: Record<
  DefectSeverity,
  { label: string; bgClass: string; textClass: string }
> = {
  minor: {
    label: 'Mineur',
    bgClass: 'bg-yellow-100',
    textClass: 'text-yellow-700',
  },
  moderate: {
    label: 'Modéré',
    bgClass: 'bg-orange-100',
    textClass: 'text-orange-700',
  },
  severe: {
    label: 'Grave',
    bgClass: 'bg-red-100',
    textClass: 'text-red-700',
  },
};

export const DefectCard: React.FC<DefectCardProps> = ({ defect, onRemove, readonly = false }) => {
  const severity = severityConfig[defect.severity];

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 relative">
      {onRemove && !readonly && (
        <button
          onClick={onRemove}
          className="absolute top-2 right-2 text-gray-400 hover:text-red-600 transition-colors"
          type="button"
        >
          <X className="w-5 h-5" />
        </button>
      )}

      <div className="flex items-start gap-3 mb-3">
        <div className={`p-2 rounded-lg ${severity.bgClass}`}>
          <AlertTriangle className={`w-5 h-5 ${severity.textClass}`} />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-semibold text-gray-900">
              {defectTypeLabels[defect.type]}
            </h4>
            <span
              className={`px-2 py-0.5 text-xs font-medium rounded-full ${severity.bgClass} ${severity.textClass}`}
            >
              {severity.label}
            </span>
          </div>
          <p className="text-sm text-gray-600 mb-1">
            <span className="font-medium">Localisation:</span> {defect.location}
          </p>
          <p className="text-sm text-gray-700">{defect.description}</p>
        </div>
      </div>

      {/* Photos */}
      {defect.photos && defect.photos.length > 0 && (
        <div className="mt-3">
          <div className="flex items-center gap-1 mb-2 text-sm text-gray-600">
            <ImageIcon className="w-4 h-4" />
            <span>{defect.photos.length} photo(s)</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {defect.photos.map((photo, idx) => (
              <img
                key={idx}
                src={photo}
                alt={`Défaut ${idx + 1}`}
                className="w-full h-20 object-cover rounded border border-gray-200"
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
