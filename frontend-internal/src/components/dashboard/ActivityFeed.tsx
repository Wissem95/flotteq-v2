import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

interface ActivityFeedProps {
  activities: Array<{
    id: string;
    type: 'TENANT_CREATED' | 'PLAN_CHANGED' | 'SUBSCRIPTION_CANCELLED' | 'PAYMENT_SUCCEEDED' | 'PAYMENT_FAILED';
    tenantId: number;
    tenantName: string;
    description: string;
    createdAt: string;
  }>;
}

export const ActivityFeed = ({ activities }: ActivityFeedProps) => {
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'TENANT_CREATED': return '🎉';
      case 'PLAN_CHANGED': return '📈';
      case 'SUBSCRIPTION_CANCELLED': return '❌';
      case 'PAYMENT_SUCCEEDED': return '✅';
      case 'PAYMENT_FAILED': return '⚠️';
      default: return '📌';
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'TENANT_CREATED': return 'bg-green-100 text-green-800';
      case 'PLAN_CHANGED': return 'bg-blue-100 text-blue-800';
      case 'SUBSCRIPTION_CANCELLED': return 'bg-red-100 text-red-800';
      case 'PAYMENT_SUCCEEDED': return 'bg-green-100 text-green-800';
      case 'PAYMENT_FAILED': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (activities.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>🔔 Activité Récente</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500 text-center py-4">Aucune activité récente</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>🔔 Activité Récente</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {activities.slice(0, 10).map((activity) => (
          <div
            key={activity.id}
            className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="text-2xl">{getActivityIcon(activity.type)}</div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900">
                {activity.description}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {formatDistanceToNow(new Date(activity.createdAt), {
                  addSuffix: true,
                  locale: fr
                })}
              </p>
            </div>
            <Badge className={getActivityColor(activity.type)} variant="outline">
              {activity.type.replace(/_/g, ' ')}
            </Badge>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
