import { useState } from 'react';
import { Search, MapPin, Filter } from 'lucide-react';
import type { SearchPartnersParams } from '@/types/marketplace.types';

interface SearchFiltersProps {
  onSearch: (params: SearchPartnersParams) => void;
  isLoading?: boolean;
}

export default function SearchFilters({ onSearch, isLoading }: SearchFiltersProps) {
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [radius, setRadius] = useState('10');
  const [type, setType] = useState('');
  const [minRating, setMinRating] = useState('');
  const [sortBy, setSortBy] = useState<'distance' | 'rating' | 'price' | 'relevance'>('relevance');

  const handleGetCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLatitude(position.coords.latitude.toString());
          setLongitude(position.coords.longitude.toString());
        },
        (error) => {
          console.error('Error getting location:', error);
          alert('Impossible d\'obtenir votre position');
        }
      );
    } else {
      alert('Géolocalisation non supportée par votre navigateur');
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();

    if (!latitude || !longitude) {
      alert('Veuillez saisir une position ou utiliser votre localisation actuelle');
      return;
    }

    const params: SearchPartnersParams = {
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      radius: parseFloat(radius),
      sortBy,
    };

    if (type) params.type = type;
    if (minRating) params.minRating = parseFloat(minRating);

    onSearch(params);
  };

  return (
    <form onSubmit={handleSearch} className="bg-white rounded-lg shadow p-6 mb-6">
      <div className="flex items-center gap-2 mb-4">
        <Filter className="h-5 w-5 text-gray-600" />
        <h2 className="text-lg font-semibold text-gray-900">Rechercher des partenaires</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        {/* Localisation */}
        <div className="lg:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <MapPin className="inline h-4 w-4 mr-1" />
            Localisation
          </label>
          <div className="flex gap-2">
            <input
              type="number"
              step="any"
              value={latitude}
              onChange={(e) => setLatitude(e.target.value)}
              placeholder="Latitude"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-flotteq-blue text-sm"
            />
            <input
              type="number"
              step="any"
              value={longitude}
              onChange={(e) => setLongitude(e.target.value)}
              placeholder="Longitude"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-flotteq-blue text-sm"
            />
            <button
              type="button"
              onClick={handleGetCurrentLocation}
              className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors text-sm"
              title="Ma position"
            >
              📍
            </button>
          </div>
        </div>

        {/* Rayon */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Rayon (km)</label>
          <input
            type="number"
            min="1"
            max="100"
            value={radius}
            onChange={(e) => setRadius(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-flotteq-blue text-sm"
          />
        </div>

        {/* Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-flotteq-blue text-sm"
          >
            <option value="">Tous</option>
            <option value="garage">Garage</option>
            <option value="bodyshop">Carrosserie</option>
            <option value="tire_specialist">Pneumatiques</option>
            <option value="car_wash">Lavage</option>
            <option value="inspection_center">Contrôle technique</option>
            <option value="rental">Location</option>
            <option value="other">Autre</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        {/* Note minimale */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Note minimale</label>
          <select
            value={minRating}
            onChange={(e) => setMinRating(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-flotteq-blue text-sm"
          >
            <option value="">Toutes</option>
            <option value="3">3+ ⭐</option>
            <option value="4">4+ ⭐</option>
            <option value="4.5">4.5+ ⭐</option>
          </select>
        </div>

        {/* Tri */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Trier par</label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-flotteq-blue text-sm"
          >
            <option value="relevance">Pertinence</option>
            <option value="distance">Distance</option>
            <option value="rating">Note</option>
            <option value="price">Prix</option>
          </select>
        </div>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-flotteq-blue text-white py-3 px-6 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center gap-2"
      >
        <Search className="h-5 w-5" />
        {isLoading ? 'Recherche en cours...' : 'Rechercher'}
      </button>
    </form>
  );
}
