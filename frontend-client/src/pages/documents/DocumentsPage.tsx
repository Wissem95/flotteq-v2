import React, { useState } from 'react';
import { Plus, Filter } from 'lucide-react';
import { DocumentList } from '../../components/documents/DocumentList';
import { FileUpload } from '../../components/documents/FileUpload';
import { DocumentPreviewModal } from '../../components/documents/DocumentPreviewModal';
import {
  useDocuments,
  useUploadDocument,
  useDeleteDocument,
  useDownloadDocument,
} from '../../api/services/documents.service';
import { DocumentEntityType, DocumentType, DocumentTypeLabels } from '../../types/document.types';
import type { UploadDocumentDto, Document } from '../../types/document.types';
import { ProtectedButton } from '../../components/common/ProtectedButton';

export const DocumentsPage: React.FC = () => {
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [entityType, setEntityType] = useState<DocumentEntityType | ''>('');
  const [entityId, setEntityId] = useState('');
  const [documentType, setDocumentType] = useState<DocumentType | ''>('');
  const [expiryDate, setExpiryDate] = useState('');
  const [notes, setNotes] = useState('');

  // Filtres
  const [filterEntityType, setFilterEntityType] = useState<DocumentEntityType | ''>('');
  const [filterDocumentType, setFilterDocumentType] = useState<DocumentType | ''>('');
  const [showFilters, setShowFilters] = useState(false);

  // Preview
  const [previewDocument, setPreviewDocument] = useState<Document | null>(null);

  const { data: allDocuments = [], isLoading, refetch } = useDocuments();
  const uploadMutation = useUploadDocument();
  const deleteMutation = useDeleteDocument();
  const downloadMutation = useDownloadDocument();

  // Filtrer les documents
  const documents = allDocuments.filter((doc) => {
    if (filterEntityType && doc.entityType !== filterEntityType) return false;
    if (filterDocumentType && doc.documentType !== filterDocumentType) return false;
    return true;
  });

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedFiles.length === 0 || !entityType || !entityId) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }

    // Pour MVP, on upload un fichier à la fois
    for (const file of selectedFiles) {
      const dto: UploadDocumentDto = {
        file,
        entityType: entityType as DocumentEntityType,
        entityId,
        documentType: documentType || undefined,
        expiryDate: expiryDate || undefined,
        notes: notes || undefined,
      };

      try {
        await uploadMutation.mutateAsync(dto);
      } catch (error) {
        console.error('Upload error:', error);
        alert('Erreur lors de l\'upload');
      }
    }

    // Reset form
    setShowUploadModal(false);
    setSelectedFiles([]);
    setEntityType('');
    setEntityId('');
    setDocumentType('');
    setExpiryDate('');
    setNotes('');
    refetch();
  };

  const handleDownload = (document: any) => {
    downloadMutation.mutate({
      id: document.id,
      fileName: document.fileName,
    });
  };

  const handleDelete = async (document: any) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce document ?')) return;

    try {
      await deleteMutation.mutateAsync(document.id);
      refetch();
    } catch (error) {
      console.error('Delete error:', error);
      alert('Erreur lors de la suppression');
    }
  };

  return (
    <div className="px-4 sm:px-6 py-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-2xl font-bold text-gray-900">Documents</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">
            Gérez vos documents (permis, cartes grises, assurances)
          </p>
        </div>

        <div className="flex gap-2 sm:gap-3">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm"
          >
            <Filter className="w-4 sm:w-5 h-4 sm:h-5" />
            <span className="hidden xs:inline">Filtres</span>
          </button>
          <ProtectedButton
            onClick={() => setShowUploadModal(true)}
            permission="documents.create"
            disabledMessage="Vous n'avez pas la permission de créer des documents"
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
          >
            <Plus className="w-4 sm:w-5 h-4 sm:h-5" />
            <span className="hidden xs:inline">Nouveau document</span>
            <span className="xs:hidden">Nouveau</span>
          </ProtectedButton>
        </div>
      </div>

      {/* Filtres */}
      {showFilters && (
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Type d'entité
              </label>
              <select
                value={filterEntityType}
                onChange={(e) => setFilterEntityType(e.target.value as DocumentEntityType)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Tous</option>
                <option value="vehicle">Véhicule</option>
                <option value="driver">Conducteur</option>
                <option value="maintenance">Maintenance</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Type de document
              </label>
              <select
                value={filterDocumentType}
                onChange={(e) => setFilterDocumentType(e.target.value as DocumentType)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Tous</option>
                {Object.entries(DocumentTypeLabels).map(([key, label]) => (
                  <option key={key} value={key.toLowerCase()}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={() => {
                  setFilterEntityType('');
                  setFilterDocumentType('');
                }}
                className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Réinitialiser
              </button>
            </div>
          </div>

          <div className="mt-3 text-sm text-gray-600">
            {documents.length} document{documents.length > 1 ? 's' : ''} trouvé{documents.length > 1 ? 's' : ''}
          </div>
        </div>
      )}

      {/* Documents List */}
      <DocumentList
        documents={documents}
        isLoading={isLoading}
        onDownload={handleDownload}
        onDelete={handleDelete}
        onPreview={setPreviewDocument}
      />

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Upload un document
            </h2>

            <form onSubmit={handleUpload} className="space-y-4">
              {/* File Upload */}
              <FileUpload
                onFilesSelected={setSelectedFiles}
                maxFiles={5}
              />

              {/* Entity Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Type d'entité *
                </label>
                <select
                  value={entityType}
                  onChange={(e) => setEntityType(e.target.value as DocumentEntityType)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="">Sélectionner...</option>
                  <option value="vehicle">Véhicule</option>
                  <option value="driver">Conducteur</option>
                  <option value="maintenance">Maintenance</option>
                </select>
              </div>

              {/* Entity ID */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ID de l'entité (UUID) *
                </label>
                <input
                  type="text"
                  value={entityId}
                  onChange={(e) => setEntityId(e.target.value)}
                  placeholder="a1b2c3d4-..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Trouvez l'ID dans la page du véhicule/conducteur
                </p>
              </div>

              {/* Document Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Type de document
                </label>
                <select
                  value={documentType}
                  onChange={(e) => setDocumentType(e.target.value as DocumentType)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Aucun</option>
                  {Object.entries(DocumentTypeLabels).map(([key, label]) => (
                    <option key={key} value={key.toLowerCase()}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Expiry Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date d'expiration
                </label>
                <input
                  type="date"
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Notes optionnelles..."
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Annuler
                </button>
                <ProtectedButton
                  type="submit"
                  permission="documents.create"
                  disabledMessage="Vous n'avez pas la permission de créer des documents"
                  disabled={uploadMutation.isPending}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {uploadMutation.isPending ? 'Upload...' : 'Uploader'}
                </ProtectedButton>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {previewDocument && (
        <DocumentPreviewModal
          document={previewDocument}
          onClose={() => setPreviewDocument(null)}
          onDownload={() => handleDownload(previewDocument)}
        />
      )}
    </div>
  );
};
