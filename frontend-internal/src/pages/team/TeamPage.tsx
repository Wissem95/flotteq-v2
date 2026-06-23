import { useState } from 'react';
import { useUsers } from '@/hooks/useUsers';
import { CreateUserModal } from '@/components/users/CreateUserModal';
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
import { Search, UserPlus, Power, PowerOff } from 'lucide-react';
import { UserRole } from '@/api/types/user.types';

// Rôles considérés comme employés internes FlotteQ
const INTERNAL_ROLES: UserRole[] = [UserRole.SUPER_ADMIN, UserRole.SUPPORT];

export const TeamPage = () => {
  const [search, setSearch] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const { users, isLoading, activateUser, deactivateUser } = useUsers({});

  const getRoleBadgeColor = (role: UserRole) => {
    const colors: Record<string, string> = {
      super_admin: 'bg-purple-500',
      support: 'bg-blue-500',
    };
    return colors[role] || 'bg-gray-500';
  };

  const getRoleLabel = (role: UserRole) => {
    const labels: Record<string, string> = {
      super_admin: 'Super Admin',
      support: 'Support',
    };
    return labels[role] || role;
  };

  const handleToggleActive = (id: string, isActive: boolean) => {
    if (isActive) {
      deactivateUser(id);
    } else {
      activateUser(id);
    }
  };

  // On ne garde que les employés internes (super_admin / support), puis on filtre par recherche
  const internalUsers = users
    .filter((user) => INTERNAL_ROLES.includes(user.role))
    .filter((user) => {
      if (!search) return true;
      const term = search.toLowerCase();
      return (
        user.email.toLowerCase().includes(term) ||
        user.firstName.toLowerCase().includes(term) ||
        user.lastName.toLowerCase().includes(term)
      );
    });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Équipe FlotteQ</h1>
          <p className="text-muted-foreground">
            Gérer les employés internes FlotteQ ({internalUsers.length})
          </p>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)}>
          <UserPlus className="h-4 w-4 mr-2" />
          Créer un employé
        </Button>
      </div>

      {/* On pré-sélectionne un rôle interne et on restreint le select aux rôles internes */}
      <CreateUserModal
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
        defaultRole={UserRole.SUPPORT}
        allowedRoles={INTERNAL_ROLES}
      />

      <Card className="p-6">
        <div className="flex gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher par nom ou email..."
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
                <TableHead>Rôle</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Créé le</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {internalUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">
                    {user.firstName} {user.lastName}
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Badge className={getRoleBadgeColor(user.role)}>
                      {getRoleLabel(user.role)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={user.isActive ? 'default' : 'secondary'}>
                      {user.isActive ? 'Actif' : 'Inactif'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(user.createdAt).toLocaleDateString('fr-FR')}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleToggleActive(user.id, user.isActive)}
                        title={user.isActive ? 'Désactiver' : 'Activer'}
                      >
                        {user.isActive ? (
                          <PowerOff className="h-4 w-4" />
                        ) : (
                          <Power className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        {!isLoading && internalUsers.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            Aucun employé interne trouvé
          </div>
        )}
      </Card>
    </div>
  );
};
