import { useState, useEffect } from 'react';
import { useMyAvailabilities, useSetWeekAvailabilities } from '../../hooks/useAvailabilities';
import type { SetAvailabilityDto } from '../../types/partner';

interface DayAvailability {
  dayOfWeek: number;
  dayName: string;
  isOpen: boolean;
  startTime: string;
  endTime: string;
  slotDuration: number;
}

const DAYS = [
  { dayOfWeek: 1, dayName: 'Lundi' },
  { dayOfWeek: 2, dayName: 'Mardi' },
  { dayOfWeek: 3, dayName: 'Mercredi' },
  { dayOfWeek: 4, dayName: 'Jeudi' },
  { dayOfWeek: 5, dayName: 'Vendredi' },
  { dayOfWeek: 6, dayName: 'Samedi' },
  { dayOfWeek: 0, dayName: 'Dimanche' },
];

const SLOT_DURATIONS = [15, 30, 45, 60, 90, 120];

// Generate time options (00:00 to 23:45 in 15-minute increments)
const generateTimeOptions = (): string[] => {
  const options: string[] = [];
  for (let h = 0; h < 24; h++) {
    for (let m = 0; m < 60; m += 15) {
      const hour = h.toString().padStart(2, '0');
      const minute = m.toString().padStart(2, '0');
      options.push(`${hour}:${minute}`);
    }
  }
  return options;
};

const TIME_OPTIONS = generateTimeOptions();

