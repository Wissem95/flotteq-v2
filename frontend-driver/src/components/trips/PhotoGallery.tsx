import React, { useState } from 'react';
import { X, ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react';

interface PhotoGalleryProps {
  photos: string[];
  labels?: string[];
  title?: string;
}

export const PhotoGallery: React.FC<PhotoGalleryProps> = ({
  photos,
  labels = ['Photo 1', 'Photo 2', 'Photo 3', 'Photo 4'],
  title = 'Photos',
}) => {
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number | null>(null);

  const openLightbox = (index: number) => {
    setSelectedPhotoIndex(index);
  };

  const closeLightbox = () => {
    setSelectedPhotoIndex(null);
  };

  const goToPrevious = () => {
    if (selectedPhotoIndex !== null && selectedPhotoIndex > 0) {
      setSelectedPhotoIndex(selectedPhotoIndex - 1);
    }
  };

  const goToNext = () => {
    if (selectedPhotoIndex !== null && selectedPhotoIndex < photos.length - 1) {
      setSelectedPhotoIndex(selectedPhotoIndex + 1);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') goToPrevious();
    if (e.key === 'ArrowRight') goToNext();
  };

  if (!photos || photos.length === 0) {
    return (
      <div className="text-sm text-gray-500 italic">
        Aucune photo disponible
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h4 className="text-sm font-semibold text-gray-700">{title}</h4>

      {/* Grid de photos */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {photos.map((photo, index) => (
          <div
            key={index}
            className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden cursor-pointer group"
            onClick={() => openLightbox(index)}
          >
            <img
              src={photo}
              alt={labels[index] || `Photo ${index + 1}`}
              className="w-full h-full object-cover transition-transform group-hover:scale-110"
            />
            {/* Overlay au hover */}
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all flex items-center justify-center">
              <ZoomIn className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            {/* Label */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2">
              <p className="text-xs text-white font-medium">
                {labels[index] || `Photo ${index + 1}`}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox Modal */}
      {selectedPhotoIndex !== null && (
        <div
          className="fixed inset-0 bg-black bg-opacity-95 z-50 flex items-center justify-center"
          onClick={closeLightbox}
          onKeyDown={handleKeyDown}
          tabIndex={0}
        >
          {/* Close button */}
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors z-10"
          >
            <X className="w-8 h-8" />
          </button>

          {/* Navigation gauche */}
          {selectedPhotoIndex > 0 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                goToPrevious();
              }}
              className="absolute left-4 text-white hover:text-gray-300 transition-colors z-10"
            >
              <ChevronLeft className="w-12 h-12" />
            </button>
          )}

          {/* Navigation droite */}
          {selectedPhotoIndex < photos.length - 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                goToNext();
              }}
              className="absolute right-4 text-white hover:text-gray-300 transition-colors z-10"
            >
              <ChevronRight className="w-12 h-12" />
            </button>
          )}

          {/* Image */}
          <div
            className="max-w-7xl max-h-[90vh] w-full h-full flex items-center justify-center p-8"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={photos[selectedPhotoIndex]}
              alt={labels[selectedPhotoIndex] || `Photo ${selectedPhotoIndex + 1}`}
              className="max-w-full max-h-full object-contain"
            />
          </div>

          {/* Counter et label */}
          <div className="absolute bottom-4 left-0 right-0 text-center text-white">
            <p className="text-lg font-medium mb-1">
              {labels[selectedPhotoIndex] || `Photo ${selectedPhotoIndex + 1}`}
            </p>
            <p className="text-sm text-gray-300">
              {selectedPhotoIndex + 1} / {photos.length}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
