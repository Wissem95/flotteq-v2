import React, { useState } from 'react';
import {
  X,
  MapPin,
  Gauge,
  Fuel,
  Clock,
  AlertTriangle,
  FileText,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  Download,
} from 'lucide-react';
import { exportTripDetailToPDF } from '../../utils/pdf/tripDetailPdfExport';
import type { Trip, VehicleDefect, DefectSeverity, DefectType } from '../../types/trip.types';

interface TripDetailModalProps {
  trip: Trip;
  onClose: () => void;
}

const defectTypeLabels: Record<DefectType, string> = {
  scratch: 'Rayure',
  dent: 'Bosse',
  broken: 'Cassé',
  dirty: 'Sale',
  missing: 'Manquant',
  other: 'Autre',
};

const severityConfig: Record<
  DefectSeverity,
  { label: string; bgClass: string; textClass: string }
> = {
  minor: { label: 'Mineur', bgClass: 'bg-yellow-100', textClass: 'text-yellow-700' },
  moderate: { label: 'Modéré', bgClass: 'bg-orange-100', textClass: 'text-orange-700' },
  severe: { label: 'Grave', bgClass: 'bg-red-100', textClass: 'text-red-700' },
};

const PhotoLightbox: React.FC<{
  photos: string[];
  labels: string[];
  onClose: () => void;
  initialIndex: number;
}> = ({ photos, labels, onClose, initialIndex }) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  const goToPrev = () => {
    if (currentIndex > 0) setCurrentIndex(currentIndex - 1);
  };

  const goToNext = () => {
    if (currentIndex < photos.length - 1) setCurrentIndex(currentIndex + 1);
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-95 z-[60] flex items-center justify-center"
      onClick={onClose}
    >
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-white hover:text-gray-300"
      >
        <X className="w-8 h-8" />
      </button>

      {currentIndex > 0 && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            goToPrev();
          }}
          className="absolute left-4 text-white hover:text-gray-300"
        >
          <ChevronLeft className="w-12 h-12" />
        </button>
      )}

      {currentIndex < photos.length - 1 && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            goToNext();
          }}
          className="absolute right-4 text-white hover:text-gray-300"
        >
          <ChevronRight className="w-12 h-12" />
        </button>
      )}

      <div className="max-w-7xl max-h-[90vh] p-8" onClick={(e) => e.stopPropagation()}>
        <img
          src={photos[currentIndex]}
          alt={labels[currentIndex]}
          className="max-w-full max-h-full object-contain"
        />
      </div>

      <div className="absolute bottom-4 left-0 right-0 text-center text-white">
        <p className="text-lg font-medium mb-1">{labels[currentIndex]}</p>
        <p className="text-sm text-gray-300">
          {currentIndex + 1} / {photos.length}
        </p>
      </div>
    </div>
  );
};

const DefectCard: React.FC<{ defect: VehicleDefect }> = ({ defect }) => {
  const severity = severityConfig[defect.severity];

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
      <div className="flex items-start gap-3 mb-3">
        <div className={`p-2 rounded-lg ${severity.bgClass}`}>
          <AlertTriangle className={`w-5 h-5 ${severity.textClass}`} />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-semibold text-gray-900">{defectTypeLabels[defect.type]}</h4>
            <span
              className={`px-2 py-0.5 text-xs font-medium rounded-full ${severity.bgClass} ${severity.textClass}`}
            >
              {severity.label}
            </span>
          </div>
          <p className="text-sm text-gray-600 mb-1">
            <span className="font-medium">Localisation:</span> {defect.location}
          </p>
          <p className="text-sm text-gray-700">{defect.description}</p>
        </div>
      </div>

      {defect.photos && defect.photos.length > 0 && (
        <div className="grid grid-cols-3 gap-2 mt-3">
          {defect.photos.map((photo, idx) => (
            <img
              key={idx}
              src={photo}
              alt={`Défaut ${idx + 1}`}
              className="w-full h-20 object-cover rounded border border-gray-200"
            />
          ))}
        </div>
      )}
    </div>
  );
};

