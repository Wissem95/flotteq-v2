import React from 'react';
import { Camera, Images } from 'lucide-react';
import { PhotoGrid } from './PhotoGrid';
import { PhotoUpload } from './PhotoUpload';

interface PhotosStepProps {
  photos: {
    front?: string;
    back?: string;
    left?: string;
    right?: string;
  };
  onPhotoSelect: (position: 'front' | 'back' | 'left' | 'right', file: File) => void;
  onPhotoRemove: (position: 'front' | 'back' | 'left' | 'right') => void;
}

export const PhotosStep: React.FC<PhotosStepProps> = ({
  photos,
  onPhotoSelect,
  onPhotoRemove,
}) => {
  const photosCount = Object.values(photos).filter(Boolean).length;
  const positions: Array<'front' | 'back' | 'left' | 'right'> = ['front', 'back', 'left', 'right'];

  const handleMultiplePhotos = (files: File[]) => {
    // Distribuer les photos aux slots vides
    const emptyPositions = positions.filter((pos) => !photos[pos]);

    files.slice(0, emptyPositions.length).forEach((file, index) => {
      if (index < emptyPositions.length) {
        onPhotoSelect(emptyPositions[index], file);
      }
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Photos du véhicule</h2>
        <p className="text-gray-600">
          Prenez 4 photos du véhicule (avant, arrière, gauche, droite)
        </p>
      </div>

      <div className="bg-white rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Camera className="w-6 h-6 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">Photos obligatoires</h3>
          </div>
          <span
            className={`px-3 py-1 rounded-full text-sm font-medium ${
              photosCount === 4
                ? 'bg-green-100 text-green-700'
                : 'bg-gray-100 text-gray-700'
            }`}
          >
            {photosCount}/4 photos
          </span>
        </div>

        {/* Bouton multi-sélection */}
        {photosCount < 4 && (
          <div className="mb-6">
            <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border-2 border-dashed border-blue-300">
              <Images className="w-6 h-6 text-blue-600 flex-shrink-0" />
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900 mb-1">Sélection rapide</h4>
                <p className="text-sm text-gray-600">Sélectionnez plusieurs photos en une fois</p>
              </div>
              <div className="w-32">
                <PhotoUpload
                  multiple
                  maxFiles={4 - photosCount}
                  onPhotosSelect={handleMultiplePhotos}
                  label={`Choisir ${4 - photosCount} photos`}
                />
              </div>
            </div>
          </div>
        )}

        {/* Grille pour ajustements individuels */}
        <PhotoGrid
          photos={photos}
          onPhotoSelect={onPhotoSelect}
          onPhotoRemove={onPhotoRemove}
        />

        {photosCount < 4 && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              📷 Il vous reste <strong>{4 - photosCount} photo(s)</strong> à prendre
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
