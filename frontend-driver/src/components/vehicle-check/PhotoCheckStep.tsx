import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, Camera } from 'lucide-react';

interface PhotoCheckStepProps {
  photos: File[];
  onChange: (photos: File[]) => void;
}

export const PhotoCheckStep: React.FC<PhotoCheckStepProps> = ({ photos, onChange }) => {
  const [previews, setPreviews] = useState<{ file: File; preview: string }[]>([]);

  const maxPhotos = 5;
  const remainingSlots = maxPhotos - photos.length - previews.length;

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const filesToAdd = acceptedFiles.slice(0, remainingSlots);

      const newPreviews = filesToAdd.map((file) => ({
        file,
        preview: URL.createObjectURL(file),
      }));

      setPreviews((prev) => [...prev, ...newPreviews]);

      // Ajouter immédiatement aux photos
      const updatedPhotos = [...photos, ...filesToAdd];
      onChange(updatedPhotos);
    },
    [remainingSlots, photos, onChange]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp'],
    },
    maxFiles: remainingSlots,
    disabled: remainingSlots <= 0,
  });

  const removePhoto = (index: number) => {
    // Supprimer de la liste des photos
    const updatedPhotos = photos.filter((_, i) => i !== index);
    onChange(updatedPhotos);

    // Supprimer le preview
    if (previews[index]) {
      URL.revokeObjectURL(previews[index].preview);
      setPreviews((prev) => prev.filter((_, i) => i !== index));
    }
  };

  const canAddMore = remainingSlots > 0;

  return (
    <div className="space-y-6">
      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
          <Camera className="w-5 h-5" />
          Photographiez votre véhicule
        </h3>
        <p className="text-sm text-blue-800">
          Prenez entre 2 et 5 photos du véhicule pour documenter son état actuel. Incluez des vues
          générales et des détails si nécessaire.
        </p>
      </div>

      {/* Photo Counter */}
      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
        <span className="text-gray-700 font-medium">Photos ajoutées</span>
        <span className="text-2xl font-bold text-flotteq-blue">
          {photos.length} / {maxPhotos}
        </span>
      </div>

      {/* Dropzone / Camera Input */}
      {canAddMore && (
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
            isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
          }`}
        >
          <input {...getInputProps()} capture="environment" />
          <Camera className="mx-auto h-16 w-16 text-gray-400 mb-4" />
          {isDragActive ? (
            <p className="text-blue-600 text-lg font-medium">Déposez les photos ici...</p>
          ) : (
            <div>
              <p className="text-gray-700 mb-2 text-lg font-medium">
                📸 Prendre une photo ou sélectionner
              </p>
              <p className="text-sm text-gray-500">
                Appuyez pour ouvrir la caméra ou sélectionner depuis la galerie
              </p>
              <p className="text-xs text-gray-400 mt-2">
                {remainingSlots} photo{remainingSlots > 1 ? 's' : ''} restante{remainingSlots > 1 ? 's' : ''}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Photos Preview Grid */}
      {photos.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
            <Upload className="w-4 h-4" />
            Photos du véhicule ({photos.length})
          </h4>
          <div className="grid grid-cols-2 gap-4">
            {photos.map((photo, index) => {
              const preview = previews[index]?.preview || URL.createObjectURL(photo);
              return (
                <div key={index} className="relative group">
                  <img
                    src={preview}
                    alt={`Photo du véhicule ${index + 1}`}
                    className="w-full h-40 object-cover rounded-lg border-2 border-gray-200"
                  />
                  <button
                    type="button"
                    onClick={() => removePhoto(index)}
                    className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:bg-red-600"
                    aria-label={`Supprimer photo ${index + 1}`}
                  >
                    <X className="w-4 h-4" />
                  </button>
                  <div className="absolute bottom-2 left-2 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded">
                    Photo {index + 1}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Validation Message */}
      {photos.length < 2 && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <p className="text-sm text-orange-800">
            ⚠️ <strong>Minimum 2 photos requises</strong> pour valider le check véhicule.
          </p>
        </div>
      )}

      {photos.length >= maxPhotos && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-sm text-green-800">
            ✅ <strong>Maximum atteint !</strong> Vous avez ajouté {maxPhotos} photos.
          </p>
        </div>
      )}

      {/* Info Box */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <p className="text-sm text-gray-700">
          <strong>💡 Conseil :</strong> Prenez des photos claires et bien éclairées. Incluez les 4 côtés du
          véhicule et tout problème détecté lors de la checklist.
        </p>
      </div>
    </div>
  );
};
