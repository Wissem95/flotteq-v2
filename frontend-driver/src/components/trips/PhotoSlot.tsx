import React from 'react';
import { PhotoUpload } from './PhotoUpload';

interface PhotoSlotProps {
  label: string;
  photo?: string;
  onPhotoSelect: (file: File) => void;
  onRemove: () => void;
  disabled?: boolean;
}

export const PhotoSlot: React.FC<PhotoSlotProps> = ({
  label,
  photo,
  onPhotoSelect,
  onRemove,
  disabled = false,
}) => {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      <PhotoUpload
        preview={photo}
        onPhotoSelect={onPhotoSelect}
        onRemove={photo ? onRemove : undefined}
        label={`Photo ${label.toLowerCase()}`}
        disabled={disabled}
      />
    </div>
  );
};
