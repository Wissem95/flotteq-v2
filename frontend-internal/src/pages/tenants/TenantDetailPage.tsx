import { useParams, useNavigate } from 'react-router-dom';
import { useTenant, useTenantStats, useTenantStorageUsage } from '@/hooks/useTenants';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TenantInfoTab } from '@/components/tenants/TenantInfoTab';
import { TenantUsersTab } from '@/components/tenants/TenantUsersTab';
import { TenantVehiclesTab } from '@/components/tenants/TenantVehiclesTab';
import { TenantSubscriptionTab } from '@/components/tenants/TenantSubscriptionTab';
import { TenantStorageTab } from '@/components/tenants/TenantStorageTab';
import {
  ArrowLeft,
  Pencil,
  Users,
  Car,
  UserCheck,
  HardDrive,
  Loader2,
} from 'lucide-react';

const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case 'active':
      return 'bg-green-100 text-green-800';
    case 'trial':
      return 'bg-yellow-100 text-yellow-800';
    case 'cancelled':
    case 'past_due':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export const TenantDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: tenant, isLoading } = useTenant(Number(id));
  const { data: stats } = useTenantStats(Number(id));
  const { data: storageUsage } = useTenantStorageUsage(Number(id));

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-flotteq-blue" />
      </div>
    );
  }

  if (!tenant) {
    return (
      <div className="text-center py-12">
        <p className="text-destructive">Tenant introuvable</p>
      </div>
    );
  }

  // Calculate active users
  const activeUsers = tenant.users?.filter((u) => u.isActive).length || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/tenants')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{tenant.name}</h1>
            <p className="text-muted-foreground">{tenant.email}</p>
          </div>
          <Badge className={getStatusColor(tenant.status)}>
            {tenant.status.toUpperCase()}
          </Badge>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate(`/tenants/${id}/edit`)}>
            <Pencil className="h-4 w-4 mr-2" />
            Modifier
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-full bg-blue-100">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats?.usersCount || 0}</p>
              <p className="text-sm text-muted-foreground">
                Utilisateurs ({activeUsers} actifs)
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-full bg-purple-100">
              <Car className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats?.vehiclesCount || 0}</p>
              <p className="text-sm text-muted-foreground">
                Véhicules
                {tenant.plan && (
                  <> / {tenant.plan.maxVehicles} max</>
                )}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-full bg-green-100">
              <UserCheck className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats?.driversCount || 0}</p>
              <p className="text-sm text-muted-foreground">Conducteurs</p>
            </div>
          </div>
        </Card>

        {storageUsage && (
          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-orange-100">
                <HardDrive className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {storageUsage.usedMb.toFixed(0)} MB
                </p>
                <p className="text-sm text-muted-foreground">
                  Stockage ({storageUsage.usagePercent.toFixed(0)}%)
                </p>
              </div>
            </div>
          </Card>
        )}
      </div>

      {/* Tabs */}
      <Tabs defaultValue="info" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="info">Informations</TabsTrigger>
          <TabsTrigger value="users">
            Utilisateurs ({tenant.users?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="vehicles">
            Véhicules ({tenant.vehicles?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="subscription">Abonnement</TabsTrigger>
          <TabsTrigger value="storage">
            <HardDrive className="h-4 w-4 mr-2" />
            Stockage
          </TabsTrigger>
        </TabsList>

        <TabsContent value="info">
          <TenantInfoTab tenant={tenant} />
        </TabsContent>

        <TabsContent value="users">
          <TenantUsersTab users={tenant.users || []} />
        </TabsContent>

        <TabsContent value="vehicles">
          <TenantVehiclesTab vehicles={tenant.vehicles || []} />
        </TabsContent>

        <TabsContent value="subscription">
          <TenantSubscriptionTab tenant={tenant} />
        </TabsContent>

        <TabsContent value="storage">
          <TenantStorageTab
            tenantId={Number(id)}
            storageUsage={storageUsage}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};
