// employeesService.ts - Service de gestion des employés FlotteQ

import { api } from "@/lib/api";

// Types pour la gestion des employés
export interface Employee {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  role: 'super_admin' | 'admin' | 'support' | 'partner_manager' | 'analyst' | 'developer';
  department: 'administration' | 'support' | 'development' | 'marketing' | 'sales' | 'partnerships';
  position: string;
  hire_date: string;
  status: 'active' | 'inactive' | 'on_leave' | 'terminated';
  permissions: string[];
  avatar?: string;
  manager_id?: number;
  manager_name?: string;
  salary?: number;
  contract_type: 'cdi' | 'cdd' | 'freelance' | 'intern';
  work_location: 'office' | 'remote' | 'hybrid';
  address?: {
    street: string;
    city: string;
    postal_code: string;
    country: string;
  };
  emergency_contact?: {
    name: string;
    phone: string;
    relationship: string;
  };
  skills: string[];
  certifications?: string[];
  last_login?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateEmployeeData {
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  role: 'super_admin' | 'admin' | 'support' | 'partner_manager' | 'analyst' | 'developer';
  department: 'administration' | 'support' | 'development' | 'marketing' | 'sales' | 'partnerships';
  position: string;
  hire_date: string;
  contract_type: 'cdi' | 'cdd' | 'freelance' | 'intern';
  work_location: 'office' | 'remote' | 'hybrid';
  manager_id?: number;
  salary?: number;
  permissions: string[];
  skills: string[];
  address?: {
    street: string;
    city: string;
    postal_code: string;
    country: string;
  };
  emergency_contact?: {
    name: string;
    phone: string;
    relationship: string;
  };
}

export interface UpdateEmployeeData {
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  role?: 'super_admin' | 'admin' | 'support' | 'partner_manager' | 'analyst' | 'developer';
  department?: string;
  position?: string;
  status?: 'active' | 'inactive' | 'on_leave' | 'terminated';
  permissions?: string[];
  manager_id?: number;
  salary?: number;
  contract_type?: string;
  work_location?: string;
  skills?: string[];
  certifications?: string[];
  address?: {
    street: string;
    city: string;
    postal_code: string;
    country: string;
  };
  emergency_contact?: {
    name: string;
    phone: string;
    relationship: string;
  };
}

export interface EmployeeFilters {
  role?: string;
  department?: string;
  status?: 'active' | 'inactive' | 'on_leave' | 'terminated';
  work_location?: string;
  manager_id?: number;
  search?: string;
  hire_date_from?: string;
  hire_date_to?: string;
}

export interface EmployeeStats {
  total: number;
  by_department: Record<string, number>;
  by_role: Record<string, number>;
  by_status: {
    active: number;
    inactive: number;
    on_leave: number;
    terminated: number;
  };
  by_work_location: {
    office: number;
    remote: number;
    hybrid: number;
  };
  average_tenure_months: number;
  new_hires_this_month: number;
  departures_this_month: number;
}

export interface Permission {
  id: string;
  name: string;
  description: string;
  category: string;
  is_system: boolean;
}

export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  is_system: boolean;
  employee_count: number;
}

/**
 * Service de gestion des employés FlotteQ
 */