export default function AvailabilityEditor() {
  const { data: existingAvailabilities, isLoading } = useMyAvailabilities();
  const setWeekMutation = useSetWeekAvailabilities();

  const [weekSchedule, setWeekSchedule] = useState<DayAvailability[]>(
    DAYS.map((day) => ({
      ...day,
      isOpen: false,
      startTime: '09:00',
      endTime: '18:00',
      slotDuration: 30,
    }))
  );

  const [validationErrors, setValidationErrors] = useState<Record<number, string>>({});

  // Helper to normalize time format from HH:MM:SS to HH:MM
  const normalizeTime = (time: string): string => {
    if (!time) return '09:00';
    // If format is HH:MM:SS, extract HH:MM
    if (time.length === 8) {
      return time.substring(0, 5);
    }
    return time;
  };

  // Load existing availabilities
  useEffect(() => {
    if (existingAvailabilities && existingAvailabilities.length > 0) {
      setWeekSchedule((prev) =>
        prev.map((day) => {
          const existing = existingAvailabilities.find((a) => a.dayOfWeek === day.dayOfWeek);
          if (existing) {
            return {
              ...day,
              isOpen: true,
              startTime: normalizeTime(existing.startTime),
              endTime: normalizeTime(existing.endTime),
              slotDuration: existing.slotDuration,
            };
          }
          return day;
        })
      );
    }
  }, [existingAvailabilities]);

  const handleDayChange = (dayOfWeek: number, field: keyof DayAvailability, value: any) => {
    setWeekSchedule((prev) =>
      prev.map((day) =>
        day.dayOfWeek === dayOfWeek ? { ...day, [field]: value } : day
      )
    );

    // Clear validation error for this day
    if (validationErrors[dayOfWeek]) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[dayOfWeek];
        return newErrors;
      });
    }
  };

  const validateSchedule = (): boolean => {
    const errors: Record<number, string> = {};

    weekSchedule.forEach((day) => {
      if (day.isOpen) {
        if (day.startTime >= day.endTime) {
          errors[day.dayOfWeek] = 'L\'heure de fin doit être après l\'heure de début';
        }
      }
    });

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateSchedule()) {
      return;
    }

    // Only send days that are open
    const availabilities: SetAvailabilityDto[] = weekSchedule
      .filter((day) => day.isOpen)
      .map((day) => ({
        dayOfWeek: day.dayOfWeek,
        startTime: day.startTime,
        endTime: day.endTime,
        slotDuration: day.slotDuration,
      }));

    if (availabilities.length === 0) {
      alert('Veuillez sélectionner au moins un jour d\'ouverture');
      return;
    }

    setWeekMutation.mutate(availabilities);
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5, 6, 7].map((i) => (
              <div key={i} className="h-16 bg-gray-100 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-2">Horaires d'ouverture</h2>
        <p className="text-sm text-gray-600">
          Définissez vos horaires d'ouverture hebdomadaires et la durée des créneaux de réservation
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="space-y-4 mb-6">
          {weekSchedule.map((day) => (
            <div
              key={day.dayOfWeek}
              className={`border rounded-lg p-4 ${
                day.isOpen ? 'border-flotteq-blue bg-blue-50' : 'border-gray-200 bg-gray-50'
              }`}
            >
              <div className="flex items-center gap-4 flex-wrap">
                {/* Day checkbox */}
                <div className="flex items-center w-32">
                  <input
                    type="checkbox"
                    id={`day-${day.dayOfWeek}`}
                    checked={day.isOpen}
                    onChange={(e) => handleDayChange(day.dayOfWeek, 'isOpen', e.target.checked)}
                    className="w-4 h-4 text-flotteq-blue border-gray-300 rounded focus:ring-flotteq-blue"
                  />
                  <label
                    htmlFor={`day-${day.dayOfWeek}`}
                    className="ml-2 font-semibold text-gray-900"
                  >
                    {day.dayName}
                  </label>
                </div>

                {day.isOpen && (
                  <>
                    {/* Start time */}
                    <div className="flex-1 min-w-[140px]">
                      <label className="block text-xs text-gray-600 mb-1">Ouverture</label>
                      <select
                        value={day.startTime}
                        onChange={(e) => handleDayChange(day.dayOfWeek, 'startTime', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-flotteq-blue focus:border-transparent text-sm"
                      >
                        {TIME_OPTIONS.map((time) => (
                          <option key={time} value={time}>
                            {time}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* End time */}
                    <div className="flex-1 min-w-[140px]">
                      <label className="block text-xs text-gray-600 mb-1">Fermeture</label>
                      <select
                        value={day.endTime}
                        onChange={(e) => handleDayChange(day.dayOfWeek, 'endTime', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-flotteq-blue focus:border-transparent text-sm"
                      >
                        {TIME_OPTIONS.map((time) => (
                          <option key={time} value={time}>
                            {time}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Slot duration */}
                    <div className="flex-1 min-w-[140px]">
                      <label className="block text-xs text-gray-600 mb-1">Durée créneau</label>
                      <select
                        value={day.slotDuration}
                        onChange={(e) => handleDayChange(day.dayOfWeek, 'slotDuration', Number(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-flotteq-blue focus:border-transparent text-sm"
                      >
                        {SLOT_DURATIONS.map((duration) => (
                          <option key={duration} value={duration}>
                            {duration} min
                          </option>
                        ))}
                      </select>
                    </div>
                  </>
                )}

                {!day.isOpen && (
                  <span className="flex-1 text-sm text-gray-500 italic">Fermé</span>
                )}
              </div>

              {/* Validation error */}
              {validationErrors[day.dayOfWeek] && (
                <p className="mt-2 text-sm text-red-600">{validationErrors[day.dayOfWeek]}</p>
              )}
            </div>
          ))}
        </div>

        {/* Submit button */}
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={() => {
              setWeekSchedule(
                DAYS.map((day) => ({
                  ...day,
                  isOpen: false,
                  startTime: '09:00',
                  endTime: '18:00',
                  slotDuration: 30,
                }))
              );
              setValidationErrors({});
            }}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Réinitialiser
          </button>
          <button
            type="submit"
            disabled={setWeekMutation.isPending}
            className="px-6 py-2 text-sm font-medium text-white bg-flotteq-blue rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {setWeekMutation.isPending ? 'Enregistrement...' : 'Enregistrer les horaires'}
          </button>
        </div>

        {setWeekMutation.isError && (
          <p className="mt-3 text-sm text-red-600">
            {(setWeekMutation.error as any)?.response?.data?.message || 'Une erreur est survenue'}
          </p>
        )}
      </form>
    </div>
  );
}
