import { useState } from 'react';
import { useDrivers } from '@/hooks/useDrivers';
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
import { Search, Trash2, AlertCircle } from 'lucide-react';
import type { DriverStatus } from '@/api/types/driver.types';

export const DriversListPage = () => {
  const [search, setSearch] = useState('');
  const { drivers, isLoading, deleteDriver } = useDrivers({
    search,
    limit: 100,
  });

  const getStatusBadgeVariant = (status: DriverStatus) => {
    const variants = {
      active: 'default',
      inactive: 'secondary',
      suspended: 'destructive',
      on_leave: 'outline',
    };
    return variants[status] as any || 'default';
  };

  const getStatusLabel = (status: DriverStatus) => {
    const labels = {
      active: 'Actif',
      inactive: 'Inactif',
      suspended: 'Suspendu',
      on_leave: 'En congé',
    };
    return labels[status] || status;
  };

  const isLicenseExpiringSoon = (expiryDate: Date) => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    const daysUntilExpiry = Math.floor((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return daysUntilExpiry <= 30 && daysUntilExpiry >= 0;
  };

  const isLicenseExpired = (expiryDate: Date) => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    return expiry < today;
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Voulez-vous vraiment supprimer le conducteur ${name} ?`)) {
      deleteDriver(id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Conducteurs</h1>
          <p className="text-muted-foreground">
            Gérer tous les conducteurs
          </p>
        </div>
      </div>

      <Card className="p-6">
        <div className="flex gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher par nom, email, permis..."
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
                <TableHead>Nom</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Téléphone</TableHead>
                <TableHead>N° Permis</TableHead>
                <TableHead>Expiration Permis</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Tenant</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {drivers.map((driver) => (
                <TableRow key={driver.id}>
                  <TableCell className="font-medium">
                    {driver.firstName} {driver.lastName}
                  </TableCell>
                  <TableCell>{driver.email}</TableCell>
                  <TableCell>{driver.phone}</TableCell>
                  <TableCell className="font-mono">{driver.licenseNumber}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {isLicenseExpired(driver.licenseExpiryDate) && (
                        <AlertCircle className="h-4 w-4 text-destructive" />
                      )}
                      {isLicenseExpiringSoon(driver.licenseExpiryDate) && !isLicenseExpired(driver.licenseExpiryDate) && (
                        <AlertCircle className="h-4 w-4 text-yellow-500" />
                      )}
                      <span className={isLicenseExpired(driver.licenseExpiryDate) ? 'text-destructive' : ''}>
                        {new Date(driver.licenseExpiryDate).toLocaleDateString('fr-FR')}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusBadgeVariant(driver.status)}>
                      {getStatusLabel(driver.status)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium">{driver.tenant?.name || 'N/A'}</span>
                      <span className="text-xs text-muted-foreground">ID: {driver.tenantId}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(driver.id, `${driver.firstName} ${driver.lastName}`)}
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

        {!isLoading && drivers.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            Aucun conducteur trouvé
          </div>
        )}
      </Card>
    </div>
  );
};
