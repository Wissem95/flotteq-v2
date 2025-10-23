import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPaymentStatusToBookings1760920000000 implements MigrationInterface {
  name = 'AddPaymentStatusToBookings1760920000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create payment_status enum
    await queryRunner.query(`
      CREATE TYPE "payment_status_enum" AS ENUM ('pending', 'paid', 'refunded')
    `);

    // Add payment_status column to bookings table
    await queryRunner.query(`
      ALTER TABLE "bookings"
      ADD COLUMN "payment_status" "payment_status_enum" NOT NULL DEFAULT 'pending'
    `);

    // Create index for payment_status
    await queryRunner.query(`
      CREATE INDEX "idx_bookings_payment_status" ON "bookings"("payment_status")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop index
    await queryRunner.query(`DROP INDEX "idx_bookings_payment_status"`);

    // Drop column
    await queryRunner.query(`ALTER TABLE "bookings" DROP COLUMN "payment_status"`);

    // Drop enum
    await queryRunner.query(`DROP TYPE "payment_status_enum"`);
  }
}
