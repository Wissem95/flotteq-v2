export const UserRole = {
  SUPER_ADMIN: 'super_admin',
  SUPPORT: 'support',
  TENANT_ADMIN: 'tenant_admin',
  MANAGER: 'manager',
  DRIVER: 'driver',
  VIEWER: 'viewer',
} as const;

export type UserRole = typeof UserRole[keyof typeof UserRole];

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  isActive: boolean;
  tenantId: number;
  phone?: string;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserDto {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  phone?: string;
}

export interface UpdateUserDto {
  email?: string;
  firstName?: string;
  lastName?: string;
  role?: UserRole;
  phone?: string;
}

export interface InviteUserDto {
  email: string;
  role: UserRole;
}

export interface InvitationResponse {
  invitationLink: string;
  token: string;
}

export interface PaginatedMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginatedMeta;
}
