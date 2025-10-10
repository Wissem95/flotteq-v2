import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { vehiclesService } from '../../api/services/vehicles.service';
import { VehicleStatus, TransmissionType, FuelType, type CreateVehicleData } from '../../types/vehicle.types';

interface AddVehicleModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AddVehicleModal({ isOpen, onClose }: AddVehicleModalProps) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<CreateVehicleData>({
    registration: '',
    brand: '',
    model: '',
    year: new Date().getFullYear(),
    vin: '',
    color: '',
    status: VehicleStatus.AVAILABLE,
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateVehicleData) => vehiclesService.createVehicle(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      onClose();
      setFormData({
        registration: '',
        brand: '',
        model: '',
        year: new Date().getFullYear(),
        vin: '',
        color: '',
        status: VehicleStatus.AVAILABLE,
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Ajouter un véhicule</h2>
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
                  value={formData.registration}
                  onChange={(e) => setFormData({ ...formData, registration: e.target.value })}
                  className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-flotteq-blue focus:border-flotteq-blue"
                  placeholder="AB-287-DF"
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
                  value={formData.brand}
                  onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                  className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-flotteq-blue focus:border-flotteq-blue"
                  placeholder="Peugeot"
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
                  value={formData.model}
                  onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                  className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-flotteq-blue focus:border-flotteq-blue"
                  placeholder="2008"
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
                  onChange={(e) => setFormData({ ...formData, year: e.target.value ? parseInt(e.target.value) : new Date().getFullYear() })}
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
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-flotteq-blue focus:border-flotteq-blue"
                  placeholder="Vert"
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
                  value={formData.vin}
                  onChange={(e) => setFormData({ ...formData, vin: e.target.value })}
                  className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-flotteq-blue focus:border-flotteq-blue"
                  placeholder="19HD883H38923HE"
                />
              </div>

              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                  Statut
                </label>
                <select
                  id="status"
                  value={formData.status}
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
                <label htmlFor="mileage" className="block text-sm font-medium text-gray-700 mb-1">
                  Kilométrage actuel
                </label>
                <input
                  type="number"
                  id="mileage"
                  min="0"
                  value={formData.mileage || ''}
                  onChange={(e) => setFormData({ ...formData, mileage: e.target.value ? parseInt(e.target.value) : undefined })}
                  className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-flotteq-blue focus:border-flotteq-blue"
                  placeholder="150000"
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
                  placeholder="25000"
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

          {createMutation.isError && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {createMutation.error instanceof Error ? createMutation.error.message : 'Une erreur est survenue'}
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
              disabled={createMutation.isPending}
              className="px-4 py-2 bg-flotteq-blue text-white rounded-md hover:bg-flotteq-navy disabled:opacity-50"
            >
              {createMutation.isPending ? 'Ajout en cours...' : 'Ajouter'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
