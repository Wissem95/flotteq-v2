import { useState } from 'react';
import { FileText, Filter, AlertTriangle, CheckCircle, Calendar } from 'lucide-react';
import { DocumentList } from '@/components/documents/DocumentList';
import { DocumentPreviewModal } from '@/components/documents/DocumentPreviewModal';
import {
  useDocuments,
  useDeleteDocument,
  useDownloadDocument,
} from '@/api/services/documents.service';
import { DocumentType, DocumentTypeLabels } from '@/types/document.types';
import type { Document } from '@/types/document.types';

export default function DocumentsPage() {
  // Filtres
  const [filterDocumentType, setFilterDocumentType] = useState<DocumentType | ''>('');
  const [showFilters, setShowFilters] = useState(false);
  const [showExpiringSoon, setShowExpiringSoon] = useState(false);

  // Preview
  const [previewDocument, setPreviewDocument] = useState<Document | null>(null);

  // API Hooks - Le endpoint /driver/documents retourne automatiquement les bons documents
  const { data: allDocuments = [], isLoading } = useDocuments();
  const deleteMutation = useDeleteDocument();
  const downloadMutation = useDownloadDocument();

  // Filtrer les documents
  const today = new Date();
  const in30Days = new Date();
  in30Days.setDate(in30Days.getDate() + 30);

  const documents = allDocuments.filter((doc) => {
    // Filtre par type
    if (filterDocumentType && doc.documentType !== filterDocumentType) return false;

    // Filtre expiration proche
    if (showExpiringSoon && doc.expiryDate) {
      const expiryDate = new Date(doc.expiryDate);
      if (expiryDate > in30Days || expiryDate < today) return false;
    }

    return true;
  });

  // Statistiques
  const expiredCount = allDocuments.filter((doc) => {
    if (!doc.expiryDate) return false;
    return new Date(doc.expiryDate) < today;
  }).length;

  const expiringCount = allDocuments.filter((doc) => {
    if (!doc.expiryDate) return false;
    const expiryDate = new Date(doc.expiryDate);
    return expiryDate >= today && expiryDate <= in30Days;
  }).length;

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
    } catch (error) {
      console.error('Delete error:', error);
      alert('Erreur lors de la suppression');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Mes Documents</h1>
          <p className="text-gray-600 mt-1">
            Documents personnels et du véhicule assigné
          </p>
        </div>

        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center justify-center gap-2 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium min-h-[48px]"
        >
          <Filter className="w-5 h-5" />
          Filtres
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-50 rounded-lg">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total documents</p>
              <p className="text-2xl font-bold text-gray-900">{allDocuments.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-orange-50 rounded-lg">
              <Calendar className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">À renouveler bientôt</p>
              <p className="text-2xl font-bold text-orange-600">{expiringCount}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-red-50 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Expirés</p>
              <p className="text-2xl font-bold text-red-600">{expiredCount}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Alertes expiration */}
      {(expiredCount > 0 || expiringCount > 0) && (
        <div className={`rounded-lg p-4 ${expiredCount > 0 ? 'bg-red-50 border border-red-200' : 'bg-orange-50 border border-orange-200'}`}>
          <div className="flex items-start gap-3">
            <AlertTriangle className={`w-5 h-5 mt-0.5 ${expiredCount > 0 ? 'text-red-600' : 'text-orange-600'}`} />
            <div className="flex-1">
              <h3 className={`font-semibold ${expiredCount > 0 ? 'text-red-900' : 'text-orange-900'}`}>
                {expiredCount > 0 ? 'Documents expirés !' : 'Documents à renouveler bientôt'}
              </h3>
              <p className={`text-sm mt-1 ${expiredCount > 0 ? 'text-red-700' : 'text-orange-700'}`}>
                {expiredCount > 0
                  ? `Vous avez ${expiredCount} document${expiredCount > 1 ? 's expirés' : ' expiré'}. Contactez votre responsable.`
                  : `${expiringCount} document${expiringCount > 1 ? 's arrivent' : ' arrive'} à expiration dans les 30 prochains jours.`
                }
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Filtres */}
      {showFilters && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Filtres</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type de document
              </label>
              <select
                value={filterDocumentType}
                onChange={(e) => setFilterDocumentType(e.target.value as DocumentType)}
                className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-flotteq-blue focus:border-flotteq-blue text-base min-h-[48px]"
              >
                <option value="">Tous</option>
                {Object.entries(DocumentTypeLabels).map(([key, label]) => (
                  <option key={key} value={key.toLowerCase()}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Statut d'expiration
              </label>
              <div className="flex items-center min-h-[48px]">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showExpiringSoon}
                    onChange={(e) => setShowExpiringSoon(e.target.checked)}
                    className="w-5 h-5 text-flotteq-blue border-gray-300 rounded focus:ring-flotteq-blue"
                  />
                  <span className="text-base text-gray-700">Expiration dans 30 jours</span>
                </label>
              </div>
            </div>
          </div>

          <div className="flex gap-3 mt-4">
            <button
              onClick={() => {
                setFilterDocumentType('');
                setShowExpiringSoon(false);
              }}
              className="px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium min-h-[48px]"
            >
              Réinitialiser
            </button>
          </div>

          <div className="mt-4 text-sm text-gray-600">
            {documents.length} document{documents.length > 1 ? 's' : ''} trouvé{documents.length > 1 ? 's' : ''}
          </div>
        </div>
      )}

      {/* Documents List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Liste des documents</h2>

        {!isLoading && documents.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 bg-gray-50 rounded-lg">
            <CheckCircle className="h-12 w-12 text-gray-400 mb-3" />
            <p className="text-gray-500 text-base">Aucun document trouvé</p>
            {(filterDocumentType || showExpiringSoon) && (
              <button
                onClick={() => {
                  setFilterDocumentType('');
                  setShowExpiringSoon(false);
                }}
                className="mt-4 text-flotteq-blue hover:text-flotteq-navy font-medium"
              >
                Réinitialiser les filtres
              </button>
            )}
          </div>
        )}

        <DocumentList
          documents={documents}
          isLoading={isLoading}
          onDownload={handleDownload}
          onDelete={handleDelete}
          onPreview={setPreviewDocument}
        />
      </div>

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
}
