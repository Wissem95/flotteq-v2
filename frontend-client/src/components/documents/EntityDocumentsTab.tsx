import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { DocumentList } from './DocumentList';
import { FileUpload } from './FileUpload';
import { DocumentPreviewModal } from './DocumentPreviewModal';
import {
  useDocuments,
  useUploadDocument,
  useDeleteDocument,
  useDownloadDocument,
} from '../../api/services/documents.service';
import {
  DocumentEntityType,
  DocumentType,
  DocumentTypeLabels,
} from '../../types/document.types';
import type {
  UploadDocumentDto,
  Document,
} from '../../types/document.types';

interface EntityDocumentsTabProps {
  entityType: DocumentEntityType;
  entityId: string;
  entityName?: string; // Pour afficher le nom dans le modal
}

export const EntityDocumentsTab: React.FC<EntityDocumentsTabProps> = ({
  entityType,
  entityId,
  entityName,
}) => {
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [documentType, setDocumentType] = useState<DocumentType | ''>('');
  const [expiryDate, setExpiryDate] = useState('');
  const [notes, setNotes] = useState('');
  const [previewDocument, setPreviewDocument] = useState<Document | null>(null);

  const { data: documents = [], isLoading, refetch } = useDocuments({ entityType, entityId });
  const uploadMutation = useUploadDocument();
  const deleteMutation = useDeleteDocument();
  const downloadMutation = useDownloadDocument();

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedFiles.length === 0) {
      alert('Veuillez sélectionner au moins un fichier');
      return;
    }

    for (const file of selectedFiles) {
      const dto: UploadDocumentDto = {
        file,
        entityType,
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
    setDocumentType('');
    setExpiryDate('');
    setNotes('');
    refetch();
  };

  const handleDownload = (document: Document) => {
    downloadMutation.mutate({
      id: document.id,
      fileName: document.fileName,
    });
  };

  const handleDelete = async (document: Document) => {
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
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Documents</h3>
          <p className="text-sm text-gray-600 mt-1">
            {documents.length} document{documents.length > 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={() => setShowUploadModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
        >
          <Plus className="w-4 h-4" />
          Ajouter un document
        </button>
      </div>

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
              Ajouter un document {entityName && `- ${entityName}`}
            </h2>

            <form onSubmit={handleUpload} className="space-y-4">
              {/* File Upload */}
              <FileUpload onFilesSelected={setSelectedFiles} maxFiles={5} />

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
                <button
                  type="submit"
                  disabled={uploadMutation.isPending}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {uploadMutation.isPending ? 'Upload...' : 'Uploader'}
                </button>
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
