import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, UserX, UserCheck, Mail, Pencil, Trash2, Users as UsersIcon } from 'lucide-react';
import { usersService } from '../../api/services/users.service';
import { UserRole } from '../../types/user.types';
import type { User } from '../../types/user.types';
import { AddUserModal } from '../../components/users/AddUserModal';
import { InviteUserModal } from '../../components/users/InviteUserModal';
import { ProtectedButton } from '../../components/common/ProtectedButton';

export const UsersPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [roleFilter, setRoleFilter] = useState<UserRole | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

  // Query: Get all users
  const { data: users = [], isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: usersService.getAll,
  });

  // Mutation: Toggle active status
  const toggleActiveMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      isActive ? usersService.deactivate(id) : usersService.activate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });

  // Mutation: Delete user
  const deleteMutation = useMutation({
    mutationFn: usersService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });

  // Filters
  const filteredUsers = users.filter((user) => {
    if (roleFilter !== 'all' && user.role !== roleFilter) return false;
    if (statusFilter === 'active' && !user.isActive) return false;
    if (statusFilter === 'inactive' && user.isActive) return false;
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
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Utilisateurs</h1>
          <p className="text-sm text-gray-500 mt-1">Gérez les membres de votre équipe</p>
        </div>
        <div className="flex gap-3">
          <ProtectedButton
            permission="users.invite"
            onClick={() => setIsInviteModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            disabledMessage="Seuls les admins peuvent inviter des utilisateurs"
          >
            <Mail className="w-4 h-4" />
            Inviter
          </ProtectedButton>
          <ProtectedButton
            permission="users.create"
            onClick={() => {
              setSelectedUser(null);
              setIsAddModalOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
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
      </div>

      {/* Modals */}
      <AddUserModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setSelectedUser(null);
        }}
        user={selectedUser}
        onSuccess={() => queryClient.invalidateQueries({ queryKey: ['users'] })}
      />

      <InviteUserModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
      />
    </div>
  );
};
