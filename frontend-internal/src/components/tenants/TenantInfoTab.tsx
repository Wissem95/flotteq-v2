import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Building2, Mail, Phone, MapPin, Calendar } from 'lucide-react';
import type { Tenant } from '@/api/types/tenant.types';

interface TenantInfoTabProps {
  tenant: Tenant;
}

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

export const TenantInfoTab = ({ tenant }: TenantInfoTabProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Informations générales</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
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
                <p className="font-medium">{tenant.phone || 'N/A'}</p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <MapPin className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Adresse</p>
                <p className="font-medium">{tenant.address || 'N/A'}</p>
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
            <Badge className={getStatusColor(tenant.status)}>
              {tenant.status.toUpperCase()}
            </Badge>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">Abonnement</p>
            <Badge className={getStatusColor(tenant.subscriptionStatus)}>
              {tenant.subscriptionStatus.toUpperCase()}
            </Badge>
          </div>
          {tenant.trialEndsAt && (
            <div>
              <p className="text-sm text-muted-foreground mb-1">Fin de l'essai</p>
              <p className="text-sm font-medium">
                {new Date(tenant.trialEndsAt).toLocaleDateString('fr-FR')}
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
