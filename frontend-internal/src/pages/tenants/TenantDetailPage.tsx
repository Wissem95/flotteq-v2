import { useParams, useNavigate } from 'react-router-dom';
import { useTenant, useTenantStats } from '@/hooks/useTenants';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  ArrowLeft,
  Pencil,
  Users,
  Car,
  UserCheck,
  Building2,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Loader2,
} from 'lucide-react';

export const TenantDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: tenant, isLoading } = useTenant(Number(id));
  const { data: stats } = useTenantStats(Number(id));

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
            <p className="text-muted-foreground">Tenant #{tenant.id}</p>
          </div>
        </div>
        <Button onClick={() => navigate(`/tenants/${id}/edit`)}>
          <Pencil className="h-4 w-4 mr-2" />
          Modifier
        </Button>
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
              <p className="text-sm text-muted-foreground">Utilisateurs</p>
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
              <p className="text-sm text-muted-foreground">Véhicules</p>
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

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-full bg-orange-100">
              <Car className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats?.activeVehicles || 0}</p>
              <p className="text-sm text-muted-foreground">Actifs</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Tenant Info */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Informations</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Building2 className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Nom</p>
                <p className="font-medium">{tenant.name}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium">{tenant.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Phone className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Téléphone</p>
                <p className="font-medium">{tenant.phone}</p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <MapPin className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Adresse</p>
                <p className="font-medium">{tenant.address}</p>
                <p className="text-sm">
                  {tenant.postalCode} {tenant.city}, {tenant.country}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Créé le</p>
                <p className="font-medium">
                  {new Date(tenant.createdAt).toLocaleDateString('fr-FR', {
                    dateStyle: 'long',
                  })}
                </p>
              </div>
            </div>
          </div>
        </div>

        <Separator className="my-6" />

        <div className="flex gap-4">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Status</p>
            <Badge>{tenant.status.toUpperCase()}</Badge>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">Abonnement</p>
            <Badge>{tenant.subscriptionStatus.toUpperCase()}</Badge>
          </div>
        </div>
      </Card>
    </div>
  );
};
