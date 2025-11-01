import React, { useState } from 'react';
import { X } from 'lucide-react';
import { PhotoUpload } from './PhotoUpload';
import type { VehicleDefect, DefectType, DefectSeverity } from '../../types/trip.types';
import { v4 as uuidv4 } from 'uuid';

interface AddDefectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (defect: VehicleDefect) => void;
}

export const AddDefectModal: React.FC<AddDefectModalProps> = ({ isOpen, onClose, onAdd }) => {
  const [type, setType] = useState<DefectType>('scratch');
  const [location, setLocation] = useState('');
  const [severity, setSeverity] = useState<DefectSeverity>('minor');
  const [description, setDescription] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);
  const [photoFiles, setPhotoFiles] = useState<File[]>([]);

  if (!isOpen) return null;

  const handlePhotoSelect = (file: File) => {
    if (photoFiles.length >= 3) {
      alert('Maximum 3 photos par défaut');
      return;
    }

    // Créer preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPhotos([...photos, reader.result as string]);
      setPhotoFiles([...photoFiles, file]);
    };
    reader.readAsDataURL(file);
  };

  const handleMultiplePhotos = (files: File[]) => {
    const remaining = 3 - photoFiles.length;
    const filesToAdd = files.slice(0, remaining);

    filesToAdd.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotos((prev) => [...prev, reader.result as string]);
        setPhotoFiles((prev) => [...prev, file]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemovePhoto = (index: number) => {
    setPhotos(photos.filter((_, i) => i !== index));
    setPhotoFiles(photoFiles.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!location.trim() || !description.trim()) {
      alert('Veuillez remplir la localisation et la description');
      return;
    }

    const defect: VehicleDefect = {
      id: uuidv4(),
      type,
      location: location.trim(),
      severity,
      description: description.trim(),
      photos,
    };

    onAdd(defect);

    // Reset form
    setType('scratch');
    setLocation('');
    setSeverity('minor');
    setDescription('');
    setPhotos([]);
    setPhotoFiles([]);
    onClose();
  };

  const handleClose = () => {
    // Reset form
    setType('scratch');
    setLocation('');
    setSeverity('minor');
    setDescription('');
    setPhotos([]);
    setPhotoFiles([]);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Ajouter un défaut</h3>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            type="button"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Type de défaut *
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as DefectType)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value="scratch">Rayure</option>
              <option value="dent">Bosse</option>
              <option value="broken">Cassé</option>
              <option value="dirty">Sale</option>
              <option value="missing">Manquant</option>
              <option value="other">Autre</option>
            </select>
          </div>

          {/* Sévérité */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sévérité *
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setSeverity('minor')}
                className={`py-2 px-3 rounded-lg border-2 transition-colors ${
                  severity === 'minor'
                    ? 'border-yellow-500 bg-yellow-50 text-yellow-700'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                Mineur
              </button>
              <button
                type="button"
                onClick={() => setSeverity('moderate')}
                className={`py-2 px-3 rounded-lg border-2 transition-colors ${
                  severity === 'moderate'
                    ? 'border-orange-500 bg-orange-50 text-orange-700'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                Modéré
              </button>
              <button
                type="button"
                onClick={() => setSeverity('severe')}
                className={`py-2 px-3 rounded-lg border-2 transition-colors ${
                  severity === 'severe'
                    ? 'border-red-500 bg-red-50 text-red-700'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                Grave
              </button>
            </div>
          </div>

          {/* Localisation */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Localisation *
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Ex: Pare-choc avant gauche"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description *
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Décrivez le défaut en détail..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              required
            />
          </div>

          {/* Photos */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Photos (max 3)
            </label>

            {photos.length === 0 ? (
              // Mode multi-sélection si aucune photo
              <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border-2 border-dashed border-blue-300">
                <div className="flex items-center justify-center">
                  <PhotoUpload
                    multiple
                    maxFiles={3}
                    onPhotosSelect={handleMultiplePhotos}
                    label="Sélectionner jusqu'à 3 photos"
                  />
                </div>
              </div>
            ) : (
              // Afficher photos sélectionnées + possibilité d'ajouter
              <div className="space-y-3">
                <div className="grid grid-cols-3 gap-3">
                  {photos.map((photo, idx) => (
                    <PhotoUpload
                      key={idx}
                      preview={photo}
                      onRemove={() => handleRemovePhoto(idx)}
                    />
                  ))}
                  {photos.length < 3 && (
                    <PhotoUpload
                      multiple={photos.length === 0}
                      maxFiles={3 - photos.length}
                      onPhotoSelect={handlePhotoSelect}
                      onPhotosSelect={handleMultiplePhotos}
                      label={`+${3 - photos.length}`}
                    />
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Ajouter
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
