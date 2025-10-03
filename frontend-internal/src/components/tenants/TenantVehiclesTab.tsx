import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import type { Vehicle } from '@/api/types/tenant.types';

interface TenantVehiclesTabProps {
  vehicles: Vehicle[];
}

const getStatusBadgeColor = (status: string) => {
  switch (status.toLowerCase()) {
    case 'available':
      return 'bg-green-100 text-green-800';
    case 'in_use':
      return 'bg-blue-100 text-blue-800';
    case 'maintenance':
      return 'bg-yellow-100 text-yellow-800';
    case 'out_of_service':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const formatStatus = (status: string) => {
  const statusMap: Record<string, string> = {
    available: 'Disponible',
    in_use: 'En cours',
    maintenance: 'Maintenance',
    out_of_service: 'Hors service',
  };
  return statusMap[status] || status;
};

export const TenantVehiclesTab = ({ vehicles }: TenantVehiclesTabProps) => {
  if (!vehicles || vehicles.length === 0) {
    return (
      <Card>
        <CardContent className="py-12">
          <p className="text-center text-muted-foreground">Aucun véhicule</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Véhicules ({vehicles.length})</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Immatriculation</TableHead>
              <TableHead>Marque</TableHead>
              <TableHead>Modèle</TableHead>
              <TableHead>Année</TableHead>
              <TableHead>Couleur</TableHead>
              <TableHead>Kilométrage</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead>VIN</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {vehicles.map((vehicle) => (
              <TableRow key={vehicle.id}>
                <TableCell className="font-medium">{vehicle.registration}</TableCell>
                <TableCell>{vehicle.brand}</TableCell>
                <TableCell>{vehicle.model}</TableCell>
                <TableCell>{vehicle.year}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div
                      className="w-4 h-4 rounded-full border border-gray-300"
                      style={{ backgroundColor: vehicle.color }}
                      title={vehicle.color}
                    />
                    <span>{vehicle.color}</span>
                  </div>
                </TableCell>
                <TableCell>{vehicle.currentKm.toLocaleString('fr-FR')} km</TableCell>
                <TableCell>
                  <Badge className={getStatusBadgeColor(vehicle.status)}>
                    {formatStatus(vehicle.status)}
                  </Badge>
                </TableCell>
                <TableCell className="font-mono text-xs">{vehicle.vin}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};
