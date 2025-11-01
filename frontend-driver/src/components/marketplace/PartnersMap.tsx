import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Icon } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, Star, Phone } from 'lucide-react';
import type { MarketplacePartner, PartnerService } from '@/types/marketplace.types';

// Custom icons for different marker types
// Icon position recherche (Bleu)
const userSearchIcon = new Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Icon partenaires (Rouge)
const partnerIcon = new Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

interface PartnersMapProps {
  partners: MarketplacePartner[];
  center: [number, number];
  zoom?: number;
}

export default function PartnersMap({ partners, center, zoom = 12 }: PartnersMapProps) {
  const navigate = useNavigate();

  return (
    <div className="h-[600px] w-full rounded-lg overflow-hidden border border-gray-200 shadow-sm">
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Marker pour position recherche */}
        <Marker position={center} icon={userSearchIcon}>
          <Popup>
            <div className="text-center p-2">
              <MapPin className="h-5 w-5 text-flotteq-blue mx-auto mb-1" />
              <p className="font-semibold text-sm">📍 Zone de recherche</p>
              <p className="text-xs text-gray-600">Centre du rayon sélectionné</p>
            </div>
          </Popup>
        </Marker>

        {/* Markers pour partenaires */}
        {partners.map((partner) => {
          if (!partner.latitude || !partner.longitude) return null;

          return (
            <Marker
              key={partner.id}
              position={[partner.latitude, partner.longitude]}
              icon={partnerIcon}
              eventHandlers={{
                click: () => navigate(`/marketplace/${partner.id}`),
                mouseover: (e) => e.target.openPopup(),
                mouseout: (e) => e.target.closePopup(),
              }}
            >
              <Popup>
                <div className="w-64">
                  <h3 className="font-bold text-base text-gray-900 mb-1">
                    {partner.companyName}
                  </h3>

                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-semibold text-sm">
                        {typeof partner.rating === 'number' ? partner.rating.toFixed(1) : partner.rating}
                      </span>
                      <span className="text-xs text-gray-600">
                        ({partner.totalReviews} avis)
                      </span>
                    </div>

                    {partner.distance && (
                      <span className="text-sm text-flotteq-blue font-medium">
                        {partner.distance.toFixed(1)} km
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-gray-600 mb-2">
                    {partner.address}, {partner.city}
                  </p>

                  {partner.phone && (
                    <div className="flex items-center gap-1 text-xs text-gray-600 mb-2">
                      <Phone className="h-3 w-3" />
                      <a href={`tel:${partner.phone}`} className="hover:text-flotteq-blue">
                        {partner.phone}
                      </a>
                    </div>
                  )}

                  {partner.services && partner.services.length > 0 && (
                    <div className="mb-2">
                      <p className="text-xs font-medium text-gray-700 mb-1">
                        Services ({partner.services.length}) :
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {partner.services.slice(0, 3).map((service: PartnerService) => (
                          <span
                            key={service.id}
                            className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded"
                          >
                            {service.name}
                          </span>
                        ))}
                        {partner.services.length > 3 && (
                          <span className="text-xs text-gray-500">
                            +{partner.services.length - 3} autres
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  <button
                    onClick={() => navigate(`/marketplace/${partner.id}`)}
                    className="w-full mt-2 bg-flotteq-blue text-white py-2 px-3 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                  >
                    Voir les détails
                  </button>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
