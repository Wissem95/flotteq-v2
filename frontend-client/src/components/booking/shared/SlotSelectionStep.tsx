import { useState } from 'react';
import { Calendar, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useAvailableSlots } from '@/hooks/useMarketplace';

interface SlotSelectionStepProps {
  partnerId: string;
  serviceId: string;
  value: { date: string | null; slot: { start: string; end: string } | null };
  onChange: (data: { date: string; slot: { start: string; end: string } }) => void;
}

export function SlotSelectionStep({ partnerId, serviceId, value, onChange }: SlotSelectionStepProps) {
  const [selectedDate, setSelectedDate] = useState<string>(
    value.date || format(new Date(), 'yyyy-MM-dd')
  );

  const { data: slotsData, isLoading } = useAvailableSlots(
    partnerId,
    serviceId,
    selectedDate
  );

  const handleDateChange = (newDate: string) => {
    setSelectedDate(newDate);
    // Reset slot when date changes
    if (value.slot) {
      onChange({ date: newDate, slot: value.slot });
    }
  };

  const handleSlotSelect = (slot: { start: string; end: string }) => {
    onChange({ date: selectedDate, slot });
  };

  const availableSlots = slotsData?.slots.filter(slot => slot.available) || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <Calendar className="h-6 w-6 text-flotteq-blue" />
        <h3 className="text-lg font-semibold text-gray-900">Choisissez une date et un créneau</h3>
      </div>

      {/* Date Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Date <span className="text-red-500">*</span>
        </label>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => handleDateChange(e.target.value)}
          min={format(new Date(), 'yyyy-MM-dd')}
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-flotteq-blue"
        />
      </div>

      {/* Time Slots */}
      <div>
        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
          <Clock className="h-5 w-5 text-flotteq-blue" />
          Créneau horaire <span className="text-red-500">*</span>
        </label>

        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-flotteq-blue mx-auto"></div>
            <p className="text-sm text-gray-600 mt-2">Chargement des créneaux...</p>
          </div>
        ) : availableSlots.length === 0 ? (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center text-gray-600">
            Aucun créneau disponible pour cette date
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 max-h-96 overflow-y-auto p-1">
            {availableSlots.map((slot, idx) => {
              const isSelected =
                value.slot?.start === slot.start && value.slot?.end === slot.end;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSlotSelect({ start: slot.start, end: slot.end })}
                  className={`px-4 py-3 rounded-lg border-2 transition-all ${
                    isSelected
                      ? 'border-flotteq-blue bg-blue-50 text-flotteq-blue font-semibold'
                      : 'border-gray-200 hover:border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <div className="font-medium">
                    {format(new Date(slot.start), 'HH:mm', { locale: fr })}
                  </div>
                  <div className="text-xs opacity-75">
                    {format(new Date(slot.end), 'HH:mm', { locale: fr })}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
