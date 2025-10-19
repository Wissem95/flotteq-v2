import { useState } from 'react';
import { Edit2, Save, X, Power, PowerOff, Plus } from 'lucide-react';
import { useMyServices, useUpdateService, useCreateService } from '../../hooks/useServices';
import type { PartnerService, UpdateServiceDto } from '../../types/partner';

export default function ServiceSettings() {
  const { data: services = [], isLoading } = useMyServices();
  const updateMutation = useUpdateService();
  const createMutation = useCreateService();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [editForm, setEditForm] = useState<{
    name: string;
    description: string;
    price: number;
    durationMinutes: number;
  }>({
    name: '',
    description: '',
    price: 0,
    durationMinutes: 30,
  });

  const handleEdit = (service: PartnerService) => {
    setEditingId(service.id);
    setEditForm({
      name: service.name,
      description: service.description || '',
      price: service.price,
      durationMinutes: service.durationMinutes,
    });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setIsCreating(false);
    setEditForm({
      name: '',
      description: '',
      price: 0,
      durationMinutes: 30,
    });
  };

  const handleCreate = () => {
    setIsCreating(true);
    setEditForm({
      name: '',
      description: '',
      price: 0,
      durationMinutes: 30,
    });
  };

  const handleSaveNew = () => {
    if (!editForm.name || editForm.price <= 0) {
      return;
    }

    createMutation.mutate(
      {
        name: editForm.name,
        description: editForm.description || undefined,
        price: editForm.price,
        durationMinutes: editForm.durationMinutes,
      },
      {
        onSuccess: () => {
          handleCancelEdit();
        },
      }
    );
  };

  const handleSave = (serviceId: string) => {
    const updates: UpdateServiceDto = {};

    const originalService = services.find((s) => s.id === serviceId);
    if (!originalService) return;

    if (editForm.name !== originalService.name) updates.name = editForm.name;
    if (editForm.description !== (originalService.description || '')) {
      updates.description = editForm.description;
    }
    if (editForm.price !== originalService.price) updates.price = editForm.price;
    if (editForm.durationMinutes !== originalService.durationMinutes) {
      updates.durationMinutes = editForm.durationMinutes;
    }

    if (Object.keys(updates).length === 0) {
      handleCancelEdit();
      return;
    }

    updateMutation.mutate(
      { id: serviceId, updates },
      {
        onSuccess: () => {
          handleCancelEdit();
        },
      }
    );
  };

  const handleToggleActive = (service: PartnerService) => {
    updateMutation.mutate({
      id: service.id,
      updates: { isActive: !service.isActive },
    });
  };

  const formatDuration = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;

    if (hours > 0 && mins > 0) {
      return `${hours}h${mins}`;
    } else if (hours > 0) {
      return `${hours}h`;
    } else {
      return `${mins}min`;
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-gray-100 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Gestion des services</h2>
          <p className="text-sm text-gray-600">
            Modifiez les prix, durées et statuts de vos services
          </p>
        </div>
        <button
          onClick={handleCreate}
          disabled={isCreating}
          className="flex items-center gap-2 px-4 py-2 bg-flotteq-blue text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus className="w-5 h-5" />
          Nouveau service
        </button>
      </div>

      {/* Create form */}
      {isCreating && (
        <div className="mb-4 border-2 border-flotteq-blue rounded-lg p-4 bg-blue-50">
          <h3 className="font-semibold text-gray-900 mb-3">Créer un nouveau service</h3>
          <div className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Name */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Nom du service *
                </label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  placeholder="Ex: Vidange complète"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-flotteq-blue focus:border-transparent text-sm"
                />
              </div>

              {/* Price */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Prix (€) *
                </label>
                <input
                  type="number"
                  value={editForm.price}
                  onChange={(e) => setEditForm({ ...editForm, price: parseFloat(e.target.value) || 0 })}
                  min="0"
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-flotteq-blue focus:border-transparent text-sm"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={editForm.description}
                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                placeholder="Description du service..."
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-flotteq-blue focus:border-transparent text-sm resize-none"
              />
            </div>

            {/* Duration */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Durée (minutes) *
              </label>
              <input
                type="number"
                value={editForm.durationMinutes}
                onChange={(e) => setEditForm({ ...editForm, durationMinutes: parseInt(e.target.value) || 0 })}
                min="1"
                step="15"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-flotteq-blue focus:border-transparent text-sm"
              />
            </div>

            {/* Action buttons */}
            <div className="flex gap-2 pt-2">
              <button
                onClick={handleSaveNew}
                disabled={!editForm.name || editForm.price <= 0 || createMutation.isPending}
                className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="w-4 h-4" />
                {createMutation.isPending ? 'Création...' : 'Créer'}
              </button>
              <button
                onClick={handleCancelEdit}
                disabled={createMutation.isPending}
                className="flex items-center gap-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                <X className="w-4 h-4" />
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}

      {services.length === 0 && !isCreating ? (
        <div className="text-center py-8 text-gray-500">
          <p>Aucun service configuré</p>
          <p className="text-sm mt-2">Cliquez sur "Nouveau service" pour commencer</p>
        </div>
      ) : (
        <div className="space-y-3">
          {services.map((service) => {
            const isEditing = editingId === service.id;

            return (
              <div
                key={service.id}
                className={`border rounded-lg p-4 transition-all ${
                  service.isActive
                    ? 'border-gray-200 bg-white'
                    : 'border-gray-300 bg-gray-100 opacity-75'
                }`}
              >
                {isEditing ? (
                  // Edit mode
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {/* Name */}
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Nom du service
                        </label>
                        <input
                          type="text"
                          value={editForm.name}
                          onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-flotteq-blue focus:border-transparent text-sm"
                        />
                      </div>

                      {/* Price */}
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Prix (€)
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={editForm.price}
                          onChange={(e) => setEditForm({ ...editForm, price: parseFloat(e.target.value) || 0 })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-flotteq-blue focus:border-transparent text-sm"
                        />
                      </div>

                      {/* Duration */}
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Durée (minutes)
                        </label>
                        <select
                          value={editForm.durationMinutes}
                          onChange={(e) => setEditForm({ ...editForm, durationMinutes: parseInt(e.target.value) })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-flotteq-blue focus:border-transparent text-sm"
                        >
                          <option value={15}>15 min</option>
                          <option value={30}>30 min</option>
                          <option value={45}>45 min</option>
                          <option value={60}>1h</option>
                          <option value={90}>1h30</option>
                          <option value={120}>2h</option>
                          <option value={180}>3h</option>
                          <option value={240}>4h</option>
                        </select>
                      </div>

                      {/* Description */}
                      <div className="md:col-span-2">
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Description
                        </label>
                        <textarea
                          value={editForm.description}
                          onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                          rows={2}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-flotteq-blue focus:border-transparent text-sm"
                        />
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={handleCancelEdit}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <X className="h-4 w-4 inline mr-1" />
                        Annuler
                      </button>
                      <button
                        onClick={() => handleSave(service.id)}
                        disabled={updateMutation.isPending}
                        className="px-4 py-2 text-sm font-medium text-white bg-flotteq-blue rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                      >
                        <Save className="h-4 w-4 inline mr-1" />
                        Enregistrer
                      </button>
                    </div>
                  </div>
                ) : (
                  // View mode
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-gray-900">{service.name}</h3>
                        {!service.isActive && (
                          <span className="px-2 py-1 text-xs font-medium text-gray-600 bg-gray-200 rounded">
                            Désactivé
                          </span>
                        )}
                      </div>
                      {service.description && (
                        <p className="text-sm text-gray-600 mb-2">{service.description}</p>
                      )}
                      <div className="flex items-center gap-4 text-sm">
                        <span className="font-semibold text-flotteq-blue">
                          {Number(service.price).toFixed(2)} €
                        </span>
                        <span className="text-gray-500">
                          {formatDuration(service.durationMinutes)}
                        </span>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEdit(service)}
                        className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                        title="Modifier"
                      >
                        <Edit2 className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleToggleActive(service)}
                        disabled={updateMutation.isPending}
                        className={`p-2 rounded-lg transition-colors disabled:opacity-50 ${
                          service.isActive
                            ? 'text-red-600 hover:bg-red-50'
                            : 'text-green-600 hover:bg-green-50'
                        }`}
                        title={service.isActive ? 'Désactiver' : 'Activer'}
                      >
                        {service.isActive ? (
                          <PowerOff className="h-5 w-5" />
                        ) : (
                          <Power className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
