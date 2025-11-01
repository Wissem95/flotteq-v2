import React, { useState } from 'react';
import { AlertCircle, Clock, CheckCircle, Eye, Plus, Loader } from 'lucide-react';
import { useDriverReports } from '../../hooks/useReports';
import { ReportVehicleModal } from '../../components/reports/ReportVehicleModal';
import {
  REPORT_TYPE_LABELS,
  REPORT_STATUS_LABELS,
  REPORT_STATUS_COLORS,
  ReportStatus,
} from '../../types/report.types';

export const MyReportsPage: React.FC = () => {
  const { reports, loading, error, refetch } = useDriverReports();
  const [showCreateModal, setShowCreateModal] = useState(false);

  const getStatusIcon = (status: ReportStatus) => {
    switch (status) {
      case 'open':
        return <Clock className="w-4 h-4" />;
      case 'acknowledged':
        return <Eye className="w-4 h-4" />;
      case 'resolved':
        return <CheckCircle className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Mes signalements</h1>
            <p className="text-gray-600 mt-2">
              Signalez les problèmes sur votre véhicule et suivez leur résolution
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
          >
            <Plus className="w-5 h-5" />
            Nouveau signalement
          </button>
        </div>

        {/* Error state */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        )}

        {/* Loading state */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && reports.length === 0 && (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
              <AlertCircle className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Aucun signalement
            </h3>
            <p className="text-gray-600 mb-6">
              Vous n'avez pas encore signalé de problème sur votre véhicule.
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
            >
              <Plus className="w-5 h-5" />
              Créer un signalement
            </button>
          </div>
        )}

        {/* Reports list */}
        {!loading && !error && reports.length > 0 && (
          <div className="space-y-4">
            {reports.map((report) => (
              <div
                key={report.id}
                className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-lg font-semibold text-gray-900">
                        {REPORT_TYPE_LABELS[report.type]}
                      </span>
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${
                          REPORT_STATUS_COLORS[report.status as ReportStatus]
                        }`}
                      >
                        {getStatusIcon(report.status as ReportStatus)}
                        {REPORT_STATUS_LABELS[report.status as ReportStatus]}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500">
                      {report.vehicleRegistration && (
                        <span className="font-medium">
                          {report.vehicleRegistration}
                        </span>
                      )}
                      {' • '}
                      {formatDate(report.createdAt)}
                    </p>
                  </div>
                </div>

                {/* Description */}
                <div className="mb-4">
                  <p className="text-gray-700 whitespace-pre-wrap">
                    {report.description}
                  </p>
                  {report.notes && (
                    <p className="text-gray-600 text-sm mt-2 italic">
                      Note : {report.notes}
                    </p>
                  )}
                </div>

                {/* Status details */}
                {report.acknowledgedAt && (
                  <div className="text-sm text-gray-600 mt-3 pt-3 border-t border-gray-100">
                    <p>
                      ✓ Pris en compte le{' '}
                      {formatDate(report.acknowledgedAt)}
                      {report.acknowledgedByName && ` par ${report.acknowledgedByName}`}
                    </p>
                  </div>
                )}

                {report.resolvedAt && (
                  <div className="bg-green-50 rounded-lg p-3 mt-3">
                    <p className="text-sm font-medium text-green-900 mb-1">
                      ✓ Résolu le {formatDate(report.resolvedAt)}
                      {report.resolvedByName && ` par ${report.resolvedByName}`}
                    </p>
                    {report.resolutionNotes && (
                      <p className="text-sm text-green-700 mt-1">
                        {report.resolutionNotes}
                      </p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Report Modal */}
      <ReportVehicleModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={refetch}
      />
    </div>
  );
};

export default MyReportsPage;
