// 📁 src/components/vehicles/EditVehicleModal.tsx

import React, { useEffect, useState } from "react";
import Modal from "@/components/Modal";
import { fetchVehicleById, Vehicle } from "@/services/vehicleService";
import { VehicleForm } from "./VehicleForm";

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
  const [vehicleData, setVehicleData] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isOpen || !vehicleId) return;
    setLoading(true);
    fetchVehicleById(String(vehicleId))
      .then((vehicle) => {
        setVehicleData(vehicle);
      })
      .catch((err) => {
        console.error("❌ Erreur chargement véhicule :", err);
        console.error("❌ Détails de l'erreur :", err.response?.data);
      })
      .finally(() => setLoading(false));
  }, [isOpen, vehicleId]);

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="w-full max-w-2xl bg-white rounded-lg shadow-lg">
        <div className="p-6">
          <h2 className="text-xl font-bold mb-4">Modifier le véhicule</h2>
          {loading ? (
            <p className="text-center">Chargement…</p>
          ) : vehicleData ? (
            <VehicleForm
              initialData={vehicleData}
              onCancel={onClose}
              onSuccess={() => {
                onUpdated?.();
                onClose();
              }}
            />
          ) : (
            <p className="text-center text-red-500">Erreur lors du chargement du véhicule</p>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default EditVehicleModal;

