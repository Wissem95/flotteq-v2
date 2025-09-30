// pages/routes/VehiclesHistory.tsx

import React, { useEffect, useState } from "react";
import axios from "@/lib/api";
import { Button } from "@/components/ui/button";

interface HistoryEntry {
  id: number;
  date: string;
  description: string;
  vehicle: {
    marque: string;
    modele: string;
    plaque: string;
  };
}

const VehiclesHistory: React.FC = () => {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [message, setMessage] = useState("");

  const fetchHistory = async () => {
    try {
      const res = await axios.get("/vehicles/history");
      setHistory(res.data);
    } catch (err) {
      console.error("❌ Erreur lors du chargement :", err);
      setMessage("Erreur lors du chargement de l'historique.");
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4">Historique des véhicules</h2>
      {message && <p className="mb-4 text-blue-600">{message}</p>}

      <table className="w-full text-sm border border-slate-200">
        <thead>
          <tr className="bg-slate-100 text-left">
            <th className="p-2 border">Date</th>
            <th className="p-2 border">Véhicule</th>
            <th className="p-2 border">Description</th>
          </tr>
        </thead>
        <tbody>
          {history.map((entry) => (
            <tr key={entry.id} className="border-t">
              <td className="p-2">{entry.date}</td>
              <td className="p-2">
                {entry.vehicle.marque} {entry.vehicle.modele} - {entry.vehicle.plaque}
              </td>
              <td className="p-2">{entry.description}</td>
            </tr>
          ))}
          {history.length === 0 && (
            <tr>
              <td colSpan={3} className="text-center p-4">Aucun historique trouvé.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default VehiclesHistory;

