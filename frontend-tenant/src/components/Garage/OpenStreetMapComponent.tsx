
import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { MapPin, Star, Euro, Navigation, Plus, Minus } from 'lucide-react';

interface Garage {
  id: string;
  name: string;
  address: string;
  distance: number;
  coordinates: { lat: number; lng: number };
  rating: number;
  priceForService: number;
  phone: string;
}

interface OpenStreetMapComponentProps {
  garages: Garage[];
  center: { lat: number; lng: number };
  selectedService: string;
  onReserve: (garage: Garage) => void;
  onMapMove?: (center: { lat: number; lng: number }, zoom: number) => void;
}

const OpenStreetMapComponent: React.FC<OpenStreetMapComponentProps> = ({
  garages,
  center,
  selectedService,
  onReserve,
  onMapMove
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(13);
  const [mapCenter, setMapCenter] = useState(center);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [selectedGarage, setSelectedGarage] = useState<Garage | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 });
  const [tilesLoaded, setTilesLoaded] = useState(false);

  // Constantes pour la projection
  const TILE_SIZE = 256;
  const MAX_ZOOM = 18;
  const MIN_ZOOM = 2;

  // Conversion lat/lng vers coordonnées de tuile
  const latLngToTile = (lat: number, lng: number, zoom: number) => {
    const x = Math.floor((lng + 180) / 360 * Math.pow(2, zoom));
    const y = Math.floor((1 - Math.log(Math.tan(lat * Math.PI / 180) + 1 / Math.cos(lat * Math.PI / 180)) / Math.PI) / 2 * Math.pow(2, zoom));
    return { x, y };
  };

  // Conversion coordonnées de tuile vers pixels
  const tileToPixel = (tileX: number, tileY: number, zoom: number, mapCenterLat: number, mapCenterLng: number, canvasWidth: number, canvasHeight: number) => {
    const centerTile = latLngToTile(mapCenterLat, mapCenterLng, zoom);
    const pixelX = (tileX - centerTile.x) * TILE_SIZE + canvasWidth / 2;
    const pixelY = (tileY - centerTile.y) * TILE_SIZE + canvasHeight / 2;
    return { x: pixelX, y: pixelY };
  };

  // Conversion lat/lng vers pixels sur le canvas
  const latLngToPixel = (lat: number, lng: number) => {
    if (!canvasRef.current) return { x: 0, y: 0 };
    
    const canvas = canvasRef.current;
    const tile = latLngToTile(lat, lng, zoom);
    const pixel = tileToPixel(tile.x, tile.y, zoom, mapCenter.lat, mapCenter.lng, canvas.width, canvas.height);
    
    // Ajustement pour la position exacte dans la tuile
    const exactTileX = (lng + 180) / 360 * Math.pow(2, zoom);
    const exactTileY = (1 - Math.log(Math.tan(lat * Math.PI / 180) + 1 / Math.cos(lat * Math.PI / 180)) / Math.PI) / 2 * Math.pow(2, zoom);
    
    const subPixelX = (exactTileX - Math.floor(exactTileX)) * TILE_SIZE;
    const subPixelY = (exactTileY - Math.floor(exactTileY)) * TILE_SIZE;
    
    return {
      x: pixel.x - TILE_SIZE / 2 + subPixelX,
      y: pixel.y - TILE_SIZE / 2 + subPixelY
    };
  };

  // Charger et dessiner les tuiles
  const loadTile = (x: number, y: number, z: number): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = `https://tile.openstreetmap.org/${z}/${x}/${y}.png`;
    });
  };

  const drawMap = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Effacer le canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Calculer les tuiles visibles
    const centerTile = latLngToTile(mapCenter.lat, mapCenter.lng, zoom);
    const tilesX = Math.ceil(canvas.width / TILE_SIZE) + 2; // Augmenter pour éviter les gaps
    const tilesY = Math.ceil(canvas.height / TILE_SIZE) + 2;

    const startX = centerTile.x - Math.floor(tilesX / 2);
    const startY = centerTile.y - Math.floor(tilesY / 2);

    let loadedTilesCount = 0;
    const totalTiles = tilesX * tilesY;

    // Charger et dessiner les tuiles
    for (let x = startX; x < startX + tilesX; x++) {
      for (let y = startY; y < startY + tilesY; y++) {
        if (x >= 0 && y >= 0 && x < Math.pow(2, zoom) && y < Math.pow(2, zoom)) {
          try {
            const tile = await loadTile(x, y, zoom);
            const pixel = tileToPixel(x, y, zoom, mapCenter.lat, mapCenter.lng, canvas.width, canvas.height);
            ctx.drawImage(tile, pixel.x - TILE_SIZE / 2, pixel.y - TILE_SIZE / 2);
            loadedTilesCount++;
          } catch (error) {
            loadedTilesCount++;
          }
        } else {
          loadedTilesCount++;
        }
      }
    }

    // Marquer les tuiles comme chargées une fois toutes les tuiles traitées
    if (loadedTilesCount >= totalTiles * 0.8) { // Au moins 80% des tuiles chargées
      setTilesLoaded(true);
    }

    // Dessiner la position de l'utilisateur
    if (userLocation) {
      const userPixel = latLngToPixel(userLocation.lat, userLocation.lng);
      if (userPixel.x >= 0 && userPixel.x <= canvas.width && userPixel.y >= 0 && userPixel.y <= canvas.height) {
        ctx.beginPath();
        ctx.arc(userPixel.x, userPixel.y, 8, 0, 2 * Math.PI);
        ctx.fillStyle = '#3b82f6';
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 3;
        ctx.stroke();
      }
    }

    // Dessiner TOUS les marqueurs de garages
    garages.forEach((garage, index) => {
      const pixel = latLngToPixel(garage.coordinates.lat, garage.coordinates.lng);
      
      // Vérifier si le marqueur est visible sur la carte
      if (pixel.x >= -20 && pixel.x <= canvas.width + 20 && pixel.y >= -20 && pixel.y <= canvas.height + 20) {
        // Dessiner le marqueur avec une couleur distinctive
        ctx.beginPath();
        ctx.arc(pixel.x, pixel.y, 14, 0, 2 * Math.PI);
        ctx.fillStyle = '#ef4444';
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 3;
        ctx.stroke();

        // Dessiner le prix avec un fond pour la lisibilité
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.fillRect(pixel.x - 15, pixel.y - 8, 30, 16);
        
        ctx.fillStyle = '#1f2937';
        ctx.font = 'bold 10px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(`${garage.priceForService}€`, pixel.x, pixel.y + 3);
        
      } else {
      }
    });

  };

  // Gérer les événements de souris
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setLastMousePos({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;

    const deltaX = e.clientX - lastMousePos.x;
    const deltaY = e.clientY - lastMousePos.y;

    // Convertir le déplacement en coordonnées géographiques
    const scale = Math.pow(2, zoom) * TILE_SIZE / 360;
    const newLng = mapCenter.lng - deltaX / scale;
    const newLat = mapCenter.lat + deltaY / scale * Math.cos(mapCenter.lat * Math.PI / 180);

    setMapCenter({ lat: newLat, lng: newLng });
    setLastMousePos({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = () => {
    if (isDragging) {
      setIsDragging(false);
      onMapMove?.(mapCenter, zoom);
    }
  };

  const handleMouseClick = (e: React.MouseEvent) => {
    if (isDragging) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Vérifier si on a cliqué sur un garage avec une tolérance plus large
    for (const garage of garages) {
      const pixel = latLngToPixel(garage.coordinates.lat, garage.coordinates.lng);
      const distance = Math.sqrt(Math.pow(x - pixel.x, 2) + Math.pow(y - pixel.y, 2));
      if (distance <= 16) { // Augmenter la zone de clic
        setSelectedGarage(garage);
        return;
      }
    }

    setSelectedGarage(null);
  };

  const handleZoomIn = () => {
    if (zoom < MAX_ZOOM) {
      setZoom(prev => prev + 1);
    }
  };

  const handleZoomOut = () => {
    if (zoom > MIN_ZOOM) {
      setZoom(prev => prev - 1);
    }
  };

  // Mise à jour du centre de la carte
  useEffect(() => {
    setMapCenter(center);
    setTilesLoaded(false); // Réinitialiser le chargement des tuiles
  }, [center]);

  // Demander la géolocalisation
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
        }
      );
    }
  }, []);

  // Redessiner la carte quand les paramètres changent
  useEffect(() => {
    drawMap();
  }, [mapCenter, zoom, garages, userLocation, tilesLoaded]);

  // Ajuster la taille du canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const resizeCanvas = () => {
      const rect = container.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
      setTilesLoaded(false); // Redessiner après redimensionnement
      drawMap();
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    return () => window.removeEventListener('resize', resizeCanvas);
  }, []);

  return (
    <div ref={containerRef} className="relative w-full h-96 border rounded-lg overflow-hidden">
      <canvas
        ref={canvasRef}
        className="w-full h-full cursor-grab active:cursor-grabbing"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onClick={handleMouseClick}
      />
      
      {/* Contrôles de zoom */}
      <div className="absolute top-4 left-4 flex flex-col gap-1">
        <Button
          size="sm"
          variant="outline"
          className="w-8 h-8 p-0 bg-white"
          onClick={handleZoomIn}
          disabled={zoom >= MAX_ZOOM}
        >
          <Plus className="w-4 h-4" />
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="w-8 h-8 p-0 bg-white"
          onClick={handleZoomOut}
          disabled={zoom <= MIN_ZOOM}
        >
          <Minus className="w-4 h-4" />
        </Button>
      </div>

      {/* Indicateur de chargement */}
      {!tilesLoaded && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white bg-opacity-90 px-4 py-2 rounded-lg shadow-lg">
          <p className="text-sm text-gray-600">Chargement de la carte...</p>
        </div>
      )}

      {/* Popup d'information du garage */}
      {selectedGarage && (
        <div className="absolute top-4 right-4 bg-white p-4 rounded-lg shadow-lg max-w-xs">
          <div className="space-y-3">
            <div>
              <h3 className="font-semibold text-base text-gray-900 mb-1">
                {selectedGarage.name}
              </h3>
              <p className="text-sm text-gray-600 flex items-center gap-1 mb-1">
                <MapPin className="w-3 h-3" />
                {selectedGarage.address}
              </p>
              <div className="flex items-center gap-2 text-sm">
                <div className="flex items-center gap-1">
                  <Star className="w-3 h-3 text-yellow-500 fill-current" />
                  <span className="font-medium">{selectedGarage.rating}</span>
                </div>
                <span className="text-gray-500">•</span>
                <span className="text-gray-600">{selectedGarage.distance} km</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1 text-lg font-bold text-green-600">
                <Euro className="w-4 h-4" />
                {selectedGarage.priceForService}
              </div>
              <Button
                onClick={() => onReserve(selectedGarage)}
                size="sm"
                className="text-xs"
              >
                Réserver
              </Button>
            </div>
            
            <p className="text-xs text-gray-500">
              pour {selectedService}
            </p>
          </div>
        </div>
      )}

      {/* Attribution OpenStreetMap */}
      <div className="absolute bottom-2 right-2 text-xs text-gray-500 bg-white bg-opacity-75 px-2 py-1 rounded">
        © <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a>
      </div>
    </div>
  );
};

export default OpenStreetMapComponent;
