import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/types/user.types';

export type Permission =
  // Véhicules
  | 'vehicles.create'
  | 'vehicles.update'
  | 'vehicles.delete'
  | 'vehicles.view'
  // Utilisateurs
  | 'users.create'
  | 'users.update'
  | 'users.delete'
  | 'users.invite'
  // Documents
  | 'documents.create'
  | 'documents.update'
  | 'documents.delete'
  // Maintenances
  | 'maintenances.create'
  | 'maintenances.update'
  | 'maintenances.delete'
  // Conducteurs
  | 'drivers.create'
  | 'drivers.update'
  | 'drivers.delete';

// Matrice des permissions par rôle
const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  [UserRole.SUPER_ADMIN]: [
    // Toutes les permissions
    'vehicles.create', 'vehicles.update', 'vehicles.delete', 'vehicles.view',
    'users.create', 'users.update', 'users.delete', 'users.invite',
    'documents.create', 'documents.update', 'documents.delete',
    'maintenances.create', 'maintenances.update', 'maintenances.delete',
    'drivers.create', 'drivers.update', 'drivers.delete',
  ],
  [UserRole.SUPPORT]: [
    // Support a les mêmes permissions que super_admin
    'vehicles.create', 'vehicles.update', 'vehicles.delete', 'vehicles.view',
    'users.create', 'users.update', 'users.delete', 'users.invite',
    'documents.create', 'documents.update', 'documents.delete',
    'maintenances.create', 'maintenances.update', 'maintenances.delete',
    'drivers.create', 'drivers.update', 'drivers.delete',
  ],
  [UserRole.TENANT_ADMIN]: [
    // Admin tenant peut tout gérer sauf certaines actions super_admin
    'vehicles.create', 'vehicles.update', 'vehicles.delete', 'vehicles.view',
    'users.create', 'users.update', 'users.delete', 'users.invite',
    'documents.create', 'documents.update', 'documents.delete',
    'maintenances.create', 'maintenances.update', 'maintenances.delete',
    'drivers.create', 'drivers.update', 'drivers.delete',
  ],
  [UserRole.MANAGER]: [
    // Manager peut gérer véhicules, documents et maintenances
    'vehicles.create', 'vehicles.update', 'vehicles.delete', 'vehicles.view',
    'documents.create', 'documents.update', 'documents.delete',
    'maintenances.create', 'maintenances.update', 'maintenances.delete',
    'drivers.create', 'drivers.update', 'drivers.delete',
  ],
  [UserRole.DRIVER]: [
    // Conducteur : lecture seule
    'vehicles.view',
  ],
  [UserRole.VIEWER]: [
    // Viewer : lecture seule
    'vehicles.view',
  ],
};

export function usePermissions() {
  const { user } = useAuth();

  /**
   * Vérifie si l'utilisateur a une permission spécifique
   */
  const hasPermission = (permission: Permission): boolean => {
    if (!user) return false;

    const userRole = user.role as UserRole;
    const userPermissions = ROLE_PERMISSIONS[userRole];

    if (!userPermissions) {
      console.error('[Permissions] No permissions found for role:', userRole);
      return false;
    }

    return userPermissions.includes(permission);
  };

  /**
   * Vérifie si l'utilisateur a au moins une des permissions
   */
  const hasAnyPermission = (permissions: Permission[]): boolean => {
    return permissions.some(permission => hasPermission(permission));
  };

  /**
   * Vérifie si l'utilisateur a toutes les permissions
   */
  const hasAllPermissions = (permissions: Permission[]): boolean => {
    return permissions.every(permission => hasPermission(permission));
  };

  /**
   * Vérifie si l'utilisateur peut modifier/supprimer ses propres données
   */
  const canModifySelf = (resourceUserId?: string): boolean => {
    if (!user || !resourceUserId) return false;
    return user.id === resourceUserId;
  };

  /**
   * Vérifie si l'utilisateur est admin (tenant_admin ou super_admin)
   */
  const isAdmin = (): boolean => {
    if (!user) return false;
    const role = user.role as UserRole;
    return role === UserRole.SUPER_ADMIN || role === UserRole.SUPPORT || role === UserRole.TENANT_ADMIN;
  };

  /**
   * Vérifie si l'utilisateur peut gérer (créer/modifier/supprimer)
   */
  const canManage = (resource: 'vehicles' | 'users' | 'documents' | 'maintenances' | 'drivers'): boolean => {
    return hasPermission(`${resource}.create` as Permission);
  };

  return {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    canModifySelf,
    isAdmin,
    canManage,
    userRole: user?.role as UserRole,
  };
}
