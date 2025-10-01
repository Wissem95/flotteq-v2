// Clients/src/pages/AddMaintenance.tsx

import React, { useState, useEffect } from "react";
// import { addMaintenance } from "../services/maintenanceService"; // Non utilisé
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

import axios from "@/lib/api"; // ✅ Très important !
interface Vehicle {
  id: number;
  marque: string;
  modele: string;
  immatriculation: string;
  kilometrage?: number;
}

const AddMaintenance: React.FC = () => {
  const { toast } = useToast();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [formData, setFormData] = useState({
    maintenance_date: "",
    maintenance_type: "",
    mileage: "",
    workshop: "",
    cost: "",
    description: "",
    vehicle_id: "",
    facture: null as File | null,
  });

  const [loading, setLoading] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [mileageError, setMileageError] = useState("");

  useEffect(() => {
    axios
      .get("/api/vehicles")
      .then((res) => {
        // S'assurer que data est un tableau
        const vehicleArray = Array.isArray(res.data) ? res.data : (res.data.data || []);
        setVehicles(vehicleArray);
      })
      .catch(() => {
        setVehicles([]);
      });
  }, []);

  const getMaintenanceDescription = (type: string) => {
    switch (type) {
      case 'oil_change':
        return 'Vidange moteur avec changement du filtre à huile et vérification des niveaux';
      case 'revision':
        return 'Révision complète du véhicule selon le carnet d\'entretien constructeur';
      case 'tires':
        return 'Changement des pneus, équilibrage et contrôle de la géométrie';
      case 'brakes':
        return 'Changement de freins - remplacement des plaquettes et disques, purge du circuit de freinage';
      case 'belt':
        return 'Remplacement de la courroie de distribution et des galets tendeurs';
      case 'filters':
        return 'Changement des filtres (air, habitacle, carburant) selon planning d\'entretien';
      case 'other':
        return 'Maintenance spécifique - préciser les travaux effectués';
      default:
        return '';
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Auto-remplissage de la description selon le type de maintenance
    if (name === "maintenance_type") {
      const description = getMaintenanceDescription(value);
      setFormData((prev) => ({ ...prev, [name]: value, description }));
    }

    // Validation du kilométrage en temps réel
    if (name === "mileage" && selectedVehicle && value) {
      const mileage = parseInt(value);
      const minMileage = selectedVehicle.kilometrage || 0;
      
      if (mileage < minMileage) {
        setMileageError(`⚠️ Le kilométrage doit être supérieur à ${minMileage.toLocaleString()} km (dernier enregistrement)`);
      } else {
        setMileageError("");
      }
    }
  };

  const handleVehicleChange = (vehicleId: string) => {
    const vehicle = vehicles.find(v => v.id.toString() === vehicleId);
    setSelectedVehicle(vehicle || null);
    setFormData(prev => ({ ...prev, vehicle_id: vehicleId }));
    setMileageError("");
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFormData((prev) => ({ ...prev, facture: file }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (mileageError) {
      toast({
        title: "Erreur de validation",
        description: mileageError,
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    
    // Préparer les données - utiliser JSON pour les données de base
    const dataToSend = {
      vehicle_id: formData.vehicle_id,
      maintenance_type: formData.maintenance_type,
      description: formData.description,
      maintenance_date: formData.maintenance_date,
      mileage: parseInt(formData.mileage),
      cost: parseFloat(formData.cost),
      workshop: formData.workshop
    };

    try {
      await axios.post("/api/maintenances", dataToSend, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      
      toast({
        title: "Succès",
        description: "Maintenance enregistrée avec succès"
      });

      setFormData({
        maintenance_date: "",
        maintenance_type: "",
        mileage: "",
        workshop: "",
        cost: "",
        description: "",
        vehicle_id: "",
        facture: null,
      });
      setSelectedVehicle(null);
      setMileageError("");
    } catch (err: unknown) {
      const error = err as { response?: { data?: { errors?: { mileage?: string[] }, message?: string } } };
      const errorMessage = error.response?.data?.errors?.mileage?.[0] || 
                          error.response?.data?.message || 
                          "Erreur lors de l'enregistrement";
      
      toast({
        title: "Erreur",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle>Ajouter une maintenance</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Date de maintenance */}
            <div>
              <Label htmlFor="maintenance_date">Date de maintenance *</Label>
              <Input
                id="maintenance_date"
                type="date"
                name="maintenance_date"
                value={formData.maintenance_date}
                onChange={handleChange}
                required
              />
            </div>

            {/* Type de maintenance */}
            <div>
              <Label htmlFor="maintenance_type">Type de maintenance *</Label>
              <Select value={formData.maintenance_type} onValueChange={(value) => {
                const description = getMaintenanceDescription(value);
                setFormData(prev => ({ ...prev, maintenance_type: value, description }));
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner le type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="oil_change">🛢️ Vidange</SelectItem>
                  <SelectItem value="revision">🔧 Révision</SelectItem>
                  <SelectItem value="tires">🚗 Pneus</SelectItem>
                  <SelectItem value="brakes">🛑 Freins</SelectItem>
                  <SelectItem value="belt">⚙️ Courroie</SelectItem>
                  <SelectItem value="filters">🌬️ Filtres</SelectItem>
                  <SelectItem value="other">🔨 Autre</SelectItem>
                </SelectContent>
              </Select>
              
              {formData.maintenance_type && (
                <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded-md">
                  <p className="text-sm text-green-700">
                    ✅ Description pré-remplie selon le type sélectionné
                  </p>
                </div>
              )}
            </div>

            {/* Véhicule */}
            <div>
              <Label htmlFor="vehicle_id">Véhicule *</Label>
              <Select value={formData.vehicle_id} onValueChange={handleVehicleChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un véhicule" />
                </SelectTrigger>
                <SelectContent>
                  {vehicles.map((v) => (
                    <SelectItem key={v.id} value={v.id.toString()}>
                      {v.marque} {v.modele} - {v.immatriculation}
                      {v.kilometrage && ` (${v.kilometrage.toLocaleString()} km)`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              {selectedVehicle && (
                <div className="mt-3 p-4 bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0">
                      <div className="h-10 w-10 bg-blue-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-lg">🚗</span>
                      </div>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-blue-900">
                        {selectedVehicle.marque} {selectedVehicle.modele}
                      </h4>
                      <p className="text-sm text-blue-700">
                        Kilométrage actuel : <span className="font-bold text-lg">{selectedVehicle.kilometrage?.toLocaleString() || '0'} km</span>
                      </p>
                      <p className="text-xs text-blue-600 mt-1">
                        Immatriculation : {selectedVehicle.immatriculation}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Garage */}
            <div>
              <Label htmlFor="workshop">Garage/Atelier *</Label>
              <Input
                id="workshop"
                name="workshop"
                value={formData.workshop}
                onChange={handleChange}
                placeholder="Nom du garage ou atelier"
                required
              />
            </div>

            {/* Kilométrage */}
            <div>
              <Label htmlFor="mileage">Kilométrage *</Label>
              <Input
                id="mileage"
                type="number"
                name="mileage"
                value={formData.mileage}
                onChange={handleChange}
                placeholder="Kilométrage actuel"
                min="0"
                required
                className={mileageError ? "border-red-500" : ""}
              />
              
              {selectedVehicle && (
                <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-md">
                  <p className="text-sm text-blue-700">
                    📊 <strong>Kilométrage actuel du véhicule :</strong> {selectedVehicle.kilometrage?.toLocaleString() || '0'} km
                  </p>
                </div>
              )}
              
              {mileageError && (
                <Alert variant="destructive" className="mt-2">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{mileageError}</AlertDescription>
                </Alert>
              )}
            </div>

            {/* Coût */}
            <div>
              <Label htmlFor="cost">Montant (€) *</Label>
              <Input
                id="cost"
                type="number"
                step="0.01"
                name="cost"
                value={formData.cost}
                onChange={handleChange}
                placeholder="Coût de la maintenance"
                min="0"
                required
              />
            </div>


            {/* Description */}
            <div>
              <Label htmlFor="description">Description des travaux *</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Décrivez les travaux effectués en détail..."
                rows={4}
                required
              />
            </div>

            {/* Facture */}
            <div>
              <Label htmlFor="facture">Facture (optionnel)</Label>
              <Input
                id="facture"
                type="file"
                name="facture"
                accept="application/pdf,image/*"
                onChange={handleFileChange}
              />
              <p className="text-sm text-gray-500 mt-1">
                Formats acceptés : PDF, JPG, PNG (max 5MB)
              </p>
            </div>

            <Button type="submit" disabled={loading || !!mileageError} className="w-full">
              {loading ? "Enregistrement..." : "Enregistrer la maintenance"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AddMaintenance;

