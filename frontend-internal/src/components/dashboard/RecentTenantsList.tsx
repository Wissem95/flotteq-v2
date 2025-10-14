import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';

interface RecentTenantsListProps {
  tenants: Array<{
    id: number;
    name: string;
    email: string;
    status: string;
    createdAt: string;
    plan: {
      name: string;
      price: number;
    };
    vehiclesCount: number;
    usersCount: number;
    daysActive: number;
  }>;
}

export const RecentTenantsList = ({ tenants }: RecentTenantsListProps) => {
  const navigate = useNavigate();

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'trial': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'past_due': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (tenants.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>📋 Derniers Tenants Inscrits</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500 text-center py-4">Aucun tenant récent</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>📋 Derniers Tenants Inscrits</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nom</TableHead>
              <TableHead>Plan</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Utilisateurs</TableHead>
              <TableHead>Véhicules</TableHead>
              <TableHead>Inscrit depuis</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tenants.map((tenant) => (
              <TableRow
                key={tenant.id}
                className="cursor-pointer hover:bg-gray-50"
                onClick={() => navigate(`/tenants/${tenant.id}`)}
              >
                <TableCell className="font-medium">
                  {tenant.name}
                  <div className="text-xs text-gray-500">{tenant.email}</div>
                </TableCell>
                <TableCell>
                  <div className="text-sm">
                    {tenant.plan.name}
                    <div className="text-xs text-gray-500">€{tenant.plan.price}/mois</div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge className={getStatusColor(tenant.status)}>
                    {tenant.status}
                  </Badge>
                </TableCell>
                <TableCell>{tenant.usersCount}</TableCell>
                <TableCell>{tenant.vehiclesCount}</TableCell>
                <TableCell className="text-sm text-gray-600">
                  {tenant.daysActive} jours
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};
