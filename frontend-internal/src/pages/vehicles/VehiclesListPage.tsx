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
import { Search, Ban, RotateCcw } from 'lucide-react';
import { VehicleStatus } from '@/api/types/vehicle.types';

export const VehiclesListPage = () => {
  const [search, setSearch] = useState('');
  const { vehicles, isLoading, updateVehicleStatus } = useVehicles({
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

  // Actions de supervision avec confirmation (même pattern que les anciens delete)
  const handleUpdateStatus = (
    id: string,
    registration: string,
    status: VehicleStatus,
    actionLabel: string,
  ) => {
    if (confirm(`Voulez-vous vraiment ${actionLabel} le véhicule ${registration} ?`)) {
      updateVehicleStatus({ id, status });
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
                <TableHead>Tenant</TableHead>
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
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium">{vehicle.tenant?.name || 'N/A'}</span>
                      <span className="text-xs text-muted-foreground">ID: {vehicle.tenantId}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      {/* Mettre hors service : visible si le véhicule n'est pas déjà hors service */}
                      {vehicle.status !== VehicleStatus.OUT_OF_SERVICE && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() =>
                            handleUpdateStatus(
                              vehicle.id,
                              vehicle.registration,
                              VehicleStatus.OUT_OF_SERVICE,
                              'mettre hors service',
                            )
                          }
                          className="text-destructive"
                          title="Mettre hors service"
                        >
                          <Ban className="h-4 w-4" />
                        </Button>
                      )}
                      {/* Réactiver : visible si le véhicule est hors service */}
                      {vehicle.status === VehicleStatus.OUT_OF_SERVICE && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() =>
                            handleUpdateStatus(
                              vehicle.id,
                              vehicle.registration,
                              VehicleStatus.AVAILABLE,
                              'réactiver',
                            )
                          }
                          title="Réactiver"
                        >
                          <RotateCcw className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
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
