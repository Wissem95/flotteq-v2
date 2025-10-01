import { api } from '@/lib/api';

export interface EmployeePermission {
  id: number;
  name: string;
  code: string;
  description: string;
  category: string;
  module: string;
  resource: string;
  action: string;
  scope: 'global' | 'tenant' | 'department' | 'personal';
  conditions: any[];
  dependencies: string[];
  is_system: boolean;
  is_dangerous: boolean;
  requires_2fa: boolean;
  requires_approval: boolean;
  approval_level: number;
  audit_log: boolean;
  is_active: boolean;
  metadata: any;
  created_at: string;
  updated_at: string;
  roles?: EmployeeRole[];
}

export interface EmployeeRole {
  id: number;
  name: string;
  code: string;
  description: string;
  level: number;
  department_specific: boolean;
  department_id: number;
  permissions: string[];
  restrictions: any[];
  can_manage_employees: boolean;
  can_access_finances: boolean;
  can_manage_tenants: boolean;
  can_manage_partners: boolean;
  can_view_analytics: boolean;
  can_export_data: boolean;
  max_subordinates: number;
  approval_limit: number;
  is_active: boolean;
  metadata: any;
  created_at: string;
  updated_at: string;
  department?: {
    id: number;
    name: string;
    code: string;
  };
  employees_count?: number;
  effective_permissions?: EmployeePermission[];
}

export interface PermissionFilters {
  active?: boolean;
  category?: string;
  module?: string;
  dangerous?: boolean;
  search?: string;
  per_page?: number;
  page?: number;
}

export interface RoleFilters {
  active?: boolean;
  department_id?: number;
  level?: number;
  search?: string;
  per_page?: number;
  page?: number;
}

export interface PermissionMatrix {
  roles: EmployeeRole[];
  permissions: EmployeePermission[];
  matrix: Array<{
    permission: EmployeePermission;
    roles: Array<{
      role_id: number;
      role_name: string;
      has_permission: boolean;
    }>;
  }>;
}

export interface UserPermissions {
  employee: any;
  role_permissions: EmployeePermission[];
  individual_permissions: string[];
  all_permissions: string[];
}

