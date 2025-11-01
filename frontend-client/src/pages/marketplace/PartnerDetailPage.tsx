import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  MapPin,
  Phone,
  Star,
  Clock,
  Wrench,
  Calendar as CalendarIcon,
  AlertCircle
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { usePartnerDetails, useAvailableSlots } from '@/hooks/useMarketplace';
import CreateBookingModal from '@/components/marketplace/CreateBookingModal';
import CreateBookingModalV2 from '@/components/booking/CreateBookingModalV2';

const partnerTypeLabels: Record<string, string> = {
  garage: 'Garage',
  bodyshop: 'Carrosserie',
  tire_specialist: 'Pneumatiques',
  car_wash: 'Lavage',
  inspection_center: 'Contrôle technique',
  rental: 'Location',
  other: 'Autre',
};

export default function PartnerDetailPage() {
  const { partnerId } = useParams<{ partnerId: string }>();
  const navigate = useNavigate();
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(
    format(new Date(), 'yyyy-MM-dd')
  );
  const [isBookingModalV1Open, setIsBookingModalV1Open] = useState(false);
  const [isBookingModalV2Open, setIsBookingModalV2Open] = useState(false);

  const { data: partner, isLoading, error } = usePartnerDetails(partnerId);

  const selectedService = partner?.services?.find(s => s.id === selectedServiceId);

  const { data: slotsData } = useAvailableSlots(
    partnerId,
    selectedServiceId || undefined,
    selectedDate,
    selectedService?.durationMinutes,
    !!selectedServiceId
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-flotteq-blue"></div>
      </div>
    );
  }

  if (error || !partner) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-center gap-3">
          <AlertCircle className="h-6 w-6 text-red-600" />
          <div>
            <h3 className="font-semibold text-red-900">Partenaire introuvable</h3>
            <p className="text-red-700 text-sm mt-1">
              {(error as any)?.response?.data?.message || 'Ce partenaire n\'existe pas ou n\'est plus disponible.'}
            </p>
          </div>
        </div>
        <button
          onClick={() => navigate('/marketplace')}
          className="mt-4 text-sm text-red-700 hover:text-red-900 font-medium flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour à la marketplace
        </button>
      </div>
    );
  }

  const handleBookServiceQuick = (serviceId: string) => {
    setSelectedServiceId(serviceId);
    setIsBookingModalV1Open(true);
  };

  const handleBookServiceGuided = (serviceId: string) => {
    setSelectedServiceId(serviceId);
    setIsBookingModalV2Open(true);
  };

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <button
        onClick={() => navigate('/marketplace')}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
      >
        <ArrowLeft className="h-5 w-5" />
        <span className="font-medium">Retour à la marketplace</span>
      </button>

      {/* Header Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-start gap-3 mb-3">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {partner.companyName}
                </h1>
                <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-lg">
                  {partnerTypeLabels[partner.type] || partner.type}
                </span>
              </div>
            </div>

            <div className="space-y-2 text-gray-600">
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-gray-400" />
                <span>{partner.address}, {partner.city}</span>
                {partner.distance && (
                  <span className="text-flotteq-blue font-medium">
                    • {partner.distance.toFixed(1)} km
                  </span>
                )}
              </div>
              {partner.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="h-5 w-5 text-gray-400" />
                  <a href={`tel:${partner.phone}`} className="hover:text-flotteq-blue transition-colors">
                    {partner.phone}
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Rating Badge */}
          <div className="flex flex-col items-end gap-2">
            <div className="flex items-center gap-2 bg-yellow-50 px-4 py-2 rounded-lg">
              <Star className="h-6 w-6 fill-yellow-400 text-yellow-400" />
              <div className="text-right">
                <div className="text-2xl font-bold text-gray-900">
                  {typeof partner.rating === 'number' ? partner.rating.toFixed(1) : partner.rating}
                </div>
                <div className="text-xs text-gray-600">
                  {partner.totalReviews} avis
                </div>
              </div>
            </div>
            {partner.nextAvailableSlot && (
              <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 px-3 py-1 rounded-lg">
                <Clock className="h-4 w-4" />
                <span>
                  Dispo: {format(new Date(partner.nextAvailableSlot), 'dd/MM à HH:mm', { locale: fr })}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Services Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center gap-2 mb-6">
          <Wrench className="h-6 w-6 text-flotteq-blue" />
          <h2 className="text-2xl font-bold text-gray-900">Services disponibles</h2>
        </div>

        {!partner.services || partner.services.length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            Aucun service disponible pour le moment
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(partner.services || []).map((service) => (
              <div
                key={service.id}
                className={`border rounded-lg p-5 transition-all cursor-pointer ${
                  selectedServiceId === service.id
                    ? 'border-flotteq-blue bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                }`}
                onClick={() => setSelectedServiceId(service.id)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1">
                      {service.name}
                    </h3>
                    {service.description && (
                      <p className="text-sm text-gray-600 mb-3">
                        {service.description}
                      </p>
                    )}
                  </div>
                  {!service.isActive && (
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                      Indisponible
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>{service.durationMinutes} min</span>
                    </div>
                    <div className="text-xl font-bold text-flotteq-blue">
                      {typeof service.price === 'number'
                        ? service.price.toFixed(2)
                        : parseFloat(service.price).toFixed(2)} €
                    </div>
                  </div>
                  {service.isActive && (
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleBookServiceQuick(service.id);
                        }}
                        className="px-3 py-2 bg-flotteq-blue text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                        title="Réservation rapide (1 écran)"
                      >
                        Rapide
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleBookServiceGuided(service.id);
                        }}
                        className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                        title="Réservation guidée (multi-étapes)"
                      >
                        Guidé
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/booking/new/${partnerId}/${service.id}`);
                        }}
                        className="px-3 py-2 border-2 border-flotteq-blue text-flotteq-blue rounded-lg hover:bg-blue-50 transition-colors text-sm font-medium"
                        title="Page complète (URL unique)"
                      >
                        Page
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Availability Calendar Preview */}
      {selectedServiceId && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-2 mb-6">
            <CalendarIcon className="h-6 w-6 text-flotteq-blue" />
            <h2 className="text-2xl font-bold text-gray-900">Disponibilités</h2>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sélectionnez une date
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              min={format(new Date(), 'yyyy-MM-dd')}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-flotteq-blue"
            />
          </div>

          {slotsData && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {slotsData.slots.filter(slot => slot.available).length === 0 ? (
                <div className="col-span-full text-center py-8 text-gray-500">
                  Aucun créneau disponible pour cette date
                </div>
              ) : (
                slotsData.slots
                  .filter(slot => slot.available)
                  .map((slot, idx) => (
                    <div
                      key={idx}
                      className="px-4 py-3 border border-green-200 bg-green-50 rounded-lg text-center"
                    >
                      <div className="font-medium text-gray-900">
                        {slot.time}
                      </div>
                      <div className="text-xs text-gray-600">
                        {slot.endTime}
                      </div>
                    </div>
                  ))
              )}
            </div>
          )}
        </div>
      )}

      {/* Booking Modal V1 (Quick) */}
      {isBookingModalV1Open && selectedServiceId && (
        <CreateBookingModal
          partnerId={partnerId!}
          serviceId={selectedServiceId}
          serviceDuration={(partner.services || []).find(s => s.id === selectedServiceId)?.durationMinutes || 60}
          partnerName={partner.companyName}
          serviceName={(partner.services || []).find(s => s.id === selectedServiceId)?.name || ''}
          onClose={() => setIsBookingModalV1Open(false)}
        />
      )}

      {/* Booking Modal V2 (Guided with steps) */}
      {isBookingModalV2Open && selectedServiceId && (
        <CreateBookingModalV2
          partnerId={partnerId!}
          serviceId={selectedServiceId}
          serviceDuration={(partner.services || []).find(s => s.id === selectedServiceId)?.durationMinutes || 60}
          partnerName={partner.companyName}
          serviceName={(partner.services || []).find(s => s.id === selectedServiceId)?.name || ''}
          onClose={() => setIsBookingModalV2Open(false)}
        />
      )}
    </div>
  );
}
