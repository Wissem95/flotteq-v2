import { useEffect, useState } from 'react';
import { dashboardService } from '@/api/services/dashboard.service';
import type { Alert, AlertSeverity } from '@/types/dashboard.types';
import { AlertTriangle, Clock, AlertCircle, XCircle } from 'lucide-react';

interface SeverityConfig {
  bg: string;
  text: string;
  border: string;
  icon: typeof AlertTriangle;
}

const severityConfig: Record<AlertSeverity, SeverityConfig> = {
  critical: {
    bg: 'bg-red-50',
    text: 'text-red-800',
    border: 'border-red-200',
    icon: XCircle,
  },
  high: {
    bg: 'bg-orange-50',
    text: 'text-orange-800',
    border: 'border-orange-200',
    icon: AlertTriangle,
  },
  medium: {
    bg: 'bg-yellow-50',
    text: 'text-yellow-800',
    border: 'border-yellow-200',
    icon: AlertCircle,
  },
  low: {
    bg: 'bg-blue-50',
    text: 'text-blue-800',
    border: 'border-blue-200',
    icon: AlertCircle,
  },
};

const severityLabels: Record<AlertSeverity, string> = {
  critical: 'CRITIQUE',
  high: 'HAUTE',
  medium: 'MOYENNE',
  low: 'BASSE',
};

export default function AlertsList() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadAlerts();
  }, []);

  const loadAlerts = async () => {
    try {
      setLoading(true);
      const data = await dashboardService.getAlerts();
      setAlerts(data.slice(0, 5)); // Show top 5 alerts
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur de chargement');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Alertes et rappels</h2>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-flotteq-blue"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Alertes et rappels</h2>
        <div className="rounded-lg bg-red-50 border border-red-200 p-4">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      </div>
    );
  }

  if (alerts.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Alertes et rappels</h2>
        <div className="flex flex-col items-center justify-center h-64 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
          <AlertCircle className="h-12 w-12 text-gray-300 mb-3" />
          <p className="text-gray-500 text-sm">Aucune alerte pour le moment</p>
          <p className="text-gray-400 text-xs mt-1">Tout va bien ! 👍</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Alertes et rappels</h2>
        <span className="text-sm text-gray-500">{alerts.length} alerte{alerts.length > 1 ? 's' : ''}</span>
      </div>

      <div className="space-y-3">
        {alerts.map((alert) => {
          const config = severityConfig[alert.severity];
          const Icon = config.icon;

          return (
            <div
              key={alert.id}
              className={`p-4 rounded-lg border ${config.bg} ${config.border} transition-all hover:shadow-sm`}
            >
              <div className="flex items-start gap-3">
                <Icon className={`h-5 w-5 mt-0.5 flex-shrink-0 ${config.text}`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className={`font-medium ${config.text}`}>{alert.title}</p>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded ${config.bg} ${config.text} border ${config.border}`}>
                      {severityLabels[alert.severity]}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 mb-2">{alert.message}</p>
                  <div className="flex items-center gap-4 text-xs text-gray-600">
                    {alert.daysUntilDue !== undefined && (
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>
                          {alert.daysUntilDue === 0
                            ? "Aujourd'hui"
                            : alert.daysUntilDue === 1
                            ? 'Demain'
                            : `Dans ${alert.daysUntilDue} jours`}
                        </span>
                      </div>
                    )}
                    <span className="capitalize text-gray-500">
                      {alert.entityType === 'driver' && '👤 Conducteur'}
                      {alert.entityType === 'vehicle' && '🚗 Véhicule'}
                      {alert.entityType === 'maintenance' && '🔧 Maintenance'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {alerts.length === 5 && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <button className="text-sm text-flotteq-blue hover:text-flotteq-navy font-medium transition-colors">
            Voir toutes les alertes →
          </button>
        </div>
      )}
    </div>
  );
}
