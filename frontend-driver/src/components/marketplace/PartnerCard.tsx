import { MapPin, Star, Wrench, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { MarketplacePartner } from '@/types/marketplace.types';

interface PartnerCardProps {
  partner: MarketplacePartner;
}

const partnerTypeLabels: Record<string, string> = {
  garage: 'Garage',
  bodyshop: 'Carrosserie',
  tire_specialist: 'Pneumatiques',
  car_wash: 'Lavage',
  inspection_center: 'Contrôle technique',
  rental: 'Location',
  other: 'Autre',
};

export default function PartnerCard({ partner }: PartnerCardProps) {
  const navigate = useNavigate();

  const handleViewDetails = () => {
    navigate(`/marketplace/${partner.id}`);
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-5 hover:shadow-lg transition-shadow cursor-pointer">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">{partner.companyName}</h3>
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
            <MapPin className="h-4 w-4" />
            <span>{partner.city}</span>
            {partner.distance && <span className="text-flotteq-blue">• {partner.distance.toFixed(1)} km</span>}
          </div>
          <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded">
            {partnerTypeLabels[partner.type] || partner.type}
          </span>
        </div>

        {/* Rating */}
        <div className="flex flex-col items-end">
          <div className="flex items-center gap-1 mb-1">
            <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
            <span className="font-bold text-gray-900">
              {typeof partner.rating === 'number' ? partner.rating.toFixed(1) : partner.rating}
            </span>
          </div>
          <span className="text-xs text-gray-500">{partner.totalReviews} avis</span>
        </div>
      </div>

      {/* Services */}
      <div className="mb-4">
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
          <Wrench className="h-4 w-4" />
          <span className="font-medium">{partner.services.length} service(s)</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {partner.services.slice(0, 3).map((service) => (
            <div key={service.id} className="text-xs bg-gray-100 px-2 py-1 rounded">
              {service.name} - {service.price}€
            </div>
          ))}
          {partner.services.length > 3 && (
            <div className="text-xs text-gray-500 px-2 py-1">
              +{partner.services.length - 3} autres
            </div>
          )}
        </div>
      </div>

      {/* Next Available Slot */}
      {partner.nextAvailableSlot && (
        <div className="flex items-center gap-2 text-sm text-green-600 mb-4">
          <Clock className="h-4 w-4" />
          <span>Prochain créneau : {new Date(partner.nextAvailableSlot).toLocaleDateString('fr-FR')}</span>
        </div>
      )}

      {/* CTA Button */}
      <button
        onClick={handleViewDetails}
        className="w-full bg-flotteq-blue text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
      >
        Voir les services
      </button>
    </div>
  );
}
