import { MigrationInterface, QueryRunner } from "typeorm";

export class AddStorageQuotaToPlans1759588716939 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Add max_storage_mb to subscription_plans
        await queryRunner.query(`
            ALTER TABLE "subscription_plans"
            ADD COLUMN "max_storage_mb" INTEGER NOT NULL DEFAULT 1000
        `);

        // Add storage_used_bytes to tenants
        await queryRunner.query(`
            ALTER TABLE "tenants"
            ADD COLUMN "storage_used_bytes" BIGINT NOT NULL DEFAULT 0
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Remove storage_used_bytes from tenants
        await queryRunner.query(`
            ALTER TABLE "tenants"
            DROP COLUMN "storage_used_bytes"
        `);

        // Remove max_storage_mb from subscription_plans
        await queryRunner.query(`
            ALTER TABLE "subscription_plans"
            DROP COLUMN "max_storage_mb"
        `);
    }

}
