import { MigrationInterface, QueryRunner } from "typeorm";

export class AddVehicleDetails1700000000000 implements MigrationInterface {
    name = 'AddVehicleDetails1700000000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "vehicles" 
            ADD COLUMN IF NOT EXISTS "transmission" VARCHAR(20),
            ADD COLUMN IF NOT EXISTS "fuelType" VARCHAR(20),
            ADD COLUMN IF NOT EXISTS "mileage" INTEGER DEFAULT 0,
            ADD COLUMN IF NOT EXISTS "purchaseDate" TIMESTAMP,
            ADD COLUMN IF NOT EXISTS "lastTechnicalInspection" TIMESTAMP,
            ADD COLUMN IF NOT EXISTS "nextTechnicalInspection" TIMESTAMP
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "vehicles" 
            DROP COLUMN IF EXISTS "transmission",
            DROP COLUMN IF EXISTS "fuelType",
            DROP COLUMN IF EXISTS "mileage",
            DROP COLUMN IF EXISTS "purchaseDate",
            DROP COLUMN IF EXISTS "lastTechnicalInspection",
            DROP COLUMN IF EXISTS "nextTechnicalInspection"
        `);
    }
}
