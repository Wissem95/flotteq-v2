
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { CreditCard, Calendar, Package, Users, Car, UserCheck, CheckCircle2 } from 'lucide-react';
import type { Tenant } from '@/api/types/tenant.types';

interface TenantSubscriptionTabProps {
  tenant: Tenant;
}

const getStatusBadgeColor = (status: string) => {
  switch (status.toLowerCase()) {
    case 'active':
      return 'bg-green-100 text-green-800';
    case 'trialing':
    case 'trial':
      return 'bg-yellow-100 text-yellow-800';
    case 'canceled':
    case 'past_due':
    case 'unpaid':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const formatStatus = (status: string) => {
  const statusMap: Record<string, string> = {
    active: 'Actif',
    trial: 'Essai gratuit',
    trialing: 'Essai',
    canceled: 'Annulé',
    past_due: 'En retard',
    unpaid: 'Impayé',
    incomplete: 'Incomplet',
  };
  return statusMap[status] || status;
};

export const TenantSubscriptionTab = ({ tenant }: TenantSubscriptionTabProps) => {
  const plan = tenant.plan;

  if (!plan) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Abonnement</CardTitle>
        </CardHeader>
        <CardContent className="py-12">
          <p className="text-center text-muted-foreground">
            ⚠️ Aucun plan d'abonnement assigné à ce tenant
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Abonnement</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Informations principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Package className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Plan</p>
                <p className="text-2xl font-bold">{plan.name}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <CreditCard className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Prix</p>
                <p className="text-2xl font-bold">
                  {plan.price === 0 ? (
                    <span className="text-green-600">Gratuit</span>
                  ) : (
                    <>€{plan.price}/mois</>
                  )}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Statut</p>
                <Badge className={getStatusBadgeColor(tenant.subscriptionStatus)}>
                  {formatStatus(tenant.subscriptionStatus)}
                </Badge>
              </div>
            </div>

            {tenant.trialEndsAt && (
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">
                    {tenant.subscriptionStatus === 'trial' ? "Fin de l'essai" : 'Prochaine facturation'}
                  </p>
                  <p className="text-base font-medium">
                    {new Date(tenant.trialEndsAt).toLocaleDateString('fr-FR', {
                      dateStyle: 'long',
                    })}
                  </p>
                </div>
              </div>
            )}

            {tenant.subscriptionStartedAt && (
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Début abonnement</p>
                  <p className="text-base font-medium">
                    {new Date(tenant.subscriptionStartedAt).toLocaleDateString('fr-FR', {
                      dateStyle: 'long',
                    })}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        <Separator />

        {/* Limites du plan */}
        <div>
          <h4 className="font-semibold mb-4">Limites du plan</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg border border-blue-100">
              <Car className="h-6 w-6 text-blue-600" />
              <div>
                <p className="text-sm text-muted-foreground">Véhicules</p>
                <p className="text-xl font-bold">
                  {plan.maxVehicles === -1 ? 'Illimité' : plan.maxVehicles}
                </p>
                {tenant.vehicles && plan.maxVehicles !== -1 && (
                  <p className="text-xs text-muted-foreground">
                    {tenant.vehicles.length} / {plan.maxVehicles} utilisés
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-purple-50 rounded-lg border border-purple-100">
              <Users className="h-6 w-6 text-purple-600" />
              <div>
                <p className="text-sm text-muted-foreground">Utilisateurs</p>
                <p className="text-xl font-bold">
                  {plan.maxUsers === -1 ? 'Illimité' : plan.maxUsers}
                </p>
                {tenant.users && plan.maxUsers !== -1 && (
                  <p className="text-xs text-muted-foreground">
                    {tenant.users.length} / {plan.maxUsers} utilisés
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg border border-green-100">
              <UserCheck className="h-6 w-6 text-green-600" />
              <div>
                <p className="text-sm text-muted-foreground">Conducteurs</p>
                <p className="text-xl font-bold">
                  {plan.maxDrivers === -1 ? 'Illimité' : plan.maxDrivers}
                </p>
                {tenant.drivers && plan.maxDrivers !== -1 && (
                  <p className="text-xs text-muted-foreground">
                    {tenant.drivers.length} / {plan.maxDrivers} utilisés
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Fonctionnalités incluses */}
        {plan.features && plan.features.length > 0 && (
          <>
            <Separator />
            <div>
              <h4 className="font-semibold mb-3">Fonctionnalités incluses</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {plan.features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
                    <span className="text-sm">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Informations Stripe */}
        {(tenant.stripeCustomerId || tenant.stripeSubscriptionId) && (
          <>
            <Separator />
            <div>
              <h4 className="font-semibold mb-3">Informations Stripe</h4>
              <div className="space-y-2 text-sm text-muted-foreground">
                {tenant.stripeCustomerId && (
                  <p className="font-mono text-xs">
                    • Customer ID : {tenant.stripeCustomerId}
                  </p>
                )}
                {tenant.stripeSubscriptionId && (
                  <p className="font-mono text-xs">
                    • Subscription ID : {tenant.stripeSubscriptionId}
                  </p>
                )}
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};
