import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateUserRolesAndPermissions1759326291782 implements MigrationInterface {
    name = 'CreateUserRolesAndPermissions1759326291782'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Add new columns to users table
        await queryRunner.query(`
            ALTER TABLE "users"
            ADD COLUMN IF NOT EXISTS "is_active" boolean DEFAULT true,
            ADD COLUMN IF NOT EXISTS "phone" varchar,
            ADD COLUMN IF NOT EXISTS "last_login_at" TIMESTAMP,
            ADD COLUMN IF NOT EXISTS "reset_password_token" varchar,
            ADD COLUMN IF NOT EXISTS "reset_password_expires" TIMESTAMP
        `);

        // Update email column to remove unique constraint (we'll have composite unique with tenantId)
        await queryRunner.query(`
            ALTER TABLE "users" DROP CONSTRAINT IF EXISTS "UQ_users_email"
        `);

        // Create composite unique index on email + tenantId
        await queryRunner.query(`
            CREATE UNIQUE INDEX IF NOT EXISTS "IDX_users_email_tenantId"
            ON "users" ("email", "tenant_id")
        `);

        // Create index on email for faster lookups
        await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS "IDX_users_email" ON "users" ("email")
        `);

        // Set default role to 'viewer' for existing users without a role
        await queryRunner.query(`
            UPDATE "users" SET "role" = 'viewer' WHERE "role" IS NULL
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Remove indexes
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_users_email_tenantId"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_users_email"`);

        // Restore unique constraint on email
        await queryRunner.query(`
            ALTER TABLE "users" ADD CONSTRAINT "UQ_users_email" UNIQUE ("email")
        `);

        // Remove added columns
        await queryRunner.query(`
            ALTER TABLE "users"
            DROP COLUMN IF EXISTS "is_active",
            DROP COLUMN IF EXISTS "phone",
            DROP COLUMN IF EXISTS "last_login_at",
            DROP COLUMN IF EXISTS "reset_password_token",
            DROP COLUMN IF EXISTS "reset_password_expires"
        `);
    }

}
