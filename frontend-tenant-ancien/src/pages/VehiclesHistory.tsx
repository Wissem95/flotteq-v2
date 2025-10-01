// pages/routes/VehiclesHistory.tsx

import React, { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MoreHorizontal, Edit, Trash2, Euro, MapPin, Calendar, Car } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface HistoryEntry {
  id: number;
  date: string;
  description: string;
  vehicle: {
    marque: string;
    modele: string;
    plaque: string;
  };
  type: string;
  vehicleId: number;
  details: {
    maintenance_type: string;
    workshop: string;
    cost: number;
    mileage: number;
    notes?: string;
    next_maintenance?: string;
  };
  maintenance_id: number;
  can_edit: boolean;
  can_delete: boolean;
}

const VehiclesHistory: React.FC = () => {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [message, setMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [maintenanceToDelete, setMaintenanceToDelete] = useState<number | null>(null);

  const fetchHistory = async () => {
    try {
      const res = await api.get("/vehicles/history");
      setHistory(res.data);
    } catch (err) {
      console.error("❌ Erreur lors du chargement :", err);
      setMessage("Erreur lors du chargement de l'historique.");
    }
  };

  const handleDeleteMaintenance = async (maintenanceId: number) => {
    try {
      await api.delete(`/maintenances/${maintenanceId}`);
      setMessage("✅ Maintenance supprimée de l'historique");
      fetchHistory(); // Recharger l'historique
    } catch (err) {
      console.error("❌ Erreur lors de la suppression :", err);
      setMessage("❌ Erreur lors de la suppression de la maintenance");
    }
  };

  const handleEditMaintenance = (maintenanceId: number) => {
    // Rediriger vers la page d'édition de maintenance
    window.location.href = `/vehicles/maintenance/edit/${maintenanceId}`;
  };

  const confirmDelete = (maintenanceId: number) => {
    setMaintenanceToDelete(maintenanceId);
    setDeleteDialogOpen(true);
  };

  const executeDelete = () => {
    if (maintenanceToDelete) {
      handleDeleteMaintenance(maintenanceToDelete);
      setDeleteDialogOpen(false);
      setMaintenanceToDelete(null);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  // Filtrer l'historique selon le terme de recherche
  const filteredHistory = history.filter((entry) =>
    entry.vehicle.marque.toLowerCase().includes(searchTerm.toLowerCase()) ||
    entry.vehicle.modele.toLowerCase().includes(searchTerm.toLowerCase()) ||
    entry.vehicle.plaque.toLowerCase().includes(searchTerm.toLowerCase()) ||
    entry.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    entry.details.workshop.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 gap-3">
        <div>
          <h2 className="text-2xl font-bold">Historique des maintenances</h2>
          <p className="text-gray-600">
            {filteredHistory.length} maintenance{filteredHistory.length > 1 ? 's' : ''} terminée{filteredHistory.length > 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Rechercher..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border border-gray-300 px-3 py-2 rounded-md w-full md:w-64"
          />
        </div>
      </div>

      {message && (
        <div className={`mb-4 p-3 rounded ${
          message.includes('✅') ? 'bg-green-100 text-green-700' : 
          message.includes('❌') ? 'bg-red-100 text-red-700' : 
          'bg-blue-100 text-blue-700'
        }`}>
          {message}
        </div>
      )}

      <div className="grid gap-4">
        {filteredHistory.map((entry) => (
          <Card key={entry.id} className="shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <Car size={18} className="text-blue-600" />
                    <div>
                      <CardTitle className="text-lg">
                        {entry.vehicle.marque} {entry.vehicle.modele}
                      </CardTitle>
                      <p className="text-sm text-gray-600">{entry.vehicle.plaque}</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="bg-green-50 text-green-700">
                    Terminée
                  </Badge>
                </div>
                
                {(entry.can_edit || entry.can_delete) && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal size={16} />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {entry.can_edit && (
                        <DropdownMenuItem 
                          onClick={() => handleEditMaintenance(entry.maintenance_id)}
                          className="flex items-center gap-2"
                        >
                          <Edit size={14} />
                          Modifier
                        </DropdownMenuItem>
                      )}
                      {entry.can_delete && (
                        <DropdownMenuItem 
                          onClick={() => confirmDelete(entry.maintenance_id)}
                          className="flex items-center gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 size={14} />
                          Supprimer
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            </CardHeader>
            
            <CardContent>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="flex items-center gap-2">
                  <Calendar size={16} className="text-gray-500" />
                  <div>
                    <p className="text-sm font-medium">Date</p>
                    <p className="text-sm text-gray-600">{entry.date}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <MapPin size={16} className="text-gray-500" />
                  <div>
                    <p className="text-sm font-medium">Garage</p>
                    <p className="text-sm text-gray-600">{entry.details.workshop}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Euro size={16} className="text-gray-500" />
                  <div>
                    <p className="text-sm font-medium">Coût</p>
                    <p className="text-sm text-gray-600">{entry.details.cost} €</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Car size={16} className="text-gray-500" />
                  <div>
                    <p className="text-sm font-medium">Kilométrage</p>
                    <p className="text-sm text-gray-600">{entry.details.mileage?.toLocaleString()} km</p>
                  </div>
                </div>
              </div>
              
              <div className="mt-4 space-y-2">
                <div>
                  <p className="text-sm font-medium text-gray-700">Type de maintenance</p>
                  <Badge variant="secondary" className="mt-1">
                    {entry.details.maintenance_type}
                  </Badge>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-gray-700">Description</p>
                  <p className="text-sm text-gray-600 mt-1">{entry.description}</p>
                </div>
                
                {entry.details.notes && (
                  <div>
                    <p className="text-sm font-medium text-gray-700">Notes</p>
                    <p className="text-sm text-gray-600 mt-1">{entry.details.notes}</p>
                  </div>
                )}
                
                {entry.details.next_maintenance && (
                  <div>
                    <p className="text-sm font-medium text-gray-700">Prochaine maintenance prévue</p>
                    <p className="text-sm text-blue-600 mt-1">{entry.details.next_maintenance}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
        
        {filteredHistory.length === 0 && (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-gray-500">
                {searchTerm ? "Aucun résultat trouvé pour votre recherche." : "Aucun historique de maintenance trouvé."}
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Dialog de confirmation de suppression */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer cette maintenance de l'historique ? 
              Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction 
              onClick={executeDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default VehiclesHistory;

