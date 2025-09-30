import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { getMaintenances, deleteMaintenance } from "@/services/maintenanceService";
import { Button } from "@/components/ui/button";

interface Maintenance {
  id: number;
  date: string;
  type: string;
  garage: string;
  kilometrage: number;
  montant: number;
  pieces: string;
  vehicle: {
    marque: string;
    modele: string;
    plaque: string;
  };
  facture?: string;
}

const Maintenances: React.FC = () => {
  const [maintenances, setMaintenances] = useState<Maintenance[]>([]);
  const [filtered, setFiltered] = useState<Maintenance[]>([]);
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const fetchMaintenances = async () => {
    try {
      const data = await getMaintenances();
      setMaintenances(data);
      setFiltered(data);
    } catch (_err) {
      console.error("❌ Erreur de chargement :", _err); // ✅ Debug
      setMessage("Erreur lors du chargement des maintenances.");
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("Supprimer cette maintenance ?")) {
      try {
        await deleteMaintenance(id);
        setMessage("Maintenance supprimée.");
        fetchMaintenances();
      } catch (_err) {
        setMessage("Erreur lors de la suppression.");
      }
    }
  };

  useEffect(() => {
    fetchMaintenances();
  }, []);

  useEffect(() => {
    const lower = search.toLowerCase();
    const result = maintenances.filter((m) =>
      m.type.toLowerCase().includes(lower) ||
      m.garage.toLowerCase().includes(lower) ||
      m.vehicle?.marque?.toLowerCase().includes(lower) ||
      m.vehicle?.modele?.toLowerCase().includes(lower) ||
      m.vehicle?.plaque?.toLowerCase().includes(lower)
    );
    setFiltered(result);
  }, [search, maintenances]);

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 gap-3">
        <h2 className="text-2xl font-bold">Maintenance</h2>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Rechercher..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border border-gray-300 px-3 py-2 rounded-md w-full md:w-64"
          />
          <Button onClick={() => navigate("/vehicles/maintenance/add")}>
            Ajouter
          </Button>
        </div>
      </div>

      {message && <p className="mb-4 text-blue-600">{message}</p>}

      <table className="w-full text-sm border border-slate-200">
        <thead>
          <tr className="bg-slate-100 text-left">
            <th className="p-2 border">Date</th>
            <th className="p-2 border">Véhicule</th>
            <th className="p-2 border">Type</th>
            <th className="p-2 border">Garage</th>
            <th className="p-2 border">KM</th>
            <th className="p-2 border">Montant</th>
            <th className="p-2 border">Pièces</th>
            <th className="p-2 border">Facture</th>
            <th className="p-2 border text-center">Action</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((m) => (
            <tr key={m.id} className="border-t">
              <td className="p-2">{m.date}</td>
              <td className="p-2">
                {m.vehicle?.marque} {m.vehicle?.modele}<br />
                {m.vehicle?.plaque}
              </td>
              <td className="p-2">{m.type}</td>
              <td className="p-2">{m.garage}</td>
              <td className="p-2">{m.kilometrage}</td>
              <td className="p-2">{m.montant} €</td>
              <td className="p-2">{m.pieces}</td>
              <td className="p-2">
                {m.facture ? (
                  <a href={`/uploads/factures/${m.facture}`} target="_blank" rel="noreferrer">
                    Voir
                  </a>
                ) : (
                  "-"
                )}
              </td>
             <td className="p-2 text-center flex gap-2 justify-center">
  <button
    onClick={() => navigate(`/vehicles/maintenance/edit/${m.id}`)}
    className="text-blue-600 hover:underline"
  >
    ✏️ Modifier
  </button>
  <button
    onClick={() => handleDelete(m.id)}
    className="text-red-600 hover:underline"
  >
    Supprimer
  </button>
</td>

            </tr>
          ))}
          {filtered.length === 0 && (
            <tr>
              <td colSpan={9} className="text-center p-4">Aucune maintenance trouvée.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Maintenances;

