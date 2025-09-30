import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { getMaintenancesWithFilters, deleteMaintenance } from "@/services/maintenanceService";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

// Utilitaires sécurisés
import { safeArray, safeLength } from "@/utils/safeData";

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
  status?: string;
}

const Maintenances: React.FC = () => {
  const [maintenancesEnCours, setMaintenancesEnCours] = useState<Maintenance[]>([]);
  const [filteredEnCours, setFilteredEnCours] = useState<Maintenance[]>([]);
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const fetchMaintenances = async () => {
    try {
      // Récupérer uniquement les maintenances en cours (in_progress et scheduled)
      const data = await getMaintenancesWithFilters({ 
        status: "in_progress" 
      });
      const scheduledData = await getMaintenancesWithFilters({ 
        status: "scheduled" 
      });
      
      // Combiner les maintenances en cours et planifiées
      const inProgressArray = safeArray(data);
      const scheduledArray = safeArray(scheduledData);
      const enCours = [...inProgressArray, ...scheduledArray];
      
      setMaintenancesEnCours(enCours);
      setFilteredEnCours(enCours);
    } catch (_err) {
      console.error("❌ Erreur de chargement :", _err); // ✅ Debug
      setMessage("Erreur lors du chargement des maintenances.");
      setMaintenancesEnCours([]);
      setFilteredEnCours([]);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("Supprimer cette maintenance ?")) {
      try {
        await deleteMaintenance(id);
        setMessage("Maintenance supprimée.");
        fetchMaintenances();
      } catch {
        setMessage("Erreur lors de la suppression.");
      }
    }
  };

  useEffect(() => {
    fetchMaintenances();
  }, []);

  useEffect(() => {
    const lower = search.toLowerCase();
    
    // Filtrer les maintenances en cours
    const resultEnCours = maintenancesEnCours.filter((m) =>
      m.type.toLowerCase().includes(lower) ||
      m.garage.toLowerCase().includes(lower) ||
      m.vehicle?.marque?.toLowerCase().includes(lower) ||
      m.vehicle?.modele?.toLowerCase().includes(lower) ||
      m.vehicle?.plaque?.toLowerCase().includes(lower)
    );
    
    setFilteredEnCours(resultEnCours);
  }, [search, maintenancesEnCours]);

  const renderMaintenanceTable = (maintenanceList: Maintenance[], emptyMessage: string) => (
    <table className="w-full text-sm border border-slate-200">
      <thead>
        <tr className="bg-slate-100 text-left">
          <th className="p-2 border">Date</th>
          <th className="p-2 border">Véhicule</th>
          <th className="p-2 border">Type</th>
          <th className="p-2 border">Garage</th>
          <th className="p-2 border">KM</th>
          <th className="p-2 border">Montant</th>
          <th className="p-2 border">Description</th>
          <th className="p-2 border">Statut</th>
          <th className="p-2 border text-center">Action</th>
        </tr>
      </thead>
      <tbody>
        {Array.isArray(maintenanceList) && maintenanceList.map((m) => (
          <tr key={m.id} className="border-t">
            <td className="p-2">{m.date}</td>
            <td className="p-2">
              {m.vehicle?.marque} {m.vehicle?.modele}<br />
              <span className="text-sm text-gray-500">{m.vehicle?.plaque}</span>
            </td>
            <td className="p-2">{m.type}</td>
            <td className="p-2">{m.garage}</td>
            <td className="p-2">{m.kilometrage?.toLocaleString()} km</td>
            <td className="p-2">{m.montant} €</td>
            <td className="p-2">{m.pieces}</td>
            <td className="p-2">
              {m.status === "in_progress" && <Badge className="bg-amber-100 text-amber-700">En cours</Badge>}
              {m.status === "scheduled" && <Badge className="bg-blue-100 text-blue-700">Planifiée</Badge>}
              {m.status === "completed" && <Badge className="bg-green-100 text-green-700">Terminée</Badge>}
              {m.status === "cancelled" && <Badge className="bg-red-100 text-red-700">Annulée</Badge>}
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
        {(!Array.isArray(maintenanceList) || maintenanceList.length === 0) && (
          <tr>
            <td colSpan={9} className="text-center p-4">{emptyMessage}</td>
          </tr>
        )}
      </tbody>
    </table>
  );

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 gap-3">
        <div>
          <h2 className="text-2xl font-bold">Véhicules en maintenance</h2>
          <p className="text-gray-600">
            {filteredEnCours.length} véhicule{filteredEnCours.length > 1 ? 's' : ''} actuellement en maintenance
          </p>
        </div>
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

      <div className="mt-4">
        {renderMaintenanceTable(filteredEnCours, "Aucune maintenance en cours.")}
      </div>

      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <p className="text-sm text-blue-700">
          💡 <strong>Astuce :</strong> Pour voir l'historique complet des maintenances terminées, 
          consultez la section <strong>Historique des véhicules</strong>.
        </p>
      </div>
    </div>
  );
};

export default Maintenances;

