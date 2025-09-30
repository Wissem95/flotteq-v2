// 📁 src/pages/AddVehicle.tsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Save } from "lucide-react";
import { createVehicle, VehiclePayload } from "@/services/vehicleService";
import DatePicker from "@/components/DatePicker";
import { toast } from "sonner";

const AddVehicle: React.FC = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = React.useState<VehiclePayload>({
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
    last_ct_date: null,
    next_ct_date: null,
    driver: null,      // on peut laisser ce champ vide si jamais vous l'utilisez ultérieurement
    status: "active",  // champ « État »
    notes: null,
  });
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    // Les champs numériques doivent être parseInt, sinon on garde la chaîne
    if (
      ["annee", "kilometrage", "puissance", "annee_mise_en_circulation", "annee_achat"].includes(
        name
      )
    ) {
      setFormData((prev) => ({
        ...prev,
        [name]: value === "" ? null : parseInt(value),
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSelect = (field: keyof VehiclePayload, value: string) => {
    // Conversion au besoin pour les champs numériques (ex. annee)  
    if (
      ["annee", "kilometrage", "puissance", "annee_mise_en_circulation", "annee_achat"].includes(
        field
      )
    ) {
      setFormData((prev) => ({
        ...prev,
        [field]: value === "" ? null : parseInt(value),
      }));
    } else {
      setFormData((prev) => ({ ...prev, [field]: value }));
    }
  };

  const handleDateChange = (field: keyof VehiclePayload, date: Date | null) => {
    setFormData((prev) => ({
      ...prev,
      [field]: date ? date.toISOString().split("T")[0] : null,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const data = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== null && value !== undefined) data.append(key, String(value));
      });
      await createVehicle(data);
      toast.success("Véhicule créé avec succès !");
      navigate("/vehicles");
    } catch (err: any) {
      console.error("❌ Erreur création :", err);
      setError(
        err.response?.data?.error ||
          "Erreur inconnue. Vérifiez la console du back-end."
      );
      toast.error("Impossible de créer le véhicule.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto p-4">
      {/* Entête avec bouton retour */}
      <div className="flex items-center">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(-1)}
          className="mr-2"
        >
          <ArrowLeft size={18} />
        </Button>
        <h1 className="text-2xl font-bold">Ajouter un véhicule</h1>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* ── Partie gauche : informations techniques et administratives ── */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Informations véhicule</CardTitle>
              <CardDescription>
                Détails techniques et administratifs
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  {/* Champ Marque */}
                  <div>
                    <Label>Marque*</Label>
                    <Input
                      name="marque"
                      value={formData.marque}
                      onChange={handleChange}
                      required
                      placeholder="Ex : Renault"
                    />
                  </div>

                  {/* Champ Modèle */}
                  <div>
                    <Label>Modèle*</Label>
                    <Input
                      name="modele"
                      value={formData.modele}
                      onChange={handleChange}
                      required
                      placeholder="Ex : Clio"
                    />
                  </div>

                  {/* Champ Version (numéro série) */}
                  <div>
                    <Label>Version (VIN)</Label>
                    <Input
                      name="numero_serie"
                      value={formData.numero_serie || ""}
                      onChange={handleChange}
                      placeholder="Ex : VIN1234567890"
                    />
                  </div>

                  {/* Champ Année */}
                  <div>
                    <Label>Année</Label>
                    <Input
                      name="annee"
                      type="number"
                      value={formData.annee != null ? formData.annee : ""}
                      onChange={handleChange}
                      placeholder="Ex : 2022"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  {/* Champ Immatriculation (plaque) */}
                  <div>
                    <Label>Immatriculation*</Label>
                    <Input
                      name="plaque"
                      value={formData.plaque}
                      onChange={handleChange}
                      required
                      placeholder="Ex : CQ-019-DP"
                    />
                  </div>

                  {/* Champ Carburant */}
                  <div>
                    <Label>Type de carburant</Label>
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

                  {/* Champ Kilométrage */}
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

                  {/* Champ Puissance */}
                  <div>
                    <Label>Puissance (ch)</Label>
                    <Input
                      name="puissance"
                      type="number"
                      value={
                        formData.puissance != null ? formData.puissance : ""
                      }
                      onChange={handleChange}
                      placeholder="Ex : 110"
                    />
                  </div>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Champ Date d'achat */}
                <div>
                  <Label>Date d'achat</Label>
                  <DatePicker
                    value={formData.purchaseDate ?? undefined}
                    onChange={(d) => handleDateChange("purchaseDate", d)}
                    placeholder="yyyy-MM-dd"
                  />
                </div>

                {/* Champ Prix d'achat */}
                <div>
                  <Label>Prix d'achat (€)</Label>
                  <Input
                    name="purchasePrice"
                    type="number"
                    value={
                      formData.purchasePrice != null
                        ? formData.purchasePrice
                        : ""
                    }
                    onChange={handleChange}
                    placeholder="Ex : 15000"
                  />
                </div>

                {/* Champ Date du dernier CT */}
                <div>
                  <Label>Date du dernier CT</Label>
                  <DatePicker
                    value={formData.last_ct_date ?? undefined}
                    onChange={(d) => handleDateChange("last_ct_date", d)}
                    placeholder="yyyy-MM-dd"
                  />
                </div>

                {/* Champ Date du prochain CT */}
                <div>
                  <Label>Date du prochain CT</Label>
                  <DatePicker
                    value={formData.next_ct_date ?? undefined}
                    onChange={(d) => handleDateChange("next_ct_date", d)}
                    placeholder="yyyy-MM-dd"
                  />
                </div>
              </div>

              <Separator />

              {/* Champ Notes */}
              <div>
                <Label>Notes</Label>
                <textarea
                  name="notes"
                  value={formData.notes || ""}
                  onChange={handleChange}
                  className="w-full min-h-[120px] rounded-md border border-slate-200 px-3 py-2"
                  placeholder="Infos complémentaires…"
                />
              </div>
            </CardContent>
          </Card>

          {/* ── Partie droite : État ── */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>État du véhicule</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label>État*</Label>
                    <Select
                      value={formData.status || ""}
                      onValueChange={(v) => handleSelect("status", v)}
                      required
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
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Boutons Annuler / Enregistrer */}
        <div className="flex justify-end mt-8 space-x-4">
          <Button variant="outline" onClick={() => navigate("/vehicles")}>
            Annuler
          </Button>
          <Button
            type="submit"
            className="bg-flotteq-blue hover:bg-flotteq-navy"
            disabled={loading}
          >
            <Save size={18} className="mr-2" />
            {loading ? "Enregistrement…" : "Enregistrer"}
          </Button>
        </div>

        {error && (
          <p className="text-red-500 text-center text-sm mt-2">{error}</p>
        )}
      </form>
    </div>
  );
};

export default AddVehicle;

