import React from 'react';
import { AlertTriangle, Calendar, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useExpiringDocuments } from '../../api/services/documents.service';
import { DocumentTypeLabels } from '../../types/document.types';
import { Link } from 'react-router-dom';

export const ExpiringDocumentsWidget: React.FC = () => {
  const { data: expiringDocs = [], isLoading, isError } = useExpiringDocuments(30);

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow p-6 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-100 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  // Si erreur ou pas de documents, afficher le message par défaut
  if (isError || expiringDocs.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-green-500" />
          Documents à renouveler
        </h3>
        <p className="text-gray-600 text-sm">
          Aucun document n'expire dans les 30 prochains jours
        </p>
      </div>
    );
  }

  const getUrgencyColor = (level: string) => {
    switch (level) {
      case 'critical':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'warning':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      default:
        return 'bg-blue-100 text-blue-700 border-blue-200';
    }
  };

  const getUrgencyIcon = (level: string) => {
    if (level === 'critical') {
      return <AlertTriangle className="w-4 h-4" />;
    }
    return <Calendar className="w-4 h-4" />;
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-orange-500" />
          Documents à renouveler
        </h3>
        <span className="text-sm text-gray-500">
          {expiringDocs.length} document{expiringDocs.length > 1 ? 's' : ''}
        </span>
      </div>

      <div className="space-y-3">
        {expiringDocs.slice(0, 5).map((doc) => (
          <div
            key={doc.id}
            className={`p-3 rounded-lg border ${getUrgencyColor(doc.urgencyLevel)}`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-2 flex-1">
                <div className="mt-0.5">{getUrgencyIcon(doc.urgencyLevel)}</div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">
                    {doc.fileName}
                  </p>
                  <p className="text-xs opacity-75 mt-0.5">
                    {DocumentTypeLabels[doc.documentType]}
                  </p>
                  <p className="text-xs opacity-75 mt-1">
                    Expire le {format(new Date(doc.expiryDate), 'dd MMM yyyy', { locale: fr })}
                  </p>
                </div>
              </div>

              <div className="flex flex-col items-end gap-1">
                <span className="text-xs font-semibold">
                  {doc.daysUntilExpiry} jour{doc.daysUntilExpiry > 1 ? 's' : ''}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {expiringDocs.length > 5 && (
        <Link
          to="/documents"
          className="mt-4 flex items-center justify-center gap-1 text-sm text-blue-600 hover:text-blue-700 font-medium"
        >
          Voir tous les documents
          <ChevronRight className="w-4 h-4" />
        </Link>
      )}
    </div>
  );
};
