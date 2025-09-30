// CreateSubscriptionModal.tsx - Modal pour assigner un abonnement à un tenant
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Loader2, CalendarIcon, Building2, CreditCard } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { subscriptionsService, SubscriptionPlan } from "@/services/subscriptionsService";
import { tenantsService } from "@/services/tenantsService";
import { toast } from "@/components/ui/use-toast";

interface CreateSubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  preselectedTenantId?: number;
}

interface Tenant {
  id: number;
  name: string;
  domain: string;
  is_active: boolean;
}

const CreateSubscriptionModal: React.FC<CreateSubscriptionModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  preselectedTenantId
}) => {
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  
  const [formData, setFormData] = useState({
    tenant_id: preselectedTenantId || "",
    subscription_id: "",
    start_date: new Date(),
    end_date: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
    is_active: true,
    auto_renew: true,
    trial_days: 0
  });

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  const loadData = async () => {
    try {
      setLoadingData(true);
      const [tenantsData, plansData] = await Promise.all([
        tenantsService.getTenants(),
        subscriptionsService.getPlans()
      ]);
      
      setTenants(tenantsData.data || []);
      setPlans(plansData || []);
      
      // Si un tenant est présélectionné
      if (preselectedTenantId) {
        setFormData(prev => ({ ...prev, tenant_id: preselectedTenantId.toString() }));
      }
    } catch (error) {
      console.error("Erreur chargement données:", error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les données",
        variant: "destructive"
      });
    } finally {
      setLoadingData(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.tenant_id || !formData.subscription_id) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner un tenant et un plan",
        variant: "destructive"
      });
      return;
    }

    try {
      setLoading(true);
      
      const subscriptionData = {
        tenant_id: parseInt(formData.tenant_id),
        subscription_id: parseInt(formData.subscription_id),
        start_date: format(formData.start_date, 'yyyy-MM-dd'),
        end_date: format(formData.end_date, 'yyyy-MM-dd'),
        is_active: formData.is_active,
        trial_ends_at: formData.trial_days > 0 
          ? format(new Date(formData.start_date.getTime() + formData.trial_days * 24 * 60 * 60 * 1000), 'yyyy-MM-dd')
          : null,
        auto_renew: formData.auto_renew,
        metadata: {
          created_by: "admin",
          billing_cycle: "monthly"
        }
      };

      // Créer la souscription via l'API
      await subscriptionsService.createSubscription(subscriptionData as any);
      
      const tenant = tenants.find(t => t.id === parseInt(formData.tenant_id));
      const plan = plans.find(p => p.id === formData.subscription_id);
      
      toast({
        title: "Succès",
        description: `Abonnement "${plan?.name}" assigné à "${tenant?.name}"`
      });
      
      resetForm();
      onSuccess?.();
      onClose();
    } catch (error: any) {
      console.error("Erreur création abonnement:", error);
      toast({
        title: "Erreur",
        description: error.response?.data?.message || "Impossible de créer l'abonnement",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      tenant_id: preselectedTenantId || "",
      subscription_id: "",
      start_date: new Date(),
      end_date: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
      is_active: true,
      auto_renew: true,
      trial_days: 0
    });
  };

  const selectedPlan = plans.find(p => p.id === formData.subscription_id);
  const selectedTenant = tenants.find(t => t.id === parseInt(formData.tenant_id));

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Assigner un abonnement</DialogTitle>
          <DialogDescription>
            Sélectionnez un tenant et un plan d'abonnement à lui assigner
          </DialogDescription>
        </DialogHeader>

        {loadingData ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Sélection du tenant */}
            <div className="space-y-2">
              <Label htmlFor="tenant">Tenant *</Label>
              <Select
                value={formData.tenant_id.toString()}
                onValueChange={(value) => setFormData(prev => ({ ...prev, tenant_id: value }))}
                disabled={!!preselectedTenantId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un tenant">
                    {selectedTenant && (
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4" />
                        {selectedTenant.name}
                      </div>
                    )}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {tenants.map((tenant) => (
                    <SelectItem key={tenant.id} value={tenant.id.toString()}>
                      <div className="flex items-center justify-between w-full">
                        <span>{tenant.name}</span>
                        <Badge variant={tenant.is_active ? "default" : "secondary"} className="ml-2">
                          {tenant.is_active ? "Actif" : "Inactif"}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedTenant && (
                <p className="text-sm text-gray-500">Domaine: {selectedTenant.domain}</p>
              )}
            </div>

            {/* Sélection du plan */}
            <div className="space-y-2">
              <Label htmlFor="plan">Plan d'abonnement *</Label>
              <Select
                value={formData.subscription_id}
                onValueChange={(value) => setFormData(prev => ({ ...prev, subscription_id: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un plan">
                    {selectedPlan && (
                      <div className="flex items-center gap-2">
                        <CreditCard className="w-4 h-4" />
                        {selectedPlan.name}
                      </div>
                    )}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {plans.map((plan) => (
                    <SelectItem key={plan.id} value={plan.id}>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{plan.name}</span>
                          {plan.is_popular && (
                            <Badge className="bg-purple-600 text-xs">Populaire</Badge>
                          )}
                        </div>
                        <div className="text-sm text-gray-500">
                          {plan.price_monthly}€/mois - {plan.max_vehicles === -1 ? "Illimité" : `${plan.max_vehicles} véhicules`}
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedPlan && (
                <div className="p-3 bg-gray-50 rounded-lg text-sm space-y-1">
                  <p className="font-medium">{selectedPlan.description}</p>
                  <p>Prix: {selectedPlan.price_monthly}€/mois</p>
                  <p>Limites: {selectedPlan.max_vehicles === -1 ? "Véhicules illimités" : `${selectedPlan.max_vehicles} véhicules`}, 
                     {selectedPlan.max_users === -1 ? " Utilisateurs illimités" : ` ${selectedPlan.max_users} utilisateurs`}</p>
                </div>
              )}
            </div>

            {/* Dates */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Date de début</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !formData.start_date && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.start_date ? (
                        format(formData.start_date, "dd MMMM yyyy", { locale: fr })
                      ) : (
                        "Sélectionner"
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={formData.start_date}
                      onSelect={(date) => date && setFormData(prev => ({ ...prev, start_date: date }))}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label>Date de fin</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !formData.end_date && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.end_date ? (
                        format(formData.end_date, "dd MMMM yyyy", { locale: fr })
                      ) : (
                        "Sélectionner"
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={formData.end_date}
                      onSelect={(date) => date && setFormData(prev => ({ ...prev, end_date: date }))}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {/* Options */}
            <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_active"
                    checked={formData.is_active}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
                  />
                  <Label htmlFor="is_active" className="cursor-pointer">
                    Activer immédiatement
                  </Label>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="auto_renew"
                    checked={formData.auto_renew}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, auto_renew: checked }))}
                  />
                  <Label htmlFor="auto_renew" className="cursor-pointer">
                    Renouvellement automatique
                  </Label>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  resetForm();
                  onClose();
                }}
                disabled={loading}
              >
                Annuler
              </Button>
              <Button type="submit" disabled={loading || !formData.tenant_id || !formData.subscription_id}>
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Création...
                  </>
                ) : (
                  "Assigner l'abonnement"
                )}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default CreateSubscriptionModal;