export const TripDetailModal: React.FC<TripDetailModalProps> = ({ trip, onClose }) => {
  const [lightboxPhotos, setLightboxPhotos] = useState<{
    photos: string[];
    labels: string[];
    index: number;
  } | null>(null);

  const startDate = new Date(trip.startedAt);
  const endDate = trip.endedAt ? new Date(trip.endedAt) : null;

  const photoLabels = ['Avant', 'Arrière', 'Gauche', 'Droite'];

  const newDefects = trip.endDefects?.filter(
    (ed) => !trip.startDefects?.some((sd) => sd.id === ed.id)
  ) || [];

  const openLightbox = (photos: string[], labels: string[], index: number) => {
    setLightboxPhotos({ photos, labels, index });
  };

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {trip.vehicle?.brand} {trip.vehicle?.model}
              </h2>
              <p className="text-sm text-gray-600">{trip.vehicle?.registration}</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => exportTripDetailToPDF(trip)}
                className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Download className="w-4 h-4" />
                <span className="text-sm">PDF</span>
              </button>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Info générale */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">📋 Informations</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-600 mb-1">Conducteur</p>
                  <p className="font-medium text-gray-900">
                    {trip.driver?.firstName} {trip.driver?.lastName}
                  </p>
                  <p className="text-xs text-gray-500">{trip.driver?.email}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-600 mb-1">Status</p>
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
                      : 'Annulé'}
                  </span>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-600 mb-1">Départ</p>
                  <p className="text-sm font-medium text-gray-900">
                    {startDate.toLocaleDateString('fr-FR', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
                {endDate && (
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-600 mb-1">Retour</p>
                    <p className="text-sm font-medium text-gray-900">
                      {endDate.toLocaleDateString('fr-FR', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Statistiques */}
            {trip.distanceKm !== null && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">📊 Statistiques</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-blue-50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Gauge className="w-5 h-5 text-blue-600" />
                      <p className="text-xs text-blue-700">Distance</p>
                    </div>
                    <p className="text-2xl font-bold text-blue-900">
                      {trip.distanceKm.toLocaleString()} km
                    </p>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="w-5 h-5 text-purple-600" />
                      <p className="text-xs text-purple-700">Durée</p>
                    </div>
                    <p className="text-2xl font-bold text-purple-900">
                      {trip.durationMinutes
                        ? `${Math.floor(trip.durationMinutes / 60)}h${(trip.durationMinutes % 60)
                            .toString()
                            .padStart(2, '0')}`
                        : 'N/A'}
                    </p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Fuel className="w-5 h-5 text-green-600" />
                      <p className="text-xs text-green-700">Carburant</p>
                    </div>
                    <p className="text-2xl font-bold text-green-900">
                      {trip.endFuelLevel !== null
                        ? `${trip.endFuelLevel - trip.startFuelLevel > 0 ? '+' : ''}${
                            trip.endFuelLevel - trip.startFuelLevel
                          }%`
                        : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Comparaison */}
            {trip.endKm !== null && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">🔄 Comparaison</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-3">Départ</p>
                    <div className="space-y-2">
                      <p className="text-sm">
                        <span className="font-medium">Km:</span> {trip.startKm.toLocaleString()}
                      </p>
                      <p className="text-sm">
                        <span className="font-medium">Carburant:</span> {trip.startFuelLevel}%
                      </p>
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-3">Retour</p>
                    <div className="space-y-2">
                      <p className="text-sm">
                        <span className="font-medium">Km:</span> {trip.endKm.toLocaleString()}
                      </p>
                      <p className="text-sm">
                        <span className="font-medium">Carburant:</span> {trip.endFuelLevel}%
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Photos départ */}
            {trip.startPhotos && trip.startPhotos.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">📷 Photos Départ</h3>
                <div className="grid grid-cols-4 gap-3">
                  {trip.startPhotos.map((photo, idx) => (
                    <div
                      key={idx}
                      className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden cursor-pointer group"
                      onClick={() =>
                        openLightbox(
                          trip.startPhotos!,
                          photoLabels.slice(0, trip.startPhotos!.length),
                          idx
                        )
                      }
                    >
                      <img
                        src={photo}
                        alt={photoLabels[idx]}
                        className="w-full h-full object-cover transition-transform group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all flex items-center justify-center">
                        <ZoomIn className="w-8 h-8 text-white opacity-0 group-hover:opacity-100" />
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                        <p className="text-xs text-white font-medium">{photoLabels[idx]}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Photos retour */}
            {trip.endPhotos && trip.endPhotos.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">📷 Photos Retour</h3>
                <div className="grid grid-cols-4 gap-3">
                  {trip.endPhotos.map((photo, idx) => (
                    <div
                      key={idx}
                      className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden cursor-pointer group"
                      onClick={() =>
                        openLightbox(
                          trip.endPhotos!,
                          photoLabels.slice(0, trip.endPhotos!.length),
                          idx
                        )
                      }
                    >
                      <img
                        src={photo}
                        alt={photoLabels[idx]}
                        className="w-full h-full object-cover transition-transform group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all flex items-center justify-center">
                        <ZoomIn className="w-8 h-8 text-white opacity-0 group-hover:opacity-100" />
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                        <p className="text-xs text-white font-medium">{photoLabels[idx]}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Défauts départ */}
            {trip.startDefects && trip.startDefects.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  ⚠️ Défauts Départ ({trip.startDefects.length})
                </h3>
                <div className="space-y-3">
                  {trip.startDefects.map((defect) => (
                    <DefectCard key={defect.id} defect={defect} />
                  ))}
                </div>
              </div>
            )}

            {/* Nouveaux défauts retour */}
            {newDefects.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <span className="px-2 py-1 bg-red-100 text-red-700 rounded text-sm">
                    NOUVEAU
                  </span>
                  Défauts Retour ({newDefects.length})
                </h3>
                <div className="space-y-3">
                  {newDefects.map((defect) => (
                    <DefectCard key={defect.id} defect={defect} />
                  ))}
                </div>
              </div>
            )}

            {/* Notes */}
            {(trip.startNotes || trip.endNotes) && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Notes
                </h3>
                <div className="space-y-3">
                  {trip.startNotes && (
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-sm text-gray-600 mb-2">Départ</p>
                      <p className="text-gray-900">{trip.startNotes}</p>
                    </div>
                  )}
                  {trip.endNotes && (
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-sm text-gray-600 mb-2">Retour</p>
                      <p className="text-gray-900">{trip.endNotes}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* GPS */}
            {(trip.startLocation || trip.endLocation) && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Localisation GPS
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  {trip.startLocation && (
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-sm text-gray-600 mb-1">Départ</p>
                      <p className="text-sm font-mono text-gray-900">
                        {trip.startLocation.lat.toFixed(6)}, {trip.startLocation.lng.toFixed(6)}
                      </p>
                    </div>
                  )}
                  {trip.endLocation && (
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-sm text-gray-600 mb-1">Retour</p>
                      <p className="text-sm font-mono text-gray-900">
                        {trip.endLocation.lat.toFixed(6)}, {trip.endLocation.lng.toFixed(6)}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ID trajet */}
            <div className="pt-4 border-t border-gray-200">
              <p className="text-xs text-gray-500">
                <span className="font-medium">ID trajet :</span> {trip.id}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Lightbox */}
      {lightboxPhotos && (
        <PhotoLightbox
          photos={lightboxPhotos.photos}
          labels={lightboxPhotos.labels}
          initialIndex={lightboxPhotos.index}
          onClose={() => setLightboxPhotos(null)}
        />
      )}
    </>
  );
};
