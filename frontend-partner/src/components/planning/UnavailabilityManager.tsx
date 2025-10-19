import { useState } from 'react';
import { Calendar, Trash2, Clock, X, Edit2, Save } from 'lucide-react';
import { useUnavailabilities, useAddUnavailability, useUpdateUnavailability, useRemoveUnavailability } from '../../hooks/useAvailabilities';
import type { AddUnavailabilityDto, Unavailability } from '../../types/partner';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function UnavailabilityManager() {
  const { data: unavailabilities = [], isLoading } = useUnavailabilities();
  const addMutation = useAddUnavailability();
  const updateMutation = useUpdateUnavailability();
  const removeMutation = useRemoveUnavailability();

  const [formData, setFormData] = useState<AddUnavailabilityDto>({
    date: '',
    reason: '',
    isFullDay: true,
    startTime: '09:00',
    endTime: '18:00',
  });

  const [editingId, setEditingId] = useState<string | null>(null);
  const [validationError, setValidationError] = useState('');

  // Helper to normalize time format (remove seconds)
  const normalizeTime = (time: string): string => {
    if (!time) return time;
    // Convert HH:mm:ss to HH:mm
    return time.substring(0, 5);
  };

  const handleChange = (field: keyof AddUnavailabilityDto, value: any) => {
    // Normalize time fields to HH:mm format (remove seconds)
    if (field === 'startTime' || field === 'endTime') {
      value = normalizeTime(value);
    }
    setFormData((prev) => ({ ...prev, [field]: value }));
    setValidationError('');
  };

  const validateForm = (): boolean => {
    if (!formData.date) {
      setValidationError('La date est requise');
      return false;
    }

    const selectedDate = new Date(formData.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (selectedDate < today) {
      setValidationError('La date doit être dans le futur');
      return false;
    }

    if (!formData.reason.trim()) {
      setValidationError('La raison est requise');
      return false;
    }

    if (!formData.isFullDay) {
      if (!formData.startTime || !formData.endTime) {
        setValidationError('Les horaires sont requis pour une indisponibilité partielle');
        return false;
      }
      if (formData.startTime >= formData.endTime) {
        setValidationError('L\'heure de fin doit être après l\'heure de début');
        return false;
      }
    }

    return true;
  };

  const handleEdit = (unavailability: Unavailability) => {
    setEditingId(unavailability.id);
    setFormData({
      date: unavailability.date,
      reason: unavailability.reason,
      isFullDay: unavailability.isFullDay,
      startTime: normalizeTime(unavailability.startTime || '09:00'),
      endTime: normalizeTime(unavailability.endTime || '18:00'),
    });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setFormData({
      date: '',
      reason: '',
      isFullDay: true,
      startTime: '09:00',
      endTime: '18:00',
    });
    setValidationError('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const payload: AddUnavailabilityDto = {
      date: formData.date,
      reason: formData.reason,
      isFullDay: formData.isFullDay,
    };

    if (!formData.isFullDay) {
      payload.startTime = normalizeTime(formData.startTime);
      payload.endTime = normalizeTime(formData.endTime);
    }

    // Remove undefined/empty fields to avoid validation issues
    Object.keys(payload).forEach(key => {
      if (payload[key as keyof AddUnavailabilityDto] === undefined || payload[key as keyof AddUnavailabilityDto] === '') {
        delete payload[key as keyof AddUnavailabilityDto];
      }
    });

    console.log('📤 Payload envoyé:', JSON.stringify(payload, null, 2));

    if (editingId) {
      // Update existing
      updateMutation.mutate(
        { id: editingId, data: payload },
        {
          onSuccess: () => {
            handleCancelEdit();
          },
        }
      );
    } else {
      // Create new
      addMutation.mutate(payload, {
        onSuccess: () => {
          setFormData({
            date: '',
            reason: '',
            isFullDay: true,
            startTime: '09:00',
            endTime: '18:00',
          });
        },
      });
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette indisponibilité ?')) {
      removeMutation.mutate(id);
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      return format(parseISO(dateStr), 'EEEE d MMMM yyyy', { locale: fr });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-2">Jours fermés</h2>
        <p className="text-sm text-gray-600">
          Ajoutez des périodes de fermeture exceptionnelle (congés, jours fériés, etc.)
        </p>
      </div>

      {/* Add/Edit form */}
      <form onSubmit={handleSubmit} className={`mb-8 p-4 rounded-lg border-2 ${editingId ? 'bg-blue-50 border-flotteq-blue' : 'bg-gray-50 border-gray-200'}`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900">
            {editingId ? 'Modifier la période fermée' : 'Ajouter une période fermée'}
          </h3>
          {editingId && (
            <button
              type="button"
              onClick={handleCancelEdit}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {/* Date */}
          <div>
            <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
              Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              id="date"
              value={formData.date}
              onChange={(e) => handleChange('date', e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-flotteq-blue focus:border-transparent"
            />
          </div>

          {/* Reason */}
          <div>
            <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-1">
              Raison <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="reason"
              value={formData.reason}
              onChange={(e) => handleChange('reason', e.target.value)}
              placeholder="Ex: Congés, Jour férié, Formation..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-flotteq-blue focus:border-transparent"
            />
          </div>
        </div>

        {/* Full day toggle */}
        <div className="mb-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.isFullDay}
              onChange={(e) => handleChange('isFullDay', e.target.checked)}
              className="w-4 h-4 text-flotteq-blue border-gray-300 rounded focus:ring-flotteq-blue"
            />
            <span className="text-sm font-medium text-gray-700">Journée complète</span>
          </label>
        </div>

        {/* Partial time */}
        {!formData.isFullDay && (
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label htmlFor="startTime" className="block text-sm font-medium text-gray-700 mb-1">
                Heure de début
              </label>
              <input
                type="time"
                id="startTime"
                value={formData.startTime}
                onChange={(e) => handleChange('startTime', e.target.value)}
                step="60"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-flotteq-blue focus:border-transparent"
              />
            </div>
            <div>
              <label htmlFor="endTime" className="block text-sm font-medium text-gray-700 mb-1">
                Heure de fin
              </label>
              <input
                type="time"
                id="endTime"
                value={formData.endTime}
                onChange={(e) => handleChange('endTime', e.target.value)}
                step="60"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-flotteq-blue focus:border-transparent"
              />
            </div>
          </div>
        )}

        {/* Validation error */}
        {validationError && (
          <p className="mb-4 text-sm text-red-600">{validationError}</p>
        )}

        {/* Submit buttons */}
        <div className="flex gap-2">
          <button
            type="submit"
            disabled={addMutation.isPending || updateMutation.isPending}
            className="px-6 py-2 text-sm font-medium text-white bg-flotteq-blue rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {editingId ? (
              <>
                <Save className="w-4 h-4" />
                {updateMutation.isPending ? 'Modification...' : 'Modifier'}
              </>
            ) : (
              <>{addMutation.isPending ? 'Ajout...' : 'Ajouter'}</>
            )}
          </button>
          {editingId && (
            <button
              type="button"
              onClick={handleCancelEdit}
              className="px-6 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Annuler
            </button>
          )}
        </div>
      </form>

      {/* List of unavailabilities */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Périodes fermées ({unavailabilities.length})
        </h3>

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse bg-gray-100 h-20 rounded-lg"></div>
            ))}
          </div>
        ) : unavailabilities.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Calendar className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <p>Aucune période de fermeture définie</p>
          </div>
        ) : (
          <div className="space-y-3">
            {unavailabilities
              .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
              .map((unavailability) => (
                <div
                  key={unavailability.id}
                  className="flex items-start justify-between p-4 bg-gray-50 border border-gray-200 rounded-lg hover:shadow-sm transition-shadow"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="h-5 w-5 text-flotteq-blue" />
                      <span className="font-semibold text-gray-900 capitalize">
                        {formatDate(unavailability.date)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 mb-1">{unavailability.reason}</p>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <Clock className="h-4 w-4" />
                      {unavailability.isFullDay ? (
                        <span>Journée complète</span>
                      ) : (
                        <span>
                          {unavailability.startTime} - {unavailability.endTime}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleEdit(unavailability)}
                      disabled={editingId === unavailability.id}
                      className="p-2 text-flotteq-blue hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50"
                      title="Modifier"
                    >
                      <Edit2 className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(unavailability.id)}
                      disabled={removeMutation.isPending}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                      title="Supprimer"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
}
