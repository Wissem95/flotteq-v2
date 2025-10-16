import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateMileageHistory1760544884300 implements MigrationInterface {
  name = 'CreateMileageHistory1760544884300';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "mileage_history" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "vehicle_id" uuid NOT NULL,
        "mileage" integer NOT NULL,
        "previous_mileage" integer,
        "difference" integer NOT NULL DEFAULT 0,
        "source" character varying NOT NULL DEFAULT 'manual',
        "notes" text,
        "tenant_id" integer NOT NULL,
        "recorded_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_mileage_history" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_mileage_history_vehicle_recorded"
      ON "mileage_history" ("vehicle_id", "recorded_at")
    `);

    await queryRunner.query(`
      ALTER TABLE "mileage_history"
      ADD CONSTRAINT "FK_mileage_history_vehicle"
      FOREIGN KEY ("vehicle_id")
      REFERENCES "vehicles"("id")
      ON DELETE CASCADE ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "mileage_history"
      ADD CONSTRAINT "FK_mileage_history_tenant"
      FOREIGN KEY ("tenant_id")
      REFERENCES "tenants"("id")
      ON DELETE CASCADE ON UPDATE NO ACTION
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "mileage_history" DROP CONSTRAINT "FK_mileage_history_tenant"`);
    await queryRunner.query(`ALTER TABLE "mileage_history" DROP CONSTRAINT "FK_mileage_history_vehicle"`);
    await queryRunner.query(`DROP INDEX "IDX_mileage_history_vehicle_recorded"`);
    await queryRunner.query(`DROP TABLE "mileage_history"`);
  }
}