export const permissionsService = {
  // === GESTION DES PERMISSIONS ===

  // Récupérer toutes les permissions avec filtres
  async getPermissions(filters: PermissionFilters = {}) {
    const response = await api.get('/internal/permissions', { params: filters });
    return response.data;
  },

  // Créer une nouvelle permission
  async createPermission(data: Partial<EmployeePermission>) {
    const response = await api.post('/internal/permissions', data);
    return response.data;
  },

  // Mettre à jour une permission
  async updatePermission(id: number, data: Partial<EmployeePermission>) {
    const response = await api.put(`/internal/permissions/${id}`, data);
    return response.data;
  },

  // Supprimer une permission
  async deletePermission(id: number) {
    const response = await api.delete(`/internal/permissions/${id}`);
    return response.data;
  },

  // Obtenir les catégories de permissions
  async getPermissionCategories(): Promise<string[]> {
    const response = await api.get('/internal/permissions/categories');
    return response.data.categories;
  },

  // Obtenir les modules de permissions
  async getPermissionModules(): Promise<string[]> {
    const response = await api.get('/internal/permissions/modules');
    return response.data.modules;
  },

  // === GESTION DES RÔLES ===

  // Récupérer tous les rôles avec filtres
  async getRoles(filters: RoleFilters = {}) {
    const response = await api.get('/internal/permissions/roles', { params: filters });
    return response.data;
  },

  // Créer un nouveau rôle
  async createRole(data: Partial<EmployeeRole>) {
    const response = await api.post('/internal/permissions/roles', data);
    return response.data;
  },

  // Récupérer un rôle spécifique
  async getRole(id: number) {
    const response = await api.get(`/internal/permissions/roles/${id}`);
    return response.data;
  },

  // Mettre à jour un rôle
  async updateRole(id: number, data: Partial<EmployeeRole>) {
    const response = await api.put(`/internal/permissions/roles/${id}`, data);
    return response.data;
  },

  // Supprimer un rôle
  async deleteRole(id: number) {
    const response = await api.delete(`/internal/permissions/roles/${id}`);
    return response.data;
  },

  // === ASSIGNATION DES PERMISSIONS AUX RÔLES ===

  // Assigner des permissions à un rôle
  async assignPermissionsToRole(roleId: number, permissionIds: number[]) {
    const response = await api.post(`/internal/permissions/roles/${roleId}/permissions`, {
      permission_ids: permissionIds
    });
    return response.data;
  },

  // Retirer une permission d'un rôle
  async removePermissionFromRole(roleId: number, permissionId: number) {
    const response = await api.delete(`/internal/permissions/roles/${roleId}/permissions/${permissionId}`);
    return response.data;
  },

  // === MATRICE DES PERMISSIONS ===

  // Obtenir la matrice complète des permissions
  async getPermissionMatrix(): Promise<PermissionMatrix> {
    const response = await api.get('/internal/permissions/matrix');
    return response.data;
  },

  // Obtenir les permissions d'un utilisateur spécifique
  async getUserPermissions(employeeId: number): Promise<UserPermissions> {
    const response = await api.get(`/internal/permissions/users/${employeeId}/permissions`);
    return response.data;
  },

  // === FONCTIONNALITÉS AVANCÉES ===

  // Vérifier si un utilisateur a une permission spécifique
  async checkUserPermission(employeeId: number, permissionCode: string) {
    const response = await api.post('/internal/permissions/check', {
      employee_id: employeeId,
      permission_code: permissionCode
    });
    return response.data.has_permission;
  },

  // Vérifier les conflits de permissions
  async checkPermissionConflicts(permissionIds: number[]) {
    const response = await api.post('/internal/permissions/check-conflicts', {
      permission_ids: permissionIds
    });
    return response.data;
  },

  // Obtenir les permissions recommandées pour un rôle
  async getRecommendedPermissions(roleId: number) {
    const response = await api.get(`/internal/permissions/roles/${roleId}/recommended`);
    return response.data;
  },

  // Dupliquer un rôle
  async duplicateRole(roleId: number, newName: string, newCode: string) {
    const response = await api.post(`/internal/permissions/roles/${roleId}/duplicate`, {
      name: newName,
      code: newCode
    });
    return response.data;
  },

  // Importer des permissions depuis un fichier
  async importPermissions(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await api.post('/internal/permissions/import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },

  // Exporter les permissions
  async exportPermissions(format: 'json' | 'csv' | 'xlsx' = 'json', filters: PermissionFilters = {}) {
    const response = await api.get('/internal/permissions/export', {
      params: { ...filters, format },
      responseType: 'blob'
    });
    return response.data;
  },

  // Synchroniser les permissions avec le code
  async syncPermissionsWithCode() {
    const response = await api.post('/internal/permissions/sync-code');
    return response.data;
  },

  // Obtenir l'historique des modifications de permissions
  async getPermissionHistory(permissionId?: number, roleId?: number) {
    const params: any = {};
    if (permissionId) params.permission_id = permissionId;
    if (roleId) params.role_id = roleId;
    
    const response = await api.get('/internal/permissions/history', { params });
    return response.data;
  },

  // Analyser l'utilisation des permissions
  async analyzePermissionUsage(period = '30d') {
    const response = await api.get('/internal/permissions/usage-analysis', {
      params: { period }
    });
    return response.data;
  },

  // Obtenir les permissions orphelines (non utilisées)
  async getOrphanPermissions() {
    const response = await api.get('/internal/permissions/orphaned');
    return response.data;
  },

  // Obtenir les suggestions d'optimisation des rôles
  async getRoleOptimizationSuggestions(roleId?: number) {
    const params: any = {};
    if (roleId) params.role_id = roleId;
    
    const response = await api.get('/internal/permissions/optimization-suggestions', { params });
    return response.data;
  },

  // Tester les permissions d'un rôle
  async testRolePermissions(roleId: number, testScenarios: Array<{
    action: string;
    resource: string;
    context?: any;
  }>) {
    const response = await api.post(`/internal/permissions/roles/${roleId}/test`, {
      scenarios: testScenarios
    });
    return response.data;
  },

  // Obtenir le graphique des dépendances de permissions
  async getPermissionDependencyGraph(permissionId: number) {
    const response = await api.get(`/internal/permissions/${permissionId}/dependency-graph`);
    return response.data;
  },

  // Valider la configuration des permissions
  async validatePermissionConfiguration(roleId: number) {
    const response = await api.post(`/internal/permissions/roles/${roleId}/validate`);
    return response.data;
  },

  // Obtenir les templates de rôles
  async getRoleTemplates() {
    const response = await api.get('/internal/permissions/role-templates');
    return response.data;
  },

  // Créer un rôle à partir d'un template
  async createRoleFromTemplate(templateId: string, roleData: {
    name: string;
    code: string;
    description?: string;
    department_id?: number;
  }) {
    const response = await api.post('/internal/permissions/create-from-template', {
      template_id: templateId,
      ...roleData
    });
    return response.data;
  }
};

export default permissionsService;