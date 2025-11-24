import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateAvailabilitiesTable1760580000000
  implements MigrationInterface
{
  name = 'CreateAvailabilitiesTable1760580000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create availabilities table
    await queryRunner.query(`
      CREATE TABLE "availabilities" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "partner_id" uuid NOT NULL,
        "day_of_week" int NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
        "start_time" time NOT NULL,
        "end_time" time NOT NULL,
        "slot_duration" int NOT NULL CHECK (slot_duration >= 5 AND slot_duration <= 120),
        "created_at" timestamp NOT NULL DEFAULT now(),
        "updated_at" timestamp NOT NULL DEFAULT now(),
        "deleted_at" timestamp NULL,
        CONSTRAINT "FK_availabilities_partner" FOREIGN KEY ("partner_id") REFERENCES "partners"("id") ON DELETE CASCADE,
        CONSTRAINT "UQ_availabilities_partner_day" UNIQUE ("partner_id", "day_of_week"),
        CONSTRAINT "CHK_availabilities_time_range" CHECK (start_time < end_time)
      )
    `);

    // Create unavailabilities table
    await queryRunner.query(`
      CREATE TABLE "unavailabilities" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "partner_id" uuid NOT NULL,
        "date" date NOT NULL,
        "reason" varchar(255) NOT NULL,
        "is_full_day" boolean NOT NULL DEFAULT true,
        "start_time" time NULL,
        "end_time" time NULL,
        "created_at" timestamp NOT NULL DEFAULT now(),
        "updated_at" timestamp NOT NULL DEFAULT now(),
        "deleted_at" timestamp NULL,
        CONSTRAINT "FK_unavailabilities_partner" FOREIGN KEY ("partner_id") REFERENCES "partners"("id") ON DELETE CASCADE,
        CONSTRAINT "CHK_unavailabilities_partial_time" CHECK (
          (is_full_day = true) OR
          (is_full_day = false AND start_time IS NOT NULL AND end_time IS NOT NULL AND start_time < end_time)
        )
      )
    `);

    // Create indexes for availabilities
    await queryRunner.query(
      `CREATE INDEX "idx_availabilities_partner_id" ON "availabilities"("partner_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_availabilities_partner_day" ON "availabilities"("partner_id", "day_of_week")`,
    );

    // Create indexes for unavailabilities
    await queryRunner.query(
      `CREATE INDEX "idx_unavailabilities_partner_id" ON "unavailabilities"("partner_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_unavailabilities_date" ON "unavailabilities"("date")`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_unavailabilities_partner_date" ON "unavailabilities"("partner_id", "date")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop indexes for unavailabilities
    await queryRunner.query(`DROP INDEX "idx_unavailabilities_partner_date"`);
    await queryRunner.query(`DROP INDEX "idx_unavailabilities_date"`);
    await queryRunner.query(`DROP INDEX "idx_unavailabilities_partner_id"`);

    // Drop indexes for availabilities
    await queryRunner.query(`DROP INDEX "idx_availabilities_partner_day"`);
    await queryRunner.query(`DROP INDEX "idx_availabilities_partner_id"`);

    // Drop tables
    await queryRunner.query(`DROP TABLE "unavailabilities"`);
    await queryRunner.query(`DROP TABLE "availabilities"`);
  }
}
