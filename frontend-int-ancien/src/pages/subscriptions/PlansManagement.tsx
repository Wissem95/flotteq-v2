// PlansManagement.tsx - Gestion des plans tarifaires FlotteQ

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger, } from "@/components/ui/dropdown-menu";
import { Plus, Edit, MoreHorizontal, Star, Check, Eye, Power, Users, Car, Shield, Zap, Crown, Building2, DollarSign, Trash2 } from "lucide-react";
import { SubscriptionPlan, subscriptionsService } from "@/services/subscriptionsService";
import CreatePlanModal from "@/components/subscriptions/CreatePlanModal";
import PlanDetailsModal from "@/components/subscriptions/PlanDetailsModal";
import DeletePlanDialog from "@/components/subscriptions/DeletePlanDialog";

const PlansManagement: React.FC = () => {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null);
  const [viewingPlan, setViewingPlan] = useState<SubscriptionPlan | null>(null);
  const [deletingPlan, setDeletingPlan] = useState<SubscriptionPlan | null>(null);


  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    setLoading(true);
    try {
      const plansData = await subscriptionsService.getPlans();
      setPlans(plansData);
    } catch (error) {
      console.error("Erreur lors du chargement des plans:", error);
      setPlans([]);
    } finally {
      setLoading(false);
    }
  };

  const togglePlanStatus = async (planId: string) => {
    try {
      const updatedPlan = await subscriptionsService.togglePlanStatus(planId);
      setPlans(prev => prev.map(plan => 
        plan.id === planId ? updatedPlan : plan
      ));
    } catch (error) {
      console.error("Erreur lors du changement de statut:", error);
    }
  };

  const openEditModal = (plan: SubscriptionPlan) => {
    setEditingPlan(plan);
  };

  const openDetailsModal = (plan: SubscriptionPlan) => {
    setViewingPlan(plan);
  };

  const openDeleteDialog = (plan: SubscriptionPlan) => {
    setDeletingPlan(plan);
  };

  const handleModalSuccess = () => {
    loadPlans(); // Recharger la liste des plans
    setShowCreateModal(false);
    setEditingPlan(null);
  };

  const handleModalClose = () => {
    setShowCreateModal(false);
    setEditingPlan(null);
  };

  const handleDetailsModalClose = () => {
    setViewingPlan(null);
  };

  const handleDeleteSuccess = () => {
    loadPlans(); // Recharger la liste des plans après suppression
    setDeletingPlan(null);
  };

  const handleDeleteClose = () => {
    setDeletingPlan(null);
  };

  const formatPrice = (price: number) => {
    if (price === 0) {
      return 'Gratuit';
    }
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
    }).format(price);
  };

  const getPlanIcon = (planName?: string) => {
    if (!planName) {
      return <Star className="w-5 h-5 text-gray-500" />;
    }
    
    const name = planName.toLowerCase();
    
    if (name.includes('trial') || name.includes('free') || name.includes('gratuit')) {
      return <Star className="w-5 h-5 text-green-500" />;
    }
    
    switch (name) {
      case 'starter':
        return <Zap className="w-5 h-5 text-green-500" />;
      case 'business':
      case 'professional':
        return <Building2 className="w-5 h-5 text-blue-500" />;
      case 'enterprise':
        return <Crown className="w-5 h-5 text-purple-500" />;
      default:
        return <Star className="w-5 h-5 text-gray-500" />;
    }
  };

  const getSupportBadge = (level?: string) => {
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
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestion des plans tarifaires</h1>
          <p className="text-gray-600">Créez et gérez les offres d'abonnement FlotteQ</p>
        </div>
        <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Créer un plan
            </Button>
          </DialogTrigger>
        </Dialog>
      </div>

      {/* Statistiques rapides */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Plans actifs</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{plans.filter(p => p.is_active).length}</div>
            <p className="text-xs text-muted-foreground">
              {plans.filter(p => !p.is_active).length} inactifs
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Prix minimum</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {plans.length > 0 && plans.some(p => p.price_monthly !== undefined) 
                ? formatPrice(Math.min(...plans.filter(p => p.price_monthly !== undefined).map(p => p.price_monthly)))
                : '0,00 €'
              }
            </div>
            <p className="text-xs text-muted-foreground">par mois</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Prix maximum</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {plans.length > 0 && plans.some(p => p.price_monthly !== undefined) 
                ? formatPrice(Math.max(...plans.filter(p => p.price_monthly !== undefined).map(p => p.price_monthly)))
                : '0,00 €'
              }
            </div>
            <p className="text-xs text-muted-foreground">par mois</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Plan populaire</CardTitle>
            <Crown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {plans.find(p => p.is_popular)?.name || "Aucun"}
            </div>
            <p className="text-xs text-muted-foreground">Plan mis en avant</p>
          </CardContent>
        </Card>
      </div>

      {/* Grille des plans */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          <div className="col-span-full flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          plans.map((plan) => (
            <Card key={plan.id} className={`relative ${plan.is_popular ? 'ring-2 ring-blue-500' : ''} ${(plan.price_monthly === 0 || plan.price_monthly === undefined) ? 'ring-2 ring-green-500' : ''}`}>
              {plan.is_popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-blue-500 text-white">
                    <Star className="w-3 h-3 mr-1" />
                    Populaire
                  </Badge>
                </div>
              )}
              
              {/* Badge automatique pour plans gratuits */}
              {(plan.price_monthly === 0 || (plan.price_monthly === undefined && plan.name?.toLowerCase().includes('trial'))) && !plan.is_popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-green-500 text-white">
                    <Check className="w-3 h-3 mr-1" />
                    {plan.name?.toLowerCase().includes('trial') ? 'Essai gratuit' : 'Gratuit'}
                  </Badge>
                </div>
              )}
              
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getPlanIcon(plan.name)}
                    <CardTitle className="text-xl">{plan.name}</CardTitle>
                    {/* Badge inline pour plan gratuit si pas déjà affiché en haut */}
                    {(plan.price_monthly === 0) && plan.is_popular && (
                      <Badge className="bg-green-100 text-green-800 ml-2">Gratuit</Badge>
                    )}
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => openEditModal(plan)} className="flex items-center gap-2">
                        <Edit className="w-4 h-4" />
                        Modifier
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => openDetailsModal(plan)} className="flex items-center gap-2">
                        <Eye className="w-4 h-4" />
                        Voir détails
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        onClick={() => togglePlanStatus(plan.id)}
                        className={`flex items-center gap-2 ${plan.is_active ? 'text-red-600' : 'text-green-600'}`}
                      >
                        <Power className="w-4 h-4" />
                        {plan.is_active ? 'Désactiver' : 'Activer'}
                      </DropdownMenuItem>
                      
                      {/* Option de suppression uniquement pour les plans inactifs */}
                      {!plan.is_active && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={() => openDeleteDialog(plan)}
                            className="flex items-center gap-2 text-red-600 focus:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                            Supprimer
                          </DropdownMenuItem>
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <CardDescription>{plan.description}</CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Prix */}
                <div className="space-y-2">
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold">{formatPrice(plan.price_monthly || 0)}</span>
                    {(plan.price_monthly !== 0) && <span className="text-gray-500">/mois</span>}
                  </div>
                  {plan.price_yearly && plan.price_monthly && plan.price_monthly > 0 && (
                    <div className="text-sm text-gray-500">
                      {formatPrice(plan.price_yearly)} /an 
                      <span className="text-green-600 ml-1">
                        (économie de {Math.round((1 - plan.price_yearly / (plan.price_monthly * 12)) * 100)}%)
                      </span>
                    </div>
                  )}
                  {/* Message spécial pour les plans gratuits */}
                  {(plan.price_monthly === 0) && (
                    <div className="text-sm text-green-600">
                      {plan.name?.toLowerCase().includes('trial') 
                        ? `Période d'essai ${plan.limits?.trial_days || 14} jours`
                        : 'Plan gratuit à vie'
                      }
                    </div>
                  )}
                </div>

                {/* Limites */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Car className="w-4 h-4 text-gray-500" />
                    <span>
                      {(plan.max_vehicles === -1 || plan.max_vehicles === undefined) ? 'Véhicules illimités' : `${plan.max_vehicles} véhicules max`}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Users className="w-4 h-4 text-gray-500" />
                    <span>
                      {(plan.max_users === -1 || plan.max_users === undefined) ? 'Utilisateurs illimités' : `${plan.max_users} utilisateurs max`}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Shield className="w-4 h-4 text-gray-500" />
                    {getSupportBadge(plan.support_level)}
                  </div>
                </div>

                {/* Fonctionnalités */}
                {plan.features && plan.features.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Fonctionnalités incluses :</h4>
                    <ul className="space-y-1">
                      {plan.features.slice(0, 4).map((feature, index) => (
                        <li key={index} className="flex items-center gap-2 text-sm">
                          <Check className="w-3 h-3 text-green-500" />
                          <span>{feature}</span>
                        </li>
                      ))}
                      {plan.features.length > 4 && (
                        <li className="text-sm text-gray-500">
                          +{plan.features.length - 4} autres fonctionnalités
                        </li>
                      )}
                    </ul>
                  </div>
                )}

                {/* Statut */}
                <div className="pt-2 border-t">
                  <Badge variant={plan.is_active ? "default" : "secondary"}>
                    {plan.is_active ? 'Actif' : 'Inactif'}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Modal de création/édition */}
      <CreatePlanModal
        isOpen={showCreateModal || editingPlan !== null}
        onClose={handleModalClose}
        onSuccess={handleModalSuccess}
        editingPlan={editingPlan}
      />

      {/* Modal de détails du plan */}
      <PlanDetailsModal
        isOpen={viewingPlan !== null}
        onClose={handleDetailsModalClose}
        plan={viewingPlan}
      />

      {/* Dialog de suppression du plan */}
      <DeletePlanDialog
        isOpen={deletingPlan !== null}
        onClose={handleDeleteClose}
        onSuccess={handleDeleteSuccess}
        plan={deletingPlan}
      />
    </div>
  );
};

export default PlansManagement; 