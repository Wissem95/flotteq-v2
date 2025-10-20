import { AlertTriangle, TrendingUp } from 'lucide-react';
import type { SubscriptionStats } from '@/api/services/billing.service';

interface UsageAlertBannerProps {
  stats: SubscriptionStats;
  onUpgrade: () => void;
}

export default function UsageAlertBanner({ stats, onUpgrade }: UsageAlertBannerProps) {
  const { vehicles, users, drivers } = stats.usage;

  const highestUsage = Math.max(
    vehicles.percentage,
    users.percentage,
    drivers.percentage
  );

  // Don't show if usage is below 80%
  if (highestUsage < 80) {
    return null;
  }

  const isWarning = highestUsage >= 80 && highestUsage < 90;
  const isCritical = highestUsage >= 90;

  const getResourceName = () => {
    if (vehicles.percentage === highestUsage) return 'véhicules';
    if (users.percentage === highestUsage) return 'utilisateurs';
    return 'conducteurs';
  };

  const getBorderColor = () => {
    if (isCritical) return 'bg-red-50 border-red-500';
    if (isWarning) return 'bg-yellow-50 border-yellow-500';
    return 'bg-yellow-50 border-yellow-500';
  };

  return (
    <div className={`rounded-lg border-l-4 p-4 mb-6 ${getBorderColor()}`}
    >
      <div className="flex items-start gap-3">
        <AlertTriangle
          className={`h-6 w-6 flex-shrink-0 mt-0.5 ${
            isCritical ? 'text-red-600' : 'text-yellow-600'
          }`}
        />
        <div className="flex-1">
          <h3
            className={`font-semibold mb-1 ${
              isCritical ? 'text-red-900' : 'text-yellow-900'
            }`}
          >
            {isCritical
              ? 'Limite presque atteinte !'
              : 'Vous approchez de la limite'}
          </h3>
          <p
            className={`text-sm mb-3 ${
              isCritical ? 'text-red-700' : 'text-yellow-700'
            }`}
          >
            Vous utilisez actuellement {highestUsage.toFixed(0)}% de votre quota de{' '}
            {getResourceName()} pour le plan <strong>{stats.plan.name}</strong>.
            {isCritical &&
              ' Vous ne pourrez bientôt plus en ajouter de nouveaux.'}
          </p>
          <button
            onClick={onUpgrade}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
              isCritical
                ? 'bg-red-600 text-white hover:bg-red-700'
                : 'bg-yellow-600 text-white hover:bg-yellow-700'
            }`}
          >
            <TrendingUp className="h-4 w-4" />
            Augmenter mon plan
          </button>
        </div>
      </div>
    </div>
  );
}
