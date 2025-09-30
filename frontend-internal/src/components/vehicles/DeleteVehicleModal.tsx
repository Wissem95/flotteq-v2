// 📁 src/components/vehicles/DeleteVehicleModal.tsx
import React, { useEffect, useState } from "react";
import Modal from "@/components/Modal";
import { Button } from "@/components/ui/button";
import { fetchVehicleById, deleteVehicle } from "@/services/vehicleService";

interface DeleteVehicleModalProps {
  isOpen: boolean;
  onClose: () => void;
  vehicleId: number;
  onDeleted?: () => void;
}

const DeleteVehicleModal: React.FC<DeleteVehicleModalProps> = ({
  isOpen,
  onClose,
  vehicleId,
  onDeleted,
}) => {
  const [vehicle, setVehicle] = useState<{ marque: string; modele: string; plaque: string } | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Charger les infos du véhicule lorsqu’on ouvre le modal
  useEffect(() => {
    if (!isOpen) return;
    setError(null);
    setLoading(true);
    fetchVehicleById(String(vehicleId))
      .then((v) =>
        setVehicle({ marque: v.marque, modele: v.modele, plaque: v.plaque })
      )
      .catch(() => {
        setVehicle(null);
        setError("Impossible de charger le véhicule.");
      })
      .finally(() => setLoading(false));
  }, [isOpen, vehicleId]);

  const handleDelete = async () => {
    setError(null);
    setLoading(true);
    try {
      await deleteVehicle(vehicleId);
      // onDeleted permet au parent de rafraîchir la liste
      onDeleted?.();
      onClose(); // fermer le modal
    } catch (err: any) {
      console.error("❌ Erreur lors de la suppression :", err);
      setError("La suppression a échoué. Réessayez.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg">
        <div className="p-6 space-y-4">
          <h2 className="text-xl font-bold">Supprimer un véhicule</h2>

          {loading && !vehicle ? (
            <p>Chargement…</p>
          ) : error ? (
            <p className="text-red-500">{error}</p>
          ) : vehicle ? (
            <>
              <p>
                Êtes-vous sûr de vouloir supprimer le véhicule{" "}
                <strong>
                  {vehicle.marque} {vehicle.modele} ({vehicle.plaque})
                </strong>
                ?
              </p>
              <div className="mt-6 flex justify-end gap-2">
                <Button variant="outline" onClick={onClose} disabled={loading}>
                  Annuler
                </Button>
                <Button
                  className="bg-red-600 text-white"
                  onClick={handleDelete}
                  disabled={loading}
                >
                  {loading ? "Suppression…" : "Supprimer"}
                </Button>
              </div>
            </>
          ) : (
            <p>Véhicule introuvable.</p>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default DeleteVehicleModal;

