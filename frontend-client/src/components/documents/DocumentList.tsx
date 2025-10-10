import React from 'react';
import { FileX } from 'lucide-react';
import { DocumentCard } from './DocumentCard';
import type { Document } from '../../types/document.types';

interface DocumentListProps {
  documents: Document[];
  isLoading?: boolean;
  onDownload?: (document: Document) => void;
  onDelete?: (document: Document) => void;
  onPreview?: (document: Document) => void;
}

export const DocumentList: React.FC<DocumentListProps> = ({
  documents,
  isLoading = false,
  onDownload,
  onDelete,
  onPreview,
}) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="bg-gray-200 h-40 rounded-lg"></div>
          </div>
        ))}
      </div>
    );
  }

  if (documents.length === 0) {
    return (
      <div className="text-center py-12">
        <FileX className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-1">
          Aucun document
        </h3>
        <p className="text-gray-500">
          Commencez par uploader vos premiers documents
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {documents.map((document) => (
        <DocumentCard
          key={document.id}
          document={document}
          onDownload={onDownload}
          onDelete={onDelete}
          onPreview={onPreview}
        />
      ))}
    </div>
  );
};
