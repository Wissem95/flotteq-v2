import { DataSource } from 'typeorm';
import { Tenant, TenantStatus } from '../../entities/tenant.entity';

/**
 * Seed pour créer le tenant FlotteQ par défaut
 * Ce tenant est utilisé pour les utilisateurs internes et les tests
 */
export async function seedTenant(dataSource: DataSource): Promise<void> {
  const tenantRepository = dataSource.getRepository(Tenant);

  // Vérifier si le tenant FlotteQ existe déjà
  const existingTenant = await tenantRepository.findOne({
    where: { email: 'contact@flotteq.com' },
  });

  if (existingTenant) {
    console.log('✅ Tenant FlotteQ existe déjà (ID: %d)', existingTenant.id);
    return;
  }

  // Créer le tenant FlotteQ
  const flotteqTenant = new Tenant();
  flotteqTenant.name = 'FlotteQ';
  flotteqTenant.email = 'contact@flotteq.com';
  flotteqTenant.phone = '+33 1 23 45 67 89';
  flotteqTenant.address = '123 Avenue de la Flotte';
  flotteqTenant.city = 'Paris';
  flotteqTenant.postalCode = '75001';
  flotteqTenant.country = 'France';
  flotteqTenant.status = TenantStatus.ACTIVE;

  const savedTenant = await tenantRepository.save(flotteqTenant);

  console.log('✅ Tenant FlotteQ créé avec succès (ID: %d)', savedTenant.id);
}

/**
 * Seed pour créer des tenants de test
 */
export async function seedTestTenants(dataSource: DataSource): Promise<void> {
  const tenantRepository = dataSource.getRepository(Tenant);

  const testTenants = [
    {
      name: 'Transport Express',
      email: 'contact@transport-express.com',
      phone: '+33 1 98 76 54 32',
      city: 'Lyon',
      postalCode: '69001',
      country: 'France',
      status: TenantStatus.ACTIVE,
    },
    {
      name: 'Logistique Rapide',
      email: 'info@logistique-rapide.com',
      phone: '+33 4 56 78 90 12',
      city: 'Marseille',
      postalCode: '13001',
      country: 'France',
      status: TenantStatus.TRIAL,
      trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    },
    {
      name: 'Livraison Plus',
      email: 'contact@livraison-plus.com',
      phone: '+33 5 12 34 56 78',
      city: 'Bordeaux',
      postalCode: '33000',
      country: 'France',
      status: TenantStatus.ACTIVE,
    },
  ];

  for (const tenantData of testTenants) {
    const existing = await tenantRepository.findOne({
      where: { email: tenantData.email },
    });

    if (!existing) {
      const tenant = tenantRepository.create(tenantData);
      await tenantRepository.save(tenant);
      console.log('✅ Tenant de test créé : %s', tenantData.name);
    } else {
      console.log('⏭️  Tenant de test existe déjà : %s', tenantData.name);
    }
  }
}

/**
 * Fonction principale de seed
 */
export async function runTenantSeeds(dataSource: DataSource): Promise<void> {
  console.log('🌱 Début du seed des tenants...');

  await seedTenant(dataSource);
  await seedTestTenants(dataSource);

  console.log('✅ Seed des tenants terminé');
}
