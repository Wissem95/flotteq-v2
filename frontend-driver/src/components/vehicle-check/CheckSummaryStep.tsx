import React from 'react';
import {
  CheckCircle,
  X,
  Clock,
  MapPin,
  AlertCircle,
  Camera,
  CheckSquare,
} from 'lucide-react';
import type { ChecklistItem } from '@/types/vehicle-check.types';
import { CATEGORY_LABELS, CATEGORY_ICONS } from '@/types/vehicle-check.types';

interface CheckSummaryStepProps {
  checklistItems: ChecklistItem[];
  photos: File[];
  timestamp: Date;
  location?: { lat: number; lng: number } | null;
}

export const CheckSummaryStep: React.FC<CheckSummaryStepProps> = ({
  checklistItems,
  photos,
  timestamp,
  location,
}) => {
  const totalItems = checklistItems.length;
  const checkedItems = checklistItems.filter((item) => item.checked).length;
  const completionRate = (checkedItems / totalItems) * 100;

  const hasWarnings = completionRate < 80 || photos.length < 2;

  // Group items by category
  const itemsByCategory = checklistItems.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, ChecklistItem[]>);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
          <CheckSquare className="w-8 h-8 text-blue-600" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Récapitulatif du contrôle</h3>
        <p className="text-gray-600">Vérifiez les informations avant de soumettre</p>
      </div>

      {/* Global Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
          <CheckSquare className="w-8 h-8 text-blue-600 mx-auto mb-2" />
          <p className="text-sm text-blue-700 mb-1">Checklist</p>
          <p className="text-2xl font-bold text-blue-900">
            {checkedItems}/{totalItems}
          </p>
          <p className="text-xs text-blue-600 mt-1">{completionRate.toFixed(0)}%</p>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
          <Camera className="w-8 h-8 text-green-600 mx-auto mb-2" />
          <p className="text-sm text-green-700 mb-1">Photos</p>
          <p className="text-2xl font-bold text-green-900">{photos.length}</p>
          <p className="text-xs text-green-600 mt-1">
            {photos.length >= 2 ? '✅ Valide' : '⚠️ Min. 2'}
          </p>
        </div>
      </div>

      {/* Warnings */}
      {hasWarnings && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold text-orange-900 mb-1">Points d'attention</p>
              <ul className="text-sm text-orange-800 space-y-1">
                {completionRate < 80 && (
                  <li>• Taux de complétion inférieur à 80% ({completionRate.toFixed(0)}%)</li>
                )}
                {photos.length < 2 && <li>• Moins de 2 photos ({photos.length} photo{photos.length > 1 ? 's' : ''})</li>}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Timestamp & Location */}
      <div className="bg-white border border-gray-200 rounded-lg divide-y divide-gray-200">
        <div className="flex items-center gap-3 p-4">
          <div className="p-2 bg-gray-100 rounded-lg">
            <Clock className="w-5 h-5 text-gray-600" />
          </div>
          <div className="flex-1">
            <p className="text-xs text-gray-500">Horodatage</p>
            <p className="font-medium text-gray-900">
              {timestamp.toLocaleString('fr-FR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
          </div>
        </div>

        {location && (
          <div className="flex items-center gap-3 p-4">
            <div className="p-2 bg-gray-100 rounded-lg">
              <MapPin className="w-5 h-5 text-gray-600" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-gray-500">Localisation</p>
              <p className="font-medium text-gray-900 text-sm">
                {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Checklist Summary */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
          <h4 className="font-semibold text-gray-900">Détail de la checklist</h4>
        </div>
        <div className="divide-y divide-gray-100">
          {Object.entries(itemsByCategory).map(([category, items]) => {
            const categoryChecked = items.filter((item) => item.checked).length;
            const categoryTotal = items.length;

            return (
              <div key={category} className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{CATEGORY_ICONS[category as keyof typeof CATEGORY_ICONS]}</span>
                    <span className="font-medium text-gray-900">
                      {CATEGORY_LABELS[category as keyof typeof CATEGORY_LABELS]}
                    </span>
                  </div>
                  <span className="text-sm text-gray-600">
                    {categoryChecked}/{categoryTotal}
                  </span>
                </div>
                <div className="space-y-1">
                  {items.map((item) => (
                    <div key={item.id} className="flex items-center gap-2 text-sm">
                      {item.checked ? (
                        <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                      ) : (
                        <X className="w-4 h-4 text-red-500 flex-shrink-0" />
                      )}
                      <span className={item.checked ? 'text-gray-700' : 'text-red-600'}>
                        {item.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Photos Preview */}
      {photos.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
            <h4 className="font-semibold text-gray-900 flex items-center gap-2">
              <Camera className="w-4 h-4" />
              Photos du véhicule ({photos.length})
            </h4>
          </div>
          <div className="p-4">
            <div className="grid grid-cols-3 gap-3">
              {photos.map((photo, index) => (
                <div key={index} className="relative">
                  <img
                    src={URL.createObjectURL(photo)}
                    alt={`Photo ${index + 1}`}
                    className="w-full h-24 object-cover rounded-lg border border-gray-200"
                  />
                  <div className="absolute bottom-1 left-1 bg-black bg-opacity-60 text-white text-xs px-2 py-0.5 rounded">
                    #{index + 1}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          <strong>ℹ️ Information :</strong> En cliquant sur "Confirmer", vous certifiez que les
          informations fournies sont exactes et correspondent à l'état réel du véhicule.
        </p>
      </div>
    </div>
  );
};
