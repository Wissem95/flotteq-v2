import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { vehiclesService } from '../../api/services/vehicles.service';
import { PhotoUploadZone } from './PhotoUploadZone';
import { Plus, Trash2, ZoomIn } from 'lucide-react';
import { ProtectedButton } from '@/components/common/ProtectedButton';

interface VehiclePhotosProps {
  vehicleId: string;
}

export default function VehiclePhotos({ vehicleId }: VehiclePhotosProps) {
  const queryClient = useQueryClient();
  const [showUpload, setShowUpload] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);

  const { data: vehicle, isLoading } = useQuery({
    queryKey: ['vehicle', vehicleId],
    queryFn: () => vehiclesService.getVehicleById(vehicleId),
  });

  const uploadMutation = useMutation({
    mutationFn: (files: File[]) => vehiclesService.uploadPhotos(vehicleId, files),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicle', vehicleId] });
      setShowUpload(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (photoUrl: string) => vehiclesService.deletePhoto(vehicleId, photoUrl),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicle', vehicleId] });
    },
  });

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-flotteq-blue"></div>
      </div>
    );
  }

  const photos = vehicle?.photos || [];
  const maxPhotos = 10;

  const handleDelete = (photoUrl: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette photo ?')) {
      deleteMutation.mutate(photoUrl);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Photos du véhicule ({photos.length}/{maxPhotos})
        </h3>
        {photos.length < maxPhotos && (
          <ProtectedButton
            onClick={() => setShowUpload(!showUpload)}
            permission="vehicles.update"
            disabledMessage="Vous n'avez pas la permission d'ajouter des photos"
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
          >
            <Plus className="w-4 h-4" />
            {showUpload ? 'Annuler' : 'Ajouter des photos'}
          </ProtectedButton>
        )}
      </div>

      {/* Upload Zone */}
      {showUpload && (
        <div className="mb-6">
          <PhotoUploadZone
            onUpload={(files) => uploadMutation.mutateAsync(files)}
            maxPhotos={maxPhotos}
            currentCount={photos.length}
          />
        </div>
      )}

      {/* Galerie */}
      {photos.length === 0 && !showUpload ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p className="mt-2 text-sm text-gray-500">Aucune photo disponible</p>
          <ProtectedButton
            onClick={() => setShowUpload(true)}
            permission="vehicles.update"
            disabledMessage="Vous n'avez pas la permission d'ajouter des photos"
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
          >
            Ajouter des photos
          </ProtectedButton>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {photos.map((photo, index) => (
            <div key={index} className="relative group">
              <img
                src={photo}
                alt={`Photo ${index + 1}`}
                className="w-full h-40 object-cover rounded-lg cursor-pointer"
                onClick={() => setSelectedPhoto(photo)}
              />
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all rounded-lg flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                <button
                  onClick={() => setSelectedPhoto(photo)}
                  className="p-2 bg-white rounded-full hover:bg-gray-100 transition-colors"
                  title="Voir en grand"
                >
                  <ZoomIn className="w-5 h-5 text-gray-700" />
                </button>
                <ProtectedButton
                  onClick={() => handleDelete(photo)}
                  disabled={deleteMutation.isPending}
                  permission="vehicles.delete"
                  disabledMessage="Vous n'avez pas la permission de supprimer des photos"
                  className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors disabled:opacity-50"
                  title="Supprimer"
                >
                  <Trash2 className="w-5 h-5" />
                </ProtectedButton>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Lightbox */}
      {selectedPhoto && (
        <div
          className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedPhoto(null)}
        >
          <button
            onClick={() => setSelectedPhoto(null)}
            className="absolute top-4 right-4 text-white hover:text-gray-300 text-2xl"
          >
            ✕
          </button>
          <img
            src={selectedPhoto}
            alt="Photo agrandie"
            className="max-w-full max-h-full object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}
