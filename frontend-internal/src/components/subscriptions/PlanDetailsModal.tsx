// PlanDetailsModal.tsx - Modal pour afficher les détails d'un plan d'abonnement
import React from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { 
  Check, 
  X, 
  Car, 
  Users, 
  Shield, 
  DollarSign,
  Calendar,
  Star,
  Crown,
  Building2,
  Zap,
  Info
} from "lucide-react";
import { SubscriptionPlan } from "@/services/subscriptionsService";

interface PlanDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan: SubscriptionPlan | null;
}

const PlanDetailsModal: React.FC<PlanDetailsModalProps> = ({
  isOpen,
  onClose,
  plan
}) => {
  if (!plan) return null;

  const formatPrice = (price: number) => {
    if (price === 0) {
      return 'Gratuit';
    }
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
    }).format(price);
  };

  const getPlanIcon = (planName: string) => {
    const name = planName.toLowerCase();
    
    if (name.includes('trial') || name.includes('free') || name.includes('gratuit')) {
      return <Star className="w-6 h-6 text-green-500" />;
    }
    
    switch (name) {
      case 'starter':
        return <Zap className="w-6 h-6 text-green-500" />;
      case 'business':
      case 'professional':
        return <Building2 className="w-6 h-6 text-blue-500" />;
      case 'enterprise':
        return <Crown className="w-6 h-6 text-purple-500" />;
      default:
        return <Star className="w-6 h-6 text-gray-500" />;
    }
  };

  const getSupportBadge = (level: string) => {
    switch (level) {
      case 'basic':
        return <Badge variant="secondary">Support basique</Badge>;
      case 'premium':
        return <Badge variant="default" className="bg-blue-100 text-blue-800">Support premium</Badge>;
      case 'enterprise':
        return <Badge variant="default" className="bg-purple-100 text-purple-800">Support 24/7</Badge>;
      default:
        return <Badge variant="secondary">Support</Badge>;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            {getPlanIcon(plan.name)}
            <div>
              <DialogTitle className="text-2xl">{plan.name}</DialogTitle>
              <DialogDescription className="text-base mt-1">
                Détails complets du plan d'abonnement
              </DialogDescription>
            </div>
            <div className="ml-auto flex gap-2">
              <Badge variant={plan.is_active ? "default" : "secondary"}>
                {plan.is_active ? 'Actif' : 'Inactif'}
              </Badge>
              {plan.is_popular && (
                <Badge className="bg-purple-600 text-white">
                  <Star className="w-3 h-3 mr-1" />
                  Populaire
                </Badge>
              )}
            </div>
          </div>
        </DialogHeader>

        <div className="grid gap-6">
          {/* Description */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="w-5 h-5" />
                Description
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700">{plan.description}</p>
            </CardContent>
          </Card>

          <Separator />

          {/* Tarification */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Tarification
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2">Prix mensuel</h4>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold">{formatPrice(plan.price_monthly || 0)}</span>
                    {plan.price_monthly !== 0 && <span className="text-gray-500">/mois</span>}
                  </div>
                  {plan.price_monthly === 0 && (
                    <p className="text-sm text-green-600 mt-1">
                      {plan.name?.toLowerCase().includes('trial') 
                        ? 'Période d\'essai gratuite'
                        : 'Plan gratuit à vie'
                      }
                    </p>
                  )}
                </div>
                
                {plan.price_yearly && plan.price_monthly && plan.price_monthly > 0 && (
                  <div>
                    <h4 className="font-semibold mb-2">Prix annuel</h4>
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-bold">{formatPrice(plan.price_yearly)}</span>
                      <span className="text-gray-500">/an</span>
                    </div>
                    <p className="text-sm text-green-600 mt-1">
                      Économie de {Math.round((1 - plan.price_yearly / (plan.price_monthly * 12)) * 100)}%
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Separator />

          {/* Limites et quotas */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Limites et quotas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Car className="w-5 h-5 text-gray-500" />
                  <div>
                    <p className="text-sm font-medium">Véhicules</p>
                    <p className="text-lg">
                      {(plan.max_vehicles === -1 || plan.max_vehicles === undefined) 
                        ? 'Illimité' 
                        : `${plan.max_vehicles} max`
                      }
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Users className="w-5 h-5 text-gray-500" />
                  <div>
                    <p className="text-sm font-medium">Utilisateurs</p>
                    <p className="text-lg">
                      {(plan.max_users === -1 || plan.max_users === undefined) 
                        ? 'Illimité' 
                        : `${plan.max_users} max`
                      }
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Shield className="w-5 h-5 text-gray-500" />
                  <div>
                    <p className="text-sm font-medium">Support</p>
                    <div className="mt-1">
                      {getSupportBadge(plan.support_level)}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Fonctionnalités */}
          {plan.features && plan.features.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Check className="w-5 h-5" />
                  Fonctionnalités incluses ({plan.features.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-2">
                  {plan.features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-2 p-2">
                      <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                </div>
                {plan.features.length === 0 && (
                  <p className="text-gray-500 italic">Aucune fonctionnalité spécifique définie</p>
                )}
              </CardContent>
            </Card>
          )}

          {/* Métadonnées et informations techniques */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Informations techniques
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div>
                  <h4 className="font-semibold mb-2">Identifiants</h4>
                  <p><span className="font-medium">ID:</span> {plan.id}</p>
                  <p><span className="font-medium">Statut:</span> 
                    <Badge variant={plan.is_active ? "default" : "secondary"} className="ml-2">
                      {plan.is_active ? 'Actif' : 'Inactif'}
                    </Badge>
                  </p>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2">Dates</h4>
                  <p><span className="font-medium">Créé le:</span> {new Date(plan.created_at).toLocaleDateString('fr-FR')}</p>
                  <p><span className="font-medium">Modifié le:</span> {new Date(plan.updated_at).toLocaleDateString('fr-FR')}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end pt-4">
          <Button onClick={onClose} variant="outline">
            Fermer
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PlanDetailsModal;