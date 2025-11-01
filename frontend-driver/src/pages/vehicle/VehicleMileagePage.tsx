import { useState } from 'react';
import { ArrowLeft, Gauge, Calendar, TrendingUp, FileText, Edit, Wrench, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useMileageHistory } from '@/hooks/useMileage';
import UpdateMileageModal from '@/components/mileage/UpdateMileageModal';

export default function VehicleMileagePage() {
  const navigate = useNavigate();
  const { data, isLoading } = useMileageHistory();
  const [showModal, setShowModal] = useState(false);

  const getSourceIcon = (source: string) => {
    switch (source) {
      case 'manual':
        return <Edit className="w-5 h-5 text-blue-600" />;
      case 'maintenance':
        return <Wrench className="w-5 h-5 text-orange-600" />;
      case 'inspection':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      default:
        return <FileText className="w-5 h-5 text-gray-600" />;
    }
  };

  const getSourceLabel = (source: string) => {
    const labels: Record<string, string> = {
      manual: 'Mise à jour manuelle',
      maintenance: 'Maintenance',
      inspection: 'Contrôle technique',
    };
    return labels[source] || source;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-flotteq-blue"></div>
      </div>
    );
  }

  if (!data?.vehicle) {
    return (
      <div className="space-y-6">
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 font-medium"
        >
          <ArrowLeft className="w-5 h-5" />
          Retour au tableau de bord
        </button>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <Gauge className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Aucun véhicule assigné</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 font-medium"
        >
          <ArrowLeft className="w-5 h-5" />
          Retour
        </button>
      </div>

      {/* Véhicule Info */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Historique du Kilométrage</h1>
            <p className="text-gray-600">
              {data.vehicle.brand} {data.vehicle.model} • {data.vehicle.registration}
            </p>
          </div>

          <button
            onClick={() => setShowModal(true)}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-flotteq-blue text-white rounded-lg hover:bg-flotteq-navy transition-colors font-medium min-h-[48px] shadow-sm"
          >
            <Edit className="w-5 h-5" />
            Mettre à Jour
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-50 rounded-lg">
              <Gauge className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Kilométrage Actuel</p>
              <p className="text-2xl font-bold text-gray-900">
                {data.vehicle.currentKm.toLocaleString()} km
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-50 rounded-lg">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Mises à Jour</p>
              <p className="text-2xl font-bold text-gray-900">{data.total}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-50 rounded-lg">
              <Calendar className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Dernière Mise à Jour</p>
              <p className="text-lg font-semibold text-gray-900">
                {data.history.length > 0
                  ? new Date(data.history[0].recordedAt).toLocaleDateString('fr-FR')
                  : 'N/A'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Historique Détaillé</h2>

        {data.history.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600">Aucun historique disponible</p>
            <p className="text-sm text-gray-500 mt-1">
              Mettez à jour le kilométrage pour commencer à suivre l'historique
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {data.history.map((item, index) => (
              <div
                key={item.id}
                className={`relative pl-8 pb-6 ${index === data.history.length - 1 ? '' : 'border-l-2 border-gray-200'}`}
              >
                {/* Timeline dot */}
                <div className="absolute left-[-9px] top-0 w-4 h-4 rounded-full bg-flotteq-blue border-4 border-white shadow"></div>

                {/* Content */}
                <div className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-white rounded-lg shadow-sm">
                        {getSourceIcon(item.source)}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 text-lg">
                          {item.mileage.toLocaleString()} km
                        </p>
                        <p className="text-sm text-gray-600">{getSourceLabel(item.source)}</p>
                      </div>
                    </div>

                    <div className="text-left sm:text-right">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Calendar className="w-4 h-4" />
                        <span className="text-sm font-medium">{formatDate(item.recordedAt)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 text-sm">
                    {item.previousMileage !== null && (
                      <div className="flex items-center gap-2">
                        <span className="text-gray-600">Précédent:</span>
                        <span className="font-medium text-gray-900">
                          {item.previousMileage.toLocaleString()} km
                        </span>
                      </div>
                    )}

                    {item.difference > 0 && (
                      <div className="flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-green-600" />
                        <span className="font-semibold text-green-700">
                          +{item.difference.toLocaleString()} km
                        </span>
                      </div>
                    )}
                  </div>

                  {item.notes && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <p className="text-sm text-gray-700 flex items-start gap-2">
                        <FileText className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                        <span>{item.notes}</span>
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      <UpdateMileageModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        currentMileage={data.vehicle.currentKm}
        vehicleRegistration={data.vehicle.registration}
      />
    </div>
  );
}
