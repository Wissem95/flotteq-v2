import { useEffect, useState } from 'react';
import { dashboardService } from '@/api/services/dashboard.service';
import StatsCard from '@/components/dashboard/StatsCard';
import CostsChart from '@/components/dashboard/CostsChart';
import AlertsList from '@/components/dashboard/AlertsList';
import SubscriptionUsage from '@/components/dashboard/SubscriptionUsage';
import { ExpiringDocumentsWidget } from '@/components/dashboard/ExpiringDocumentsWidget';
import type { DashboardStats } from '@/types/dashboard.types';
import { Car, Users, Wrench, Plus } from 'lucide-react';

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const data = await dashboardService.getStats();
      setStats(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur de chargement');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div role="status" className="animate-spin rounded-full h-12 w-12 border-b-2 border-flotteq-blue"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg bg-red-50 border border-red-200 p-4">
        <p className="text-sm text-red-800">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Tableau de bord</h1>
        <p className="mt-2 text-sm sm:text-base text-gray-600">Vue d'ensemble de votre flotte</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <StatsCard
          title="Véhicules"
          value={stats?.totalVehicles || 0}
          subtitle={`${stats?.activeVehicles || 0} actifs`}
          icon={Car}
          iconColor="text-blue-600"
          iconBgColor="bg-blue-50"
        />
        <StatsCard
          title="Conducteurs"
          value={stats?.totalDrivers || 0}
          subtitle={`${stats?.activeDrivers || 0} actifs`}
          icon={Users}
          iconColor="text-green-600"
          iconBgColor="bg-green-50"
        />
        <StatsCard
          title="Maintenances"
          value={stats?.upcomingMaintenances || 0}
          subtitle={`${stats?.overdueMaintenances || 0} en retard`}
          icon={Wrench}
          iconColor="text-orange-600"
          iconBgColor="bg-orange-50"
        />
      </div>

      {/* Graphiques et alertes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CostsChart />
        <AlertsList />
      </div>

      {/* Documents expirant */}
      <ExpiringDocumentsWidget />

      {/* Utilisation du plan */}
      <SubscriptionUsage />

      {/* Actions rapides */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Actions rapides</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <button className="flex items-center justify-center gap-2 px-4 py-3 bg-flotteq-blue text-white rounded-lg hover:bg-flotteq-navy transition-colors font-medium shadow-sm">
            <Plus className="h-5 w-5" />
            Ajouter un véhicule
          </button>
          <button className="flex items-center justify-center gap-2 px-4 py-3 bg-flotteq-blue text-white rounded-lg hover:bg-flotteq-navy transition-colors font-medium shadow-sm">
            <Plus className="h-5 w-5" />
            Ajouter un conducteur
          </button>
          <button className="flex items-center justify-center gap-2 px-4 py-3 bg-flotteq-blue text-white rounded-lg hover:bg-flotteq-navy transition-colors font-medium shadow-sm">
            <Plus className="h-5 w-5" />
            Planifier maintenance
          </button>
        </div>
      </div>
    </div>
  );
}
