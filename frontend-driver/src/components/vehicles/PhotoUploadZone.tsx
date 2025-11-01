import React, { useCallback, useState, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, Image as ImageIcon } from 'lucide-react';

interface PhotoUploadZoneProps {
  // Mode upload immédiat (véhicules)
  onUpload?: (files: File[]) => Promise<void>;

  // Mode controlled (reports)
  photos?: File[];
  onChange?: (files: File[]) => void;
  controlledMode?: boolean;

  maxPhotos: number;
  currentCount: number;
  disabled?: boolean;
}

export const PhotoUploadZone: React.FC<PhotoUploadZoneProps> = ({
  onUpload,
  photos: controlledPhotos,
  onChange,
  controlledMode = false,
  maxPhotos,
  currentCount,
  disabled = false,
}) => {
  const [previews, setPreviews] = useState<{ file: File; preview: string }[]>([]);
  const [uploading, setUploading] = useState(false);

  // En mode controlled, sync previews avec photos prop
  useEffect(() => {
    if (controlledMode && controlledPhotos) {
      setPreviews(
        controlledPhotos.map((file) => ({
          file,
          preview: URL.createObjectURL(file),
        }))
      );
    }
  }, [controlledMode, controlledPhotos]);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const remaining = maxPhotos - currentCount - previews.length;
      const filesToAdd = acceptedFiles.slice(0, remaining);

      if (controlledMode && onChange) {
        // Mode controlled: notifier parent
        const currentFiles = controlledPhotos || [];
        onChange([...currentFiles, ...filesToAdd]);
      } else {
        // Mode upload immédiat: state interne
        const newPreviews = filesToAdd.map((file) => ({
          file,
          preview: URL.createObjectURL(file),
        }));
        setPreviews((prev) => [...prev, ...newPreviews]);
      }
    },
    [controlledMode, onChange, controlledPhotos, currentCount, maxPhotos, previews.length]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp'],
    },
    maxFiles: maxPhotos - currentCount,
    disabled: disabled || currentCount + previews.length >= maxPhotos,
  });

  const removePreview = (index: number) => {
    if (controlledMode && onChange && controlledPhotos) {
      // Mode controlled: notifier parent
      const newPhotos = [...controlledPhotos];
      newPhotos.splice(index, 1);
      onChange(newPhotos);
    } else {
      // Mode upload immédiat: state interne
      setPreviews((prev) => {
        const newPreviews = [...prev];
        URL.revokeObjectURL(newPreviews[index].preview);
        newPreviews.splice(index, 1);
        return newPreviews;
      });
    }
  };

  const handleUpload = async () => {
    if (previews.length === 0) return;

    setUploading(true);
    try {
      const files = previews.map((p) => p.file);
      await onUpload(files);

      // Nettoyer les previews
      previews.forEach((p) => URL.revokeObjectURL(p.preview));
      setPreviews([]);
    } catch (error) {
      console.error('Upload error:', error);
      alert('Erreur lors de l\'upload des photos');
    } finally {
      setUploading(false);
    }
  };

  const canAddMore = currentCount + previews.length < maxPhotos;

  return (
    <div className="space-y-4">
      {/* Dropzone */}
      {canAddMore && (
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
            isDragActive
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-300 hover:border-gray-400'
          }`}
        >
          <input {...getInputProps()} />
          <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          {isDragActive ? (
            <p className="text-blue-600">Déposez les photos ici...</p>
          ) : (
            <div>
              <p className="text-gray-600 mb-2">
                Glissez-déposez des photos ici, ou cliquez pour sélectionner
              </p>
              <p className="text-xs text-gray-500">
                Maximum {maxPhotos - currentCount - previews.length} photo
                {maxPhotos - currentCount - previews.length > 1 ? 's' : ''} restante
                {maxPhotos - currentCount - previews.length > 1 ? 's' : ''}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Previews */}
      {previews.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
            {controlledMode && <ImageIcon className="w-4 h-4" />}
            {controlledMode
              ? `Photos sélectionnées (${previews.length}/${maxPhotos})`
              : `Photos à uploader (${previews.length})`}
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {previews.map((preview, index) => (
              <div key={index} className="relative group">
                <img
                  src={preview.preview}
                  alt={`Preview ${index + 1}`}
                  className="w-full h-32 object-cover rounded-lg border border-gray-200"
                />
                {!disabled && (
                  <button
                    type="button"
                    onClick={() => removePreview(index)}
                    className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:bg-red-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
                {controlledMode && (
                  <div className="absolute bottom-2 left-2 bg-black/60 text-white text-xs px-2 py-0.5 rounded">
                    {(preview.file.size / 1024 / 1024).toFixed(1)} MB
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Boutons upload/annuler seulement en mode upload immédiat */}
          {!controlledMode && (
            <div className="flex gap-3 mt-4">
              <button
                onClick={handleUpload}
                disabled={uploading}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {uploading
                  ? 'Upload en cours...'
                  : `Uploader ${previews.length} photo${previews.length > 1 ? 's' : ''}`}
              </button>
              <button
                onClick={() => {
                  previews.forEach((p) => URL.revokeObjectURL(p.preview));
                  setPreviews([]);
                }}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Annuler
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
