import React, { useState } from 'react';
import { X, AlertCircle, CheckCircle, Loader, Camera } from 'lucide-react';
import { ReportType, REPORT_TYPE_LABELS, type CreateReportDto } from '../../types/report.types';
import { reportsService } from '../../api/services/reports.service';
import { PhotoUploadZone } from '../vehicles/PhotoUploadZone';

interface ReportVehicleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const ReportVehicleModal: React.FC<ReportVehicleModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [formData, setFormData] = useState<CreateReportDto>({
    type: ReportType.MECHANICAL,
    description: '',
    notes: '',
  });
  const [photos, setPhotos] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Étape 1: Créer le report
      const result = await reportsService.createDriverReport(formData);

      // Étape 2: Upload photos si présentes
      if (photos.length > 0) {
        await reportsService.uploadReportPhotos(result.reportId, photos);
      }

      setSuccess(true);

      // Auto-close after 2 seconds
      setTimeout(() => {
        handleClose();
        if (onSuccess) onSuccess();
      }, 2000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de la création du signalement');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      type: ReportType.MECHANICAL,
      description: '',
      notes: '',
    });
    setPhotos([]);
    setError(null);
    setSuccess(false);
    onClose();
  };

  const isFormValid = formData.description.trim().length >= 10;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertCircle className="w-6 h-6 text-red-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">
              Signaler un problème
            </h2>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Success Message */}
        {success && (
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
              <div>
                <p className="font-medium text-green-900">Signalement envoyé !</p>
                <p className="text-sm text-green-700 mt-1">
                  Votre responsable a été notifié et vous contactera prochainement.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        )}

        {/* Form */}
        {!success && (
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Type de problème */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type de problème <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as ReportType })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={loading}
              >
                {Object.values(ReportType).map((type) => (
                  <option key={type} value={type}>
                    {REPORT_TYPE_LABELS[type]}
                  </option>
                ))}
              </select>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description du problème <span className="text-red-500">*</span>
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Décrivez le problème en détail (minimum 10 caractères)..."
                rows={4}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                disabled={loading}
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                {formData.description.length} / 10 caractères minimum
              </p>
            </div>

            {/* Notes complémentaires */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes complémentaires (optionnel)
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Informations supplémentaires, contexte..."
                rows={3}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                disabled={loading}
              />
            </div>

            {/* Photos du problème */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Camera className="w-4 h-4 inline mr-1" />
                Photos du problème (optionnel - max 5)
              </label>
              <PhotoUploadZone
                photos={photos}
                onChange={setPhotos}
                maxPhotos={5}
                currentCount={0}
                controlledMode={true}
                disabled={loading}
              />
            </div>

            {/* Info box */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <strong>ℹ️ Information :</strong> Votre responsable recevra une notification immédiate
                et vous contactera pour organiser la prise en charge du véhicule.
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                disabled={loading}
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={loading || !isFormValid}
                className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader className="w-5 h-5 animate-spin" />
                    Envoi en cours...
                  </>
                ) : (
                  'Envoyer le signalement'
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
