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
import { Search, AlertCircle, Ban, Power, RotateCcw } from 'lucide-react';
import { DriverStatus } from '@/api/types/driver.types';

export const DriversListPage = () => {
  const [search, setSearch] = useState('');
  const { drivers, isLoading, updateDriverStatus } = useDrivers({
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

  // Actions de supervision avec confirmation (même pattern que les anciens delete)
  const handleUpdateStatus = (
    id: string,
    name: string,
    status: DriverStatus,
    actionLabel: string,
  ) => {
    if (confirm(`Voulez-vous vraiment ${actionLabel} le conducteur ${name} ?`)) {
      updateDriverStatus({ id, status });
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
              {drivers.map((driver) => {
                const fullName = `${driver.firstName} ${driver.lastName}`;
                return (
                  <TableRow key={driver.id}>
                    <TableCell className="font-medium">
                      {fullName}
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
                      <div className="flex justify-end gap-2">
                        {/* Désactiver : visible si le conducteur est actif */}
                        {driver.status === DriverStatus.ACTIVE && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() =>
                              handleUpdateStatus(driver.id, fullName, DriverStatus.INACTIVE, 'désactiver')
                            }
                            title="Désactiver"
                          >
                            <Power className="h-4 w-4" />
                          </Button>
                        )}
                        {/* Bannir : visible tant que le conducteur n'est pas déjà suspendu */}
                        {driver.status !== DriverStatus.SUSPENDED && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() =>
                              handleUpdateStatus(driver.id, fullName, DriverStatus.SUSPENDED, 'bannir')
                            }
                            className="text-destructive"
                            title="Bannir"
                          >
                            <Ban className="h-4 w-4" />
                          </Button>
                        )}
                        {/* Réactiver : visible si le conducteur n'est pas actif */}
                        {driver.status !== DriverStatus.ACTIVE && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() =>
                              handleUpdateStatus(driver.id, fullName, DriverStatus.ACTIVE, 'réactiver')
                            }
                            title="Réactiver"
                          >
                            <RotateCcw className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
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
