import { MigrationInterface, QueryRunner } from 'typeorm';

/** Réconcilie le schéma historique avec les entités courantes sans supprimer de colonnes ni de lignes. */
export class AlignCoreSchemaToEntities1763000800000
  implements MigrationInterface
{
  name = 'AlignCoreSchemaToEntities1763000800000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TYPE "subscriptions_status_enum" ADD VALUE IF NOT EXISTS 'incomplete'`,
    );
    await queryRunner.query(
      `ALTER TYPE "tenants_subscription_status_enum" ADD VALUE IF NOT EXISTS 'trialing'`,
    );
    await queryRunner.query(`
      DO $$
      DECLARE commission_status_type text;
      BEGIN
        SELECT udt_name INTO commission_status_type
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'commissions'
          AND column_name = 'status';

        IF commission_status_type IS NOT NULL THEN
          EXECUTE format(
            'ALTER TYPE %I ADD VALUE IF NOT EXISTS ''cancelled''',
            commission_status_type
          );
        END IF;
      END $$;
    `);

    await queryRunner.query(`
      ALTER TABLE "subscriptions"
      ADD COLUMN IF NOT EXISTS "trialEnd" date
    `);
    await queryRunner.query(`
      ALTER TABLE "subscriptions"
      ALTER COLUMN "trialEnd" TYPE date USING "trialEnd"::date
    `);

    await queryRunner.query(`
      ALTER TABLE "tenants"
      ALTER COLUMN "status" SET DEFAULT 'active'
    `);
    await queryRunner.query(`
      UPDATE "tenants" SET "subscription_status" = 'active'
      WHERE "subscription_status" IS NULL
    `);
    await queryRunner.query(`
      ALTER TABLE "tenants"
      ALTER COLUMN "subscription_status" SET DEFAULT 'active',
      ALTER COLUMN "subscription_status" SET NOT NULL
    `);

    await queryRunner.query(`
      ALTER TABLE "vehicles" ADD COLUMN IF NOT EXISTS "photos" text
    `);
    await queryRunner.query(`
      UPDATE "vehicles" SET "mileage" = 0 WHERE "mileage" IS NULL
    `);
    await queryRunner.query(`
      ALTER TABLE "vehicles"
      ALTER COLUMN "mileage" SET DEFAULT 0,
      ALTER COLUMN "mileage" SET NOT NULL,
      ALTER COLUMN "purchaseDate" TYPE TIMESTAMP USING "purchaseDate"::timestamp,
      ALTER COLUMN "purchaseDate" DROP NOT NULL,
      ALTER COLUMN "purchasePrice" DROP NOT NULL,
      ALTER COLUMN "version" DROP DEFAULT
    `);

    await queryRunner.query(`
      ALTER TABLE "maintenances"
      ALTER COLUMN "estimated_cost" DROP DEFAULT,
      ALTER COLUMN "actual_cost" DROP NOT NULL
    `);

    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE "mileage_history_source_enum" AS ENUM ('manual', 'maintenance', 'inspection');
      EXCEPTION WHEN duplicate_object THEN NULL; END $$;
    `);
    await queryRunner.query(`
      DO $$ BEGIN
        IF EXISTS (
          SELECT 1 FROM "mileage_history"
          WHERE "source" IS NOT NULL
            AND "source" NOT IN ('manual', 'maintenance', 'inspection')
        ) THEN
          RAISE EXCEPTION 'Valeur source inconnue dans mileage_history, migration interrompue sans modification';
        END IF;
      END $$;
    `);
    await queryRunner.query(`
      ALTER TABLE "mileage_history"
      ALTER COLUMN "source" DROP DEFAULT
    `);
    await queryRunner.query(`
      ALTER TABLE "mileage_history"
      ALTER COLUMN "source" TYPE "mileage_history_source_enum"
      USING "source"::text::"mileage_history_source_enum"
    `);
    await queryRunner.query(`
      ALTER TABLE "mileage_history"
      ALTER COLUMN "source" SET DEFAULT 'manual'
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {
    // Migration forward-only : les valeurs d'enum et conversions préservent les données existantes.
  }
}
