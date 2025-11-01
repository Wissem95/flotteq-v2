import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, FileText, User, Phone, Mail, Calendar, Gauge, AlertTriangle, CheckCircle, ClipboardCheck } from 'lucide-react';
import api from '@/config/api';
import { ReportVehicleModal } from '@/components/reports/ReportVehicleModal';
import StatsCard from '@/components/dashboard/StatsCard';
import MyVehicleCard from '@/components/dashboard/MyVehicleCard';
import MaintenanceAlert from '@/components/dashboard/MaintenanceAlert';
import { MissionWidget } from '@/components/dashboard/MissionWidget';
import { driverStatsService, type DriverStats, type DriverAlert } from '@/api/services/driver-stats.service';

interface DriverProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  licenseNumber?: string;
  licenseExpiryDate?: Date;
  status: string;
  assignedVehicle?: {
    id: string;
    registration: string;
    brand: string;
    model: string;
    year: number;
    currentKm: number;
    status: string;
    photos?: string[];
    lastTechnicalInspection?: Date;
    nextTechnicalInspection?: Date;
  };
  createdAt: Date;
}

interface Report {
  id: string;
  type: string;
  description: string;
  status: string;
  createdAt: Date;
  vehicleRegistration?: string;
}

export default function DriverDashboard() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<DriverProfile | null>(null);
  const [reports, setReports] = useState<Report[]>([]);
  const [stats, setStats] = useState<DriverStats | null>(null);
  const [alerts, setAlerts] = useState<DriverAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [showReportModal, setShowReportModal] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [profileRes, reportsRes, statsData, alertsData] = await Promise.all([
        api.get<DriverProfile>('/driver/profile'),
        api.get<Report[]>('/driver/reports'),
        driverStatsService.getStats(),
        driverStatsService.getAlerts(),
      ]);
      setProfile(profileRes.data);
      setReports(reportsRes.data);
      setStats(statsData);
      setAlerts(alertsData);
    } catch (error) {
      console.error('Error fetching driver data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: Date | undefined) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('fr-FR');
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
      case 'available':
        return 'bg-green-100 text-green-800';
      case 'in_use':
      case 'maintenance':
        return 'bg-yellow-100 text-yellow-800';
      case 'inactive':
      case 'unavailable':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-flotteq-blue"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Tableau de bord</h1>
          <p className="text-gray-600 mt-1">Bienvenue {profile?.firstName} !</p>
        </div>
        {profile?.assignedVehicle && (
          <button
            onClick={() => setShowReportModal(true)}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium text-lg min-h-[48px] shadow-sm"
            aria-label="Signaler un problème avec le véhicule"
          >
            <AlertTriangle className="w-6 h-6" />
            Signaler un problème
          </button>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <StatsCard
          title="Documents à renouveler"
          value={stats?.expiringDocumentsCount || 0}
          subtitle={`${stats?.expiredDocumentsCount || 0} expiré${
            (stats?.expiredDocumentsCount || 0) > 1 ? 's' : ''
          }`}
          icon={FileText}
          iconColor={stats?.expiredDocumentsCount ? 'text-red-600' : 'text-blue-600'}
          iconBgColor={stats?.expiredDocumentsCount ? 'bg-red-50' : 'bg-blue-50'}
        />
        <StatsCard
          title="Signalements actifs"
          value={stats?.activeReportsCount || 0}
          subtitle="En cours de traitement"
          icon={AlertCircle}
          iconColor="text-orange-600"
          iconBgColor="bg-orange-50"
        />
        <StatsCard
          title="Kilométrage"
          value={profile?.assignedVehicle?.currentKm || 0}
          subtitle="Kilomètres actuels"
          icon={Gauge}
          iconColor="text-green-600"
          iconBgColor="bg-green-50"
        />
      </div>

      {/* Alertes et rappels */}
      <MaintenanceAlert alerts={alerts} loading={loading} />

      {/* Mission Widget */}
      <MissionWidget currentVehicleKm={profile?.assignedVehicle?.currentKm} />

      {/* Mon véhicule */}
      <MyVehicleCard vehicle={profile?.assignedVehicle || null} />

      {/* Mon profil (compact) */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-flotteq-light rounded-lg">
            <User className="w-6 h-6 text-flotteq-blue" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900">Mon profil</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <Mail className="w-5 h-5 text-gray-400" />
            <div>
              <p className="text-xs text-gray-600">Email</p>
              <p className="font-medium text-gray-900">{profile?.email}</p>
            </div>
          </div>
          {profile?.phone && (
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <Phone className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-xs text-gray-600">Téléphone</p>
                <p className="font-medium text-gray-900">{profile.phone}</p>
              </div>
            </div>
          )}
          {profile?.licenseNumber && (
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <FileText className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-xs text-gray-600">Permis de conduire</p>
                <p className="font-medium text-gray-900">{profile.licenseNumber}</p>
              </div>
            </div>
          )}
          {profile?.licenseExpiryDate && (
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <Calendar className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-xs text-gray-600">Expiration permis</p>
                <p className="font-medium text-gray-900">
                  {formatDate(profile.licenseExpiryDate)}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Recent Reports */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-flotteq-light rounded-lg">
              <AlertCircle className="w-6 h-6 text-flotteq-blue" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">Mes signalements récents</h2>
          </div>
          <button
            onClick={() => navigate('/reports')}
            className="text-flotteq-blue hover:text-flotteq-navy font-medium min-h-[48px] px-4"
            aria-label="Voir tous les signalements"
          >
            Voir tout
          </button>
        </div>
        {reports.length > 0 ? (
          <div className="space-y-3">
            {reports.slice(0, 3).map((report) => (
              <div key={report.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{report.type}</p>
                  <p className="text-sm text-gray-600 line-clamp-1">{report.description}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {formatDate(report.createdAt)}
                  </p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(report.status)}`}
                >
                  {report.status}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 bg-gray-50 rounded-lg">
            <CheckCircle className="h-12 w-12 text-green-400 mb-3" />
            <p className="text-gray-500 text-sm">Aucun signalement pour le moment</p>
            <p className="text-gray-400 text-xs mt-1">Tout est en ordre ! 👍</p>
          </div>
        )}
      </div>

      {/* Actions rapides */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Actions rapides</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            onClick={() => navigate('/documents')}
            className="flex items-center justify-center gap-3 px-6 py-4 bg-flotteq-blue text-white rounded-lg hover:bg-flotteq-navy transition-colors font-medium shadow-sm min-h-[48px]"
            aria-label="Voir mes documents"
          >
            <FileText className="h-6 w-6" />
            Voir mes documents
          </button>
          {profile?.assignedVehicle && (
            <>
              <button
                onClick={() => navigate('/vehicle-check')}
                className="flex items-center justify-center gap-3 px-6 py-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium shadow-sm min-h-[48px]"
                aria-label="Faire un check véhicule"
              >
                <ClipboardCheck className="h-6 w-6" />
                Check véhicule
              </button>
              <button
                onClick={() => setShowReportModal(true)}
                className="flex items-center justify-center gap-3 px-6 py-4 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium shadow-sm min-h-[48px]"
                aria-label="Signaler un problème"
              >
                <AlertTriangle className="h-6 w-6" />
                Signaler un problème
              </button>
            </>
          )}
        </div>
      </div>

      {/* Report Modal */}
      <ReportVehicleModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        onSuccess={() => {
          setShowReportModal(false);
          fetchData();
        }}
      />
    </div>
  );
}
