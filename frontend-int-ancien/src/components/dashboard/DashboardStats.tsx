// components/dashboard/DashboardStats.tsx - Composant de statistiques réutilisable

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Building, 
  Users, 
  Car, 
  Wrench, 
  AlertCircle, 
  TrendingUp, 
  TrendingDown,
  Activity,
  CheckCircle
} from 'lucide-react';

interface StatsData {
  scope: 'global' | 'tenant';
  tenant_info?: {
    id: string;
    name: string;
    domain?: string;
  } | null;
  stats: {
    tenants: {
      total: number;
      active: number;
    };
    vehicles: {
      total: number;
      active: number;
      in_maintenance: number;
    };
    users: {
      total: number;
      active: number;
      inactive: number;
    };
    maintenances: {
      pending: number;
      upcoming_30_days: number;
    };
    alerts: {
      critical: number;
      total: number;
    };
  };
}

interface DashboardStatsProps {
  data: StatsData | null;
  loading?: boolean;
}

interface StatCardProps {
  title: string;
  value: number | string;
  subtitle?: string;
  icon: React.ComponentType<any>;
  trend?: {
    value: number;
    isPositive: boolean;
    label: string;
  };
  color?: 'blue' | 'green' | 'purple' | 'orange' | 'red' | 'yellow';
  badge?: {
    text: string;
    variant?: 'default' | 'secondary' | 'destructive' | 'outline';
  };
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  color = 'blue',
  badge
}) => {
  const colorClasses = {
    blue: 'text-blue-600',
    green: 'text-green-600',
    purple: 'text-purple-600',
    orange: 'text-orange-600',
    red: 'text-red-600',
    yellow: 'text-yellow-600',
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className="flex items-center gap-2">
          <Icon className={`h-4 w-4 ${colorClasses[color]}`} />
          {badge && (
            <Badge variant={badge.variant || 'secondary'} className="text-xs">
              {badge.text}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {subtitle && (
          <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
        )}
        {trend && (
          <div className="flex items-center mt-2">
            {trend.isPositive ? (
              <TrendingUp className="h-4 w-4 text-green-600" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-600" />
            )}
            <span className={`text-xs ml-1 ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
              {trend.value}% {trend.label}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const DashboardStats: React.FC<DashboardStatsProps> = ({ data, loading = false }) => {
  
  // État de chargement
  if (loading || !data) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="pb-2">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-2/3"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const { stats, scope, tenant_info } = data;
  const isGlobal = scope === 'global';

  // Calculer les pourcentages et tendances
  const vehicleUtilizationRate = stats.vehicles.total > 0 
    ? Math.round((stats.vehicles.active / stats.vehicles.total) * 100) 
    : 0;

  const userEngagementRate = stats.users.total > 0 
    ? Math.round((stats.users.active / stats.users.total) * 100) 
    : 0;

  const tenantActivityRate = isGlobal && stats.tenants.total > 0
    ? Math.round((stats.tenants.active / stats.tenants.total) * 100)
    : 0;

  const alertSeverityRate = stats.alerts.total > 0
    ? Math.round((stats.alerts.critical / stats.alerts.total) * 100)
    : 0;

  return (
    <div className="space-y-6">
      {/* Indicateur de scope */}
      <div className="flex items-center gap-2">
        {isGlobal ? (
          <Badge className="bg-blue-100 text-blue-800">
            <Activity className="w-4 h-4 mr-1" />
            Vue Globale - {stats.tenants.total} tenants
          </Badge>
        ) : (
          <Badge className="bg-green-100 text-green-800">
            <Building className="w-4 h-4 mr-1" />
            Tenant: {tenant_info?.name}
          </Badge>
        )}
      </div>

      {/* Grille des statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Tenants - uniquement en mode global */}
        {isGlobal && (
          <StatCard
            title="Tenants"
            value={stats.tenants.total}
            subtitle={`${stats.tenants.active} actifs`}
            icon={Building}
            color="blue"
            trend={{
              value: tenantActivityRate,
              isPositive: tenantActivityRate >= 80,
              label: 'taux d\'activité'
            }}
            badge={{
              text: tenantActivityRate >= 80 ? 'Excellent' : 'À surveiller',
              variant: tenantActivityRate >= 80 ? 'default' : 'secondary'
            }}
          />
        )}

        {/* Utilisateurs */}
        <StatCard
          title="Utilisateurs"
          value={stats.users.total}
          subtitle={`${stats.users.active} actifs, ${stats.users.inactive} inactifs`}
          icon={Users}
          color="purple"
          trend={{
            value: userEngagementRate,
            isPositive: userEngagementRate >= 70,
            label: 'engagement'
          }}
        />

        {/* Véhicules */}
        <StatCard
          title="Véhicules"
          value={stats.vehicles.total}
          subtitle={`${stats.vehicles.active} actifs, ${stats.vehicles.in_maintenance} en maintenance`}
          icon={Car}
          color="green"
          trend={{
            value: vehicleUtilizationRate,
            isPositive: vehicleUtilizationRate >= 80,
            label: 'utilisation'
          }}
          badge={{
            text: stats.vehicles.in_maintenance > 0 ? `${stats.vehicles.in_maintenance} en maintenance` : 'Tous opérationnels',
            variant: stats.vehicles.in_maintenance > 0 ? 'outline' : 'default'
          }}
        />

        {/* Maintenances */}
        <StatCard
          title="Maintenances"
          value={stats.maintenances.pending}
          subtitle={`${stats.maintenances.upcoming_30_days} prévues (30j)`}
          icon={Wrench}
          color="orange"
          badge={{
            text: stats.maintenances.pending > 0 ? 'En attente' : 'À jour',
            variant: stats.maintenances.pending > 0 ? 'destructive' : 'default'
          }}
        />

        {/* Alertes - prend la place des tenants en mode tenant */}
        {(!isGlobal || stats.tenants.total === 0) && (
          <StatCard
            title="Alertes Système"
            value={stats.alerts.total}
            subtitle={`${stats.alerts.critical} critiques`}
            icon={AlertCircle}
            color="red"
            trend={{
              value: alertSeverityRate,
              isPositive: false,
              label: 'critiques'
            }}
            badge={{
              text: stats.alerts.critical > 0 ? 'Action requise' : 'Système sain',
              variant: stats.alerts.critical > 0 ? 'destructive' : 'default'
            }}
          />
        )}
      </div>

      {/* Résumé contextuel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        
        {/* Santé générale */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              État du {isGlobal ? 'Système' : 'Tenant'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">Véhicules opérationnels</span>
                <Badge variant={vehicleUtilizationRate >= 80 ? "default" : "secondary"}>
                  {vehicleUtilizationRate}%
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Utilisateurs actifs</span>
                <Badge variant={userEngagementRate >= 70 ? "default" : "secondary"}>
                  {userEngagementRate}%
                </Badge>
              </div>
              {isGlobal && (
                <div className="flex justify-between">
                  <span className="text-sm">Tenants actifs</span>
                  <Badge variant={tenantActivityRate >= 80 ? "default" : "secondary"}>
                    {tenantActivityRate}%
                  </Badge>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Actions requises */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-orange-600" />
              Actions Requises
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {stats.maintenances.pending > 0 && (
                <div className="flex justify-between">
                  <span className="text-sm">Maintenances en attente</span>
                  <Badge variant="destructive">{stats.maintenances.pending}</Badge>
                </div>
              )}
              {stats.alerts.critical > 0 && (
                <div className="flex justify-between">
                  <span className="text-sm">Alertes critiques</span>
                  <Badge variant="destructive">{stats.alerts.critical}</Badge>
                </div>
              )}
              {stats.maintenances.upcoming_30_days > 0 && (
                <div className="flex justify-between">
                  <span className="text-sm">Maintenances à venir</span>
                  <Badge variant="outline">{stats.maintenances.upcoming_30_days}</Badge>
                </div>
              )}
              {stats.maintenances.pending === 0 && stats.alerts.critical === 0 && (
                <div className="text-center py-4">
                  <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
                  <span className="text-sm text-muted-foreground">Aucune action requise</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Métriques rapides */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              Métriques Rapides
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm">
                  <span>Véhicules par utilisateur</span>
                  <span className="font-medium">
                    {stats.users.total > 0 
                      ? (stats.vehicles.total / stats.users.total).toFixed(1) 
                      : '0'}
                  </span>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm">
                  <span>Taux de maintenance</span>
                  <span className="font-medium">
                    {stats.vehicles.total > 0 
                      ? Math.round((stats.vehicles.in_maintenance / stats.vehicles.total) * 100) 
                      : 0}%
                  </span>
                </div>
              </div>
              {isGlobal && (
                <div>
                  <div className="flex justify-between text-sm">
                    <span>Utilisateurs par tenant</span>
                    <span className="font-medium">
                      {stats.tenants.active > 0 
                        ? Math.round(stats.users.total / stats.tenants.active) 
                        : 0}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardStats;