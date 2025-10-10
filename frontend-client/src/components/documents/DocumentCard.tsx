import React from 'react';
import { FileText, Image as ImageIcon, Download, Trash2, Calendar, AlertTriangle } from 'lucide-react';
import { format, differenceInDays } from 'date-fns';
import { fr } from 'date-fns/locale';
import type { Document } from '../../types/document.types';
import { DocumentTypeLabels } from '../../types/document.types';
import { ProtectedButton } from '../common/ProtectedButton';

interface DocumentCardProps {
  document: Document;
  onDownload?: (document: Document) => void;
  onDelete?: (document: Document) => void;
  onPreview?: (document: Document) => void;
}

export const DocumentCard: React.FC<DocumentCardProps> = ({
  document,
  onDownload,
  onDelete,
  onPreview,
}) => {
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getFileIcon = () => {
    if (document.mimeType.startsWith('image/')) {
      return <ImageIcon className="w-8 h-8 text-blue-500" />;
    }
    return <FileText className="w-8 h-8 text-red-500" />;
  };

  const getExpiryBadge = () => {
    if (!document.expiryDate) return null;

    const expiryDate = new Date(document.expiryDate);
    const today = new Date();
    const daysUntil = differenceInDays(expiryDate, today);

    if (daysUntil < 0) {
      return (
        <div className="flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full">
          <AlertTriangle className="w-3 h-3" />
          <span>Expiré</span>
        </div>
      );
    }

    if (daysUntil <= 7) {
      return (
        <div className="flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full">
          <AlertTriangle className="w-3 h-3" />
          <span>{daysUntil}j restants</span>
        </div>
      );
    }

    if (daysUntil <= 30) {
      return (
        <div className="flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full">
          <Calendar className="w-3 h-3" />
          <span>{daysUntil}j restants</span>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      {/* Header avec icône et actions */}
      <div className="flex items-start gap-3 mb-3">
        <div className="flex-shrink-0">{getFileIcon()}</div>

        <div className="flex-1 min-w-0">
          <button
            onClick={() => onPreview?.(document)}
            className="text-sm font-medium text-gray-900 hover:text-blue-600 truncate block w-full text-left"
            title={document.fileName}
          >
            {document.fileName}
          </button>
          <p className="text-xs text-gray-500 mt-1">
            {formatFileSize(document.size)}
          </p>
        </div>

        <div className="flex gap-1">
          {onDownload && (
            <ProtectedButton
              onClick={() => onDownload(document)}
              permission="documents.create"
              disabledMessage="Vous n'avez pas la permission de télécharger des documents"
              className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
              title="Télécharger"
            >
              <Download className="w-4 h-4" />
            </ProtectedButton>
          )}
          {onDelete && (
            <ProtectedButton
              onClick={() => onDelete(document)}
              permission="documents.delete"
              disabledMessage="Vous n'avez pas la permission de supprimer des documents"
              className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
              title="Supprimer"
            >
              <Trash2 className="w-4 h-4" />
            </ProtectedButton>
          )}
        </div>
      </div>

      {/* Type de document */}
      {document.documentType && (
        <div className="mb-2">
          <span className="inline-block px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
            {DocumentTypeLabels[document.documentType]}
          </span>
        </div>
      )}

      {/* Badge expiration */}
      {getExpiryBadge()}

      {/* Notes */}
      {document.notes && (
        <p className="text-xs text-gray-600 mt-2 line-clamp-2">
          {document.notes}
        </p>
      )}

      {/* Date d'upload */}
      <div className="mt-3 pt-3 border-t border-gray-100">
        <p className="text-xs text-gray-500">
          Uploadé le {format(new Date(document.createdAt), 'dd MMM yyyy', { locale: fr })}
        </p>
      </div>
    </div>
  );
};
