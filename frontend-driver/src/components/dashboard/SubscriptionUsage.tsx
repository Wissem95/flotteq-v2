import { useEffect, useState } from 'react';
import { dashboardService } from '@/api/services/dashboard.service';
import type { SubscriptionUsage } from '@/types/dashboard.types';
import { Package, Car, Users, HardDrive } from 'lucide-react';

interface UsageBarProps {
  label: string;
  icon: typeof Car;
  current: number;
  max: number;
  percentage: number;
  unit?: string;
}

function UsageBar({ label, icon: Icon, current, max, percentage, unit = '' }: UsageBarProps) {
  const getColor = (percent: number) => {
    if (percent >= 90) return 'bg-red-500';
    if (percent >= 70) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getTextColor = (percent: number) => {
    if (percent >= 90) return 'text-red-700';
    if (percent >= 70) return 'text-yellow-700';
    return 'text-green-700';
  };

  const color = getColor(percentage);
  const textColor = getTextColor(percentage);
  const displayPercentage = Math.min(percentage, 100);

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-gray-500" />
          <span className="text-sm text-gray-600 font-medium">{label}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-gray-900">
            {current} / {max}
          </span>
          {unit && <span className="text-xs text-gray-500">{unit}</span>}
        </div>
      </div>
      <div className="relative">
        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
          <div
            className={`${color} h-3 rounded-full transition-all duration-500 ease-out`}
            style={{ width: `${displayPercentage}%` }}
          />
        </div>
        <div className={`text-xs font-semibold mt-1 ${textColor}`}>
          {percentage.toFixed(1)}%
        </div>
      </div>
    </div>
  );
}

export default function SubscriptionUsage() {
  const [usage, setUsage] = useState<SubscriptionUsage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadUsage();
  }, []);

  const loadUsage = async () => {
    try {
      setLoading(true);
      const data = await dashboardService.getSubscriptionUsage();
      setUsage(data);
    } catch (err: any) {
      // Silently fail if endpoint not ready yet
      setError(err.response?.data?.message || 'Erreur de chargement');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Package className="h-5 w-5 text-gray-600" />
          <h2 className="text-lg font-semibold text-gray-900">Utilisation du plan</h2>
        </div>
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-flotteq-blue"></div>
        </div>
      </div>
    );
  }

  if (error || !usage) {
    return null; // Don't show component if there's an error
  }

  // Don't show if no active plan
  if (usage.planName === 'Aucun plan actif') {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Package className="h-5 w-5 text-gray-600" />
          <h2 className="text-lg font-semibold text-gray-900">Utilisation du plan</h2>
        </div>
        <div className="flex flex-col items-center justify-center h-32 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
          <Package className="h-10 w-10 text-gray-300 mb-2" />
          <p className="text-gray-500 text-sm">Aucun plan actif</p>
        </div>
      </div>
    );
  }

  const hasLimits = usage.maxVehicles > 0 || usage.maxDrivers > 0;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Package className="h-5 w-5 text-gray-600" />
          <h2 className="text-lg font-semibold text-gray-900">Utilisation du plan</h2>
        </div>
        <div className="px-3 py-1 bg-flotteq-blue/10 text-flotteq-blue rounded-full text-sm font-medium">
          {usage.planName}
        </div>
      </div>

      {hasLimits ? (
        <div className="space-y-6">
          {usage.maxVehicles > 0 && (
            <UsageBar
              label="Véhicules"
              icon={Car}
              current={usage.currentVehicles}
              max={usage.maxVehicles}
              percentage={usage.usagePercentage.vehicles}
            />
          )}

          {usage.maxDrivers > 0 && (
            <UsageBar
              label="Conducteurs"
              icon={Users}
              current={usage.currentDrivers}
              max={usage.maxDrivers}
              percentage={usage.usagePercentage.drivers}
            />
          )}

          {usage.storageQuotaMB > 0 && (
            <UsageBar
              label="Stockage"
              icon={HardDrive}
              current={usage.storageUsedMB}
              max={usage.storageQuotaMB}
              percentage={usage.usagePercentage.storage}
              unit="MB"
            />
          )}
        </div>
      ) : (
        <div className="text-center py-4 text-gray-500 text-sm">
          Plan illimité
        </div>
      )}

      {hasLimits && (
        <div className="mt-6 pt-6 border-t border-gray-100">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">Besoin de plus de capacité ?</span>
            <button className="text-flotteq-blue hover:text-flotteq-navy font-medium transition-colors">
              Mettre à niveau →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
