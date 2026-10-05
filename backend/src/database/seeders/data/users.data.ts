import { User, UserRole } from '../../../entities/user.entity';

// FlotteQ Users
export const USER_WISSEM: Partial<User> = {
  email: 'wissem@flotteq.com',
  firstName: 'Wissem',
  lastName: 'Admin',
  role: UserRole.SUPER_ADMIN,
  isActive: true,
};

export const USER_SUPPORT: Partial<User> = {
  email: 'support@flotteq.com',
  firstName: 'Support',
  lastName: 'FlotteQ',
  role: UserRole.SUPPORT,
  isActive: true,
};

// Transport Express Users
export const USER_TE_ADMIN: Partial<User> = {
  email: 'admin@transport-express.fr',
  firstName: 'Pierre',
  lastName: 'Leroy',
  role: UserRole.TENANT_ADMIN,
  isActive: true,
};

export const USER_TE_MANAGER: Partial<User> = {
  email: 'manager@transport-express.fr',
  firstName: 'Sophie',
  lastName: 'Bernard',
  role: UserRole.MANAGER,
  isActive: true,
};

export const USER_TE_DRIVER1: Partial<User> = {
  email: 'driver1@transport-express.fr',
  firstName: 'Jean',
  lastName: 'Dupont',
  role: UserRole.DRIVER,
  isActive: true,
};

export const USER_TE_DRIVER2: Partial<User> = {
  email: 'driver2@transport-express.fr',
  firstName: 'Marie',
  lastName: 'Martin',
  role: UserRole.DRIVER,
  isActive: true,
};

// LogisTrans Users
export const USER_LT_ADMIN: Partial<User> = {
  email: 'admin@logistrans.com',
  firstName: 'Paul',
  lastName: 'Dubois',
  role: UserRole.TENANT_ADMIN,
  isActive: true,
};

export const USER_LT_VIEWER: Partial<User> = {
  email: 'viewer@logistrans.com',
  firstName: 'Claire',
  lastName: 'Moreau',
  role: UserRole.VIEWER,
  isActive: true,
};

export const USER_LT_DRIVER: Partial<User> = {
  email: 'driver@logistrans.com',
  firstName: 'Pierre',
  lastName: 'Durand',
  role: UserRole.DRIVER,
  isActive: true,
};
