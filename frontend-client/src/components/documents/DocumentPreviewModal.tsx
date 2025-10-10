import React, { useState, useEffect } from 'react';
import { X, Download } from 'lucide-react';
import type { Document } from '../../types/document.types';

interface DocumentPreviewModalProps {
  document: Document;
  onClose: () => void;
  onDownload?: () => void;
}

export const DocumentPreviewModal: React.FC<DocumentPreviewModalProps> = ({
  document,
  onClose,
  onDownload,
}) => {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const isPDF = document.mimeType === 'application/pdf';
  const isImage = document.mimeType.startsWith('image/');

  // Charger le PDF avec authentification
  useEffect(() => {
    if (isPDF) {
      const loadPDF = async () => {
        try {
          const token = localStorage.getItem('access_token');
          const tenantId = localStorage.getItem('tenant_id');

          const response = await fetch(`http://localhost:3000/api/documents/${document.id}/download`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'X-Tenant-ID': tenantId || '1',
            },
          });

          if (!response.ok) throw new Error('Failed to load PDF');

          const blob = await response.blob();
          const url = URL.createObjectURL(blob);
          setPdfUrl(url);
          setLoading(false);
        } catch (error) {
          console.error('Error loading PDF:', error);
          setLoading(false);
        }
      };

      loadPDF();

      return () => {
        if (pdfUrl) {
          URL.revokeObjectURL(pdfUrl);
        }
      };
    }
  }, [document.id, isPDF]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full h-full max-w-7xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 flex-shrink-0">
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-semibold text-gray-900 truncate">
              {document.fileName}
            </h2>
            <p className="text-sm text-gray-500">
              {(document.size / 1024 / 1024).toFixed(2)} MB
            </p>
          </div>

          <div className="flex items-center gap-2">
            {onDownload && (
              <button
                onClick={onDownload}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Télécharger"
              >
                <Download className="w-5 h-5 text-gray-600" />
              </button>
            )}

            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Fermer"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 bg-gray-100 flex items-center justify-center min-h-0">
          {isPDF ? (
            loading ? (
              <div className="flex items-center justify-center p-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : pdfUrl ? (
              <iframe
                src={pdfUrl}
                className="w-full h-full border-0"
                title={document.fileName}
              />
            ) : (
              <div className="p-12 text-center text-red-600">
                Erreur de chargement du PDF
              </div>
            )
          ) : isImage ? (
            <img
              src={document.fileUrl}
              alt={document.fileName}
              className="max-w-full max-h-full object-contain rounded-lg shadow-lg"
            />
          ) : (
            <div className="text-center text-gray-600 p-12">
              <p className="mb-4">Aperçu non disponible pour ce type de fichier</p>
              {onDownload && (
                <button
                  onClick={onDownload}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Télécharger le fichier
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
