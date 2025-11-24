/**
 * Script pour créer des Stripe Customers pour les tenants existants
 * Usage: ts-node src/scripts/create-stripe-customers.ts
 */

import Stripe from 'stripe';
import { DataSource } from 'typeorm';
import { Tenant } from '../entities/tenant.entity';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-09-30.clover' as any,
});

async function createStripeCustomers() {
  // Create database connection
  const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'flotteq123',
    database: process.env.DB_NAME || 'flotteq_dev',
    entities: [Tenant],
    synchronize: false,
  });

  await dataSource.initialize();
  console.log('✅ Database connected');

  const tenantRepo = dataSource.getRepository(Tenant);

  // Find tenants without Stripe customer
  const tenants = await tenantRepo.find({
    where: {
      stripeCustomerId: null as any,
    },
  });

  console.log(`Found ${tenants.length} tenants without Stripe customer`);

  for (const tenant of tenants) {
    try {
      console.log(
        `Creating Stripe customer for tenant ${tenant.id} (${tenant.name})...`,
      );

      const customer = await stripe.customers.create({
        email: tenant.email,
        name: tenant.name,
        metadata: {
          tenantId: tenant.id.toString(),
        },
      });

      tenant.stripeCustomerId = customer.id;
      await tenantRepo.save(tenant);

      console.log(
        `✅ Created customer ${customer.id} for tenant ${tenant.name}`,
      );
    } catch (error) {
      console.error(
        `❌ Failed to create customer for tenant ${tenant.id}:`,
        error,
      );
    }
  }

  await dataSource.destroy();
  console.log('✅ Done!');
}

createStripeCustomers()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Error:', error);
    process.exit(1);
  });
