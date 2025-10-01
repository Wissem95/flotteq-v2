// 📁 src/components/vehicles/VehicleForm.tsx
import React, { useState, useEffect, ChangeEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Save } from "lucide-react";
import {
  createVehicle,
  updateVehicle,
  Vehicle,
  VehiclePayload,
} from "@/services/vehicleService";
import DatePicker from "@/components/DatePicker";

interface VehicleFormProps {
  initialData?: Vehicle;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const VehicleForm: React.FC<VehicleFormProps> = ({
  initialData,
  onSuccess,
  onCancel,
}) => {
  const isEditing = Boolean(initialData);
  const allowedStatus = ["active", "inactive", "maintenance", "warning"] as const;

  const [formData, setFormData] = useState<
    VehiclePayload & { photos: File[]; documents: File[]; driver?: string }
  >({
    plaque: "",
    marque: "",
    modele: "",
    numero_serie: null,
    annee: null,
    kilometrage: null,
    carburant: "",
    type: null,
    couleur: null,
    annee_mise_en_circulation: null,
    annee_achat: null,
    puissance: null,
    purchaseDate: null,
    purchasePrice: null,
    last_ct_date: null,
    next_ct_date: null,
    driver: null,
    status: "active",
    notes: null,
    photos: [],
    documents: [],
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialisation en édition
  useEffect(() => {
    if (initialData) {
      setFormData((prev) => ({
        ...prev,
        plaque: initialData.plaque,
        marque: initialData.marque,
        modele: initialData.modele,
        numero_serie: initialData.numero_serie ?? null,
        annee: initialData.annee ?? null,
        kilometrage: initialData.kilometrage ?? null,
        carburant: initialData.carburant ?? "",
        type: initialData.type ?? null,
        couleur: initialData.couleur ?? null,
        annee_mise_en_circulation:
          initialData.annee_mise_en_circulation ?? null,
        annee_achat: initialData.annee_achat ?? null,
        puissance: initialData.puissance ?? null,
        purchaseDate: initialData.purchaseDate ?? null,
        purchasePrice: initialData.purchasePrice ?? null,
        last_ct_date: initialData.last_ct_date ?? null,
        next_ct_date: initialData.next_ct_date ?? null,
        driver: initialData.driver ?? null,
        status: allowedStatus.includes(initialData.status as any)
          ? (initialData.status as typeof allowedStatus[number])
          : "active",
        notes: initialData.notes ?? null,
        photos: [],
        documents: [],
      }));
    }
  }, [initialData]);

  // Gestion textes / nombres
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        ["annee", "kilometrage", "puissance", "annee_mise_en_circulation", "annee_achat"].includes(
          name
        )
          ? value === ""
            ? null
            : parseInt(value, 10)
          : value,
    }));
  };

  // Sélecteurs (carburant, driver, etc.)
  const handleSelect = (field: keyof VehiclePayload | "driver", value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]:
        ["annee", "kilometrage", "puissance", "annee_mise_en_circulation", "annee_achat"].includes(
          field
        )
          ? value === ""
            ? null
            : parseInt(value, 10)
          : value,
    }));
  };

  // DatePicker
  const handleDateChange = (field: keyof VehiclePayload, date: Date | null) => {
    setFormData((prev) => ({
      ...prev,
      [field]: date ? date.toISOString().split("T")[0] : null,
    }));
  };

  // Photos (drag & drop support natif via input)
  const handlePhotos = (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    setFormData((prev) => ({ ...prev, photos: Array.from(e.target.files) }));
  };

  // Documents PDF
  const handleDocuments = (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    setFormData((prev) => ({
      ...prev,
      documents: Array.from(e.target.files),
    }));
  };

  // Soumission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const data = new FormData();
      Object.entries(formData).forEach(([key, val]) => {
        if (val == null) return;
        if (key === "photos" && Array.isArray(val)) {
          val.forEach((file) => data.append("photos", file));
        } else if (key === "documents" && Array.isArray(val)) {
          val.forEach((file) => data.append("documents", file));
        } else {
          data.append(key, String(val));
        }
      });

      if (isEditing && initialData) {
        await updateVehicle(initialData.id, data as any);
      } else {
        await createVehicle(data as any);
      }
      onSuccess?.();
    } catch (err: any) {
      console.error("❌ Erreur lors de l'enregistrement :", err);
      setError(err.response?.data?.error ?? "Erreur serveur");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* ―― INFORMATIONS TECHNIQUES & ADMINISTRATIVES ―― */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label>Marque*</Label>
          <Input
            name="marque"
            value={formData.marque ?? ""}
            onChange={handleChange}
            required
            placeholder="Ex : Peugeot"
          />
        </div>
        <div>
          <Label>Modèle*</Label>
          <Input
            name="modele"
            value={formData.modele ?? ""}
            onChange={handleChange}
            required
            placeholder="Ex : 208"
          />
        </div>
        <div>
          <Label>Immatriculation*</Label>
          <Input
            name="plaque"
            value={formData.plaque ?? ""}
            onChange={handleChange}
            required
            placeholder="Ex : AB-123-CD"
          />
        </div>
        <div>
          <Label>Numéro VIN</Label>
          <Input
            name="numero_serie"
            value={formData.numero_serie ?? ""}
            onChange={handleChange}
            placeholder="Numéro d'identification"
          />
        </div>
        <div>
          <Label>Version</Label>
          <Input
            name="type"
            value={formData.type ?? ""}
            onChange={handleChange}
            placeholder="Ex : 1.5 dCi 90ch Business"
          />
        </div>
        <div>
          <Label>Type de carburant</Label>
          <select
            name="carburant"
            value={formData.carburant}
            onChange={(e) => handleSelect("carburant", e.target.value)}
            className="w-full rounded-md border border-input p-2"
          >
            <option value="">Sélectionner</option>
            <option value="Essence">Essence</option>
            <option value="Diesel">Diesel</option>
            <option value="Hybride">Hybride</option>
            <option value="Électrique">Électrique</option>
          </select>
        </div>
        <div>
          <Label>Kilométrage</Label>
          <Input
            name="kilometrage"
            type="number"
            value={formData.kilometrage ?? ""}
            onChange={handleChange}
            placeholder="Ex : 50000"
          />
        </div>
        <div>
          <Label>Année</Label>
          <Input
            name="annee"
            type="number"
            value={formData.annee ?? ""}
            onChange={handleChange}
            placeholder="Ex : 2020"
          />
        </div>
        <div>
          <Label>Puissance (ch)</Label>
          <Input
            name="puissance"
            type="number"
            value={formData.puissance ?? ""}
            onChange={handleChange}
            placeholder="Ex : 90"
          />
        </div>
      </div>

      <Separator />

      {/* ―― DATES, NOTES & TYPE ―― */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label>Date d'achat</Label>
          <DatePicker
            value={formData.purchaseDate ?? undefined}
            onChange={(d) => handleDateChange("purchaseDate", d)}
            placeholder="jj/MM/aaaa"
          />
        </div>
        <div>
          <Label>Prix d'achat</Label>
          <Input
            name="purchasePrice"
            type="number"
            value={formData.purchasePrice ?? ""}
            onChange={handleChange}
            placeholder="Ex : 15000"
          />
        </div>
        <div>
          <Label>Date du dernier CT</Label>
          <DatePicker
            value={formData.last_ct_date ?? undefined}
            onChange={(d) => handleDateChange("last_ct_date", d)}
            placeholder="Sélectionner une date"
          />
        </div>
        <div>
          <Label>Date du prochain CT</Label>
          <DatePicker
            value={formData.next_ct_date ?? undefined}
            onChange={(d) => handleDateChange("next_ct_date", d)}
            placeholder="Sélectionner une date"
          />
        </div>
      </div>

      {/* Affichage conditionnel du champ Conducteur */}
      <>
        <Separator />
        <div>
          <Label>Conducteur assigné</Label>
          <Input
            name="driver"
            value={formData.driver ?? ""}
            onChange={handleChange}
            placeholder="Sélectionner le conducteur"
          />
        </div>
      </>

      <Separator />

      {/* ―― DOCUMENTS (PDF) ―― */}
      <div className="relative">
        <Label>Documents (PDF)</Label>
        <div className="border border-dashed border-gray-300 rounded-lg p-4 text-center">
          <input
            type="file"
            multiple
            accept="application/pdf"
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            onChange={handleDocuments}
          />
          <p className="text-sm text-gray-500">
            Glissez-déposez ou cliquez pour importer vos PDF.<br />
            (Carte grise, Certificat d'assurance, CT, Facture…)
          </p>
        </div>
      </div>

      <Separator />

      {/* ―― PHOTOS DU VÉHICULE ―― */}
      <div className="relative">
        <Label>Photos du véhicule</Label>
        <div className="border border-dashed border-gray-300 rounded-lg p-4 text-center">
          <input
            type="file"
            multiple
            accept="image/*"
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            onChange={handlePhotos}
          />
          <p className="text-sm text-gray-500">
            Glissez-déposez ou cliquez pour ajouter vos photos
          </p>
        </div>
      </div>

      {error && (
        <p className="text-red-500 text-center text-sm mt-2">{error}</p>
      )}

      {/* ―― BOUTONS ANNULER / ENREGISTRER ―― */}
      <div className="flex justify-end space-x-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => onCancel?.()}
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

