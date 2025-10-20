import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X } from 'lucide-react';

interface PhotoUploadZoneProps {
  onUpload: (files: File[]) => Promise<void>;
  maxPhotos: number;
  currentCount: number;
}

export const PhotoUploadZone: React.FC<PhotoUploadZoneProps> = ({
  onUpload,
  maxPhotos,
  currentCount,
}) => {
  const [previews, setPreviews] = useState<{ file: File; preview: string }[]>([]);
  const [uploading, setUploading] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const remaining = maxPhotos - currentCount - previews.length;
    const filesToAdd = acceptedFiles.slice(0, remaining);

    const newPreviews = filesToAdd.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));

    setPreviews((prev) => [...prev, ...newPreviews]);
  }, [currentCount, maxPhotos, previews.length]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp'],
    },
    maxFiles: maxPhotos - currentCount,
    disabled: currentCount + previews.length >= maxPhotos,
  });

  const removePreview = (index: number) => {
    setPreviews((prev) => {
      const newPreviews = [...prev];
      URL.revokeObjectURL(newPreviews[index].preview);
      newPreviews.splice(index, 1);
      return newPreviews;
    });
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
          <h4 className="text-sm font-medium text-gray-700 mb-3">
            Photos à uploader ({previews.length})
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {previews.map((preview, index) => (
              <div key={index} className="relative group">
                <img
                  src={preview.preview}
                  alt={`Preview ${index + 1}`}
                  className="w-full h-32 object-cover rounded-lg"
                />
                <button
                  onClick={() => removePreview(index)}
                  className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          <div className="flex gap-3 mt-4">
            <button
              onClick={handleUpload}
              disabled={uploading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {uploading ? 'Upload en cours...' : `Uploader ${previews.length} photo${previews.length > 1 ? 's' : ''}`}
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
        </div>
      )}
    </div>
  );
};
