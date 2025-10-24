import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CommissionKPIs } from '@/components/commissions/CommissionKPIs';
import { TopPartnersTable } from '@/components/commissions/TopPartnersTable';
import { PendingCommissionsList } from '@/components/commissions/PendingCommissionsList';
import { CommissionsChart } from '@/components/commissions/CommissionsChart';
import {
  useCommissionsStats,
  usePendingCommissions,
  useExportCommissions,
} from '@/hooks/useCommissions';

export const CommissionsDashboardPage = () => {
  const { data: stats, isLoading: statsLoading, error: statsError } = useCommissionsStats();
  const {
    data: pendingCommissions,
    isLoading: pendingLoading,
    error: pendingError,
  } = usePendingCommissions();
  const exportMutation = useExportCommissions();

  const handleExport = () => {
    exportMutation.mutate(undefined);
  };

  // Loading state
  if (statsLoading || pendingLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  // Error state
  if (statsError || pendingError) {
    return (
      <div className="space-y-6">
        <Alert variant="destructive">
          <AlertDescription>
            Erreur lors du chargement du dashboard des commissions. Vérifiez que vous êtes
            bien connecté en tant qu'administrateur.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-[#1a3a6c] via-[#2463b0] to-[#14b8a6] bg-clip-text text-transparent">
            Dashboard Commissions
          </h1>
          <p className="text-gray-600 mt-1">
            Gestion et suivi des commissions partenaires
          </p>
        </div>
        <Button onClick={handleExport} disabled={exportMutation.isPending}>
          <Download className="h-4 w-4 mr-2" />
          {exportMutation.isPending ? 'Export en cours...' : 'Exporter Excel'}
        </Button>
      </div>

      {/* KPIs */}
      {stats && (
        <CommissionKPIs
          totalThisMonth={stats.totalThisMonth}
          pendingAmount={stats.pendingAmount}
          activePartners={stats.activePartners}
          platformRevenue={stats.platformRevenue}
        />
      )}

      {/* Top Partners & Pending Commissions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {stats && <TopPartnersTable partners={stats.topPartners} />}
        {pendingCommissions && (
          <PendingCommissionsList commissions={pendingCommissions} />
        )}
      </div>

      {/* Evolution Chart */}
      {stats && stats.evolution && stats.evolution.length > 0 && (
        <CommissionsChart data={stats.evolution} />
      )}
    </div>
  );
};
