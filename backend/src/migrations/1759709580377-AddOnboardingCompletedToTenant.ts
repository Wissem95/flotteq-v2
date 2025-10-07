import { MigrationInterface, QueryRunner } from "typeorm";

export class AddOnboardingCompletedToTenant1759709580377 implements MigrationInterface {
    name = 'AddOnboardingCompletedToTenant1759709580377'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "tenants" ADD "onboarding_completed" boolean NOT NULL DEFAULT false`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "tenants" DROP COLUMN "onboarding_completed"`);
    }

}
