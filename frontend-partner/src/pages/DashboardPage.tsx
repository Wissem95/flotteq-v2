import { Calendar, DollarSign, Clock, TrendingUp } from 'lucide-react';
import StatsCard from '../components/dashboard/StatsCard';
import RevenueChart from '../components/dashboard/RevenueChart';
import PendingBookingsList from '../components/dashboard/PendingBookingsList';
import WeeklyCalendar from '../components/dashboard/WeeklyCalendar';
import { useDashboardStats } from '../hooks/useDashboardStats';

export default function DashboardPage() {
  const { data: stats, isLoading } = useDashboardStats();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Tableau de bord</h1>

      {/* KPIs - Stats Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
              <div className="h-8 bg-gray-200 rounded w-3/4"></div>
            </div>
          ))}
        </div>
      ) : stats ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="RDV cette semaine"
            value={stats.bookingsThisWeek}
            icon={Calendar}
            iconColor="text-blue-600"
            iconBgColor="bg-blue-50"
          />
          <StatsCard
            title="CA mois en cours"
            value={`${stats.revenueThisMonth.toFixed(2)}€`}
            icon={DollarSign}
            iconColor="text-emerald-600"
            iconBgColor="bg-emerald-50"
          />
          <StatsCard
            title="Paiements en attente"
            value={`${stats.pendingPayments.toFixed(2)}€`}
            icon={Clock}
            iconColor="text-orange-600"
            iconBgColor="bg-orange-50"
          />
          <StatsCard
            title="Taux d'acceptation"
            value={`${stats.acceptanceRate}%`}
            icon={TrendingUp}
            iconColor="text-purple-600"
            iconBgColor="bg-purple-50"
          />
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          Erreur de chargement des statistiques
        </div>
      )}

      {/* Planning de la semaine */}
      <WeeklyCalendar />

      {/* Graphique CA */}
      <RevenueChart />

      {/* RDV en attente */}
      <PendingBookingsList />
    </div>
  );
}
