import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Garantit que toute nouvelle base expose les offres visibles sur la landing.
 * Les offres historiques restent en base pour préserver leurs abonnements,
 * mais ne sont plus proposées à de nouveaux clients.
 */
export class EnsureLaunchSubscriptionPlans1763001100000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    const plans = [
      {
        name: 'Starter',
        price: 0,
        maxVehicles: 3,
        maxUsers: 2,
        maxDrivers: 3,
        trialDays: 0,
        maxStorageMb: 100,
        features: 'basic_dashboard,email_notifications,marketplace_read',
      },
      {
        name: 'Pro',
        price: 29,
        maxVehicles: 10,
        maxUsers: 5,
        maxDrivers: 10,
        trialDays: 14,
        maxStorageMb: 1024,
        features:
          'support_email,basic_reports,api_access,export_pdf,marketplace_booking',
      },
      {
        name: 'Business',
        price: 79,
        maxVehicles: 50,
        maxUsers: 20,
        maxDrivers: 50,
        trialDays: 14,
        maxStorageMb: 5120,
        features:
          'support_priority,advanced_reports,api_access,export_excel,custom_fields,multi_users',
      },
      {
        name: 'Enterprise',
        price: 0,
        maxVehicles: -1,
        maxUsers: -1,
        maxDrivers: -1,
        trialDays: 30,
        maxStorageMb: 51200,
        features:
          'support_24_7,custom_reports,api_access,dedicated_manager,sla,white_label',
      },
    ];

    for (const plan of plans) {
      await queryRunner.query(
        `INSERT INTO "subscription_plans"
          ("name", "price", "maxVehicles", "maxUsers", "maxDrivers", "trialDays",
           "max_storage_mb", "features", "isActive")
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, true)
         ON CONFLICT ("name") DO NOTHING`,
        [
          plan.name,
          plan.price,
          plan.maxVehicles,
          plan.maxUsers,
          plan.maxDrivers,
          plan.trialDays,
          plan.maxStorageMb,
          plan.features,
        ],
      );

      // Ne conserver un ancien prix Stripe que si le montant reste identique.
      // Les abonnements déjà créés côté Stripe ne sont pas touchés par cette table.
      await queryRunner.query(
        `UPDATE "subscription_plans"
         SET "price" = $2,
             "maxVehicles" = $3,
             "maxUsers" = $4,
             "maxDrivers" = $5,
             "trialDays" = $6,
             "max_storage_mb" = $7,
             "features" = $8,
             "isActive" = true,
             "stripePriceId" = CASE WHEN "price" = $2 THEN "stripePriceId" ELSE NULL END,
             "updatedAt" = now()
         WHERE "name" = $1`,
        [
          plan.name,
          plan.price,
          plan.maxVehicles,
          plan.maxUsers,
          plan.maxDrivers,
          plan.trialDays,
          plan.maxStorageMb,
          plan.features,
        ],
      );
    }

    await queryRunner.query(`
      UPDATE "subscription_plans"
      SET "isActive" = false, "updatedAt" = now()
      WHERE "name" IN ('Essai Gratuit', 'Freemium', 'Standard', 'Premium')
    `);
  }

  public async down(): Promise<void> {
    throw new Error(
      'Migration forward-only: les plans peuvent désormais avoir des abonnements associés.',
    );
  }
}
