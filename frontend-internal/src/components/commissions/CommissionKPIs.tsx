import { KPICard } from '@/components/dashboard/KPICard';
import { DollarSign, Clock, Users, TrendingUp } from 'lucide-react';

interface CommissionKPIsProps {
  totalThisMonth: number;
  pendingAmount: number;
  activePartners: number;
  platformRevenue: number;
}

export const CommissionKPIs = ({
  totalThisMonth,
  pendingAmount,
  activePartners,
  platformRevenue,
}: CommissionKPIsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <KPICard
        title="Commissions ce mois"
        value={`€${Number(totalThisMonth).toFixed(2)}`}
        icon={DollarSign}
        iconColor="text-green-600"
      />
      <KPICard
        title="Commissions en attente"
        value={`€${Number(pendingAmount).toFixed(2)}`}
        icon={Clock}
        iconColor="text-yellow-600"
      />
      <KPICard
        title="Partenaires actifs"
        value={activePartners}
        icon={Users}
        iconColor="text-blue-600"
      />
      <KPICard
        title="CA plateforme"
        value={`€${Number(platformRevenue).toFixed(2)}`}
        icon={TrendingUp}
        iconColor="text-purple-600"
      />
    </div>
  );
};
