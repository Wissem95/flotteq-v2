import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { vehiclesService } from '../../api/services/vehicles.service';
import { VehicleStatus, TransmissionType, FuelType, type UpdateVehicleData, type Vehicle } from '../../types/vehicle.types';

interface EditVehicleModalProps {
  isOpen: boolean;
  onClose: () => void;
  vehicle: Vehicle;
}

export default function EditVehicleModal({ isOpen, onClose, vehicle }: EditVehicleModalProps) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<UpdateVehicleData>({});

  // Pré-remplir le formulaire avec les données actuelles du véhicule
  useEffect(() => {
    if (isOpen && vehicle) {
      setFormData({
        registration: vehicle.registration,
        brand: vehicle.brand,
        model: vehicle.model,
        year: vehicle.year,
        vin: vehicle.vin,
        color: vehicle.color,
        status: vehicle.status,
        transmission: vehicle.transmission,
        fuelType: vehicle.fuelType,
        currentKm: vehicle.currentKm || vehicle.mileage,
        initialMileage: vehicle.initialMileage ?? undefined,
        purchaseDate: vehicle.purchaseDate ? new Date(vehicle.purchaseDate).toISOString().split('T')[0] : undefined,
        purchasePrice: vehicle.purchasePrice,
        lastTechnicalInspection: vehicle.lastTechnicalInspection ? new Date(vehicle.lastTechnicalInspection).toISOString().split('T')[0] : undefined,
        nextTechnicalInspection: vehicle.nextTechnicalInspection ? new Date(vehicle.nextTechnicalInspection).toISOString().split('T')[0] : undefined,
      });
    }
  }, [isOpen, vehicle]);

  const updateMutation = useMutation({
    mutationFn: (data: UpdateVehicleData) => vehiclesService.updateVehicle(vehicle.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicle', vehicle.id] });
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      onClose();
    },
    onError: (error: any) => {
      console.error('❌ Erreur lors de la mise à jour:', error);
      console.error('❌ Détails:', error.response?.data);
      if (error.response?.data?.message) {
        console.error('❌ Messages d\'erreur:', error.response.data.message);
      }
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Liste blanche des champs autorisés pour la mise à jour
    const allowedFields = [
      'registration', 'brand', 'model', 'year', 'vin', 'color', 'status',
      'transmission', 'fuelType', 'currentKm', 'initialMileage',
      'purchaseDate', 'purchasePrice', 'lastTechnicalInspection', 'nextTechnicalInspection'
    ];

    // Champs numériques qui nécessitent une validation NaN
    const numericFields = ['year', 'currentKm', 'initialMileage', 'purchasePrice'];

    // Nettoyer les données : n'envoyer que les champs autorisés avec des valeurs valides
    const cleanedData: UpdateVehicleData = {};

    Object.entries(formData).forEach(([key, value]) => {
      // Ignorer les champs non autorisés
      if (!allowedFields.includes(key)) {
        return;
      }

      // Ignorer les valeurs vides
      if (value !== undefined && value !== '' && value !== null) {
        // Pour les champs numériques, convertir explicitement en number
        if (numericFields.includes(key)) {
          const numValue = Number(value);
          if (!isNaN(numValue)) {
            cleanedData[key as keyof UpdateVehicleData] = numValue as any;
          }
        } else {
          cleanedData[key as keyof UpdateVehicleData] = value as any;
        }
      }
    });

    updateMutation.mutate(cleanedData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Modifier le véhicule</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informations de base */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Informations de base</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label htmlFor="registration" className="block text-sm font-medium text-gray-700 mb-1">
                  Immatriculation *
                </label>
                <input
                  type="text"
                  id="registration"
                  required
                  value={formData.registration || ''}
                  onChange={(e) => setFormData({ ...formData, registration: e.target.value })}
                  className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-flotteq-blue focus:border-flotteq-blue"
                />
              </div>

              <div>
                <label htmlFor="brand" className="block text-sm font-medium text-gray-700 mb-1">
                  Marque *
                </label>
                <input
                  type="text"
                  id="brand"
                  required
                  value={formData.brand || ''}
                  onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                  className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-flotteq-blue focus:border-flotteq-blue"
                />
              </div>

              <div>
                <label htmlFor="model" className="block text-sm font-medium text-gray-700 mb-1">
                  Modèle *
                </label>
                <input
                  type="text"
                  id="model"
                  required
                  value={formData.model || ''}
                  onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                  className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-flotteq-blue focus:border-flotteq-blue"
                />
              </div>

              <div>
                <label htmlFor="year" className="block text-sm font-medium text-gray-700 mb-1">
                  Année *
                </label>
                <input
                  type="number"
                  id="year"
                  required
                  min="1900"
                  max={new Date().getFullYear() + 1}
                  value={formData.year || ''}
                  onChange={(e) => setFormData({ ...formData, year: e.target.value ? parseInt(e.target.value) : undefined })}
                  className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-flotteq-blue focus:border-flotteq-blue"
                />
              </div>

              <div>
                <label htmlFor="color" className="block text-sm font-medium text-gray-700 mb-1">
                  Couleur *
                </label>
                <input
                  type="text"
                  id="color"
                  required
                  value={formData.color || ''}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-flotteq-blue focus:border-flotteq-blue"
                />
              </div>

              <div className="col-span-2">
                <label htmlFor="vin" className="block text-sm font-medium text-gray-700 mb-1">
                  VIN *
                </label>
                <input
                  type="text"
                  id="vin"
                  required
                  value={formData.vin || ''}
                  onChange={(e) => setFormData({ ...formData, vin: e.target.value })}
                  className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-flotteq-blue focus:border-flotteq-blue"
                />
              </div>

              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                  Statut
                </label>
                <select
                  id="status"
                  value={formData.status || VehicleStatus.AVAILABLE}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as VehicleStatus })}
                  className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-flotteq-blue focus:border-flotteq-blue"
                >
                  <option value={VehicleStatus.AVAILABLE}>Disponible</option>
                  <option value={VehicleStatus.IN_USE}>En service</option>
                  <option value={VehicleStatus.MAINTENANCE}>En maintenance</option>
                  <option value={VehicleStatus.OUT_OF_SERVICE}>Hors service</option>
                </select>
              </div>
            </div>
          </div>

          {/* Caractéristiques techniques */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Caractéristiques techniques</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="transmission" className="block text-sm font-medium text-gray-700 mb-1">
                  Transmission
                </label>
                <select
                  id="transmission"
                  value={formData.transmission || ''}
                  onChange={(e) => setFormData({ ...formData, transmission: (e.target.value || undefined) as TransmissionType })}
                  className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-flotteq-blue focus:border-flotteq-blue"
                >
                  <option value="">Sélectionnez...</option>
                  <option value={TransmissionType.MANUAL}>Manuelle</option>
                  <option value={TransmissionType.AUTOMATIC}>Automatique</option>
                </select>
              </div>

              <div>
                <label htmlFor="fuelType" className="block text-sm font-medium text-gray-700 mb-1">
                  Carburant
                </label>
                <select
                  id="fuelType"
                  value={formData.fuelType || ''}
                  onChange={(e) => setFormData({ ...formData, fuelType: (e.target.value || undefined) as FuelType })}
                  className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-flotteq-blue focus:border-flotteq-blue"
                >
                  <option value="">Sélectionnez...</option>
                  <option value={FuelType.GASOLINE}>Essence</option>
                  <option value={FuelType.DIESEL}>Diesel</option>
                  <option value={FuelType.ELECTRIC}>Électrique</option>
                  <option value={FuelType.HYBRID}>Hybride</option>
                </select>
              </div>

              <div>
                <label htmlFor="initialMileage" className="block text-sm font-medium text-gray-700 mb-1">
                  Kilométrage initial
                </label>
                <input
                  type="number"
                  id="initialMileage"
                  min="0"
                  value={formData.initialMileage || ''}
                  onChange={(e) => setFormData({ ...formData, initialMileage: e.target.value ? parseInt(e.target.value) : undefined })}
                  className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-flotteq-blue focus:border-flotteq-blue"
                />
              </div>

              <div>
                <label htmlFor="currentKm" className="block text-sm font-medium text-gray-700 mb-1">
                  Kilométrage actuel
                </label>
                <input
                  type="number"
                  id="currentKm"
                  min="0"
                  value={formData.currentKm || ''}
                  onChange={(e) => setFormData({ ...formData, currentKm: e.target.value ? parseInt(e.target.value) : undefined })}
                  className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-flotteq-blue focus:border-flotteq-blue"
                />
              </div>
            </div>
          </div>

          {/* Informations d'achat */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Informations d'achat</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="purchaseDate" className="block text-sm font-medium text-gray-700 mb-1">
                  Date d'achat
                </label>
                <input
                  type="date"
                  id="purchaseDate"
                  value={formData.purchaseDate || ''}
                  onChange={(e) => setFormData({ ...formData, purchaseDate: e.target.value || undefined })}
                  className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-flotteq-blue focus:border-flotteq-blue"
                />
              </div>

              <div>
                <label htmlFor="purchasePrice" className="block text-sm font-medium text-gray-700 mb-1">
                  Prix d'achat (€)
                </label>
                <input
                  type="number"
                  id="purchasePrice"
                  min="0"
                  step="0.01"
                  value={formData.purchasePrice || ''}
                  onChange={(e) => setFormData({ ...formData, purchasePrice: e.target.value ? parseFloat(e.target.value) : undefined })}
                  className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-flotteq-blue focus:border-flotteq-blue"
                />
              </div>
            </div>
          </div>

          {/* Contrôle technique */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Contrôle technique</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="lastTechnicalInspection" className="block text-sm font-medium text-gray-700 mb-1">
                  Dernier CT
                </label>
                <input
                  type="date"
                  id="lastTechnicalInspection"
                  value={formData.lastTechnicalInspection || ''}
                  onChange={(e) => setFormData({ ...formData, lastTechnicalInspection: e.target.value || undefined })}
                  className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-flotteq-blue focus:border-flotteq-blue"
                />
              </div>

              <div>
                <label htmlFor="nextTechnicalInspection" className="block text-sm font-medium text-gray-700 mb-1">
                  Prochain CT
                </label>
                <input
                  type="date"
                  id="nextTechnicalInspection"
                  value={formData.nextTechnicalInspection || ''}
                  onChange={(e) => setFormData({ ...formData, nextTechnicalInspection: e.target.value || undefined })}
                  className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-flotteq-blue focus:border-flotteq-blue"
                />
              </div>
            </div>
          </div>

          {updateMutation.isError && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {updateMutation.error instanceof Error ? updateMutation.error.message : 'Une erreur est survenue'}
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={updateMutation.isPending}
              className="px-4 py-2 bg-flotteq-blue text-white rounded-md hover:bg-flotteq-navy disabled:opacity-50"
            >
              {updateMutation.isPending ? 'Modification en cours...' : 'Enregistrer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
