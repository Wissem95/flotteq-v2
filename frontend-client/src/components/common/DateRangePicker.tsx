import React, { useState } from 'react';
import ReactDatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { Calendar } from 'lucide-react';
import { format, subDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';
import { fr } from 'date-fns/locale';

interface DateRangePickerProps {
  startDate: Date | null;
  endDate: Date | null;
  onDateChange: (start: Date | null, end: Date | null) => void;
  className?: string;
}

type PresetType = 'today' | '7days' | '30days' | '90days' | 'week' | 'month' | 'custom';

export const DateRangePicker: React.FC<DateRangePickerProps> = ({
  startDate,
  endDate,
  onDateChange,
  className = '',
}) => {
  const [activePreset, setActivePreset] = useState<PresetType>('30days');

  const presets = [
    {
      id: 'today' as PresetType,
      label: "Aujourd'hui",
      getRange: () => {
        const today = new Date();
        return { start: today, end: today };
      },
    },
    {
      id: 'week' as PresetType,
      label: 'Cette semaine',
      getRange: () => {
        const today = new Date();
        return {
          start: startOfWeek(today, { weekStartsOn: 1 }),
          end: endOfWeek(today, { weekStartsOn: 1 }),
        };
      },
    },
    {
      id: 'month' as PresetType,
      label: 'Ce mois',
      getRange: () => {
        const today = new Date();
        return {
          start: startOfMonth(today),
          end: endOfMonth(today),
        };
      },
    },
    {
      id: '7days' as PresetType,
      label: '7 derniers jours',
      getRange: () => ({
        start: subDays(new Date(), 6),
        end: new Date(),
      }),
    },
    {
      id: '30days' as PresetType,
      label: '30 derniers jours',
      getRange: () => ({
        start: subDays(new Date(), 29),
        end: new Date(),
      }),
    },
    {
      id: '90days' as PresetType,
      label: '90 derniers jours',
      getRange: () => ({
        start: subDays(new Date(), 89),
        end: new Date(),
      }),
    },
  ];

  const handlePresetClick = (presetId: PresetType) => {
    if (presetId === 'custom') {
      setActivePreset('custom');
      return;
    }

    const preset = presets.find((p) => p.id === presetId);
    if (preset) {
      const { start, end } = preset.getRange();
      setActivePreset(presetId);
      onDateChange(start, end);
    }
  };

  const handleCustomDateChange = (dates: [Date | null, Date | null]) => {
    const [start, end] = dates;
    setActivePreset('custom');
    onDateChange(start, end);
  };

  const handleClear = () => {
    setActivePreset('30days');
    const preset = presets.find((p) => p.id === '30days');
    if (preset) {
      const { start, end } = preset.getRange();
      onDateChange(start, end);
    }
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Presets rapides */}
      <div className="flex flex-wrap gap-2">
        {presets.map((preset) => (
          <button
            key={preset.id}
            onClick={() => handlePresetClick(preset.id)}
            className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
              activePreset === preset.id
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {preset.label}
          </button>
        ))}
        <button
          onClick={() => handlePresetClick('custom')}
          className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
            activePreset === 'custom'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Personnalisé
        </button>
      </div>

      {/* DatePicker custom */}
      {activePreset === 'custom' && (
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 flex-1">
            <Calendar className="w-5 h-5 text-gray-400" />
            <div className="flex-1">
              <ReactDatePicker
                selected={startDate}
                onChange={handleCustomDateChange}
                startDate={startDate}
                endDate={endDate}
                selectsRange
                dateFormat="dd/MM/yyyy"
                locale={fr}
                placeholderText="Sélectionner une période"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                isClearable
                maxDate={new Date()}
              />
            </div>
          </div>
          <button
            onClick={handleClear}
            className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            Réinitialiser
          </button>
        </div>
      )}

      {/* Affichage période sélectionnée */}
      {startDate && endDate && (
        <div className="text-sm text-gray-600 bg-blue-50 px-3 py-2 rounded-lg border border-blue-200">
          <span className="font-medium">Période :</span>{' '}
          {format(startDate, 'dd MMM yyyy', { locale: fr })} -{' '}
          {format(endDate, 'dd MMM yyyy', { locale: fr })}
        </div>
      )}
    </div>
  );
};
