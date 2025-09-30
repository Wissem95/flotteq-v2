// TenantModal.tsx - Modal pour la gestion des tenants

import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { Loader2, Building2, Mail, Globe, CreditCard } from "lucide-react";

// Utilitaires sécurisés
import { safeFind, safeLength } from '@/utils/safeData';

interface TenantData {
  name: string;
  domain: string;
  admin_email: string;
  admin_name: string;
  subscription_plan: string;
  description?: string;
  max_users: number;
  max_vehicles: number;
}

interface TenantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: TenantData) => Promise<void>;
  tenant?: any;
  mode: 'create' | 'edit';
}

const TenantModal: React.FC<TenantModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  tenant,
  mode
}) => {
  const [formData, setFormData] = useState<TenantData>({
    name: '',
    domain: '',
    admin_email: '',
    admin_name: '',
    subscription_plan: 'starter',
    description: '',
    max_users: 5,
    max_vehicles: 10
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (tenant && mode === 'edit') {
      setFormData({
        name: tenant.name || '',
        domain: tenant.domain || '',
        admin_email: tenant.admin_email || '',
        admin_name: tenant.admin_name || '',
        subscription_plan: tenant.subscription_plan || 'starter',
        description: tenant.description || '',
        max_users: tenant.max_users || 5,
        max_vehicles: tenant.max_vehicles || 10
      });
    } else {
      setFormData({
        name: '',
        domain: '',
        admin_email: '',
        admin_name: '',
        subscription_plan: 'starter',
        description: '',
        max_users: 5,
        max_vehicles: 10
      });
    }
    setErrors({});
  }, [tenant, mode, isOpen]);

  const subscriptionPlans = [
    { value: 'starter', label: 'Starter - 5 utilisateurs, 10 véhicules', price: '49€/mois' },
    { value: 'professional', label: 'Professional - 20 utilisateurs, 50 véhicules', price: '149€/mois' },
    { value: 'enterprise', label: 'Enterprise - Utilisateurs illimités', price: '299€/mois' },
    { value: 'custom', label: 'Personnalisé - Configuration sur mesure', price: 'Sur devis' }
  ];

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Le nom de l\'entreprise est requis';
    }

    if (!formData.domain.trim()) {
      newErrors.domain = 'Le domaine est requis';
    } else if (!/^[a-zA-Z0-9][a-zA-Z0-9-]*[a-zA-Z0-9]*\.[a-zA-Z]{2,}$/.test(formData.domain)) {
      newErrors.domain = 'Format de domaine invalide';
    }

    if (!formData.admin_email.trim()) {
      newErrors.admin_email = 'L\'email administrateur est requis';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.admin_email)) {
      newErrors.admin_email = 'Format d\'email invalide';
    }

    if (!formData.admin_name.trim()) {
      newErrors.admin_name = 'Le nom de l\'administrateur est requis';
    }

    if (formData.max_users < 1) {
      newErrors.max_users = 'Le nombre minimum d\'utilisateurs est de 1';
    }

    if (formData.max_vehicles < 1) {
      newErrors.max_vehicles = 'Le nombre minimum de véhicules est de 1';
    }

    setErrors(newErrors);
    return safeLength(Object.keys(newErrors)) === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast({
        title: "Erreur de validation",
        description: "Veuillez corriger les erreurs dans le formulaire",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      await onSubmit(formData);
      toast({
        title: mode === 'create' ? "Tenant créé" : "Tenant modifié",
        description: mode === 'create' 
          ? `Le tenant ${formData.name} a été créé avec succès`
          : `Le tenant ${formData.name} a été modifié avec succès`,
      });
      onClose();
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof TenantData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const selectedPlan = safeFind(subscriptionPlans, plan => plan.value === formData.subscription_plan);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            {mode === 'create' ? 'Créer un nouveau tenant' : 'Modifier le tenant'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'create' 
              ? 'Configurez une nouvelle entreprise cliente sur la plateforme FlotteQ'
              : 'Modifiez les informations de l\'entreprise cliente'
            }
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informations générales */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Informations générales</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nom de l'entreprise *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Ex: Transport Express SARL"
                  className={errors.name ? 'border-red-500' : ''}
                />
                {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="domain">Domaine *</Label>
                <div className="relative">
                  <Globe className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="domain"
                    value={formData.domain}
                    onChange={(e) => handleInputChange('domain', e.target.value)}
                    placeholder="transport-express.com"
                    className={`pl-10 ${errors.domain ? 'border-red-500' : ''}`}
                  />
                </div>
                {errors.domain && <p className="text-sm text-red-500">{errors.domain}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description (optionnel)</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Description de l'entreprise et de ses activités..."
                rows={3}
              />
            </div>
          </div>

          {/* Administrateur */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Administrateur principal</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="admin_name">Nom complet *</Label>
                <Input
                  id="admin_name"
                  value={formData.admin_name}
                  onChange={(e) => handleInputChange('admin_name', e.target.value)}
                  placeholder="Jean Dupont"
                  className={errors.admin_name ? 'border-red-500' : ''}
                />
                {errors.admin_name && <p className="text-sm text-red-500">{errors.admin_name}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="admin_email">Email *</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="admin_email"
                    type="email"
                    value={formData.admin_email}
                    onChange={(e) => handleInputChange('admin_email', e.target.value)}
                    placeholder="admin@transport-express.com"
                    className={`pl-10 ${errors.admin_email ? 'border-red-500' : ''}`}
                  />
                </div>
                {errors.admin_email && <p className="text-sm text-red-500">{errors.admin_email}</p>}
              </div>
            </div>
          </div>

          {/* Abonnement et limites */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Abonnement et limites</h3>
            
            <div className="space-y-2">
              <Label htmlFor="subscription_plan">Plan d'abonnement *</Label>
              <Select value={formData.subscription_plan} onValueChange={(value) => handleInputChange('subscription_plan', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionnez un plan" />
                </SelectTrigger>
                <SelectContent>
                  {subscriptionPlans.map((plan) => (
                    <SelectItem key={plan.value} value={plan.value}>
                      <div className="flex flex-col">
                        <span>{plan.label}</span>
                        <span className="text-sm text-gray-500">{plan.price}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedPlan && (
                <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-md">
                  <CreditCard className="inline h-4 w-4 mr-1" />
                  Plan sélectionné : {selectedPlan.label} - {selectedPlan.price}
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="max_users">Nombre maximum d'utilisateurs</Label>
                <Input
                  id="max_users"
                  type="number"
                  min="1"
                  value={formData.max_users}
                  onChange={(e) => handleInputChange('max_users', parseInt(e.target.value) || 1)}
                  className={errors.max_users ? 'border-red-500' : ''}
                />
                {errors.max_users && <p className="text-sm text-red-500">{errors.max_users}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="max_vehicles">Nombre maximum de véhicules</Label>
                <Input
                  id="max_vehicles"
                  type="number"
                  min="1"
                  value={formData.max_vehicles}
                  onChange={(e) => handleInputChange('max_vehicles', parseInt(e.target.value) || 1)}
                  className={errors.max_vehicles ? 'border-red-500' : ''}
                />
                {errors.max_vehicles && <p className="text-sm text-red-500">{errors.max_vehicles}</p>}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {mode === 'create' ? 'Créer le tenant' : 'Sauvegarder'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default TenantModal;