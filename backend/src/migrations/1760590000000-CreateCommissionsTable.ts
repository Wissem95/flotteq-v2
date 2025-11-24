import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateCommissionsTable1760590000000 implements MigrationInterface {
  name = 'CreateCommissionsTable1760590000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create CommissionStatus enum
    await queryRunner.query(`
      CREATE TYPE "commission_status" AS ENUM ('pending', 'paid')
    `);

    // Create commissions table
    await queryRunner.query(`
      CREATE TABLE "commissions" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "partner_id" uuid NOT NULL,
        "booking_id" uuid NOT NULL UNIQUE,
        "amount" decimal(10,2) NOT NULL,
        "status" commission_status NOT NULL DEFAULT 'pending',
        "paid_at" timestamp NULL,
        "payment_reference" varchar(255) NULL,
        "created_at" timestamp NOT NULL DEFAULT now(),
        "updated_at" timestamp NOT NULL DEFAULT now(),
        "deleted_at" timestamp NULL,
        CONSTRAINT "FK_commissions_partner" FOREIGN KEY ("partner_id") REFERENCES "partners"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_commissions_booking" FOREIGN KEY ("booking_id") REFERENCES "bookings"("id") ON DELETE CASCADE,
        CONSTRAINT "UQ_commission_booking" UNIQUE ("booking_id")
      )
    `);

    // Create indexes for commissions table
    await queryRunner.query(
      `CREATE INDEX "idx_commissions_partner_id" ON "commissions"("partner_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_commissions_status" ON "commissions"("status")`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_commissions_paid_at" ON "commissions"("paid_at")`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_commissions_partner_status" ON "commissions"("partner_id", "status")`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_commissions_created_at" ON "commissions"("created_at")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop indexes
    await queryRunner.query(`DROP INDEX "idx_commissions_created_at"`);
    await queryRunner.query(`DROP INDEX "idx_commissions_partner_status"`);
    await queryRunner.query(`DROP INDEX "idx_commissions_paid_at"`);
    await queryRunner.query(`DROP INDEX "idx_commissions_status"`);
    await queryRunner.query(`DROP INDEX "idx_commissions_partner_id"`);

    // Drop table
    await queryRunner.query(`DROP TABLE "commissions"`);

    // Drop enum
    await queryRunner.query(`DROP TYPE "commission_status"`);
  }
}
