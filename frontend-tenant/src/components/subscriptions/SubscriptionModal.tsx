// src/components/subscriptions/SubscriptionModal.tsx
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Loader2, Check, X, Crown, Zap, Shield, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  getAvailablePlans,
  subscribeToPlan,
  getCurrentSubscription,
  formatSubscriptionPrice,
  type SubscriptionPlan,
  type SubscribeData
} from "@/services/subscriptionService";

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  showCloseButton?: boolean;
  blurBackground?: boolean;
}

const SubscriptionModal: React.FC<SubscriptionModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  showCloseButton = true,
  blurBackground = true
}) => {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [selectedPlanId, setSelectedPlanId] = useState<number | null>(null);
  const [isYearly, setIsYearly] = useState(false);
  const [loading, setLoading] = useState(true);
  const [subscribing, setSubscribing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchPlans();
    }
  }, [isOpen]);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      setError(null);
      const availablePlans = await getAvailablePlans();
      setPlans(availablePlans);
      
      // Auto-select the popular plan
      const popularPlan = availablePlans.find(plan => plan.is_popular);
      if (popularPlan) {
        setSelectedPlanId(popularPlan.id);
      } else if (availablePlans.length > 0) {
        setSelectedPlanId(availablePlans[0].id);
      }
    } catch (err) {
      console.error('Error fetching plans:', err);
      setError('Impossible de charger les plans d\'abonnement');
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async () => {
    if (!selectedPlanId) return;

    const selectedPlan = plans.find(p => p.id === selectedPlanId);
    if (!selectedPlan) return;

    try {
      setSubscribing(true);
      setError(null);

      const subscriptionData: SubscribeData = {
        subscription_id: selectedPlanId,
        billing_cycle: isYearly ? 'yearly' : 'monthly',
        auto_renew: true,
        trial_days: 14 // Offer 14-day trial
      };

      await subscribeToPlan(subscriptionData);
      
      // Success! Close modal and trigger success callback
      onSuccess?.();
      onClose();
    } catch (err: any) {
      console.error('Error subscribing:', err);
      setError(err.response?.data?.message || 'Erreur lors de l\'abonnement');
    } finally {
      setSubscribing(false);
    }
  };

  const getPlanPrice = (plan: SubscriptionPlan) => {
    const price = isYearly ? plan.price * 12 : plan.price;
    const cycle = isYearly ? '/an' : '/mois';
    return `${price.toFixed(2)}€${cycle}`;
  };

  const getYearlySavings = (plan: SubscriptionPlan) => {
    const monthlyTotal = plan.price * 12;
    const yearlyPrice = plan.price * 12; // Assuming yearly is same as monthly * 12 for now
    const savings = monthlyTotal - yearlyPrice;
    return savings > 0 ? Math.round((savings / monthlyTotal) * 100) : 0;
  };

  const getPlanIcon = (planName: string) => {
    const name = planName.toLowerCase();
    if (name.includes('starter') || name.includes('basic')) return <Zap className="w-6 h-6 text-blue-500" />;
    if (name.includes('professional') || name.includes('pro')) return <Crown className="w-6 h-6 text-purple-500" />;
    if (name.includes('enterprise') || name.includes('premium')) return <Shield className="w-6 h-6 text-gold-500" />;
    return <Star className="w-6 h-6 text-green-500" />;
  };

  if (!isOpen) return null;

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget && showCloseButton) {
      onClose();
    }
  };

  return (
    <div
      className={cn(
        "fixed inset-0 z-50 flex items-center justify-center p-4",
        blurBackground ? "bg-black/60 backdrop-blur-sm" : "bg-black/50"
      )}
      onClick={handleOverlayClick}
    >
      <div className="bg-white rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">
              Choisissez votre plan d'abonnement
            </h2>
            <p className="text-gray-600 mt-2">
              Sélectionnez le plan qui convient le mieux à vos besoins
            </p>
          </div>
          {showCloseButton && (
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100 transition-colors"
              disabled={subscribing}
            >
              <X className="w-6 h-6" />
            </button>
          )}
        </div>

        {/* Billing Toggle */}
        <div className="flex justify-center p-6 border-b bg-gray-50">
          <div className="flex items-center space-x-4 bg-white p-2 rounded-lg border">
            <Label htmlFor="billing-toggle" className={cn(
              "font-medium transition-colors",
              !isYearly ? "text-blue-600" : "text-gray-500"
            )}>
              Mensuel
            </Label>
            <Switch
              id="billing-toggle"
              checked={isYearly}
              onCheckedChange={setIsYearly}
              disabled={subscribing}
            />
            <Label htmlFor="billing-toggle" className={cn(
              "font-medium transition-colors flex items-center space-x-1",
              isYearly ? "text-blue-600" : "text-gray-500"
            )}>
              <span>Annuel</span>
              <Badge variant="secondary" className="bg-green-100 text-green-800 text-xs">
                Économisez jusqu'à 20%
              </Badge>
            </Label>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {loading && (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
              <span className="ml-2 text-gray-600">Chargement des plans...</span>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <div className="flex items-center">
                <X className="w-5 h-5 text-red-500 mr-2" />
                <p className="text-red-800">{error}</p>
              </div>
            </div>
          )}

          {!loading && !error && (
            <>
              {/* Plans Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                {plans.map((plan) => (
                  <Card
                    key={plan.id}
                    className={cn(
                      "relative cursor-pointer transition-all duration-200 hover:shadow-lg",
                      selectedPlanId === plan.id
                        ? "ring-2 ring-blue-600 shadow-lg"
                        : "hover:ring-1 hover:ring-gray-300",
                      plan.is_popular && "ring-2 ring-purple-500 shadow-purple-100"
                    )}
                    onClick={() => setSelectedPlanId(plan.id)}
                  >
                    {/* Popular Badge */}
                    {plan.is_popular && (
                      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                        <Badge className="bg-purple-600 hover:bg-purple-600 text-white px-4 py-1">
                          <Crown className="w-3 h-3 mr-1" />
                          Populaire
                        </Badge>
                      </div>
                    )}

                    <CardHeader className="text-center">
                      <div className="flex justify-center mb-3">
                        {getPlanIcon(plan.name)}
                      </div>
                      <CardTitle className="text-xl">{plan.name}</CardTitle>
                      <CardDescription className="text-sm">
                        {plan.description}
                      </CardDescription>
                      <div className="mt-4">
                        <div className="text-3xl font-bold text-gray-900">
                          {getPlanPrice(plan)}
                        </div>
                        {isYearly && getYearlySavings(plan) > 0 && (
                          <div className="text-sm text-green-600 font-medium">
                            Économisez {getYearlySavings(plan)}%
                          </div>
                        )}
                      </div>
                    </CardHeader>

                    <CardContent>
                      <ul className="space-y-2">
                        {plan.features.map((feature, index) => (
                          <li key={index} className="flex items-center text-sm">
                            <Check className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>

                      {/* Limits */}
                      {plan.limits && Object.keys(plan.limits).length > 0 && (
                        <div className="mt-4 pt-4 border-t">
                          <h4 className="text-sm font-medium text-gray-700 mb-2">Limites :</h4>
                          <ul className="space-y-1">
                            {Object.entries(plan.limits).map(([key, value]) => (
                              <li key={key} className="text-sm text-gray-600 flex justify-between">
                                <span className="capitalize">{key.replace('_', ' ')} :</span>
                                <span className="font-medium">
                                  {value === -1 ? 'Illimité' : value}
                                </span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </CardContent>

                    <CardFooter>
                      <Button
                        variant={selectedPlanId === plan.id ? "default" : "outline"}
                        className="w-full"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedPlanId(plan.id);
                        }}
                      >
                        {selectedPlanId === plan.id ? (
                          <>
                            <Check className="w-4 h-4 mr-2" />
                            Sélectionné
                          </>
                        ) : (
                          "Sélectionner"
                        )}
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="flex justify-center space-x-4 pt-6 border-t">
                <Button
                  variant="outline"
                  onClick={onClose}
                  disabled={subscribing}
                  className="px-8"
                >
                  Annuler
                </Button>
                <Button
                  onClick={handleSubscribe}
                  disabled={!selectedPlanId || subscribing}
                  className="px-8"
                >
                  {subscribing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Traitement...
                    </>
                  ) : (
                    <>
                      S'abonner maintenant
                      <span className="ml-2 text-xs opacity-75">
                        (Essai gratuit 14 jours)
                      </span>
                    </>
                  )}
                </Button>
              </div>

              {/* Trust indicators */}
              <div className="mt-8 pt-6 border-t bg-gray-50 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                  <div className="flex items-center justify-center space-x-2">
                    <Shield className="w-5 h-5 text-green-500" />
                    <span className="text-sm text-gray-600">Paiement sécurisé</span>
                  </div>
                  <div className="flex items-center justify-center space-x-2">
                    <Check className="w-5 h-5 text-green-500" />
                    <span className="text-sm text-gray-600">Annulation libre</span>
                  </div>
                  <div className="flex items-center justify-center space-x-2">
                    <Star className="w-5 h-5 text-green-500" />
                    <span className="text-sm text-gray-600">Support 24/7</span>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default SubscriptionModal;