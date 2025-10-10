import { useState } from 'react';
import { useVehicles } from '@/hooks/useVehicles';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Search, Trash2 } from 'lucide-react';
import type { VehicleStatus } from '@/api/types/vehicle.types';

export const VehiclesListPage = () => {
  const [search, setSearch] = useState('');
  const { vehicles, isLoading, deleteVehicle } = useVehicles({
    search,
    limit: 100,
  });

  const getStatusBadgeVariant = (status: VehicleStatus) => {
    const variants = {
      available: 'default',
      in_use: 'secondary',
      maintenance: 'destructive',
      out_of_service: 'outline',
    };
    return variants[status] as any || 'default';
  };

  const getStatusLabel = (status: VehicleStatus) => {
    const labels = {
      available: 'Disponible',
      in_use: 'En service',
      maintenance: 'Maintenance',
      out_of_service: 'Hors service',
    };
    return labels[status] || status;
  };

  const handleDelete = (id: string, registration: string) => {
    if (confirm(`Voulez-vous vraiment supprimer le véhicule ${registration} ?`)) {
      deleteVehicle(id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Véhicules</h1>
          <p className="text-muted-foreground">
            Gérer tous les véhicules de la flotte
          </p>
        </div>
      </div>

      <Card className="p-6">
        <div className="flex gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher par immatriculation, marque, modèle..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-8">Chargement...</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Immatriculation</TableHead>
                <TableHead>Marque</TableHead>
                <TableHead>Modèle</TableHead>
                <TableHead>Année</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>KM Actuel</TableHead>
                <TableHead>Tenant ID</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {vehicles.map((vehicle) => (
                <TableRow key={vehicle.id}>
                  <TableCell className="font-medium font-mono">
                    {vehicle.registration}
                  </TableCell>
                  <TableCell>{vehicle.brand}</TableCell>
                  <TableCell>{vehicle.model}</TableCell>
                  <TableCell>{vehicle.year}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusBadgeVariant(vehicle.status)}>
                      {getStatusLabel(vehicle.status)}
                    </Badge>
                  </TableCell>
                  <TableCell>{vehicle.currentKm.toLocaleString()} km</TableCell>
                  <TableCell>{vehicle.tenantId}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(vehicle.id, vehicle.registration)}
                      className="text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        {!isLoading && vehicles.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            Aucun véhicule trouvé
          </div>
        )}
      </Card>
    </div>
  );
};
