import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, FileText, Image as ImageIcon, AlertCircle } from 'lucide-react';
import { FILE_UPLOAD } from '../../config/constants';

interface FileUploadProps {
  onFilesSelected: (files: File[]) => void;
  maxFiles?: number;
  acceptedTypes?: string[];
  disabled?: boolean;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  onFilesSelected,
  maxFiles = FILE_UPLOAD.MAX_FILES_PER_UPLOAD,
  acceptedTypes = FILE_UPLOAD.ALLOWED_DOCUMENT_TYPES,
  disabled = false,
}) => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [errors, setErrors] = useState<string[]>([]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: acceptedTypes.reduce((acc, type) => ({ ...acc, [type]: [] }), {}),
    maxFiles,
    maxSize: FILE_UPLOAD.MAX_FILE_SIZE,
    disabled,
    onDrop: (acceptedFiles, rejectedFiles) => {
      const newErrors: string[]  = [];

      // Vérifier les fichiers rejetés
      rejectedFiles.forEach((file) => {
        if (file.errors.some((e) => e.code === 'file-too-large')) {
          newErrors.push(`${file.file.name}: Fichier trop volumineux (max 5MB)`);
        }
        if (file.errors.some((e) => e.code === 'file-invalid-type')) {
          newErrors.push(`${file.file.name}: Type de fichier non autorisé`);
        }
      });

      // Vérifier le nombre max
      if (selectedFiles.length + acceptedFiles.length > maxFiles) {
        newErrors.push(`Maximum ${maxFiles} fichiers autorisés`);
        return;
      }

      setErrors(newErrors);

      if (acceptedFiles.length > 0) {
        const newFiles = [...selectedFiles, ...acceptedFiles].slice(0, maxFiles);
        setSelectedFiles(newFiles);
        onFilesSelected(newFiles);
      }
    },
  });

  const removeFile = (index: number) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    setSelectedFiles(newFiles);
    onFilesSelected(newFiles);
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) {
      return <ImageIcon className="w-8 h-8 text-blue-500" />;
    }
    return <FileText className="w-8 h-8 text-red-500" />;
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="w-full">
      {/* Drop Zone */}
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
          transition-colors duration-200
          ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        <input {...getInputProps()} />
        <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
        {isDragActive ? (
          <p className="text-blue-600 font-medium">Déposez les fichiers ici...</p>
        ) : (
          <>
            <p className="text-gray-700 font-medium mb-1">
              Glissez-déposez vos fichiers ici
            </p>
            <p className="text-gray-500 text-sm">
              ou cliquez pour sélectionner ({maxFiles} max, 5MB max)
            </p>
            <p className="text-gray-400 text-xs mt-2">
              PDF, JPG, PNG acceptés
            </p>
          </>
        )}
      </div>

      {/* Errors */}
      {errors.length > 0 && (
        <div className="mt-4 space-y-2">
          {errors.map((error, index) => (
            <div
              key={index}
              className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm"
            >
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          ))}
        </div>
      )}

      {/* Preview Selected Files */}
      {selectedFiles.length > 0 && (
        <div className="mt-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">
            Fichiers sélectionnés ({selectedFiles.length})
          </h4>
          <div className="space-y-2">
            {selectedFiles.map((file, index) => (
              <div
                key={index}
                className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200"
              >
                {getFileIcon(file)}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {file.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatFileSize(file.size)}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => removeFile(index)}
                  className="p-1 hover:bg-gray-200 rounded transition-colors"
                  title="Retirer"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
