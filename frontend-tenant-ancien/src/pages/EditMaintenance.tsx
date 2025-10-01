import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Vehicle {
  id: number;
  marque: string;
  modele: string;
  immatriculation: string;
}

const EditMaintenance: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    maintenance_date: "",
    maintenance_type: "",
    mileage: "",
    workshop: "",
    cost: "",
    description: "",
    vehicle_id: "",
    next_maintenance: "",
    notes: "",
  });
  const [message, setMessage] = useState("");

  const maintenanceTypes = [
    { value: "oil_change", label: "Vidange" },
    { value: "revision", label: "Révision générale" },
    { value: "tires", label: "Pneus" },
    { value: "brakes", label: "Freins" },
    { value: "belt", label: "Courroie" },
    { value: "filters", label: "Filtres" },
    { value: "other", label: "Autre" },
  ];

  // Charger véhicules + données de la maintenance
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Charger les véhicules
        const vehiclesRes = await api.get("/vehicles");
        setVehicles(vehiclesRes.data);

        // Charger les données de la maintenance
        const maintenanceRes = await api.get(`/maintenances/${id}`);
        const data = maintenanceRes.data;
        
        setFormData({
          maintenance_date: data.maintenance_date ? data.maintenance_date.split('T')[0] : "",
          maintenance_type: data.maintenance_type || "",
          mileage: data.mileage?.toString() || "",
          workshop: data.workshop || "",
          cost: data.cost?.toString() || "",
          description: data.description || "",
          vehicle_id: data.vehicle_id?.toString() || "",
          next_maintenance: data.next_maintenance ? data.next_maintenance.split('T')[0] : "",
          notes: data.notes || "",
        });
      } catch (err) {
        console.error("Erreur lors du chargement :", err);
        setMessage("❌ Erreur lors du chargement des données");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        maintenance_date: formData.maintenance_date,
        maintenance_type: formData.maintenance_type,
        mileage: parseInt(formData.mileage) || 0,
        workshop: formData.workshop,
        cost: parseFloat(formData.cost) || 0,
        description: formData.description,
        vehicle_id: parseInt(formData.vehicle_id),
        next_maintenance: formData.next_maintenance || null,
        notes: formData.notes || null,
      };

      await api.put(`/maintenances/${id}`, payload);
      setMessage("✅ Maintenance modifiée avec succès.");
      setTimeout(() => navigate("/vehicles/history"), 1500);
    } catch (err) {
      console.error("Erreur lors de la modification :", err);
      setMessage("❌ Erreur lors de la modification.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Modifier la maintenance</CardTitle>
        </CardHeader>
        <CardContent>
          {message && (
            <div className={`mb-4 p-3 rounded ${
              message.includes('✅') ? 'bg-green-100 text-green-700' : 
              'bg-red-100 text-red-700'
            }`}>
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="maintenance_date">Date de maintenance *</Label>
                <Input
                  id="maintenance_date"
                  name="maintenance_date"
                  type="date"
                  value={formData.maintenance_date}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="maintenance_type">Type de maintenance *</Label>
                <Select
                  value={formData.maintenance_type}
                  onValueChange={(value) => handleSelectChange("maintenance_type", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un type" />
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
            </div>

            <div className="space-y-2">
              <Label htmlFor="vehicle_id">Véhicule *</Label>
              <Select
                value={formData.vehicle_id}
                onValueChange={(value) => handleSelectChange("vehicle_id", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un véhicule" />
                </SelectTrigger>
                <SelectContent>
                  {vehicles.map((vehicle) => (
                    <SelectItem key={vehicle.id} value={vehicle.id.toString()}>
                      {vehicle.marque} {vehicle.modele} - {vehicle.immatriculation}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="workshop">Garage *</Label>
                <Input
                  id="workshop"
                  name="workshop"
                  value={formData.workshop}
                  onChange={handleChange}
                  placeholder="Nom du garage"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="mileage">Kilométrage</Label>
                <Input
                  id="mileage"
                  name="mileage"
                  type="number"
                  value={formData.mileage}
                  onChange={handleChange}
                  placeholder="120000"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cost">Coût (€) *</Label>
                <Input
                  id="cost"
                  name="cost"
                  type="number"
                  step="0.01"
                  value={formData.cost}
                  onChange={handleChange}
                  placeholder="150.00"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="next_maintenance">Prochaine maintenance</Label>
                <Input
                  id="next_maintenance"
                  name="next_maintenance"
                  type="date"
                  value={formData.next_maintenance}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Décrivez les travaux effectués..."
                rows={3}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes supplémentaires</Label>
              <Textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                placeholder="Notes ou observations..."
                rows={2}
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button 
                type="submit" 
                disabled={loading}
                className="flex-1"
              >
                {loading ? "Modification en cours..." : "Mettre à jour"}
              </Button>
              <Button 
                type="button" 
                variant="outline"
                onClick={() => navigate("/vehicles/history")}
                className="flex-1"
              >
                Annuler
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default EditMaintenance;

