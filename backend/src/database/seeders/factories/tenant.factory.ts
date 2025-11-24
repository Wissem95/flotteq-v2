import { Tenant, TenantStatus } from '../../../entities/tenant.entity';

export class TenantFactory {
  static create(data: Partial<Tenant> = {}): Tenant {
    const tenant = new Tenant();
    tenant.name = data.name || `Company ${Math.floor(Math.random() * 1000)}`;
    tenant.email = data.email || `contact${Math.random()}@company.com`;
    tenant.phone =
      data.phone || `+33 6 ${Math.floor(Math.random() * 100000000)}`;
    tenant.address =
      data.address || `${Math.floor(Math.random() * 200)} Rue Test`;
    tenant.city = data.city || 'Paris';
    tenant.postalCode = data.postalCode || '75001';
    tenant.country = data.country || 'France';
    tenant.status = data.status || TenantStatus.ACTIVE;
    tenant.subscriptionStatus = data.subscriptionStatus || 'active';
    return Object.assign(tenant, data);
  }
}
