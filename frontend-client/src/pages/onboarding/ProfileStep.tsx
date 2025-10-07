import { useState } from 'react';

interface ProfileStepProps {
  onNext: (data: any) => void;
  initialData?: any;
}

export default function ProfileStep({ onNext, initialData }: ProfileStepProps) {
  const [formData, setFormData] = useState({
    companyName: initialData?.companyName || '',
    companyAddress: initialData?.companyAddress || '',
    companyCity: initialData?.companyCity || '',
    companyPostalCode: initialData?.companyPostalCode || '',
    companyCountry: initialData?.companyCountry || 'France',
    fleetSize: initialData?.fleetSize || 0,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNext(formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Profil de votre entreprise</h2>
      <p className="text-gray-600 mb-6">Complétez les informations de votre entreprise</p>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="companyName" className="block text-sm font-medium text-gray-700">
            Nom de l'entreprise *
          </label>
          <input
            type="text"
            name="companyName"
            id="companyName"
            required
            value={formData.companyName}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-flotteq-blue focus:border-flotteq-blue"
          />
        </div>

        <div>
          <label htmlFor="companyAddress" className="block text-sm font-medium text-gray-700">
            Adresse *
          </label>
          <input
            type="text"
            name="companyAddress"
            id="companyAddress"
            required
            value={formData.companyAddress}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-flotteq-blue focus:border-flotteq-blue"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="companyPostalCode" className="block text-sm font-medium text-gray-700">
              Code postal *
            </label>
            <input
              type="text"
              name="companyPostalCode"
              id="companyPostalCode"
              required
              value={formData.companyPostalCode}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-flotteq-blue focus:border-flotteq-blue"
            />
          </div>

          <div>
            <label htmlFor="companyCity" className="block text-sm font-medium text-gray-700">
              Ville *
            </label>
            <input
              type="text"
              name="companyCity"
              id="companyCity"
              required
              value={formData.companyCity}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-flotteq-blue focus:border-flotteq-blue"
            />
          </div>
        </div>

        <div>
          <label htmlFor="companyCountry" className="block text-sm font-medium text-gray-700">
            Pays *
          </label>
          <select
            name="companyCountry"
            id="companyCountry"
            required
            value={formData.companyCountry}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-flotteq-blue focus:border-flotteq-blue"
          >
            <option value="France">France</option>
            <option value="Belgique">Belgique</option>
            <option value="Suisse">Suisse</option>
          </select>
        </div>

        <div>
          <label htmlFor="fleetSize" className="block text-sm font-medium text-gray-700">
            Taille de la flotte estimée *
          </label>
          <input
            type="number"
            name="fleetSize"
            id="fleetSize"
            required
            min="1"
            value={formData.fleetSize}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-flotteq-blue focus:border-flotteq-blue"
          />
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="bg-flotteq-blue text-white px-6 py-2 rounded-md hover:bg-flotteq-navy focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-flotteq-blue"
          >
            Suivant
          </button>
        </div>
      </form>
    </div>
  );
}
