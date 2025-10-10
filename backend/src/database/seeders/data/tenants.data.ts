import { Tenant, TenantStatus } from '../../../entities/tenant.entity';

export const TENANT_FLOTTEQ: Partial<Tenant> = {
  id: 1,
  name: 'FlotteQ',
  email: 'contact@flotteq.com',
  phone: '+33 1 23 45 67 89',
  address: '123 Avenue des Champs-Élysées',
  city: 'Paris',
  postalCode: '75008',
  country: 'France',
  status: TenantStatus.ACTIVE,
  subscriptionStatus: 'active',
};

export const TENANT_TRANSPORT_EXPRESS: Partial<Tenant> = {
  name: 'Transport Express SARL',
  email: 'admin@transport-express.fr',
  phone: '+33 6 12 34 56 78',
  address: '45 Rue de la République',
  city: 'Lyon',
  postalCode: '69002',
  country: 'France',
  status: TenantStatus.ACTIVE,
  subscriptionStatus: 'active',
};

export const TENANT_LOGISTRANS: Partial<Tenant> = {
  name: 'LogisTrans',
  email: 'contact@logistrans.com',
  phone: '+33 4 56 78 90 12',
  address: '78 Boulevard Haussmann',
  city: 'Marseille',
  postalCode: '13001',
  country: 'France',
  status: TenantStatus.ACTIVE,
  subscriptionStatus: 'active',
  stripeCustomerId: 'cus_test_logistrans',
  subscriptionStartedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
};
