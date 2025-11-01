import { Wrench, Clock } from 'lucide-react';
import { usePartnerDetails } from '@/hooks/useMarketplace';

interface ServiceSelectionStepProps {
  partnerId: string;
  value: string | null;
  onChange: (serviceId: string) => void;
}

export function ServiceSelectionStep({ partnerId, value, onChange }: ServiceSelectionStepProps) {
  const { data: partner, isLoading } = usePartnerDetails(partnerId);

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-flotteq-blue mx-auto"></div>
        <p className="text-sm text-gray-600 mt-2">Chargement des services...</p>
      </div>
    );
  }

  if (!partner?.services || partner.services.length === 0) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center text-gray-600">
        Aucun service disponible pour ce partenaire
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Wrench className="h-6 w-6 text-flotteq-blue" />
        <h3 className="text-lg font-semibold text-gray-900">Choisissez un service</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {partner.services.map((service) => (
          <div
            key={service.id}
            onClick={() => service.isActive && onChange(service.id)}
            className={`border-2 rounded-lg p-5 transition-all ${
              !service.isActive
                ? 'opacity-50 cursor-not-allowed bg-gray-50'
                : value === service.id
                ? 'border-flotteq-blue bg-blue-50 cursor-pointer'
                : 'border-gray-200 hover:border-gray-300 hover:shadow-sm cursor-pointer'
            }`}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900 mb-1">{service.name}</h4>
                {service.description && (
                  <p className="text-sm text-gray-600">{service.description}</p>
                )}
              </div>
              {!service.isActive && (
                <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded">
                  Indisponible
                </span>
              )}
              {value === service.id && (
                <div className="w-5 h-5 bg-flotteq-blue rounded-full flex items-center justify-center flex-shrink-0 ml-2">
                  <svg
                    className="w-3 h-3 text-white"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>{service.durationMinutes} min</span>
                </div>
              </div>
              <div className="text-xl font-bold text-flotteq-blue">
                {service.price.toFixed(2)} €
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
