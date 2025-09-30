// DeletePlanDialog.tsx - Dialog de confirmation pour supprimer un plan
import React, { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Loader2, AlertTriangle } from "lucide-react";
import { SubscriptionPlan, subscriptionsService } from "@/services/subscriptionsService";
import { toast } from "@/components/ui/use-toast";

interface DeletePlanDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  plan: SubscriptionPlan | null;
}

const DeletePlanDialog: React.FC<DeletePlanDialogProps> = ({
  isOpen,
  onClose,
  onSuccess,
  plan
}) => {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!plan) return;

    setLoading(true);
    try {
      await subscriptionsService.deletePlan(plan.id);
      
      toast({
        title: "Plan supprimé",
        description: `Le plan "${plan.name}" a été supprimé avec succès`,
      });

      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Erreur suppression plan:', error);
      
      let errorMessage = "Impossible de supprimer le plan";
      if (error.response?.status === 400) {
        errorMessage = error.response?.data?.error || "Ce plan ne peut pas être supprimé car il a des abonnements actifs";
      }
      
      toast({
        title: "Erreur",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (!plan) return null;

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            Supprimer le plan "{plan.name}" ?
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-2">
            <p>
              <strong>⚠️ Cette action est irréversible.</strong>
            </p>
            <p>
              Le plan <strong>"{plan.name}"</strong> sera définitivement supprimé de la base de données.
            </p>
            
            {plan.is_active && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-red-800 text-sm font-medium">
                  ❌ Ce plan est encore actif ! Vous devez d'abord le désactiver avant de le supprimer.
                </p>
              </div>
            )}
            
            {!plan.is_active && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-md">
                <p className="text-amber-800 text-sm">
                  ✅ Ce plan est inactif et peut être supprimé en toute sécurité.
                </p>
              </div>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>
            Annuler
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={loading || plan.is_active}
            className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Suppression...
              </>
            ) : (
              "Supprimer définitivement"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeletePlanDialog;