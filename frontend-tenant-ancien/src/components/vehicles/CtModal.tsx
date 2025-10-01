// 📁 src/components/vehicles/CtModal.tsx
import React, { useState } from "react";
import Modal from "@/components/Modal";
import { Button } from "@/components/ui/button";
import DatePicker from "@/components/DatePicker";
import { updateVehicle } from "@/services/vehicleService";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  vehicleId: number;
  currentLastCT?: string|null;
  currentNextCT?: string|null;
  onUpdated?: () => void;
}

export const CtModal: React.FC<Props> = ({
  isOpen, onClose, vehicleId, currentLastCT, currentNextCT, onUpdated
}) => {
  const [lastCT, setLastCT] = useState(currentLastCT);
  const [nextCT, setNextCT] = useState(currentNextCT);
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    try {
      await updateVehicle(vehicleId, { lastCT, nextCT });
      onUpdated?.();
      onClose();
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;
  return (
    <Modal isOpen onClose={onClose}>
      <div className="max-w-sm bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-bold mb-4">Mettre à jour le CT</h2>
        <div className="space-y-4">
          <div>
            <Label>Dernier CT</Label>
            <DatePicker
              value={lastCT ?? undefined}
              onChange={(d) => setLastCT(d?.toISOString().slice(0,10) ?? null)}
              placeholder="jj/MM/aaaa"
            />
          </div>
          <div>
            <Label>Prochain CT</Label>
            <DatePicker
              value={nextCT ?? undefined}
              onChange={(d) => setNextCT(d?.toISOString().slice(0,10) ?? null)}
              placeholder="jj/MM/aaaa"
            />
          </div>
        </div>
        <div className="mt-6 flex justify-end space-x-2">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Annuler
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading ? "Enregistrement…" : "Enregistrer"}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

