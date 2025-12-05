export interface LoginDto {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  user: User;
}

export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  tenantId: number;
  isActive: boolean;
  phone: string | null;
}

export type UserRole =
  | 'super_admin'
  | 'support'
  | 'tenant_admin'
  | 'manager'
  | 'driver'
  | 'viewer';
