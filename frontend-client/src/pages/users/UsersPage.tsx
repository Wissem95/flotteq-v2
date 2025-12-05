import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, UserX, UserCheck, Mail, Pencil, Trash2, Users as UsersIcon, Search, X } from 'lucide-react';
import { toast } from 'sonner';
import { usersService } from '../../api/services/users.service';
import { UserRole } from '../../types/user.types';
import type { User } from '../../types/user.types';
import { AddUserModal } from '../../components/users/AddUserModal';
import { InviteUserModal } from '../../components/users/InviteUserModal';
import { ProtectedButton } from '../../components/common/ProtectedButton';
import { Pagination } from '../../components/common/Pagination';

export const UsersPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [roleFilter, setRoleFilter] = useState<UserRole | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);

  // Query: Get all users with pagination
  const { data: paginatedData, isLoading } = useQuery({
    queryKey: ['users', currentPage, itemsPerPage],
    queryFn: () => usersService.getAll(currentPage, itemsPerPage),
  });

  const users = paginatedData?.data || [];
  const paginationMeta = paginatedData?.meta;

  // Mutation: Toggle active status
  const toggleActiveMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      isActive ? usersService.deactivate(id) : usersService.activate(id),
    onSuccess: (_, variables) => {
      const action = variables.isActive ? 'désactivé' : 'activé';
      toast.success(`Utilisateur ${action} avec succès`);
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });

  // Mutation: Delete user
  const deleteMutation = useMutation({
    mutationFn: usersService.delete,
    onSuccess: () => {
      toast.success('Utilisateur supprimé avec succès');
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });

  // Filters
  const filteredUsers = users.filter((user) => {
    // Filtre rôle
    if (roleFilter !== 'all' && user.role !== roleFilter) return false;

    // Filtre statut
    if (statusFilter === 'active' && !user.isActive) return false;
    if (statusFilter === 'inactive' && user.isActive) return false;

    // Filtre recherche
    if (searchQuery) {
      const query = searchQuery.toLowerCase().trim();
      const searchableFields = [
        user.email,
        user.firstName,
        user.lastName,
        `${user.firstName} ${user.lastName}`,
      ].join(' ').toLowerCase();

      if (!searchableFields.includes(query)) {
        return false;
      }
    }

    return true;
  });

  // Handlers
  const handleToggleActive = (user: User) => {
    if (
      window.confirm(
        `Voulez-vous vraiment ${user.isActive ? 'désactiver' : 'activer'} ${user.firstName} ${user.lastName} ?`,
      )
    ) {
      toggleActiveMutation.mutate({ id: user.id, isActive: user.isActive });
    }
  };

  const handleDelete = (user: User) => {
    if (window.confirm(`Voulez-vous vraiment supprimer ${user.firstName} ${user.lastName} ?`)) {
      deleteMutation.mutate(user.id);
    }
  };

  const handleEdit = (user: User) => {
    setSelectedUser(user);
    setIsAddModalOpen(true);
  };

  // Role labels in French
  const getRoleLabel = (role: UserRole): string => {
    const labels: Record<UserRole, string> = {
      [UserRole.SUPER_ADMIN]: 'Super Admin',
      [UserRole.SUPPORT]: 'Support',
      [UserRole.TENANT_ADMIN]: 'Admin',
      [UserRole.MANAGER]: 'Manager',
      [UserRole.DRIVER]: 'Conducteur',
      [UserRole.VIEWER]: 'Lecteur',
    };
    return labels[role] || role;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-2xl font-bold text-gray-900">Utilisateurs</h1>
          <p className="text-sm sm:text-base text-gray-500 mt-1">Gérez les membres de votre équipe</p>
        </div>
        <div className="flex gap-2 sm:gap-3">
          <ProtectedButton
            permission="users.invite"
            onClick={() => setIsInviteModalOpen(true)}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 sm:px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm"
            disabledMessage="Seuls les admins peuvent inviter des utilisateurs"
          >
            <Mail className="w-4 h-4" />
            <span className="hidden xs:inline">Inviter</span>
          </ProtectedButton>
          <ProtectedButton
            permission="users.create"
            onClick={() => {
              setSelectedUser(null);
              setIsAddModalOpen(true);
            }}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
            disabledMessage="Seuls les admins peuvent créer des utilisateurs"
          >
            <Plus className="w-4 h-4" />
            Ajouter un utilisateur
          </ProtectedButton>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total</p>
              <p className="text-2xl font-bold text-gray-900">{users.length}</p>
            </div>
            <UsersIcon className="w-8 h-8 text-blue-500" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Actifs</p>
              <p className="text-2xl font-bold text-green-600">
                {users.filter((u) => u.isActive).length}
              </p>
            </div>
            <UserCheck className="w-8 h-8 text-green-500" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Inactifs</p>
              <p className="text-2xl font-bold text-red-600">
                {users.filter((u) => !u.isActive).length}
              </p>
            </div>
            <UserX className="w-8 h-8 text-red-500" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Filtrés</p>
              <p className="text-2xl font-bold text-gray-900">{filteredUsers.length}</p>
            </div>
            <UsersIcon className="w-8 h-8 text-gray-400" />
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Rechercher un utilisateur
        </label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher par nom, prénom ou email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              aria-label="Effacer la recherche"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value as UserRole | 'all')}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="all">Tous les rôles</option>
          <option value={UserRole.TENANT_ADMIN}>Admin</option>
          <option value={UserRole.MANAGER}>Manager</option>
          <option value={UserRole.DRIVER}>Conducteur</option>
          <option value={UserRole.VIEWER}>Lecteur</option>
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'inactive')}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="all">Tous les statuts</option>
          <option value="active">Actifs</option>
          <option value="inactive">Inactifs</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Utilisateur
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Rôle
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Statut
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {filteredUsers.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-medium">
                        {user.firstName.charAt(0)}
                        {user.lastName.charAt(0)}
                      </span>
                    </div>
                    <div className="ml-4">
                      <div className="font-medium text-gray-900">
                        {user.firstName} {user.lastName}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.email}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                    {getRoleLabel(user.role)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-full ${
                      user.isActive
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {user.isActive ? 'Actif' : 'Inactif'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end gap-2">
                    <ProtectedButton
                      permission="users.update"
                      onClick={() => handleEdit(user)}
                      className="text-blue-600 hover:text-blue-900 transition-colors"
                      title="Modifier"
                      disabledMessage="Vous ne pouvez pas modifier les utilisateurs"
                    >
                      <Pencil className="w-4 h-4" />
                    </ProtectedButton>
                    <ProtectedButton
                      permission="users.update"
                      onClick={() => handleToggleActive(user)}
                      className={
                        user.isActive
                          ? 'text-orange-600 hover:text-orange-900 transition-colors'
                          : 'text-green-600 hover:text-green-900 transition-colors'
                      }
                      title={user.isActive ? 'Désactiver' : 'Activer'}
                      disabled={toggleActiveMutation.isPending}
                      disabledMessage="Vous ne pouvez pas modifier le statut des utilisateurs"
                    >
                      {user.isActive ? (
                        <UserX className="w-4 h-4" />
                      ) : (
                        <UserCheck className="w-4 h-4" />
                      )}
                    </ProtectedButton>
                    <ProtectedButton
                      permission="users.delete"
                      onClick={() => handleDelete(user)}
                      className="text-red-600 hover:text-red-900 transition-colors"
                      title="Supprimer"
                      disabled={deleteMutation.isPending}
                      disabledMessage="Vous ne pouvez pas supprimer les utilisateurs"
                    >
                      <Trash2 className="w-4 h-4" />
                    </ProtectedButton>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredUsers.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <UsersIcon className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>Aucun utilisateur trouvé</p>
          </div>
        )}

        {/* Pagination */}
        {paginationMeta && filteredUsers.length > 0 && (
          <Pagination
            currentPage={paginationMeta.page}
            totalPages={paginationMeta.totalPages}
            total={paginationMeta.total}
            onPageChange={setCurrentPage}
            hasNextPage={paginationMeta.hasNextPage}
            hasPreviousPage={paginationMeta.hasPreviousPage}
          />
        )}
      </div>

      {/* Modals */}
      <AddUserModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setSelectedUser(null);
        }}
        user={selectedUser}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ['users'] });
          setCurrentPage(1); // Retour à la page 1 après création/édition
        }}
      />

      <InviteUserModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
      />
    </div>
  );
};
