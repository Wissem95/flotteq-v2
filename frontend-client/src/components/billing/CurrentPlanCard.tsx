import { Package, Calendar, TrendingUp } from 'lucide-react';
import type { SubscriptionStats } from '@/api/services/billing.service';
import { format } from 'date-fns';

interface CurrentPlanCardProps {
  stats: SubscriptionStats;
  onUpgrade: () => void;
}

export default function CurrentPlanCard({ stats, onUpgrade }: CurrentPlanCardProps) {
  const isPaidPlan = stats.plan.price > 0;
  const periodEndDate = stats.currentPeriodEnd
    ? format(new Date(stats.currentPeriodEnd), 'dd MMMM yyyy')
    : null;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Package className="h-6 w-6 text-flotteq-blue" />
          <h2 className="text-xl font-semibold text-gray-900">Plan actuel</h2>
        </div>
        <div className={`px-4 py-2 rounded-full text-sm font-medium ${
          stats.status === 'active'
            ? 'bg-green-100 text-green-700'
            : 'bg-yellow-100 text-yellow-700'
        }`}>
          {stats.status === 'active' ? 'Actif' : stats.status}
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <h3 className="text-2xl font-bold text-gray-900">{stats.plan.name}</h3>
          <p className="text-3xl font-bold text-flotteq-blue mt-2">
            {stats.plan.price}€
            <span className="text-base font-normal text-gray-500">/mois</span>
          </p>
        </div>

        {periodEndDate && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Calendar className="h-4 w-4" />
            <span>Renouvellement le {periodEndDate}</span>
          </div>
        )}

        {stats.plan.features && stats.plan.features.length > 0 && (
          <div className="pt-4 border-t border-gray-100">
            <h4 className="text-sm font-medium text-gray-700 mb-3">Fonctionnalités incluses :</h4>
            <ul className="space-y-2">
              {stats.plan.features.map((feature, idx) => (
                <li key={idx} className="flex items-center gap-2 text-sm text-gray-600">
                  <div className="h-1.5 w-1.5 bg-flotteq-blue rounded-full" />
                  {feature}
                </li>
              ))}
            </ul>
          </div>
        )}

        <button
          onClick={onUpgrade}
          className="w-full mt-4 bg-flotteq-blue text-white px-6 py-3 rounded-lg hover:bg-flotteq-navy transition-colors font-medium flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
        >
          <TrendingUp className="h-5 w-5" />
          {!isPaidPlan ? 'Passer à un plan payant' : 'Changer de plan'}
        </button>
      </div>
    </div>
  );
}
