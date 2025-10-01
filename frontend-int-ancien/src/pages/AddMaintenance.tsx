// Clients/src/pages/AddMaintenance.tsx

import React, { useState, useEffect } from "react";
import { addMaintenance } from "../services/maintenanceService";

import axios from "@/lib/api"; // ✅ Très important !
interface Vehicle {
  id: number;
  marque: string;
  modele: string;
  plaque: string;
}

const AddMaintenance: React.FC = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [formData, setFormData] = useState({
    date: "",
    type: "",
    kilometrage: "",
    garage: "",
    montant: "",
    pieces: "",
    vehicle_id: "",
    facture: null as File | null,
  });

  const [message, setMessage] = useState("");

  useEffect(() => {
    axios
      .get("/api/vehicles")
      .then((res) => setVehicles(res.data))
      .catch(() => setVehicles([]));


  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFormData((prev) => ({ ...prev, facture: file }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (value) data.append(key, value);
    });

    try {
      await axios.post("/api/maintenances", data, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      setMessage("✅ Maintenance enregistrée avec succès.");
      setFormData({
        date: "",
        type: "",
        kilometrage: "",
        garage: "",
        montant: "",
        pieces: "",
        vehicle_id: "",
        facture: null,
      });
    } catch (_err) {
      setMessage("❌ Erreur lors de l'enregistrement.");
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto bg-white shadow rounded">
      <h2 className="text-2xl font-bold mb-4">Ajouter une maintenance</h2>
      {message && <p className="mb-4 text-sm text-blue-600">{message}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">

        <input
          type="date"
          name="date"
          value={formData.date}
          onChange={handleChange}
          className="w-full border p-2 rounded"
          required
        />

        <input
          type="text"
          name="type"
          value={formData.type}
          onChange={handleChange}
          placeholder="Type d’intervention"
          className="w-full border p-2 rounded"
          required
        />

        <select
          name="vehicle_id"
          value={formData.vehicle_id}
          onChange={handleChange}
          className="w-full border p-2 rounded"
          required
        >
          <option value="">Sélectionner un véhicule</option>
          {vehicles.map((v) => (
            <option key={v.id} value={v.id}>
              {v.marque} {v.modele} - {v.plaque}
            </option>
          ))}
        </select>

        <input
          type="text"
          name="garage"
          value={formData.garage}
          onChange={handleChange}
          placeholder="Garage"
          className="w-full border p-2 rounded"
        />

        <input
          type="number"
          name="kilometrage"
          value={formData.kilometrage}
          onChange={handleChange}
          placeholder="Kilométrage"
          className="w-full border p-2 rounded"
        />

        <input
          type="number"
          step="0.01"
          name="montant"
          value={formData.montant}
          onChange={handleChange}
          placeholder="Montant (€)"
          className="w-full border p-2 rounded"
        />

        <textarea
          name="pieces"
          value={formData.pieces}
          onChange={handleChange}
          placeholder="Pièces remplacées"
          className="w-full border p-2 rounded"
          rows={3}
        />

        <input
          type="file"
          name="facture"
          accept="application/pdf,image/*"
          onChange={handleFileChange}
          className="w-full border p-2 rounded"
        />

        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Enregistrer
        </button>
      </form>
    </div>
  );
};

export default AddMaintenance;

