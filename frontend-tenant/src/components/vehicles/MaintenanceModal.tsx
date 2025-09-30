import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { api } from "@/lib/api";

interface MaintenanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  vehicleId: number;
  vehicleInfo: {
    marque: string;
    modele: string;
    immatriculation: string;
  };
  onMaintenanceCreated: () => void;
}

const MaintenanceModal: React.FC<MaintenanceModalProps> = ({
  isOpen,
  onClose,
  vehicleId,
  vehicleInfo,
  onMaintenanceCreated,
}) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    maintenance_date: new Date().toISOString().split('T')[0], // Date d'aujourd'hui par défaut
    maintenance_type: "",
    mileage: "",
    workshop: "",
    cost: "",
    description: "",
    next_maintenance: "",
    notes: "",
  });

  const maintenanceTypes = [
    { value: "oil_change", label: "Vidange" },
    { value: "revision", label: "Révision générale" },
    { value: "tires", label: "Pneus" },
    { value: "brakes", label: "Freins" },
    { value: "belt", label: "Courroie" },
    { value: "filters", label: "Filtres" },
    { value: "other", label: "Autre" },
  ];

  const handleChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Créer la maintenance
      await api.post("/maintenances", {
        vehicle_id: vehicleId,
        ...formData,
        status: "in_progress", // Maintenance en cours
      });

      // Notifier le parent que la maintenance a été créée
      onMaintenanceCreated();
      onClose();
      
      // Réinitialiser le formulaire
      setFormData({
        maintenance_date: new Date().toISOString().split('T')[0],
        maintenance_type: "",
            mileage: "",
        workshop: "",
        cost: "",
        description: "",
        next_maintenance: "",
        notes: "",
      });
    } catch (error) {
      console.error("Erreur lors de la création de la maintenance:", error);
      alert("Erreur lors de l'enregistrement de la maintenance");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    onClose();
    // Réinitialiser le formulaire
    setFormData({
      maintenance_date: new Date().toISOString().split('T')[0],
      maintenance_type: "",
        mileage: "",
      workshop: "",
      cost: "",
      description: "",
      next_maintenance: "",
      notes: "",
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleCancel}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Nouvelle maintenance</DialogTitle>
          <p className="text-sm text-gray-600">
            {vehicleInfo.marque} {vehicleInfo.modele} - {vehicleInfo.immatriculation}
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Date de maintenance */}
          <div>
            <Label htmlFor="maintenance_date">Date de maintenance *</Label>
            <Input
              id="maintenance_date"
              type="date"
              value={formData.maintenance_date}
              onChange={(e) => handleChange("maintenance_date", e.target.value)}
              required
            />
          </div>

          {/* Type de maintenance */}
          <div>
            <Label htmlFor="maintenance_type">Type de maintenance *</Label>
            <Select 
              value={formData.maintenance_type} 
              onValueChange={(value) => handleChange("maintenance_type", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner le type" />
              </SelectTrigger>
              <SelectContent>
                {maintenanceTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>


          {/* Kilométrage */}
          <div>
            <Label htmlFor="mileage">Kilométrage *</Label>
            <Input
              id="mileage"
              type="number"
              value={formData.mileage}
              onChange={(e) => handleChange("mileage", e.target.value)}
              placeholder="Kilométrage actuel"
              required
            />
          </div>

          {/* Atelier/Garage */}
          <div>
            <Label htmlFor="workshop">Garage/Atelier *</Label>
            <Input
              id="workshop"
              type="text"
              value={formData.workshop}
              onChange={(e) => handleChange("workshop", e.target.value)}
              placeholder="Nom du garage"
              required
            />
          </div>

          {/* Coût */}
          <div>
            <Label htmlFor="cost">Coût estimé/réel (€) *</Label>
            <Input
              id="cost"
              type="number"
              step="0.01"
              value={formData.cost}
              onChange={(e) => handleChange("cost", e.target.value)}
              placeholder="0.00"
              required
            />
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="description">Description des travaux *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
              placeholder="Détails des travaux à effectuer..."
              rows={3}
              required
            />
          </div>

          {/* Prochaine maintenance */}
          <div>
            <Label htmlFor="next_maintenance">Prochaine maintenance (optionnel)</Label>
            <Input
              id="next_maintenance"
              type="date"
              value={formData.next_maintenance}
              onChange={(e) => handleChange("next_maintenance", e.target.value)}
            />
          </div>

          {/* Notes */}
          <div>
            <Label htmlFor="notes">Notes supplémentaires</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleChange("notes", e.target.value)}
              placeholder="Notes additionnelles..."
              rows={2}
            />
          </div>

          {/* Boutons */}
          <div className="flex justify-end space-x-2 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleCancel}
              disabled={loading}
            >
              Annuler
            </Button>
            <Button 
              type="submit" 
              disabled={loading}
              className="bg-amber-600 hover:bg-amber-700"
            >
              {loading ? "Enregistrement..." : "Enregistrer maintenance"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default MaintenanceModal; 