// 📁 src/components/vehicles/HistoryVehicleModal.tsx

import React, { useEffect, useState } from "react";
import Modal from "@/components/Modal";
import { Button } from "@/components/ui/button";
import { fetchVehicleHistory } from "@/services/vehicleService";

import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";

interface HistoryVehicleModalProps {
  isOpen: boolean;
  onClose: () => void;
  vehicleId: number;
}

const HistoryVehicleModal: React.FC<HistoryVehicleModalProps> = ({
  isOpen,
  onClose,
  vehicleId,
}) => {
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isOpen) return;
    setLoading(true);

    fetchVehicleHistory()
      .then((allData) => {
        if (Array.isArray(allData)) {
          const filtered = allData.filter((item) => item.vehicleId === vehicleId);
          setHistory(filtered);
        } else {
          setHistory([]);
        }
      })
      .catch((err) => {
        console.error("❌ Erreur chargement historique :", err);
        setHistory([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [isOpen, vehicleId]);

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="w-full max-w-3xl bg-white rounded-lg shadow-lg">
        <div className="p-6">
          <h2 className="text-xl font-bold mb-4">Historique du véhicule</h2>

          {loading ? (
            <p>Chargement…</p>
          ) : history.length > 0 ? (
            <Table className="mt-4">
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Description</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {history.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      {item.date
                        ? new Date(item.date).toLocaleDateString("fr-FR")
                        : "-"}
                    </TableCell>
                    <TableCell>{item.type}</TableCell>
                    <TableCell>{item.description}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="mt-4">Aucun historique disponible.</p>
          )}

          <div className="mt-6 text-right">
            <Button onClick={onClose}>Fermer</Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default HistoryVehicleModal;

