// 📁 src/components/vehicles/VehicleEditForm.tsx

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Save } from "lucide-react";
import {
  updateVehicle,
  fetchVehicleById,
  Vehicle,
  VehiclePayload,
} from "@/services/vehicleService";
import DatePicker from "@/components/DatePicker";

interface VehicleEditFormProps {
  initialData: Vehicle;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const VehicleEditForm: React.FC<VehicleEditFormProps> = ({
  initialData,
  onSuccess,
  onCancel,
}) => {
  const [formData, setFormData] = useState<VehiclePayload>({
    plaque: "",
    marque: "",
    modele: "",
    numero_serie: null,
    annee: null,
    kilometrage: null,
    carburant: null,
    type: null,
    couleur: null,
    annee_mise_en_circulation: null,
    annee_achat: null,
    puissance: null,
    purchaseDate: null,
    purchasePrice: null,
    lastCT: null,
    nextCT: null,
    status: "active",
    notes: null,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialisation des valeurs du formulaire
  useEffect(() => {
    setFormData({
      plaque: initialData.plaque,
      marque: initialData.marque,
      modele: initialData.modele,
      numero_serie: initialData.numero_serie ?? null,
      annee: initialData.annee ?? null,
      kilometrage: initialData.kilometrage ?? null,
      carburant: initialData.carburant ?? null,
      type: initialData.type ?? null,
      couleur: initialData.couleur ?? null,
      annee_mise_en_circulation: initialData.annee_mise_en_circulation ?? null,
      annee_achat: initialData.annee_achat ?? null,
      puissance: initialData.puissance ?? null,
      purchaseDate: initialData.purchaseDate ?? null,
      purchasePrice: initialData.purchasePrice ?? null,
      lastCT: initialData.lastCT ?? null,
      nextCT: initialData.nextCT ?? null,
      status: initialData.status ?? "active",
      notes: initialData.notes ?? null,
    });
  }, [initialData]);

  // Gestion des champs texte / numériques
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        ["annee", "kilometrage", "puissance", "annee_mise_en_circulation", "annee_achat"].includes(name)
          ? value === ""
            ? null
            : parseInt(value)
          : value,
    }));
  };

  // Gestion des Select
  const handleSelect = (field: keyof VehiclePayload, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]:
        ["annee", "kilometrage", "puissance", "annee_mise_en_circulation", "annee_achat"].includes(field)
          ? value === ""
            ? null
            : parseInt(value)
          : value,
    }));
  };

  // Gestion des DatePicker
  const handleDateChange = (field: keyof VehiclePayload, date: Date | null) => {
    setFormData((prev) => ({
      ...prev,
      [field]: date ? date.toISOString().split("T")[0] : null,
    }));
  };

  // Envoi des modifications
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await updateVehicle(initialData.id, formData);
      onSuccess?.();
    } catch (err: any) {
      console.error("❌ Erreur lors de la mise à jour du véhicule :", err);
      setError(
        err.response?.data?.error ||
          "Erreur inconnue lors de la mise à jour. Consultez la console du back-end."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* ── INFOS TECHNIQUES & ADMINISTRATIVES ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label>Marque*</Label>
          <Input
            name="marque"
            value={formData.marque ?? ""}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <Label>Modèle*</Label>
          <Input
            name="modele"
            value={formData.modele ?? ""}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <Label>Immatriculation*</Label>
          <Input
            name="plaque"
            value={formData.plaque ?? ""}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <Label>Kilométrage</Label>
          <Input
            name="kilometrage"
            type="number"
            value={
              formData.kilometrage != null ? formData.kilometrage : ""
            }
            onChange={handleChange}
            placeholder="Ex : 50000"
          />
        </div>
        <div>
          <Label>Année</Label>
          <Input
            name="annee"
            type="number"
            value={formData.annee != null ? formData.annee : ""}
            onChange={handleChange}
            placeholder="Ex : 2020"
          />
        </div>
        <div>
          <Label>Puissance (ch)</Label>
          <Input
            name="puissance"
            type="number"
            value={formData.puissance != null ? formData.puissance : ""}
            onChange={handleChange}
            placeholder="Ex : 90"
          />
        </div>
        <div>
          <Label>Catégorie</Label>
          <Select
            value={formData.type || ""}
            onValueChange={(v) => handleSelect("type", v)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Sélectionner" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="VP">VP</SelectItem>
              <SelectItem value="VUL">VUL</SelectItem>
              <SelectItem value="PL">PL</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Carburant</Label>
          <Select
            value={formData.carburant || ""}
            onValueChange={(v) => handleSelect("carburant", v)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Sélectionner" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="diesel">Diesel</SelectItem>
              <SelectItem value="essence">Essence</SelectItem>
              <SelectItem value="hybride">Hybride</SelectItem>
              <SelectItem value="electrique">Électrique</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Separator />

      {/* ── DATES, NOTES ET ÉTAT ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label>Date d’achat</Label>
          <DatePicker
            value={formData.purchaseDate || undefined}
            onChange={(d) => handleDateChange("purchaseDate", d)}
            placeholder="jj/MM/aaaa"
          />
        </div>
        <div>
          <Label>Date dernier CT</Label>
          <DatePicker
            value={formData.lastCT || undefined}
            onChange={(d) => handleDateChange("lastCT", d)}
            placeholder="jj/MM/aaaa"
          />
        </div>
        <div>
          <Label>Date prochain CT</Label>
          <DatePicker
            value={formData.nextCT || undefined}
            onChange={(d) => handleDateChange("nextCT", d)}
            placeholder="jj/MM/aaaa"
          />
        </div>
        <div>
          <Label>Notes</Label>
          <textarea
            name="notes"
            value={formData.notes || ""}
            onChange={handleChange}
            className="w-full min-h-[100px] rounded-md border border-input p-2 text-sm"
            placeholder="Infos complémentaires…"
          />
        </div>
        <div>
          <Label>État*</Label>
          <Select
            value={formData.status || ""}
            onValueChange={(v) => handleSelect("status", v)}
            required
          >
            <SelectTrigger>
              <SelectValue placeholder="Sélectionner état" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">En service</SelectItem>
              <SelectItem value="maintenance">En maintenance</SelectItem>
              <SelectItem value="inactive">Hors service</SelectItem>
              <SelectItem value="warning">Attention requise</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {error && <p className="text-red-500 text-center text-sm">{error}</p>}

      {/* ── BOUTONS ANNULER / ENREGISTRER ── */}
      <div className="flex justify-end space-x-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => onCancel && onCancel()}
          disabled={loading}
        >
          Annuler
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? (
            "Enregistrement…"
          ) : (
            <>
              <Save size={16} className="mr-1" /> Enregistrer
            </>
          )}
        </Button>
      </div>
    </form>
  );
};

