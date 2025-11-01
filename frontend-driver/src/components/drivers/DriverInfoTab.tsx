import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { driversService } from '@/api/services/drivers.service';
import type { Driver, UpdateDriverData } from '@/types/driver.types';

interface DriverInfoTabProps {
  driver: Driver;
}

export default function DriverInfoTab({ driver }: DriverInfoTabProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<UpdateDriverData>({
    firstName: driver.firstName,
    lastName: driver.lastName,
    email: driver.email,
    phone: driver.phone,
    licenseNumber: driver.licenseNumber,
    licenseExpiryDate: driver.licenseExpiryDate,
    medicalCertificateExpiryDate: driver.medicalCertificateExpiryDate,
    birthDate: driver.birthDate,
    address: driver.address,
    city: driver.city,
    postalCode: driver.postalCode,
    emergencyContact: driver.emergencyContact,
    emergencyPhone: driver.emergencyPhone,
    notes: driver.notes,
  });

  const queryClient = useQueryClient();

  const updateMutation = useMutation({
    mutationFn: (data: UpdateDriverData) => driversService.updateDriver(driver.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['driver', driver.id] });
      queryClient.invalidateQueries({ queryKey: ['drivers'] });
      setIsEditing(false);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate(formData);
  };

  const handleCancel = () => {
    setFormData({
      firstName: driver.firstName,
      lastName: driver.lastName,
      email: driver.email,
      phone: driver.phone,
      licenseNumber: driver.licenseNumber,
      licenseExpiryDate: driver.licenseExpiryDate,
      medicalCertificateExpiryDate: driver.medicalCertificateExpiryDate,
      birthDate: driver.birthDate,
      address: driver.address,
      city: driver.city,
      postalCode: driver.postalCode,
      emergencyContact: driver.emergencyContact,
      emergencyPhone: driver.emergencyPhone,
      notes: driver.notes,
    });
    setIsEditing(false);
  };

  if (!isEditing) {
    return (
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex justify-between items-start mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Informations générales</h3>
          <button
            onClick={() => setIsEditing(true)}
            className="text-flotteq-blue hover:text-flotteq-navy text-sm font-medium"
          >
            Modifier
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-sm text-gray-500">Prénom</p>
            <p className="mt-1 text-gray-900">{driver.firstName}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Nom</p>
            <p className="mt-1 text-gray-900">{driver.lastName}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Email</p>
            <p className="mt-1 text-gray-900">{driver.email}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Téléphone</p>
            <p className="mt-1 text-gray-900">{driver.phone}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Numéro de permis</p>
            <p className="mt-1 text-gray-900">{driver.licenseNumber}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Expiration permis</p>
            <p className="mt-1 text-gray-900">
              {format(new Date(driver.licenseExpiryDate), 'dd MMMM yyyy', { locale: fr })}
            </p>
          </div>
          {driver.birthDate && (
            <div>
              <p className="text-sm text-gray-500">Date de naissance</p>
              <p className="mt-1 text-gray-900">
                {format(new Date(driver.birthDate), 'dd MMMM yyyy', { locale: fr })}
              </p>
            </div>
          )}
          {driver.medicalCertificateExpiryDate && (
            <div>
              <p className="text-sm text-gray-500">Expiration certificat médical</p>
              <p className="mt-1 text-gray-900">
                {format(new Date(driver.medicalCertificateExpiryDate), 'dd MMMM yyyy', { locale: fr })}
              </p>
            </div>
          )}
          {driver.address && (
            <div className="md:col-span-2">
              <p className="text-sm text-gray-500">Adresse</p>
              <p className="mt-1 text-gray-900">{driver.address}</p>
            </div>
          )}
          {driver.city && (
            <div>
              <p className="text-sm text-gray-500">Ville</p>
              <p className="mt-1 text-gray-900">{driver.city}</p>
            </div>
          )}
          {driver.postalCode && (
            <div>
              <p className="text-sm text-gray-500">Code postal</p>
              <p className="mt-1 text-gray-900">{driver.postalCode}</p>
            </div>
          )}
          {driver.emergencyContact && (
            <div>
              <p className="text-sm text-gray-500">Contact d'urgence</p>
              <p className="mt-1 text-gray-900">{driver.emergencyContact}</p>
            </div>
          )}
          {driver.emergencyPhone && (
            <div>
              <p className="text-sm text-gray-500">Téléphone d'urgence</p>
              <p className="mt-1 text-gray-900">{driver.emergencyPhone}</p>
            </div>
          )}
          {driver.notes && (
            <div className="md:col-span-2">
              <p className="text-sm text-gray-500">Notes</p>
              <p className="mt-1 text-gray-900 whitespace-pre-wrap">{driver.notes}</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">Modifier les informations</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Prénom *
          </label>
          <input
            type="text"
            required
            value={formData.firstName}
            onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
            className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-flotteq-blue focus:border-flotteq-blue"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nom *
          </label>
          <input
            type="text"
            required
            value={formData.lastName}
            onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
            className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-flotteq-blue focus:border-flotteq-blue"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email *
          </label>
          <input
            type="email"
            required
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-flotteq-blue focus:border-flotteq-blue"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Téléphone *
          </label>
          <input
            type="tel"
            required
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-flotteq-blue focus:border-flotteq-blue"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Numéro de permis *
          </label>
          <input
            type="text"
            required
            value={formData.licenseNumber}
            onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
            className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-flotteq-blue focus:border-flotteq-blue"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Expiration permis *
          </label>
          <input
            type="date"
            required
            value={formData.licenseExpiryDate?.split('T')[0]}
            onChange={(e) => setFormData({ ...formData, licenseExpiryDate: e.target.value })}
            className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-flotteq-blue focus:border-flotteq-blue"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Date de naissance
          </label>
          <input
            type="date"
            value={formData.birthDate?.split('T')[0] || ''}
            onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
            className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-flotteq-blue focus:border-flotteq-blue"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Expiration certificat médical
          </label>
          <input
            type="date"
            value={formData.medicalCertificateExpiryDate?.split('T')[0] || ''}
            onChange={(e) => setFormData({ ...formData, medicalCertificateExpiryDate: e.target.value })}
            className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-flotteq-blue focus:border-flotteq-blue"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Adresse
          </label>
          <input
            type="text"
            value={formData.address || ''}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-flotteq-blue focus:border-flotteq-blue"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Ville
          </label>
          <input
            type="text"
            value={formData.city || ''}
            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
            className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-flotteq-blue focus:border-flotteq-blue"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Code postal
          </label>
          <input
            type="text"
            value={formData.postalCode || ''}
            onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
            className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-flotteq-blue focus:border-flotteq-blue"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Contact d'urgence
          </label>
          <input
            type="text"
            value={formData.emergencyContact || ''}
            onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
            className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-flotteq-blue focus:border-flotteq-blue"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Téléphone d'urgence
          </label>
          <input
            type="tel"
            value={formData.emergencyPhone || ''}
            onChange={(e) => setFormData({ ...formData, emergencyPhone: e.target.value })}
            className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-flotteq-blue focus:border-flotteq-blue"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Notes
          </label>
          <textarea
            rows={4}
            value={formData.notes || ''}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-flotteq-blue focus:border-flotteq-blue"
          />
        </div>
      </div>

      <div className="mt-6 flex justify-end gap-3">
        <button
          type="button"
          onClick={handleCancel}
          className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
        >
          Annuler
        </button>
        <button
          type="submit"
          disabled={updateMutation.isPending}
          className="px-4 py-2 bg-flotteq-blue text-white rounded-md hover:bg-flotteq-navy disabled:opacity-50"
        >
          {updateMutation.isPending ? 'Enregistrement...' : 'Enregistrer'}
        </button>
      </div>

      {updateMutation.isError && (
        <div className="mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          Erreur lors de la mise à jour
        </div>
      )}
    </form>
  );
}
