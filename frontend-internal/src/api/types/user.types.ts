export enum UserRole {
  SUPER_ADMIN = 'super_admin',
  SUPPORT = 'support',
  TENANT_ADMIN = 'tenant_admin',
  MANAGER = 'manager',
  DRIVER = 'driver',
  VIEWER = 'viewer',
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  tenantId: number;
  tenant?: {
    id: number;
    name: string;
    email: string;
  };
  isActive: boolean;
  phone?: string;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

export interface CreateUserDto {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  tenantId?: number;
  phone?: string;
}

export interface UpdateUserDto {
  firstName?: string;
  lastName?: string;
  role?: UserRole;
  phone?: string;
}

export interface UsersListResponse {
  data: User[];
  total: number;
  page: number;
  limit: number;
}

export interface UsersQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  role?: UserRole;
  tenantId?: number;
  isActive?: boolean;
}
