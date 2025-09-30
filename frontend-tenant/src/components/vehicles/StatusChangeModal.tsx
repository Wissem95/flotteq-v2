import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface StatusChangeModalProps {
  isOpen: boolean;
  onClose: () => void;
  vehicleInfo: {
    marque: string;
    modele: string;
    immatriculation: string;
  };
  currentStatus: string;
  newStatus: string;
  onConfirm: (reason: string) => void;
}

const statusLabels: Record<string, string> = {
  'active': 'En Service',
  'en_maintenance': 'En Maintenance',
  'en_reparation': 'En Réparation',
  'hors_service': 'Hors Service',
  'vendu': 'Vendu'
};

const statusReasons: Record<string, string[]> = {
  'en_maintenance': [
    'Vidange moteur',
    'Changement de filtres (air, huile, carburant)',
    'Contrôle freins',
    'Révision périodique',
    'Changement de pneus',
    'Entretien climatisation',
    'Contrôle suspension',
    'Maintenance préventive',
    'Autre (préciser ci-dessous)'
  ],
  'en_reparation': [
    'Problème moteur',
    'Panne électrique',
    'Réparation carrosserie',
    'Problème de transmission',
    'Réparation freins',
    'Remplacement pare-brise',
    'Problème de suspension',
    'Accident - réparations',
    'Autre (préciser ci-dessous)'
  ],
  'hors_service': [
    'Panne majeure',
    'Accident grave',
    'Fin de vie économique',
    'Contrôle technique non validé',
    'Problème sécuritaire',
    'En attente de pièces',
    'Immobilisation administrative',
    'Autre (préciser ci-dessous)'
  ],
  'active': [
    'Réparation terminée',
    'Maintenance terminée',
    'Contrôle technique validé',
    'Retour de location',
    'Véhicule testé et validé',
    'Problème résolu',
    'Autre (préciser ci-dessous)'
  ],
  'vendu': [
    'Vente à un particulier',
    'Vente à un professionnel',
    'Reprise par concessionnaire',
    'Fin de contrat de leasing',
    'Véhicule en fin de vie',
    'Autre (préciser ci-dessous)'
  ]
};

const StatusChangeModal: React.FC<StatusChangeModalProps> = ({
  isOpen,
  onClose,
  vehicleInfo,
  currentStatus,
  newStatus,
  onConfirm,
}) => {
  const [selectedReason, setSelectedReason] = useState<string>("");
  const [customReason, setCustomReason] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedReason) {
      return;
    }

    setLoading(true);
    
    const finalReason = selectedReason === 'Autre (préciser ci-dessous)' 
      ? customReason 
      : selectedReason;

    try {
      await onConfirm(finalReason);
      onClose();
      setSelectedReason("");
      setCustomReason("");
    } catch (error) {
      console.error('Erreur lors du changement de statut:', error);
    } finally {
      setLoading(false);
    }
  };

  const availableReasons = statusReasons[newStatus] || [];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Changement de statut véhicule</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="bg-gray-50 p-3 rounded-md">
            <p className="text-sm text-gray-600">
              <strong>{vehicleInfo.marque} {vehicleInfo.modele}</strong>
              <br />
              <span className="font-mono text-xs">{vehicleInfo.immatriculation}</span>
            </p>
            <div className="flex items-center mt-2 text-sm">
              <span className="text-gray-500">De:</span>
              <span className="ml-2 px-2 py-1 bg-gray-200 rounded text-xs">
                {statusLabels[currentStatus]}
              </span>
              <span className="mx-2">→</span>
              <span className="text-gray-500">Vers:</span>
              <span className={`ml-2 px-2 py-1 rounded text-xs font-medium ${
                newStatus === 'active' ? 'bg-green-100 text-green-800' :
                newStatus === 'en_maintenance' ? 'bg-orange-100 text-orange-800' :
                newStatus === 'en_reparation' ? 'bg-yellow-100 text-yellow-800' :
                newStatus === 'hors_service' ? 'bg-red-100 text-red-800' :
                'bg-blue-100 text-blue-800'
              }`}>
                {statusLabels[newStatus]}
              </span>
            </div>
          </div>

          <div>
            <Label htmlFor="reason">Raison du changement *</Label>
            <Select value={selectedReason} onValueChange={setSelectedReason} required>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner une raison..." />
              </SelectTrigger>
              <SelectContent>
                {availableReasons.map((reason) => (
                  <SelectItem key={reason} value={reason}>
                    {reason}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedReason === 'Autre (préciser ci-dessous)' && (
            <div>
              <Label htmlFor="customReason">Préciser la raison *</Label>
              <Textarea
                id="customReason"
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
                placeholder="Détailler la raison du changement..."
                required
              />
            </div>
          )}

          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Annuler
            </Button>
            <Button 
              type="submit" 
              disabled={loading || !selectedReason || (selectedReason === 'Autre (préciser ci-dessous)' && !customReason)}
              className="flex-1"
            >
              {loading ? "Changement..." : "Confirmer"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default StatusChangeModal;