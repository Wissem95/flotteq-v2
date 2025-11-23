import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { Trip } from '../../types/trip.types';

// Fix Leaflet default marker icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface TripsMapProps {
  trips: Trip[];
  height?: number;
}

export const TripsMap: React.FC<TripsMapProps> = ({ trips, height = 400 }) => {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Initialize map
    if (!mapRef.current) {
      mapRef.current = L.map(mapContainerRef.current).setView([46.603354, 1.888334], 6); // Center of France

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(mapRef.current);
    }

    const map = mapRef.current;

    // Clear existing markers
    map.eachLayer((layer) => {
      if (layer instanceof L.Marker) {
        map.removeLayer(layer);
      }
    });

    // Add markers for trips with GPS data
    const bounds: L.LatLngBounds[] = [];

    trips.forEach((trip) => {
      // Start location
      if (trip.startLocation?.lat && trip.startLocation?.lng) {
        const startMarker = L.marker([trip.startLocation.lat, trip.startLocation.lng], {
          icon: L.icon({
            iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
            shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
            shadowSize: [41, 41],
          }),
        });

        startMarker.bindPopup(`
          <div style="min-width: 200px;">
            <h3 style="font-weight: bold; margin-bottom: 8px;">Départ</h3>
            <p style="margin: 4px 0;"><strong>Conducteur:</strong> ${trip.driver?.firstName} ${trip.driver?.lastName}</p>
            <p style="margin: 4px 0;"><strong>Véhicule:</strong> ${trip.vehicle?.registration}</p>
            <p style="margin: 4px 0;"><strong>Date:</strong> ${new Date(trip.startedAt).toLocaleString('fr-FR')}</p>
            ${trip.distanceKm ? `<p style="margin: 4px 0;"><strong>Distance:</strong> ${trip.distanceKm} km</p>` : ''}
          </div>
        `);

        startMarker.addTo(map);
        bounds.push(L.latLngBounds([trip.startLocation.lat, trip.startLocation.lng], [trip.startLocation.lat, trip.startLocation.lng]));
      }

      // End location
      if (trip.endLocation?.lat && trip.endLocation?.lng) {
        const endMarker = L.marker([trip.endLocation.lat, trip.endLocation.lng], {
          icon: L.icon({
            iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
            shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
            shadowSize: [41, 41],
          }),
        });

        endMarker.bindPopup(`
          <div style="min-width: 200px;">
            <h3 style="font-weight: bold; margin-bottom: 8px;">Arrivée</h3>
            <p style="margin: 4px 0;"><strong>Conducteur:</strong> ${trip.driver?.firstName} ${trip.driver?.lastName}</p>
            <p style="margin: 4px 0;"><strong>Véhicule:</strong> ${trip.vehicle?.registration}</p>
            ${trip.endedAt ? `<p style="margin: 4px 0;"><strong>Date:</strong> ${new Date(trip.endedAt).toLocaleString('fr-FR')}</p>` : ''}
            ${trip.distanceKm ? `<p style="margin: 4px 0;"><strong>Distance:</strong> ${trip.distanceKm} km</p>` : ''}
          </div>
        `);

        endMarker.addTo(map);
        bounds.push(L.latLngBounds([trip.endLocation.lat, trip.endLocation.lng], [trip.endLocation.lat, trip.endLocation.lng]));

        // Draw line between start and end if both exist
        if (trip.startLocation?.lat && trip.startLocation?.lng) {
          const polyline = L.polyline([
            [trip.startLocation.lat, trip.startLocation.lng],
            [trip.endLocation.lat, trip.endLocation.lng],
          ], {
            color: '#3b82f6',
            weight: 3,
            opacity: 0.6,
          });
          polyline.addTo(map);
        }
      }
    });

    // Fit bounds to show all markers
    if (bounds.length > 0) {
      const group = new L.FeatureGroup(bounds.map(b => L.marker(b.getCenter())));
      map.fitBounds(group.getBounds().pad(0.1));
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [trips]);

  return (
    <div className="relative">
      <div
        ref={mapContainerRef}
        style={{ height: `${height}px` }}
        className="rounded-lg border border-gray-200 shadow-sm"
      />
      {trips.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-50 bg-opacity-90 rounded-lg">
          <p className="text-gray-500">Aucun trajet avec localisation GPS</p>
        </div>
      )}
    </div>
  );
};
