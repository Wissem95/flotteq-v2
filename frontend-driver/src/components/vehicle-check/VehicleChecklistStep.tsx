import React from 'react';
import { CheckCircle, Circle } from 'lucide-react';
import type {
  ChecklistItem,
  ChecklistCategory,
} from '@/types/vehicle-check.types';
import {
  CATEGORY_LABELS,
  CATEGORY_ICONS,
} from '@/types/vehicle-check.types';

interface VehicleChecklistStepProps {
  items: ChecklistItem[];
  onChange: (items: ChecklistItem[]) => void;
}

export const VehicleChecklistStep: React.FC<VehicleChecklistStepProps> = ({ items, onChange }) => {
  const toggleItem = (id: string) => {
    const updatedItems = items.map((item) =>
      item.id === id ? { ...item, checked: !item.checked } : item
    );
    onChange(updatedItems);
  };

  const toggleCategory = (category: ChecklistCategory) => {
    const categoryItems = items.filter((item) => item.category === category);
    const allChecked = categoryItems.every((item) => item.checked);

    const updatedItems = items.map((item) =>
      item.category === category ? { ...item, checked: !allChecked } : item
    );
    onChange(updatedItems);
  };

  const getCategoryProgress = (category: ChecklistCategory) => {
    const categoryItems = items.filter((item) => item.category === category);
    const checkedCount = categoryItems.filter((item) => item.checked).length;
    return { checked: checkedCount, total: categoryItems.length };
  };

  const getTotalProgress = () => {
    const checkedCount = items.filter((item) => item.checked).length;
    return { checked: checkedCount, total: items.length, percentage: (checkedCount / items.length) * 100 };
  };

  const totalProgress = getTotalProgress();
  const categories: ChecklistCategory[] = ['tires', 'fluids', 'body', 'lights', 'interior'];

  return (
    <div className="space-y-6">
      {/* Global Progress */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold text-blue-900">Progression du contrôle</h3>
          <span className="text-2xl font-bold text-blue-700">
            {totalProgress.percentage.toFixed(0)}%
          </span>
        </div>
        <div className="w-full bg-blue-200 rounded-full h-3">
          <div
            className="bg-blue-600 h-3 rounded-full transition-all duration-300"
            style={{ width: `${totalProgress.percentage}%` }}
          />
        </div>
        <p className="text-sm text-blue-700 mt-2">
          {totalProgress.checked} / {totalProgress.total} éléments vérifiés
        </p>
        {totalProgress.percentage < 80 && (
          <p className="text-xs text-orange-600 mt-1">
            ⚠️ Minimum 80% recommandé pour valider le check
          </p>
        )}
      </div>

      {/* Checklist by Category */}
      <div className="space-y-4">
        {categories.map((category) => {
          const categoryItems = items.filter((item) => item.category === category);
          const progress = getCategoryProgress(category);
          const allChecked = progress.checked === progress.total;

          return (
            <div key={category} className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              {/* Category Header */}
              <button
                onClick={() => toggleCategory(category)}
                className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors border-b border-gray-200"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl" role="img" aria-label={CATEGORY_LABELS[category]}>
                    {CATEGORY_ICONS[category]}
                  </span>
                  <div className="text-left">
                    <h4 className="font-semibold text-gray-900">{CATEGORY_LABELS[category]}</h4>
                    <p className="text-xs text-gray-600">
                      {progress.checked} / {progress.total} éléments
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {allChecked ? (
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  ) : (
                    <Circle className="w-6 h-6 text-gray-400" />
                  )}
                </div>
              </button>

              {/* Category Items */}
              <div className="divide-y divide-gray-100">
                {categoryItems.map((item) => (
                  <label
                    key={item.id}
                    className="flex items-center gap-4 p-4 hover:bg-gray-50 cursor-pointer transition-colors min-h-[60px]"
                  >
                    <input
                      type="checkbox"
                      checked={item.checked}
                      onChange={() => toggleItem(item.id)}
                      className="w-6 h-6 rounded border-gray-300 text-blue-600 focus:ring-blue-500 focus:ring-2 cursor-pointer"
                    />
                    <span className={`flex-1 text-base ${item.checked ? 'text-gray-900 font-medium' : 'text-gray-700'}`}>
                      {item.label}
                    </span>
                    {item.checked && <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />}
                  </label>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Info Box */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <p className="text-sm text-gray-700">
          <strong>💡 Conseil :</strong> Vérifiez soigneusement chaque élément avant de cocher. En cas de problème
          détecté, vous pourrez ajouter des photos à l'étape suivante.
        </p>
      </div>
    </div>
  );
};
