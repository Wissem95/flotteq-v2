import { Repository } from 'typeorm';
import { Tenant } from '../src/entities/tenant.entity';
import { User, UserRole } from '../src/entities/user.entity';
import { Subscription } from '../src/entities/subscription.entity';
import { SubscriptionPlan } from '../src/entities/subscription-plan.entity';
import * as bcrypt from 'bcrypt';

export interface TestTenant {
  tenant: Tenant;
  user: User;
  subscription: Subscription;
}

/**
 * Creates a complete test tenant with user, subscription, and plan
 * This ensures all FK constraints are satisfied
 */
export async function createTestTenant(
  tenantsRepo: Repository<Tenant>,
  usersRepo: Repository<User>,
  subscriptionsRepo: Repository<Subscription>,
  plansRepo: Repository<SubscriptionPlan>,
  overrides?: {
    tenantData?: Partial<Tenant>;
    userData?: Partial<User>;
  },
): Promise<TestTenant> {
  // Ensure a basic plan exists
  let plan = await plansRepo.findOne({ where: { name: 'Basic' } });
  if (!plan) {
    plan = await plansRepo.save({
      name: 'Basic',
      price: 49.99,
      maxVehicles: 10,
      maxUsers: 5,
      maxDrivers: 10,
    });
  }

  // Create tenant
  const tenant = await tenantsRepo.save({
    name: `Test Company ${Date.now()}`,
    email: `test-${Date.now()}@test.com`,
    onboardingCompleted: true,
    ...overrides?.tenantData,
  });

  // Create subscription
  const subscription = await subscriptionsRepo.save({
    tenantId: tenant.id,
    planId: plan.id,
    status: 'active',
    startDate: new Date(),
  });

  // Create user
  const hashedPassword = await bcrypt.hash('TestPassword123', 12);
  const user = await usersRepo.save({
    email: `user-${Date.now()}@test.com`,
    password: hashedPassword,
    firstName: 'Test',
    lastName: 'User',
    role: UserRole.TENANT_ADMIN,
    tenantId: tenant.id,
    isActive: true,
    ...overrides?.userData,
  });

  return { tenant, user, subscription };
}

/**
 * Cleans up a test tenant and all related entities
 * Handles FK constraints in the correct order
 */
export async function cleanupTestTenant(
  tenant: Tenant,
  tenantsRepo: Repository<Tenant>,
  usersRepo: Repository<User>,
  subscriptionsRepo: Repository<Subscription>,
  vehiclesRepo?: Repository<any>,
  driversRepo?: Repository<any>,
  bookingsRepo?: Repository<any>,
  commissionsRepo?: Repository<any>,
): Promise<void> {
  // Delete in correct order to avoid FK violations
  // 1. Delete commissions first (FK to bookings)
  if (commissionsRepo) {
    await commissionsRepo.delete({ tenantId: tenant.id });
  }

  // 2. Delete bookings (FK to vehicles)
  if (bookingsRepo) {
    await bookingsRepo.delete({ tenantId: tenant.id });
  }

  // 3. Delete vehicles
  if (vehiclesRepo) {
    await vehiclesRepo.delete({ tenantId: tenant.id });
  }

  // 4. Delete drivers
  if (driversRepo) {
    await driversRepo.delete({ tenantId: tenant.id });
  }

  // 5. Delete users
  await usersRepo.delete({ tenantId: tenant.id });

  // 6. Delete subscription
  await subscriptionsRepo.delete({ tenantId: tenant.id });

  // 7. Finally delete tenant
  await tenantsRepo.delete(tenant.id);
}

/**
 * Creates a minimal test user (requires tenant to exist)
 */
export async function createTestUser(
  usersRepo: Repository<User>,
  tenantId: number,
  overrides?: Partial<User>,
): Promise<User> {
  const hashedPassword = await bcrypt.hash('TestPassword123', 12);
  return await usersRepo.save({
    email: `user-${Date.now()}@test.com`,
    password: hashedPassword,
    firstName: 'Test',
    lastName: 'User',
    role: UserRole.VIEWER,
    tenantId,
    isActive: true,
    ...overrides,
  });
}