export const employeesService = {
  /**
   * Récupérer tous les employés avec filtres
   */
  async getEmployees(
    page: number = 1,
    perPage: number = 20,
    filters?: EmployeeFilters
  ): Promise<{
    employees: Employee[];
    pagination: {
      current_page: number;
      per_page: number;
      total: number;
      last_page: number;
    };
  }> {
    try {
      let url = `/internal/employees?page=${page}&per_page=${perPage}`;
      
      if (filters) {
        const params = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            params.append(key, value.toString());
          }
        });
        url += `&${params.toString()}`;
      }
      
      const response = await api.get(url);
      return response.data;
    } catch (error: any) {
      console.error("Erreur lors de la récupération des employés:", error);
      throw new Error(error.response?.data?.message || "Erreur lors de la récupération");
    }
  },

  /**
   * Récupérer un employé par ID
   */
  async getEmployee(id: number): Promise<Employee> {
    try {
      const response = await api.get(`/internal/employees/${id}`);
      return response.data.employee;
    } catch (error: any) {
      console.error(`Erreur lors de la récupération de l'employé ${id}:`, error);
      throw new Error(error.response?.data?.message || "Employé non trouvé");
    }
  },

  /**
   * Créer un nouvel employé
   */
  async createEmployee(data: CreateEmployeeData): Promise<Employee> {
    try {
      const response = await api.post('/internal/employees', data);
      return response.data.employee;
    } catch (error: any) {
      console.error("Erreur lors de la création de l'employé:", error);
      throw new Error(error.response?.data?.message || "Erreur lors de la création");
    }
  },

  /**
   * Mettre à jour un employé
   */
  async updateEmployee(id: number, data: UpdateEmployeeData): Promise<Employee> {
    try {
      const response = await api.put(`/internal/employees/${id}`, data);
      return response.data.employee;
    } catch (error: any) {
      console.error(`Erreur lors de la mise à jour de l'employé ${id}:`, error);
      throw new Error(error.response?.data?.message || "Erreur lors de la mise à jour");
    }
  },

  /**
   * Supprimer un employé (soft delete)
   */
  async deleteEmployee(id: number): Promise<{ message: string }> {
    try {
      const response = await api.delete(`/internal/employees/${id}`);
      return response.data;
    } catch (error: any) {
      console.error(`Erreur lors de la suppression de l'employé ${id}:`, error);
      throw new Error(error.response?.data?.message || "Erreur lors de la suppression");
    }
  },

  /**
   * Changer le statut d'un employé
   */
  async updateEmployeeStatus(
    id: number, 
    status: 'active' | 'inactive' | 'on_leave' | 'terminated'
  ): Promise<Employee> {
    try {
      const response = await api.patch(`/internal/employees/${id}/status`, { status });
      return response.data.employee;
    } catch (error: any) {
      console.error("Erreur lors du changement de statut:", error);
      throw new Error(error.response?.data?.message || "Erreur lors du changement de statut");
    }
  },

  /**
   * Réinitialiser le mot de passe d'un employé
   */
  async resetEmployeePassword(id: number): Promise<{ message: string; temporary_password?: string }> {
    try {
      const response = await api.post(`/internal/employees/${id}/reset-password`);
      return response.data;
    } catch (error: any) {
      console.error("Erreur lors de la réinitialisation du mot de passe:", error);
      throw new Error(error.response?.data?.message || "Erreur lors de la réinitialisation");
    }
  },

  /**
   * Récupérer les statistiques des employés
   */
  async getEmployeeStats(): Promise<EmployeeStats> {
    try {
      const response = await api.get('/internal/employees/stats');
      return response.data;
    } catch (error: any) {
      console.error("Erreur lors de la récupération des statistiques:", error);
      throw new Error(error.response?.data?.message || "Erreur lors de la récupération des statistiques");
    }
  },

  /**
   * Alias pour getEmployeeStats (compatibilité)
   */
  async getStats(): Promise<EmployeeStats> {
    return this.getEmployeeStats();
  },

  /**
   * Récupérer toutes les permissions disponibles
   */
  async getPermissions(): Promise<Permission[]> {
    try {
      const response = await api.get('/permissions');
      return response.data.permissions;
    } catch (error: any) {
      console.error("Erreur lors de la récupération des permissions:", error);
      throw new Error(error.response?.data?.message || "Erreur lors de la récupération des permissions");
    }
  },

  /**
   * Récupérer tous les rôles disponibles
   */
  async getRoles(): Promise<Role[]> {
    try {
      const response = await api.get('/roles');
      return response.data.roles;
    } catch (error: any) {
      console.error("Erreur lors de la récupération des rôles:", error);
      throw new Error(error.response?.data?.message || "Erreur lors de la récupération des rôles");
    }
  },

  /**
   * Créer un nouveau rôle
   */
  async createRole(data: { name: string; description: string; permissions: string[] }): Promise<Role> {
    try {
      const response = await api.post('/roles', data);
      return response.data.role;
    } catch (error: any) {
      console.error("Erreur lors de la création du rôle:", error);
      throw new Error(error.response?.data?.message || "Erreur lors de la création du rôle");
    }
  },

  /**
   * Mettre à jour un rôle
   */
  async updateRole(id: string, data: { name?: string; description?: string; permissions?: string[] }): Promise<Role> {
    try {
      const response = await api.put(`/roles/${id}`, data);
      return response.data.role;
    } catch (error: any) {
      console.error(`Erreur lors de la mise à jour du rôle ${id}:`, error);
      throw new Error(error.response?.data?.message || "Erreur lors de la mise à jour du rôle");
    }
  },

  /**
   * Supprimer un rôle
   */
  async deleteRole(id: string): Promise<{ message: string }> {
    try {
      const response = await api.delete(`/roles/${id}`);
      return response.data;
    } catch (error: any) {
      console.error(`Erreur lors de la suppression du rôle ${id}:`, error);
      throw new Error(error.response?.data?.message || "Erreur lors de la suppression du rôle");
    }
  },

  /**
   * Rechercher des employés
   */
  async searchEmployees(query: string): Promise<Employee[]> {
    try {
      const response = await api.get(`/internal/employees/search?q=${encodeURIComponent(query)}`);
      return response.data.employees;
    } catch (error: any) {
      console.error("Erreur lors de la recherche:", error);
      throw new Error(error.response?.data?.message || "Erreur lors de la recherche");
    }
  },

  /**
   * Exporter les employés
   */
  async exportEmployees(
    format: 'csv' | 'excel',
    filters?: EmployeeFilters
  ): Promise<Blob> {
    try {
      let url = `/internal/employees/export?format=${format}`;
      
      if (filters) {
        const params = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            params.append(key, value.toString());
          }
        });
        url += `&${params.toString()}`;
      }
      
      const response = await api.get(url, {
        responseType: 'blob'
      });
      
      return response.data;
    } catch (error: any) {
      console.error("Erreur lors de l'export:", error);
      throw new Error(error.response?.data?.message || "Erreur lors de l'export");
    }
  },
}; 