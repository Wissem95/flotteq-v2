import { useState } from 'react';
import { useUsers } from '@/hooks/useUsers';
import { CreateUserModal } from '@/components/users/CreateUserModal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Search, UserPlus, Trash2, Power, PowerOff, Filter } from 'lucide-react';
import type { UserRole } from '@/api/types/user.types';

export const UsersListPage = () => {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const itemsPerPage = 20;

  const { users, isLoading, deleteUser, activateUser, deactivateUser } = useUsers({});

  const getRoleBadgeColor = (role: UserRole) => {
    const colors = {
      super_admin: 'bg-purple-500',
      support: 'bg-blue-500',
      tenant_admin: 'bg-green-500',
      manager: 'bg-yellow-500',
      driver: 'bg-gray-500',
      viewer: 'bg-slate-500',
    };
    return colors[role] || 'bg-gray-500';
  };

  const handleDelete = (id: string, email: string) => {
    if (confirm(`Voulez-vous vraiment supprimer l'utilisateur ${email} ?`)) {
      deleteUser(id);
    }
  };

  const handleToggleActive = (id: string, isActive: boolean) => {
    if (isActive) {
      deactivateUser(id);
    } else {
      activateUser(id);
    }
  };

  // Filtrage côté client
  const filteredUsers = users.filter((user) => {
    const matchesSearch = search
      ? user.email.toLowerCase().includes(search.toLowerCase()) ||
        user.firstName.toLowerCase().includes(search.toLowerCase()) ||
        user.lastName.toLowerCase().includes(search.toLowerCase())
      : true;

    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'active' && user.isActive) ||
      (statusFilter === 'inactive' && !user.isActive);

    return matchesSearch && matchesRole && matchesStatus;
  });

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const startIndex = (page - 1) * itemsPerPage;
  const paginatedUsers = filteredUsers.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Utilisateurs</h1>
          <p className="text-muted-foreground">
            Gérer tous les utilisateurs de la plateforme ({filteredUsers.length})
          </p>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)}>
          <UserPlus className="h-4 w-4 mr-2" />
          Créer un utilisateur
        </Button>
      </div>

      <CreateUserModal open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen} />

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

          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filtrer par rôle" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les rôles</SelectItem>
              <SelectItem value="super_admin">Super Admin</SelectItem>
              <SelectItem value="support">Support</SelectItem>
              <SelectItem value="tenant_admin">Tenant Admin</SelectItem>
              <SelectItem value="manager">Manager</SelectItem>
              <SelectItem value="driver">Driver</SelectItem>
              <SelectItem value="viewer">Viewer</SelectItem>
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filtrer par statut" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les statuts</SelectItem>
              <SelectItem value="active">Actifs</SelectItem>
              <SelectItem value="inactive">Inactifs</SelectItem>
            </SelectContent>
          </Select>
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
                <TableHead>Tenant</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Créé le</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">
                    {user.firstName} {user.lastName}
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Badge className={getRoleBadgeColor(user.role)}>{user.role}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium">{user.tenant?.name || 'N/A'}</span>
                      <span className="text-xs text-muted-foreground">ID: {user.tenantId}</span>
                    </div>
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
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(user.id, user.email)}
                        className="text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        {!isLoading && filteredUsers.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            Aucun utilisateur trouvé
          </div>
        )}

        {totalPages > 1 && (
          <div className="mt-4 flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Affichage de {startIndex + 1} à{' '}
              {Math.min(startIndex + itemsPerPage, filteredUsers.length)} sur{' '}
              {filteredUsers.length} résultats
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Précédent
              </Button>
              <span className="flex items-center px-4">
                Page {page} sur {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                Suivant
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};
