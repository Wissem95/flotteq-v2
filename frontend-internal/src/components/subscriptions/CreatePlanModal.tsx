// CreatePlanModal.tsx - Modal pour créer un nouveau plan d'abonnement
import React, { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Loader2, Plus, X } from "lucide-react";
import { subscriptionsService, CreatePlanData } from "@/services/subscriptionsService";
import { toast } from "@/components/ui/use-toast";

interface CreatePlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  editingPlan?: {
    id: string;
    name: string;
    description: string;
    price_monthly?: number;
    price_yearly?: number;
    features?: string[];
    max_vehicles?: number;
    max_users?: number;
    support_level?: 'basic' | 'premium' | 'enterprise';
    is_popular?: boolean;
  } | null;
}

const CreatePlanModal: React.FC<CreatePlanModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  editingPlan
}) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<CreatePlanData>({
    name: "",
    description: "",
    price_monthly: 0,
    price_yearly: 0,
    features: [],
    max_vehicles: 5,
    max_users: 3,
    support_level: "basic",
    is_popular: false
  });

  const [currentFeature, setCurrentFeature] = useState("");

  // Pré-remplir le formulaire en mode édition
  React.useEffect(() => {
    if (editingPlan) {
      console.log("Editing plan data:", editingPlan); // Debug log
      setFormData({
        name: editingPlan.name || "",
        description: editingPlan.description || "",
        price_monthly: editingPlan.price_monthly > 0 ? editingPlan.price_monthly : 0,
        price_yearly: editingPlan.price_yearly > 0 ? editingPlan.price_yearly : 0,
        features: Array.isArray(editingPlan.features) ? editingPlan.features : [],
        max_vehicles: editingPlan.max_vehicles !== undefined ? editingPlan.max_vehicles : 5,
        max_users: editingPlan.max_users !== undefined ? editingPlan.max_users : 3,
        support_level: editingPlan.support_level || "basic",
        is_popular: Boolean(editingPlan.is_popular)
      });
    } else {
      resetForm();
    }
  }, [editingPlan, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log("Form data at submit:", formData); // Debug log
    
    // Validation plus spécifique
    if (!formData.name?.trim()) {
      toast({
        title: "Erreur",
        description: "Le nom du plan est obligatoire",
        variant: "destructive"
      });
      return;
    }

    if (!formData.description?.trim()) {
      toast({
        title: "Erreur",
        description: "La description du plan est obligatoire",
        variant: "destructive"
      });
      return;
    }

    if (formData.price_monthly < 0) {
      toast({
        title: "Erreur",
        description: "Le prix mensuel ne peut pas être négatif",
        variant: "destructive"
      });
      return;
    }

    try {
      setLoading(true);
      
      // Préparer les données pour l'API
      const planData = {
        name: formData.name,
        description: formData.description,
        price: formData.price_monthly,
        price_monthly: formData.price_monthly,
        price_yearly: formData.price_yearly,
        currency: "EUR",
        billing_cycle: "monthly" as const,
        features: formData.features,
        max_vehicles: formData.max_vehicles,
        max_users: formData.max_users,
        support_level: formData.support_level,
        is_active: true,
        is_popular: formData.is_popular,
        sort_order: formData.support_level === 'enterprise' ? 3 : 
                   formData.support_level === 'premium' ? 2 : 1,
        metadata: {
          pricing: {
            monthly: formData.price_monthly,
            yearly: formData.price_yearly
          },
          badge: formData.support_level === 'enterprise' ? 'Premium' : 
                formData.support_level === 'premium' ? 'Populaire' : 'Essentiel',
          color: formData.support_level === 'enterprise' ? '#EF4444' : 
                formData.support_level === 'premium' ? '#8B5CF6' : '#6B7280'
        }
      };

      if (editingPlan) {
        // Mode modification
        await subscriptionsService.updatePlan(editingPlan.id, planData as any);
        toast({
          title: "Succès",
          description: `Plan "${formData.name}" modifié avec succès`
        });
      } else {
        // Mode création
        await subscriptionsService.createPlan(planData as any);
        toast({
          title: "Succès",
          description: `Plan "${formData.name}" créé avec succès`
        });
      }
      
      resetForm();
      onSuccess?.();
      onClose();
    } catch (error: any) {
      console.error(`Erreur ${editingPlan ? 'modification' : 'création'} plan:`, error);
      toast({
        title: "Erreur",
        description: error.response?.data?.message || `Impossible de ${editingPlan ? 'modifier' : 'créer'} le plan`,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      price_monthly: 0,
      price_yearly: 0,
      features: [],
      max_vehicles: 5,
      max_users: 3,
      support_level: "basic",
      is_popular: false
    });
    setCurrentFeature("");
  };

  const addFeature = () => {
    if (currentFeature.trim()) {
      setFormData(prev => ({
        ...prev,
        features: [...prev.features, currentFeature.trim()]
      }));
      setCurrentFeature("");
    }
  };

  const removeFeature = (index: number) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index)
    }));
  };

  const calculateYearlyPrice = (monthlyPrice: number) => {
    // Applique automatiquement 20% de réduction pour l'annuel
    return Math.round(monthlyPrice * 12 * 0.8 * 100) / 100;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editingPlan ? 'Modifier le plan d\'abonnement' : 'Créer un nouveau plan d\'abonnement'}
          </DialogTitle>
          <DialogDescription>
            {editingPlan 
              ? 'Modifiez les caractéristiques et tarifs du plan existant'
              : 'Définissez les caractéristiques et tarifs du nouveau plan'
            }
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informations de base */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Nom du plan *</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Ex: Starter, Professional, Enterprise"
                autoComplete="off"
                required
              />
            </div>

            <div>
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Description détaillée du plan et ses avantages"
                rows={3}
                autoComplete="off"
                required
              />
            </div>
          </div>

          {/* Tarification */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Tarification</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="price_monthly">Prix mensuel (€) *</Label>
                <Input
                  id="price_monthly"
                  name="price_monthly"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.price_monthly || ""}
                  onChange={(e) => {
                    const monthly = parseFloat(e.target.value) || 0;
                    setFormData(prev => ({
                      ...prev,
                      price_monthly: monthly,
                      price_yearly: calculateYearlyPrice(monthly)
                    }));
                  }}
                  autoComplete="off"
                  required
                />
              </div>

              <div>
                <Label htmlFor="price_yearly">Prix annuel (€)</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="price_yearly"
                    name="price_yearly"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.price_yearly || ""}
                    onChange={(e) => setFormData(prev => ({ ...prev, price_yearly: parseFloat(e.target.value) || 0 }))}
                    autoComplete="off"
                  />
                  <Badge variant="secondary" className="whitespace-nowrap">
                    -20%
                  </Badge>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Calculé automatiquement avec 20% de réduction
                </p>
              </div>
            </div>
          </div>

          {/* Limites */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Limites et quotas</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="max_vehicles">Nombre max de véhicules</Label>
                <Input
                  id="max_vehicles"
                  name="max_vehicles"
                  type="number"
                  min="-1"
                  value={formData.max_vehicles === -1 ? "" : formData.max_vehicles || ""}
                  onChange={(e) => setFormData(prev => ({ ...prev, max_vehicles: e.target.value === "" ? -1 : parseInt(e.target.value) || 0 }))}
                  placeholder="-1 pour illimité"
                  autoComplete="off"
                />
                <p className="text-xs text-gray-500 mt-1">-1 pour illimité</p>
              </div>

              <div>
                <Label htmlFor="max_users">Nombre max d'utilisateurs</Label>
                <Input
                  id="max_users"
                  name="max_users"
                  type="number"
                  min="-1"
                  value={formData.max_users === -1 ? "" : formData.max_users || ""}
                  onChange={(e) => setFormData(prev => ({ ...prev, max_users: e.target.value === "" ? -1 : parseInt(e.target.value) || 0 }))}
                  placeholder="-1 pour illimité"
                  autoComplete="off"
                />
                <p className="text-xs text-gray-500 mt-1">-1 pour illimité</p>
              </div>
            </div>

            <div>
              <Label htmlFor="support_level">Niveau de support</Label>
              <Select
                value={formData.support_level}
                onValueChange={(value: 'basic' | 'premium' | 'enterprise') => 
                  setFormData(prev => ({ ...prev, support_level: value }))
                }
              >
                <SelectTrigger id="support_level">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="basic">Basique - Email uniquement</SelectItem>
                  <SelectItem value="premium">Premium - Email + Chat</SelectItem>
                  <SelectItem value="enterprise">Enterprise - Support dédié 24/7</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Fonctionnalités */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Fonctionnalités incluses</h3>
            
            <div className="flex gap-2">
              <div className="flex-1">
                <Label htmlFor="current_feature" className="sr-only">Nouvelle fonctionnalité</Label>
                <Input
                  id="current_feature"
                  name="current_feature"
                  value={currentFeature}
                  onChange={(e) => setCurrentFeature(e.target.value)}
                  placeholder="Ajouter une fonctionnalité"
                  autoComplete="off"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addFeature();
                    }
                  }}
                />
              </div>
              <Button
                type="button"
                onClick={addFeature}
                variant="outline"
                size="icon"
                aria-label="Ajouter la fonctionnalité"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>

            <div className="space-y-2">
              {formData.features.map((feature, index) => (
                <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                  <span className="text-sm">{feature}</span>
                  <Button
                    type="button"
                    onClick={() => removeFeature(index)}
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    aria-label={`Supprimer la fonctionnalité: ${feature}`}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              ))}
              {formData.features.length === 0 && (
                <p className="text-sm text-gray-500 italic">Aucune fonctionnalité ajoutée</p>
              )}
            </div>
          </div>

          {/* Options */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-2">
              <Switch
                id="is_popular"
                checked={formData.is_popular}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_popular: checked }))}
              />
              <Label htmlFor="is_popular" className="cursor-pointer">
                Marquer comme plan populaire
              </Label>
            </div>
            {formData.is_popular && (
              <Badge className="bg-purple-600">Populaire</Badge>
            )}
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
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {editingPlan ? 'Modification...' : 'Création...'}
                </>
              ) : (
                editingPlan ? "Modifier le plan" : "Créer le plan"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreatePlanModal;