import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';

interface KPICardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  iconColor: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

export const KPICard = ({ title, value, icon: Icon, iconColor, trend }: KPICardProps) => {
  return (
    <Card className="hover:shadow-lg transition-shadow duration-200">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <div className={`p-2 rounded-lg bg-opacity-10 ${iconColor.replace('text-', 'bg-')}`}>
          <Icon className={`h-5 w-5 ${iconColor}`} />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-gray-900">{value}</div>
        {trend && (
          <p className={`text-xs mt-1 flex items-center gap-1 ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
            {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}% vs mois dernier
          </p>
        )}
      </CardContent>
    </Card>
  );
};
