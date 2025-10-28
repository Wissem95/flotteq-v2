import { useState, useEffect, useRef } from 'react';
import { Search, MapPin, Filter, Loader2 } from 'lucide-react';
import type { SearchPartnersParams } from '@/types/marketplace.types';

interface SearchFiltersProps {
  onSearch: (params: SearchPartnersParams) => void;
  isLoading?: boolean;
}

interface NominatimResult {
  lat: string;
  lon: string;
  display_name: string;
  place_id: number;
}

export default function SearchFilters({ onSearch, isLoading }: SearchFiltersProps) {
  const [address, setAddress] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [suggestions, setSuggestions] = useState<NominatimResult[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearchingAddress, setIsSearchingAddress] = useState(false);
  const [radius, setRadius] = useState('10');
  const [type, setType] = useState('');
  const [minRating, setMinRating] = useState('');
  const [sortBy, setSortBy] = useState<'distance' | 'rating' | 'price' | 'relevance'>('relevance');
  const debounceTimer = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (address.length < 3) {
      setSuggestions([]);
      return;
    }

    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = setTimeout(async () => {
      setIsSearchingAddress(true);
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address)}&format=json&limit=5&countrycodes=fr`,
          {
            headers: {
              'User-Agent': 'FlotteQ-App',
            },
          }
        );
        const data: NominatimResult[] = await response.json();
        setSuggestions(data);
        setShowSuggestions(true);
      } catch (error) {
        console.error('Error fetching address suggestions:', error);
      } finally {
        setIsSearchingAddress(false);
      }
    }, 500);

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [address]);

  const handleGetCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLatitude(position.coords.latitude.toString());
          setLongitude(position.coords.longitude.toString());
          setAddress('Ma position actuelle');
          setSuggestions([]);
          setShowSuggestions(false);
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

  const handleSelectSuggestion = (result: NominatimResult) => {
    setAddress(result.display_name);
    setLatitude(result.lat);
    setLongitude(result.lon);
    setShowSuggestions(false);
    setSuggestions([]);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();

    if (!latitude || !longitude) {
      alert('Veuillez saisir une adresse ou utiliser votre localisation actuelle');
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
        <div className="lg:col-span-2 relative">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <MapPin className="inline h-4 w-4 mr-1" />
            Localisation
          </label>
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                placeholder="Entrez une adresse (ex: Paris, Marseille...)"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-flotteq-blue text-sm"
              />
              {isSearchingAddress && (
                <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-gray-400" />
              )}
              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  {suggestions.map((result) => (
                    <button
                      key={result.place_id}
                      type="button"
                      onClick={() => handleSelectSuggestion(result)}
                      className="w-full text-left px-4 py-2 hover:bg-blue-50 text-sm border-b border-gray-100 last:border-b-0"
                    >
                      <MapPin className="inline h-3 w-3 mr-2 text-gray-400" />
                      {result.display_name}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={handleGetCurrentLocation}
              className="px-4 py-2 bg-flotteq-blue text-white hover:bg-blue-700 rounded-lg transition-colors text-sm font-medium flex items-center gap-2"
              title="Utiliser ma position actuelle"
            >
              📍 Ma position
            </button>
          </div>
          {latitude && longitude && (
            <p className="text-xs text-gray-500 mt-1">
              Position: {parseFloat(latitude).toFixed(4)}°, {parseFloat(longitude).toFixed(4)}°
            </p>
          )}
        </div>

        {/* Rayon */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Rayon: <span className="text-flotteq-blue font-semibold">{radius} km</span>
          </label>
          <input
            type="range"
            min="1"
            max="200"
            value={radius}
            onChange={(e) => setRadius(e.target.value)}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-flotteq-blue"
            style={{
              background: `linear-gradient(to right, #0066CC 0%, #0066CC ${(parseInt(radius) / 200) * 100}%, #E5E7EB ${(parseInt(radius) / 200) * 100}%, #E5E7EB 100%)`
            }}
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>1 km</span>
            <span>200 km</span>
          </div>
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
