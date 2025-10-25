import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateRatingsTable1760930000000 implements MigrationInterface {
  name = 'CreateRatingsTable1760930000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create ratings table
    await queryRunner.query(`
      CREATE TABLE "ratings" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "booking_id" uuid NOT NULL UNIQUE,
        "tenant_id" int NOT NULL,
        "partner_id" uuid NOT NULL,
        "score" decimal(2,1) NOT NULL,
        "comment" text NULL,
        "created_at" timestamp NOT NULL DEFAULT now(),
        CONSTRAINT "FK_ratings_booking" FOREIGN KEY ("booking_id") REFERENCES "bookings"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_ratings_tenant" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_ratings_partner" FOREIGN KEY ("partner_id") REFERENCES "partners"("id") ON DELETE CASCADE,
        CONSTRAINT "CHK_rating_score" CHECK ("score" >= 1 AND "score" <= 5)
      )
    `);

    // Create indexes for ratings table
    await queryRunner.query(
      `CREATE INDEX "idx_ratings_partner_id" ON "ratings"("partner_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_ratings_tenant_id" ON "ratings"("tenant_id")`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "idx_ratings_booking_id" ON "ratings"("booking_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_ratings_created_at" ON "ratings"("created_at")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop indexes
    await queryRunner.query(`DROP INDEX "idx_ratings_created_at"`);
    await queryRunner.query(`DROP INDEX "idx_ratings_booking_id"`);
    await queryRunner.query(`DROP INDEX "idx_ratings_tenant_id"`);
    await queryRunner.query(`DROP INDEX "idx_ratings_partner_id"`);

    // Drop table
    await queryRunner.query(`DROP TABLE "ratings"`);
  }
}
