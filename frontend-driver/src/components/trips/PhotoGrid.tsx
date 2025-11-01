import React from 'react';
import { PhotoSlot } from './PhotoSlot';

interface PhotoGridProps {
  photos: {
    front?: string;
    back?: string;
    left?: string;
    right?: string;
  };
  onPhotoSelect: (position: 'front' | 'back' | 'left' | 'right', file: File) => void;
  onPhotoRemove: (position: 'front' | 'back' | 'left' | 'right') => void;
  disabled?: boolean;
}

export const PhotoGrid: React.FC<PhotoGridProps> = ({
  photos,
  onPhotoSelect,
  onPhotoRemove,
  disabled = false,
}) => {
  return (
    <div className="grid grid-cols-2 gap-4">
      <PhotoSlot
        label="Avant"
        photo={photos.front}
        onPhotoSelect={(file) => onPhotoSelect('front', file)}
        onRemove={() => onPhotoRemove('front')}
        disabled={disabled}
      />
      <PhotoSlot
        label="Arrière"
        photo={photos.back}
        onPhotoSelect={(file) => onPhotoSelect('back', file)}
        onRemove={() => onPhotoRemove('back')}
        disabled={disabled}
      />
      <PhotoSlot
        label="Gauche"
        photo={photos.left}
        onPhotoSelect={(file) => onPhotoSelect('left', file)}
        onRemove={() => onPhotoRemove('left')}
        disabled={disabled}
      />
      <PhotoSlot
        label="Droite"
        photo={photos.right}
        onPhotoSelect={(file) => onPhotoSelect('right', file)}
        onRemove={() => onPhotoRemove('right')}
        disabled={disabled}
      />
    </div>
  );
};
