import React, { useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import MaintenanceModal from "./MaintenanceModal";
import StatusChangeModal from "./StatusChangeModal";
import { getMaintenancesWithFilters, updateMaintenanceStatus } from "@/services/maintenanceService";
import { api } from "@/lib/api";

interface StatusDropdownProps {
  currentStatus: string;
  vehicleId: number;
  vehicleInfo: {
    marque: string;
    modele: string;
    immatriculation: string;
  };
  onStatusChange: (vehicleId: number, newStatus: string) => Promise<void>;
}

const statusOptions = [
  { value: "active", label: "En service", className: "bg-green-100 text-green-700" },
  { value: "en_maintenance", label: "En maintenance", className: "bg-amber-100 text-amber-700" },
  { value: "en_reparation", label: "En réparation", className: "bg-orange-100 text-orange-700" },
  { value: "hors_service", label: "Hors service", className: "bg-red-100 text-red-700" },
  { value: "vendu", label: "Vendu", className: "bg-gray-100 text-gray-700" },
];

const StatusDropdown: React.FC<StatusDropdownProps> = ({
  currentStatus,
  vehicleId,
  vehicleInfo,
  onStatusChange,
}) => {
  const [loading, setLoading] = useState(false);
  const [showMaintenanceModal, setShowMaintenanceModal] = useState(false);
  const [showStatusChangeModal, setShowStatusChangeModal] = useState(false);
  const [pendingStatus, setPendingStatus] = useState<string | null>(null);

  const currentOption = statusOptions.find(opt => opt.value === currentStatus) || statusOptions[0];

  const handleStatusChange = async (newStatus: string) => {
    if (newStatus === currentStatus) return;
    
    // Si on passe en maintenance, ouvrir le modal spécialisé maintenance
    if (newStatus === "en_maintenance") {
      setPendingStatus(newStatus);
      setShowMaintenanceModal(true);
      return;
    }

    // Pour tous les autres changements, ouvrir le modal de changement de statut avec raisons
    setPendingStatus(newStatus);
    setShowStatusChangeModal(true);
  };

  // Gestion du retour en service depuis la maintenance
  const handleReturnToService = async () => {
    try {
      // Récupérer toutes les maintenances en cours pour ce véhicule
      const maintenances = await getMaintenancesWithFilters({ 
        vehicle_id: vehicleId, 
        status: "in_progress" 
      });
      
      if (maintenances && Array.isArray(maintenances)) {
        // Marquer toutes les maintenances en cours comme terminées
        for (const maintenance of maintenances) {
          await updateMaintenanceStatus(maintenance.id, "completed");
        }
      }
    } catch {
      // Handle error silently or show user-friendly message
    }
  };

  // Gestion de la création de maintenance
  const handleMaintenanceCreated = async () => {
    if (pendingStatus) {
      setLoading(true);
      try {
        await onStatusChange(vehicleId, pendingStatus);
      } catch (error) {
        console.error("Erreur lors du changement de statut:", error);
      } finally {
        setLoading(false);
        setPendingStatus(null);
      }
    }
  };

  // Gestion de la confirmation du changement de statut avec raison
  const handleStatusChangeConfirm = async (reason: string) => {
    if (!pendingStatus) return;

    // Si on remet en service depuis maintenance, marquer la maintenance comme terminée
    if (currentStatus === "en_maintenance" && pendingStatus === "active") {
      await handleReturnToService();
    }

    setLoading(true);
    try {
      // Utiliser l'API pour mettre à jour le véhicule avec la raison
      await api.put(`/vehicles/${vehicleId}`, {
        status: pendingStatus,
        status_reason: reason
      });
      
      // Appeler le callback parent pour rafraîchir l'affichage
      await onStatusChange(vehicleId, pendingStatus);
    } catch (error) {
      console.error("Erreur lors du changement de statut:", error);
      throw error;
    } finally {
      setLoading(false);
      setShowStatusChangeModal(false);
      setPendingStatus(null);
    }
  };

  const handleMaintenanceModalClose = () => {
    setShowMaintenanceModal(false);
    setPendingStatus(null);
  };

  const handleStatusChangeModalClose = () => {
    setShowStatusChangeModal(false);
    setPendingStatus(null);
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-auto p-0 hover:bg-transparent"
            disabled={loading}
          >
            <Badge className={`${currentOption.className} hover:opacity-80 cursor-pointer`}>
              {currentOption.label}
              <ChevronDown size={12} className="ml-1" />
            </Badge>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="center" className="w-48">
          {statusOptions.map((option) => (
            <DropdownMenuItem
              key={option.value}
              onClick={() => handleStatusChange(option.value)}
              className="flex items-center justify-between cursor-pointer"
            >
              <span className="flex items-center">
                <div className={`w-3 h-3 rounded-full ${option.className} mr-2`} />
                {option.label}
              </span>
              {option.value === currentStatus && <Check size={16} />}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Modal de maintenance */}
      <MaintenanceModal
        isOpen={showMaintenanceModal}
        onClose={handleMaintenanceModalClose}
        vehicleId={vehicleId}
        vehicleInfo={vehicleInfo}
        onMaintenanceCreated={handleMaintenanceCreated}
      />

      {/* Modal de changement de statut avec raisons */}
      <StatusChangeModal
        isOpen={showStatusChangeModal}
        onClose={handleStatusChangeModalClose}
        vehicleInfo={vehicleInfo}
        currentStatus={currentStatus}
        newStatus={pendingStatus || ''}
        onConfirm={handleStatusChangeConfirm}
      />
    </>
  );
};

export default StatusDropdown; 