import React from 'react';
import { Fuel } from 'lucide-react';

interface FuelGaugeProps {
  value: number;
  onChange: (value: number) => void;
  disabled?: boolean;
}

export const FuelGauge: React.FC<FuelGaugeProps> = ({ value, onChange, disabled = false }) => {
  const getColor = () => {
    if (value < 25) return 'text-red-600';
    if (value < 50) return 'text-orange-500';
    return 'text-green-600';
  };

  const getBarColor = () => {
    if (value < 25) return 'bg-red-600';
    if (value < 50) return 'bg-orange-500';
    return 'bg-green-600';
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Fuel className={`w-6 h-6 ${getColor()}`} />
          <span className="text-sm font-medium text-gray-700">Niveau de carburant</span>
        </div>
        <span className={`text-2xl font-bold ${getColor()}`}>{value}%</span>
      </div>

      {/* Barre de progression */}
      <div className="relative h-3 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={`h-full ${getBarColor()} transition-all duration-300`}
          style={{ width: `${value}%` }}
        />
      </div>

      {/* Slider */}
      <input
        type="range"
        min="0"
        max="100"
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value))}
        disabled={disabled}
        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
      />

      {/* Marqueurs de niveau */}
      <div className="flex justify-between text-xs text-gray-500">
        <span>Vide (0%)</span>
        <span>1/4 (25%)</span>
        <span>1/2 (50%)</span>
        <span>3/4 (75%)</span>
        <span>Plein (100%)</span>
      </div>
    </div>
  );
};
