import { useState } from 'react';

interface VehicleStepProps {
  onNext: (data: any) => void;
  onSkip: () => void;
  onBack: () => void;
  initialData?: any;
}

export default function VehicleStep({ onNext, onSkip, onBack, initialData }: VehicleStepProps) {
  const [formData, setFormData] = useState({
    licensePlate: initialData?.licensePlate || '',
    brand: initialData?.brand || '',
    model: initialData?.model || '',
    year: initialData?.year || new Date().getFullYear(),
    vin: initialData?.vin || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNext(formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Ajoutez votre premier véhicule</h2>
      <p className="text-gray-600 mb-6">Optionnel - Vous pourrez en ajouter d'autres plus tard</p>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="licensePlate" className="block text-sm font-medium text-gray-700">
            Plaque d'immatriculation *
          </label>
          <input
            type="text"
            name="licensePlate"
            id="licensePlate"
            required
            value={formData.licensePlate}
            onChange={handleChange}
            placeholder="AB-123-CD"
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-flotteq-blue focus:border-flotteq-blue"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="brand" className="block text-sm font-medium text-gray-700">
              Marque *
            </label>
            <input
              type="text"
              name="brand"
              id="brand"
              required
              value={formData.brand}
              onChange={handleChange}
              placeholder="Renault"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-flotteq-blue focus:border-flotteq-blue"
            />
          </div>

          <div>
            <label htmlFor="model" className="block text-sm font-medium text-gray-700">
              Modèle *
            </label>
            <input
              type="text"
              name="model"
              id="model"
              required
              value={formData.model}
              onChange={handleChange}
              placeholder="Kangoo"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-flotteq-blue focus:border-flotteq-blue"
            />
          </div>
        </div>

        <div>
          <label htmlFor="year" className="block text-sm font-medium text-gray-700">
            Année *
          </label>
          <input
            type="number"
            name="year"
            id="year"
            required
            min="1900"
            max={new Date().getFullYear() + 1}
            value={formData.year}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-flotteq-blue focus:border-flotteq-blue"
          />
        </div>

        <div>
          <label htmlFor="vin" className="block text-sm font-medium text-gray-700">
            VIN (optionnel)
          </label>
          <input
            type="text"
            name="vin"
            id="vin"
            value={formData.vin}
            onChange={handleChange}
            placeholder="1HGBH41JXMN109186"
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-flotteq-blue focus:border-flotteq-blue"
          />
        </div>

        <div className="flex justify-between">
          <button
            type="button"
            onClick={onBack}
            className="text-gray-700 px-6 py-2 rounded-md border border-gray-300 hover:bg-gray-50 focus:outline-none"
          >
            Retour
          </button>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onSkip}
              className="text-gray-700 px-6 py-2 rounded-md hover:bg-gray-50 focus:outline-none"
            >
              Passer
            </button>
            <button
              type="submit"
              className="bg-flotteq-blue text-white px-6 py-2 rounded-md hover:bg-flotteq-navy focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-flotteq-blue"
            >
              Suivant
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
