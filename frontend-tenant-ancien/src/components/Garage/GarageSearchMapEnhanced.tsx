import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { MapPin, Filter, Navigation, Star, Clock, Euro, Search, Maximize2, Heart, Info } from 'lucide-react';
import { toast } from 'sonner';
import OpenStreetMapComponent from './OpenStreetMapComponent';
import { useGeolocation } from '@/hooks/useGeolocation';

interface Garage {
  id: string;
  name: string;
  address: string;
  distance: number;
  coordinates: { lat: number; lng: number };
  specialties: string[];
  rating: number;
  reviewCount: number;
  availability: 'Disponible' | 'Limité' | 'Complet';
  phone: string;
  priceForService: number;
  nextAvailableSlots: string[];
}

interface GarageSearchMapEnhancedProps {
  vehicleInfo: any;
  selectedRepairs: string[];
  onReservationRequest: (garage: Garage) => void;
  userLocation?: { lat: number; lng: number };
}

const GarageSearchMapEnhanced: React.FC<GarageSearchMapEnhancedProps> = ({ 
  vehicleInfo, 
  selectedRepairs,
  onReservationRequest,
  userLocation = { lat: 48.8566, lng: 2.3522 } // Paris par défaut
}) => {
  
  const [garages, setGarages] = useState<Garage[]>([]);
  const [filteredGarages, setFilteredGarages] = useState<Garage[]>([]);
  const [selectedGarages, setSelectedGarages] = useState<string[]>([]);
  const [favoriteGarages, setFavoriteGarages] = useState<string[]>([]);
  const [mapCenter, setMapCenter] = useState(userLocation);
  const [searchRadius, setSearchRadius] = useState('10');
  const [sortBy, setSortBy] = useState('recommended');
  const [specialtyFilter, setSpecialtyFilter] = useState('all');
  const [locationSearch, setLocationSearch] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [isMapExpanded, setIsMapExpanded] = useState(false);
  const [showComparison, setShowComparison] = useState(false);
  
  const { coordinates, isLoading: geoLoading, error: geoError, getCurrentLocation } = useGeolocation();

  // Données mockées des garages
  const mockGarages: Garage[] = [
    {
      id: 'garage-1',
      name: 'Garage Central Auto',
      address: '15 Avenue de la République, 75011 Paris',
      distance: 2.3,
      coordinates: { lat: 48.8566, lng: 2.3522 },
      specialties: ['Freinage', 'Vidange', 'Contrôle technique'],
      rating: 4.8,
      reviewCount: 127,
      availability: 'Disponible',
      phone: '01 23 45 67 89',
      priceForService: 89,
      nextAvailableSlots: ['Vendredi 15h', 'Samedi 9h', 'Lundi 14h']
    },
    {
      id: 'garage-2',
      name: 'AutoService Pro',
      address: '8 Rue des Artisans, 75012 Paris',
      distance: 3.1,
      coordinates: { lat: 48.8455, lng: 2.3732 },
      specialties: ['Électronique', 'Moteur', 'Climatisation'],
      rating: 4.6,
      reviewCount: 93,
      availability: 'Limité',
      phone: '01 34 56 78 90',
      priceForService: 132,
      nextAvailableSlots: ['Mardi 10h', 'Jeudi 16h']
    },
    {
      id: 'garage-3',
      name: 'Mécanique Express',
      address: '22 Boulevard Saint-Michel, 75005 Paris',
      distance: 4.7,
      coordinates: { lat: 48.8434, lng: 2.3412 },
      specialties: ['Freinage', 'Échappement', 'Pneumatiques'],
      rating: 4.5,
      reviewCount: 156,
      availability: 'Disponible',
      phone: '01 45 67 89 01',
      priceForService: 75,
      nextAvailableSlots: ['Vendredi 11h', 'Samedi 14h', 'Dimanche 9h']
    },
    {
      id: 'garage-4',
      name: 'Atelier du Faubourg',
      address: '33 Rue du Faubourg Saint-Antoine, 75011 Paris',
      distance: 1.8,
      coordinates: { lat: 48.8533, lng: 2.3710 },
      specialties: ['Vidange', 'Distribution', 'Embrayage'],
      rating: 4.7,
      reviewCount: 84,
      availability: 'Disponible',
      phone: '01 56 78 90 12',
      priceForService: 95,
      nextAvailableSlots: ['Aujourd\'hui 17h', 'Demain 9h', 'Vendredi 15h']
    }
  ];

  useEffect(() => {
    setGarages(mockGarages);
    setFilteredGarages(mockGarages);
  }, []);

  useEffect(() => {
    if (coordinates) {
      setMapCenter(coordinates);
      toast.success('Position détectée automatiquement');
    }
  }, [coordinates]);

  useEffect(() => {
    let filtered = [...garages];

    // Filtre par distance
    if (searchRadius !== 'all') {
      const radius = parseInt(searchRadius);
      filtered = filtered.filter(garage => garage.distance <= radius);
    }

    // Filtre par spécialité
    if (specialtyFilter !== 'all') {
      filtered = filtered.filter(garage => 
        garage.specialties.some(specialty => 
          specialty.toLowerCase().includes(specialtyFilter.toLowerCase())
        )
      );
    }

    // Tri
    if (sortBy === 'price') {
      filtered.sort((a, b) => a.priceForService - b.priceForService);
    } else if (sortBy === 'distance') {
      filtered.sort((a, b) => a.distance - b.distance);
    } else if (sortBy === 'rating') {
      filtered.sort((a, b) => b.rating - a.rating);
    }

    setFilteredGarages(filtered);
  }, [garages, searchRadius, sortBy, specialtyFilter]);

  const handleLocationSearch = async () => {
    
    if (!locationSearch || !locationSearch.trim()) {
      console.error('Recherche vide');
      toast.error('Veuillez saisir une ville ou une adresse');
      return;
    }

    const searchTerm = locationSearch.trim();
    
    setIsSearching(true);
    
    try {
      const apiUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchTerm)}&limit=1&countrycodes=fr`;
      
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'GarageSearchApp/1.0'
        }
      });
      
      
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data && data.length > 0) {
        const location = data[0];
        const lat = parseFloat(location.lat);
        const lng = parseFloat(location.lon);
        
        if (!isNaN(lat) && !isNaN(lng)) {
          const newCenter = { lat, lng };
          setMapCenter(newCenter);
          toast.success(`Position trouvée: ${location.display_name}`);
        } else {
          console.error('Coordonnées invalides:', location);
          toast.error('Coordonnées invalides reçues');
        }
      } else {
        toast.error('Lieu non trouvé');
      }
      
    } catch (error) {
      console.error('Erreur de recherche:', error);
      toast.error('Erreur lors de la recherche');
    } finally {
      setIsSearching(false);
    }
  };

  const handleGetCurrentLocation = () => {
    getCurrentLocation();
  };

  const handleMapMove = (center: { lat: number; lng: number }, zoom: number) => {
    setMapCenter(center);
  };

  const handleCompareToggle = (garageId: string) => {
    setSelectedGarages(prev => 
      prev.includes(garageId) 
        ? prev.filter(id => id !== garageId)
        : [...prev, garageId]
    );
  };

  const handleFavoriteToggle = (garageId: string) => {
    setFavoriteGarages(prev => {
      const newFavorites = prev.includes(garageId) 
        ? prev.filter(id => id !== garageId)
        : [...prev, garageId];
      
      toast.success(
        newFavorites.includes(garageId) 
          ? 'Garage ajouté aux favoris ❤️' 
          : 'Garage retiré des favoris'
      );
      
      return newFavorites;
    });
  };

  const handleContact = (garage: Garage) => {
    toast.success(`Appel en cours vers ${garage.name}...`);
  };

  const handleReserve = (garage: Garage) => {
    onReservationRequest(garage);
  };

  const handleSlotReservation = (garage: Garage, slot: string) => {
    toast.success(`Réservation pour ${slot} chez ${garage.name}`);
  };

  const getAvailabilityColor = (availability: string) => {
    switch (availability) {
      case 'Disponible': return 'bg-green-100 text-green-800';
      case 'Limité': return 'bg-yellow-100 text-yellow-800';
      case 'Complet': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getAvailabilityTooltip = (availability: string) => {
    switch (availability) {
      case 'Disponible': return 'Garage disponible à la réservation immédiate';
      case 'Limité': return 'Places limitées';
      case 'Complet': return 'Aucune place disponible';
      default: return '';
    }
  };

  const getSpecialtyIcon = (specialty: string) => {
    // Retourner l'icône appropriée selon la spécialité
    switch (specialty.toLowerCase()) {
      case 'freinage': return '🛑';
      case 'vidange': return '🛢️';
      case 'contrôle technique': return '🔍';
      case 'électronique': return '⚡';
      case 'moteur': return '🔧';
      case 'climatisation': return '❄️';
      case 'échappement': return '💨';
      case 'pneumatiques': return '🛞';
      case 'distribution': return '⚙️';
      case 'embrayage': return '🔗';
      default: return '🔧';
    }
  };

  // Calculer le prix total estimé pour toutes les réparations
  const getTotalEstimatedPrice = (garage: Garage) => {
    return selectedRepairs.length * garage.priceForService;
  };

  return (
    <div className="space-y-4">
      {/* Zone de recherche optimisée - Barre compacte */}
      <Card className="shadow-sm">
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
            {/* Recherche de localisation avec icône loupe */}
            <div className="flex-1 flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Rechercher une ville ou adresse..."
                  value={locationSearch}
                  onChange={(e) => setLocationSearch(e.target.value)}
                  className="pl-10"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleLocationSearch();
                    }
                  }}
                  disabled={isSearching}
                />
              </div>
              <Button 
                onClick={handleLocationSearch}
                disabled={isSearching || !locationSearch.trim()}
                size="sm"
              >
                {isSearching ? 'Recherche...' : 'Chercher'}
              </Button>
              <Button 
                onClick={handleGetCurrentLocation} 
                variant="outline"
                disabled={geoLoading}
                size="sm"
              >
                <Navigation className="w-4 h-4 mr-1" />
                {geoLoading ? 'Localisation...' : 'Ma position'}
              </Button>
            </div>
            
            {/* Filtres compactés */}
            <div className="flex gap-2 flex-wrap">
              <Select value={searchRadius} onValueChange={setSearchRadius}>
                <SelectTrigger className="w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5 km</SelectItem>
                  <SelectItem value="10">10 km</SelectItem>
                  <SelectItem value="25">25 km</SelectItem>
                  <SelectItem value="all">Tous</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recommended">Recommandé</SelectItem>
                  <SelectItem value="price">Prix ↗</SelectItem>
                  <SelectItem value="distance">Distance ↗</SelectItem>
                  <SelectItem value="rating">Note ↘</SelectItem>
                </SelectContent>
              </Select>

              <Select value={specialtyFilter} onValueChange={setSpecialtyFilter}>
                <SelectTrigger className="w-28">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes</SelectItem>
                  <SelectItem value="freinage">Freinage</SelectItem>
                  <SelectItem value="vidange">Vidange</SelectItem>
                  <SelectItem value="électronique">Électronique</SelectItem>
                  <SelectItem value="moteur">Moteur</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          {geoError && (
            <p className="text-sm text-red-600 mt-2">{geoError}</p>
          )}
        </CardContent>
      </Card>

      {/* Résumé des résultats */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <MapPin className="w-5 h-5 text-blue-600" />
          {filteredGarages.length} garage(s) trouvé(s) pour {selectedRepairs.length} réparation{selectedRepairs.length > 1 ? 's' : ''}
        </h2>
      </div>

      {/* Carte interactive compacte */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <div style={{ height: isMapExpanded ? '500px' : '350px' }}>
              <OpenStreetMapComponent
                garages={filteredGarages}
                center={mapCenter}
                selectedService={selectedRepairs[0]}
                onReserve={handleReserve}
                onMapMove={handleMapMove}
              />
            </div>
            
            {/* Bouton Agrandir la carte */}
            <Button
              onClick={() => setIsMapExpanded(!isMapExpanded)}
              variant="outline"
              size="sm"
              className="absolute bottom-4 right-4 bg-white shadow-md hover:shadow-lg"
            >
              <Maximize2 className="w-4 h-4 mr-1" />
              {isMapExpanded ? 'Réduire' : 'Agrandir la carte'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Liste des garages partenaires */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Garages partenaires</h3>
        
        {filteredGarages.map((garage) => (
          <Card key={garage.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{getSpecialtyIcon(garage.specialties[0])}</span>
                      <h3 className="text-lg font-semibold text-gray-900">{garage.name}</h3>
                    </div>
                    <div className="relative group">
                      <Badge className={getAvailabilityColor(garage.availability)}>
                        {garage.availability}
                      </Badge>
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                        {getAvailabilityTooltip(garage.availability)}
                      </div>
                    </div>
                    <button
                      onClick={() => handleFavoriteToggle(garage.id)}
                      className={`p-1 rounded-full transition-colors ${
                        favoriteGarages.includes(garage.id)
                          ? 'text-red-500 bg-red-50 hover:bg-red-100'
                          : 'text-gray-400 hover:text-red-500 hover:bg-red-50'
                      }`}
                    >
                      <Heart className={`w-5 h-5 ${favoriteGarages.includes(garage.id) ? 'fill-current' : ''}`} />
                    </button>
                  </div>
                  <p className="text-sm text-gray-600 flex items-center gap-1 mb-1">
                    <MapPin className="w-4 h-4" />
                    {garage.address} • {garage.distance} km
                  </p>
                  <div className="flex items-center gap-3 text-sm">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-500 fill-current" />
                      <span className="font-medium">{garage.rating}</span>
                      <span className="text-gray-500">({garage.reviewCount} avis)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {garage.specialties.slice(0, 2).map((specialty, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {specialty}
                        </Badge>
                      ))}
                      {garage.specialties.length > 2 && (
                        <span className="text-xs text-gray-500">+{garage.specialties.length - 2}</span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1 text-2xl font-bold text-green-600 mb-1">
                    <Euro className="w-5 h-5" />
                    {getTotalEstimatedPrice(garage)}
                  </div>
                  <p className="text-xs text-gray-500">pour {selectedRepairs.length} réparation{selectedRepairs.length > 1 ? 's' : ''}</p>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-2 flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    Prochaines disponibilités:
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {garage.nextAvailableSlots.map((slot, index) => (
                      <button
                        key={index}
                        onClick={() => handleSlotReservation(garage, slot)}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-medium transition-colors"
                      >
                        {slot}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id={`compare-${garage.id}`}
                      checked={selectedGarages.includes(garage.id)}
                      onChange={() => handleCompareToggle(garage.id)}
                      className="mr-2"
                    />
                    <label htmlFor={`compare-${garage.id}`} className="text-sm text-gray-600">
                      Comparer
                    </label>
                  </div>
                  <Button 
                    onClick={() => handleContact(garage)}
                    variant="outline"
                    size="sm"
                    className="flex-1"
                  >
                    Contacter
                  </Button>
                  <Button 
                    onClick={() => handleReserve(garage)}
                    size="sm"
                    className="flex-1"
                  >
                    Réserver
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredGarages.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-2">Aucun garage trouvé avec ces critères</p>
            <p className="text-sm text-gray-500 mb-4">
              Essayez d'élargir votre rayon de recherche ou de modifier les filtres
            </p>
            <Button 
              variant="outline" 
              onClick={() => {
                setSearchRadius('25');
                setSpecialtyFilter('all');
                setSortBy('recommended');
              }}
            >
              Réinitialiser les filtres
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Bouton Comparer flottant */}
      {selectedGarages.length > 0 && (
        <div className="fixed bottom-4 right-4 z-50">
          <Button 
            className="shadow-lg hover:shadow-xl transition-shadow"
            onClick={() => setShowComparison(true)}
          >
            Comparer les garages ({selectedGarages.length})
          </Button>
        </div>
      )}

      {/* Modal de comparaison */}
      {showComparison && selectedGarages.length > 0 && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Comparaison des garages</h2>
                <Button 
                  variant="outline" 
                  onClick={() => setShowComparison(false)}
                >
                  Fermer
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {selectedGarages.map(garageId => {
                  const garage = garages.find(g => g.id === garageId);
                  if (!garage) return null;
                  
                  return (
                    <Card key={garage.id} className="text-center">
                      <CardContent className="p-4">
                        <h3 className="font-semibold mb-2">{garage.name}</h3>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span>Prix total:</span>
                            <span className="font-bold text-green-600">{getTotalEstimatedPrice(garage)}€</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Distance:</span>
                            <span>{garage.distance} km</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Note:</span>
                            <span className="flex items-center gap-1">
                              <Star className="w-3 h-3 text-yellow-500 fill-current" />
                              {garage.rating}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Disponibilité:</span>
                            <Badge className={getAvailabilityColor(garage.availability)} variant="secondary">
                              {garage.availability}
                            </Badge>
                          </div>
                        </div>
                        <Button 
                          onClick={() => handleReserve(garage)}
                          size="sm"
                          className="w-full mt-3"
                        >
                          Réserver
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GarageSearchMapEnhanced;
