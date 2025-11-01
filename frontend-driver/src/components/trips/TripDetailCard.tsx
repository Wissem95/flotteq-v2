import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Calendar, MapPin, FileText } from 'lucide-react';
import type { Trip } from '../../types/trip.types';
import { TripStats } from './TripStats';
import { PhotoGallery } from './PhotoGallery';
import { ComparisonCard } from './ComparisonCard';
import { DefectCard } from './DefectCard';

interface TripDetailCardProps {
  trip: Trip;
}

export const TripDetailCard: React.FC<TripDetailCardProps> = ({ trip }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const startDate = new Date(trip.startedAt);
  const endDate = trip.endedAt ? new Date(trip.endedAt) : null;

  const totalDefectsCount = (trip.startDefects?.length || 0) + (trip.endDefects?.length || 0);
  const newDefects = trip.endDefects?.filter(
    (ed) => !trip.startDefects?.some((sd) => sd.id === ed.id)
  ) || [];

  const photoLabels = ['Avant', 'Arrière', 'Gauche', 'Droite'];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Header - Always visible */}
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              {trip.vehicle?.brand} {trip.vehicle?.model}
            </h3>
            <p className="text-sm text-gray-600">{trip.vehicle?.registration}</p>
          </div>
          <span
            className={`px-3 py-1 rounded-full text-sm font-medium ${
              trip.status === 'completed'
                ? 'bg-green-100 text-green-700'
                : trip.status === 'in_progress'
                ? 'bg-blue-100 text-blue-700'
                : 'bg-gray-100 text-gray-700'
            }`}
          >
            {trip.status === 'completed'
              ? 'Terminé'
              : trip.status === 'in_progress'
              ? 'En cours'
              : trip.status}
          </span>
        </div>

        {/* Date */}
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
          <Calendar className="w-4 h-4" />
          <span>
            {startDate.toLocaleDateString('fr-FR', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </span>
          {endDate && (
            <>
              <span>→</span>
              <span>
                {endDate.toLocaleDateString('fr-FR', {
                  day: '2-digit',
                  month: 'short',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </>
          )}
        </div>

        {/* Stats compactes */}
        <TripStats
          startKm={trip.startKm}
          endKm={trip.endKm}
          startFuelLevel={trip.startFuelLevel}
          endFuelLevel={trip.endFuelLevel}
          distanceKm={trip.distanceKm}
          durationMinutes={trip.durationMinutes}
          defectsCount={totalDefectsCount}
          compact
        />

        {/* Toggle button */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="mt-4 w-full flex items-center justify-center gap-2 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
        >
          <span className="font-medium">
            {isExpanded ? 'Masquer les détails' : 'Voir les détails'}
          </span>
          {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </button>
      </div>

      {/* Expanded content */}
      {isExpanded && (
        <div className="border-t border-gray-200 p-6 space-y-6 bg-gray-50">
          {/* Stats détaillées */}
          {trip.endKm !== null && (
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-4">📊 Statistiques</h4>
              <TripStats
                startKm={trip.startKm}
                endKm={trip.endKm}
                startFuelLevel={trip.startFuelLevel}
                endFuelLevel={trip.endFuelLevel}
                distanceKm={trip.distanceKm}
                durationMinutes={trip.durationMinutes}
                defectsCount={totalDefectsCount}
              />
            </div>
          )}

          {/* Comparaison */}
          {trip.endKm !== null && trip.endFuelLevel !== null && (
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-4">🔄 Comparaison</h4>
              <ComparisonCard
                startKm={trip.startKm}
                endKm={trip.endKm}
                startFuel={trip.startFuelLevel}
                endFuel={trip.endFuelLevel}
                startDefects={trip.startDefects || []}
                endDefects={trip.endDefects || []}
              />
            </div>
          )}

          {/* Photos départ */}
          {trip.startPhotos && trip.startPhotos.length > 0 && (
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-4">📷 Photos Départ</h4>
              <PhotoGallery
                photos={trip.startPhotos}
                labels={photoLabels.slice(0, trip.startPhotos.length)}
                title=""
              />
            </div>
          )}

          {/* Photos retour */}
          {trip.endPhotos && trip.endPhotos.length > 0 && (
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-4">📷 Photos Retour</h4>
              <PhotoGallery
                photos={trip.endPhotos}
                labels={photoLabels.slice(0, trip.endPhotos.length)}
                title=""
              />
            </div>
          )}

          {/* Défauts départ */}
          {trip.startDefects && trip.startDefects.length > 0 && (
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-4">
                ⚠️ Défauts constatés au départ ({trip.startDefects.length})
              </h4>
              <div className="space-y-3">
                {trip.startDefects.map((defect) => (
                  <DefectCard key={defect.id} defect={defect} readonly />
                ))}
              </div>
            </div>
          )}

          {/* Nouveaux défauts retour */}
          {newDefects.length > 0 && (
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <span className="px-2 py-1 bg-red-100 text-red-700 rounded text-sm">NOUVEAU</span>
                Défauts constatés au retour ({newDefects.length})
              </h4>
              <div className="space-y-3">
                {newDefects.map((defect) => (
                  <DefectCard key={defect.id} defect={defect} readonly />
                ))}
              </div>
            </div>
          )}

          {/* Défauts déjà présents aussi au retour */}
          {trip.endDefects && trip.endDefects.length > newDefects.length && (
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-4">
                ⚠️ Défauts toujours présents ({trip.endDefects.length - newDefects.length})
              </h4>
              <div className="space-y-3">
                {trip.endDefects
                  .filter((ed) => !newDefects.some((nd) => nd.id === ed.id))
                  .map((defect) => (
                    <DefectCard key={defect.id} defect={defect} readonly />
                  ))}
              </div>
            </div>
          )}

          {/* Notes départ */}
          {trip.startNotes && (
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Notes de départ
              </h4>
              <div className="p-4 bg-white rounded-lg border border-gray-200">
                <p className="text-gray-700 whitespace-pre-wrap">{trip.startNotes}</p>
              </div>
            </div>
          )}

          {/* Notes retour */}
          {trip.endNotes && (
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Notes de retour
              </h4>
              <div className="p-4 bg-white rounded-lg border border-gray-200">
                <p className="text-gray-700 whitespace-pre-wrap">{trip.endNotes}</p>
              </div>
            </div>
          )}

          {/* Localisation GPS si disponible */}
          {(trip.startLocation || trip.endLocation) && (
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Localisation GPS
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {trip.startLocation && (
                  <div className="p-4 bg-white rounded-lg border border-gray-200">
                    <p className="text-sm text-gray-600 mb-1">Départ</p>
                    <p className="text-sm font-mono text-gray-900">
                      {trip.startLocation.lat.toFixed(6)}, {trip.startLocation.lng.toFixed(6)}
                    </p>
                  </div>
                )}
                {trip.endLocation && (
                  <div className="p-4 bg-white rounded-lg border border-gray-200">
                    <p className="text-sm text-gray-600 mb-1">Retour</p>
                    <p className="text-sm font-mono text-gray-900">
                      {trip.endLocation.lat.toFixed(6)}, {trip.endLocation.lng.toFixed(6)}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ID du trajet (pour support/debug) */}
          <div className="pt-4 border-t border-gray-200">
            <p className="text-xs text-gray-500">
              <span className="font-medium">ID trajet :</span> {trip.id}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
