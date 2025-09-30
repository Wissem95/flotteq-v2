// 📁 src/components/vehicles/AddVehicleModal.tsx

import React from "react";
import Modal from "@/components/Modal";
import { VehicleForm } from "./VehicleForm";

interface AddVehicleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated?: () => void;
}

const AddVehicleModal: React.FC<AddVehicleModalProps> = ({
  isOpen,
  onClose,
  onCreated,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="w-full max-w-2xl bg-white rounded-lg shadow-lg">
        <div className="p-6">
          <h2 className="text-xl font-bold mb-4">Ajouter un véhicule</h2>
          <VehicleForm
            onCancel={onClose}
            onSuccess={() => {
              onCreated?.();
              onClose();
            }}
          />
        </div>
      </div>
    </Modal>
  );
};

export default AddVehicleModal;

