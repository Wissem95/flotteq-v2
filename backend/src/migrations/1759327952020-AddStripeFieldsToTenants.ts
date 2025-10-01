import { MigrationInterface, QueryRunner } from "typeorm";

export class AddStripeFieldsToTenants1759327952020 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Update enum type - drop default first
        await queryRunner.query(`
            ALTER TABLE "tenants" ALTER COLUMN "status" DROP DEFAULT
        `);

        await queryRunner.query(`
            ALTER TYPE "tenants_status_enum" RENAME TO "tenants_status_enum_old"
        `);

        await queryRunner.query(`
            CREATE TYPE "tenants_status_enum" AS ENUM('trial', 'active', 'past_due', 'cancelled', 'incomplete')
        `);

        await queryRunner.query(`
            ALTER TABLE "tenants" ALTER COLUMN "status" TYPE "tenants_status_enum"
            USING "status"::text::"tenants_status_enum"
        `);

        await queryRunner.query(`
            ALTER TABLE "tenants" ALTER COLUMN "status" SET DEFAULT 'trial'
        `);

        await queryRunner.query(`
            DROP TYPE "tenants_status_enum_old"
        `);

        // Remove old subscription_id column
        await queryRunner.query(`
            ALTER TABLE "tenants" DROP COLUMN IF EXISTS "subscription_id"
        `);

        // Add new Stripe fields
        await queryRunner.query(`
            ALTER TABLE "tenants" ADD COLUMN IF NOT EXISTS "stripe_customer_id" character varying
        `);

        await queryRunner.query(`
            ALTER TABLE "tenants" ADD COLUMN IF NOT EXISTS "stripe_subscription_id" character varying
        `);

        await queryRunner.query(`
            DO $$ BEGIN
                CREATE TYPE "tenants_subscription_status_enum" AS ENUM('trial', 'active', 'past_due', 'cancelled', 'incomplete');
            EXCEPTION
                WHEN duplicate_object THEN null;
            END $$;
        `);

        await queryRunner.query(`
            ALTER TABLE "tenants" ADD COLUMN IF NOT EXISTS "subscription_status" "tenants_subscription_status_enum" DEFAULT 'trial'
        `);

        await queryRunner.query(`
            ALTER TABLE "tenants" ADD COLUMN IF NOT EXISTS "subscription_started_at" TIMESTAMP
        `);

        await queryRunner.query(`
            ALTER TABLE "tenants" ADD COLUMN IF NOT EXISTS "subscription_ended_at" TIMESTAMP
        `);

        // Modify trial_ends_at to timestamp
        await queryRunner.query(`
            ALTER TABLE "tenants" ALTER COLUMN "trial_ends_at" TYPE TIMESTAMP
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Revert trial_ends_at to date
        await queryRunner.query(`
            ALTER TABLE "tenants" ALTER COLUMN "trial_ends_at" TYPE DATE
        `);

        // Remove new columns
        await queryRunner.query(`
            ALTER TABLE "tenants" DROP COLUMN "subscription_ended_at"
        `);

        await queryRunner.query(`
            ALTER TABLE "tenants" DROP COLUMN "subscription_started_at"
        `);

        await queryRunner.query(`
            ALTER TABLE "tenants" DROP COLUMN "subscription_status"
        `);

        await queryRunner.query(`
            DROP TYPE "tenants_subscription_status_enum"
        `);

        await queryRunner.query(`
            ALTER TABLE "tenants" DROP COLUMN "stripe_subscription_id"
        `);

        await queryRunner.query(`
            ALTER TABLE "tenants" DROP COLUMN "stripe_customer_id"
        `);

        // Restore old subscription_id column
        await queryRunner.query(`
            ALTER TABLE "tenants" ADD COLUMN "subscription_id" character varying
        `);

        // Restore old enum
        await queryRunner.query(`
            ALTER TYPE "tenants_status_enum" RENAME TO "tenants_status_enum_new"
        `);

        await queryRunner.query(`
            CREATE TYPE "tenants_status_enum" AS ENUM('trial', 'active', 'suspended', 'cancelled')
        `);

        await queryRunner.query(`
            ALTER TABLE "tenants" ALTER COLUMN "status" TYPE "tenants_status_enum"
            USING "status"::text::"tenants_status_enum"
        `);

        await queryRunner.query(`
            DROP TYPE "tenants_status_enum_new"
        `);
    }

}
