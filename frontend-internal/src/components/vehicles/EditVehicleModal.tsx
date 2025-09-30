// 📁 src/components/vehicles/EditVehicleModal.tsx

import React, { useEffect, useState } from "react";
import Modal from "@/components/Modal";
import { fetchVehicleById, updateVehicle, VehiclePayload } from "@/services/vehicleService";
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
import DatePicker from "@/components/DatePicker";   // ← import par défaut
import { Separator } from "@/components/ui/separator";
import { Save } from "lucide-react";

interface EditVehicleModalProps {
  isOpen: boolean;
  onClose: () => void;
  vehicleId: number;
  onUpdated?: () => void;
}

const EditVehicleModal: React.FC<EditVehicleModalProps> = ({
  isOpen,
  onClose,
  vehicleId,
  onUpdated,
}) => {
  const [formData, setFormData] = useState<VehiclePayload>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isOpen) return;
    setLoading(true);
    fetchVehicleById(String(vehicleId))
      .then((v) => {
        setFormData({
          plaque: v.plaque,
          marque: v.marque,
          modele: v.modele,
          status: v.status as any,
          nextCT: v.nextCT,
          lastMaintenanceDate: (v as any).lastMaintenanceDate,
          kilometrage: v.kilometrage,
          photoUrl: (v as any).photoUrl,
          // … et tous les autres champs PDF / image déjà enregistrés
        });
      })
      .catch((err) => {
        console.error("❌ Erreur chargement véhicule :", err);
      })
      .finally(() => setLoading(false));
  }, [isOpen, vehicleId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, files } = e.target as any;
    if (files) {
      setFormData((prev) => ({ ...prev, [name]: files[0] }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleDate = (field: keyof VehiclePayload, date: Date | null) => {
    setFormData((prev) => ({
      ...prev,
      [field]: date ? date.toISOString().split("T")[0] : null,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Si on a des fichiers : FormData
    const payload = new FormData();
    Object.entries(formData).forEach(([key, val]) => {
      if (val != null) payload.append(key, val as any);
    });

    try {
      await updateVehicle(vehicleId, payload as any);
      onUpdated?.();
      onClose();
    } catch (err) {
      console.error("❌ Erreur updateVehicle :", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <form onSubmit={handleSubmit} className="max-w-2xl bg-white rounded-lg shadow-lg p-6 space-y-6">
        <h2 className="text-xl font-bold">Modifier le véhicule</h2>
        {loading ? (
          <p className="text-center">Chargement…</p>
        ) : (
          <>
            {/* Uploads des images et PDF */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Photo</Label>
                <Input type="file" name="photo" accept="image/*" onChange={handleChange} />
                {formData.photoUrl && (
                  <img src={formData.photoUrl} alt="Aperçu" className="mt-2 h-24 object-cover rounded" />
                )}
              </div>
              <div>
                <Label>Carte grise (PDF)</Label>
                <Input type="file" name="carteGrise" accept="application/pdf" onChange={handleChange} />
              </div>
              <div>
                <Label>Certificat d'assurance (PDF)</Label>
                <Input type="file" name="assurance" accept="application/pdf" onChange={handleChange} />
              </div>
              <div>
                <Label>Dernier CT (PDF)</Label>
                <Input type="file" name="pvCT" accept="application/pdf" onChange={handleChange} />
              </div>
              <div>
                <Label>Facture d'achat (PDF)</Label>
                <Input type="file" name="factureAchat" accept="application/pdf" onChange={handleChange} />
              </div>
            </div>

            <Separator />

            {/* Champs texte / select / date */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Marque</Label>
                <Input name="marque" value={formData.marque || ""} onChange={handleChange} required />
              </div>
              <div>
                <Label>Modèle</Label>
                <Input name="modele" value={formData.modele || ""} onChange={handleChange} required />
              </div>
              <div>
                <Label>Plaque</Label>
                <Input name="plaque" value={formData.plaque || ""} onChange={handleChange} required />
              </div>
              <div>
                <Label>État</Label>
                <Select
                  name="status"
                  value={formData.status || ""}
                  onValueChange={(v) => setFormData((p) => ({ ...p, status: v as any }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">En service</SelectItem>
                    <SelectItem value="maintenance">En maintenance</SelectItem>
                    <SelectItem value="inactive">Hors service</SelectItem>
                    <SelectItem value="warning">Attention requise</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Prochain CT</Label>
                <DatePicker
                  value={formData.nextCT ?? undefined}
                  onChange={(d) => handleDate("nextCT", d)}
                />
              </div>
              <div>
                <Label>Dernier entretien</Label>
                <DatePicker
                  value={formData.lastMaintenanceDate ?? undefined}
                  onChange={(d) => handleDate("lastMaintenanceDate", d)}
                />
              </div>
              <div>
                <Label>Kilométrage</Label>
                <Input
                  name="kilometrage"
                  type="number"
                  value={formData.kilometrage?.toString() || ""}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Boutons */}
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={onClose} disabled={loading}>
                Annuler
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Enregistrement…" : <><Save size={16} className="mr-1" /> Enregistrer</>}
              </Button>
            </div>
          </>
        )}
      </form>
    </Modal>
  );
};

export default EditVehicleModal;

