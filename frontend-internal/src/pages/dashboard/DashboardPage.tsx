import { Building2, TrendingUp, Car, AlertTriangle, Users } from 'lucide-react';
import { KPICard } from '@/components/dashboard/KPICard';
import { MRRChart } from '@/components/dashboard/MRRChart';
import { SubscriptionsPieChart } from '@/components/dashboard/SubscriptionsPieChart';
import { RecentTenantsList } from '@/components/dashboard/RecentTenantsList';
import { ActivityFeed } from '@/components/dashboard/ActivityFeed';
import { useDashboard } from '@/hooks/useDashboard';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';

export const DashboardPage = () => {
  const { stats, revenue, subscriptions, activity, recentTenants } = useDashboard();

  // Loading state
  if (stats.isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  // Error state
  if (stats.error) {
    return (
      <div className="p-6">
        <Alert variant="destructive">
          <AlertDescription>
            Erreur lors du chargement du dashboard. Vérifiez que vous êtes bien connecté en tant qu'administrateur FlotteQ.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const statsData = stats.data!;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-[#1a3a6c] via-[#2463b0] to-[#14b8a6] bg-clip-text text-transparent">
          Dashboard FlotteQ
        </h1>
        <p className="text-gray-600 mt-1">
          Vue d'ensemble de la plateforme
        </p>
      </div>

      {/* KPIs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <KPICard
          title="Tenants Actifs"
          value={statsData.activeTenants}
          icon={Building2}
          iconColor="text-blue-600"
        />
        <KPICard
          title="MRR"
          value={`€${statsData.mrr.toFixed(2)}`}
          icon={TrendingUp}
          iconColor="text-green-600"
        />
        <KPICard
          title="Véhicules"
          value={statsData.totalVehicles}
          icon={Car}
          iconColor="text-purple-600"
        />
        <KPICard
          title="Utilisateurs"
          value={statsData.totalUsers}
          icon={Users}
          iconColor="text-indigo-600"
        />
        <KPICard
          title="Churn Rate"
          value={`${statsData.churnRate.toFixed(1)}%`}
          icon={AlertTriangle}
          iconColor="text-orange-600"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {revenue.isLoading ? (
            <Skeleton className="h-[400px]" />
          ) : revenue.data ? (
            <MRRChart data={revenue.data.revenueEvolution} />
          ) : null}
        </div>
        <div>
          {subscriptions.isLoading ? (
            <Skeleton className="h-[400px]" />
          ) : subscriptions.data ? (
            <SubscriptionsPieChart data={subscriptions.data.planDistribution} />
          ) : null}
        </div>
      </div>

      {/* Tables Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {recentTenants.isLoading ? (
          <Skeleton className="h-64" />
        ) : recentTenants.data ? (
          <RecentTenantsList tenants={recentTenants.data} />
        ) : null}

        {activity.isLoading ? (
          <Skeleton className="h-64" />
        ) : activity.data ? (
          <ActivityFeed activities={activity.data} />
        ) : null}
      </div>
    </div>
  );
};
