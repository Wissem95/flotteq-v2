import { MigrationInterface, QueryRunner } from "typeorm";

export class AddEstimatedActualCostToMaintenance1759800000000 implements MigrationInterface {
    name = 'AddEstimatedActualCostToMaintenance1759800000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Rename cost to actualCost
        await queryRunner.query(`ALTER TABLE "maintenances" RENAME COLUMN "cost" TO "actual_cost"`);

        // Add estimatedCost column
        await queryRunner.query(`ALTER TABLE "maintenances" ADD "estimated_cost" numeric(10,2) NOT NULL DEFAULT 0`);

        // Copy actualCost to estimatedCost for existing records
        await queryRunner.query(`UPDATE "maintenances" SET "estimated_cost" = "actual_cost"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Remove estimatedCost
        await queryRunner.query(`ALTER TABLE "maintenances" DROP COLUMN "estimated_cost"`);

        // Rename actualCost back to cost
        await queryRunner.query(`ALTER TABLE "maintenances" RENAME COLUMN "actual_cost" TO "cost"`);
    }
}
