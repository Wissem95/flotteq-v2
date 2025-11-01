import React, { useRef } from 'react';
import { Camera, Upload, X } from 'lucide-react';
import { isValidImageFile, isValidFileSize } from '../../utils/photo-utils';
import { toast } from 'react-hot-toast';

interface PhotoUploadProps {
  // Mode single (existant)
  onPhotoSelect?: (file: File) => void;

  // Mode multiple (nouveau)
  onPhotosSelect?: (files: File[]) => void;
  multiple?: boolean;
  maxFiles?: number;

  // Commun
  onRemove?: () => void;
  preview?: string;
  label?: string;
  disabled?: boolean;
}

export const PhotoUpload: React.FC<PhotoUploadProps> = ({
  onPhotoSelect,
  onPhotosSelect,
  multiple = false,
  maxFiles = 10,
  onRemove,
  preview,
  label = 'Ajouter une photo',
  disabled = false,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    if (multiple && onPhotosSelect) {
      // Mode multiple : valider et traiter tous les fichiers
      const validFiles: File[] = [];
      const fileArray = Array.from(files).slice(0, maxFiles);

      for (const file of fileArray) {
        if (!isValidImageFile(file)) {
          toast.error(`${file.name}: Format non valide. Utilisez JPG, PNG ou WebP.`);
          continue;
        }

        if (!isValidFileSize(file, 10)) {
          toast.error(`${file.name}: Fichier trop volumineux. Maximum 10 MB.`);
          continue;
        }

        validFiles.push(file);
      }

      if (validFiles.length > 0) {
        onPhotosSelect(validFiles);
        if (validFiles.length < fileArray.length) {
          toast.success(`${validFiles.length}/${fileArray.length} photos sélectionnées`);
        }
      }
    } else {
      // Mode single : traiter seulement le premier fichier
      const file = files[0];

      if (!isValidImageFile(file)) {
        toast.error('Format de fichier non valide. Utilisez JPG, PNG ou WebP.');
        return;
      }

      if (!isValidFileSize(file, 10)) {
        toast.error('Fichier trop volumineux. Maximum 10 MB.');
        return;
      }

      onPhotoSelect?.(file);
    }

    // Reset input pour permettre la re-sélection du même fichier
    event.target.value = '';
  };

  const handleCameraClick = () => {
    cameraInputRef.current?.click();
  };

  const handleGalleryClick = () => {
    fileInputRef.current?.click();
  };

  if (preview) {
    return (
      <div className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden">
        <img src={preview} alt="Preview" className="w-full h-full object-cover" />
        {onRemove && !disabled && (
          <button
            onClick={onRemove}
            className="absolute top-2 right-2 bg-red-600 text-white p-1.5 rounded-full shadow-lg hover:bg-red-700 transition-colors"
            type="button"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="aspect-square bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center gap-2">
      <div className="flex gap-2">
        {!multiple && (
          <button
            onClick={handleCameraClick}
            disabled={disabled}
            className="p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            type="button"
          >
            <Camera className="w-5 h-5" />
          </button>
        )}
        <button
          onClick={handleGalleryClick}
          disabled={disabled}
          className="p-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          type="button"
        >
          <Upload className="w-5 h-5" />
        </button>
      </div>
      <p className="text-xs text-gray-500 text-center px-2">{label}</p>

      {/* Input caméra (mobile) - seulement en mode single */}
      {!multiple && (
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleFileSelect}
          className="hidden"
          disabled={disabled}
        />
      )}

      {/* Input galerie */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        multiple={multiple}
        onChange={handleFileSelect}
        className="hidden"
        disabled={disabled}
      />
    </div>
  );
};
