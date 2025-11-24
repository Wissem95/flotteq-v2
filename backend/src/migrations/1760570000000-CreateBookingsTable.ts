import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateBookingsTable1760570000000 implements MigrationInterface {
  name = 'CreateBookingsTable1760570000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create BookingStatus enum
    await queryRunner.query(`
      CREATE TYPE "booking_status" AS ENUM ('pending', 'confirmed', 'in_progress', 'completed', 'cancelled', 'rejected')
    `);

    // Create bookings table
    await queryRunner.query(`
      CREATE TABLE "bookings" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "partner_id" uuid NOT NULL,
        "tenant_id" int NOT NULL,
        "vehicle_id" uuid NOT NULL,
        "driver_id" uuid NULL,
        "service_id" uuid NOT NULL,
        "scheduled_date" date NOT NULL,
        "scheduled_time" time NOT NULL,
        "end_time" time NOT NULL,
        "status" booking_status NOT NULL DEFAULT 'pending',
        "price" decimal(10,2) NOT NULL,
        "commission_amount" decimal(10,2) NOT NULL DEFAULT 0,
        "customer_notes" text NULL,
        "partner_notes" text NULL,
        "rejection_reason" text NULL,
        "cancellation_reason" text NULL,
        "confirmed_at" timestamp NULL,
        "completed_at" timestamp NULL,
        "paid_at" timestamp NULL,
        "created_at" timestamp NOT NULL DEFAULT now(),
        "updated_at" timestamp NOT NULL DEFAULT now(),
        "deleted_at" timestamp NULL,
        CONSTRAINT "FK_bookings_partner" FOREIGN KEY ("partner_id") REFERENCES "partners"("id") ON DELETE RESTRICT,
        CONSTRAINT "FK_bookings_tenant" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT,
        CONSTRAINT "FK_bookings_vehicle" FOREIGN KEY ("vehicle_id") REFERENCES "vehicles"("id") ON DELETE RESTRICT,
        CONSTRAINT "FK_bookings_driver" FOREIGN KEY ("driver_id") REFERENCES "drivers"("id") ON DELETE SET NULL,
        CONSTRAINT "FK_bookings_service" FOREIGN KEY ("service_id") REFERENCES "partner_services"("id") ON DELETE RESTRICT
      )
    `);

    // Create indexes for bookings table
    await queryRunner.query(
      `CREATE INDEX "idx_bookings_partner_id" ON "bookings"("partner_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_bookings_tenant_id" ON "bookings"("tenant_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_bookings_vehicle_id" ON "bookings"("vehicle_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_bookings_status" ON "bookings"("status")`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_bookings_scheduled_date" ON "bookings"("scheduled_date")`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_bookings_partner_status" ON "bookings"("partner_id", "status")`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_bookings_tenant_status" ON "bookings"("tenant_id", "status")`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_bookings_date_range" ON "bookings"("scheduled_date", "status")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop indexes
    await queryRunner.query(`DROP INDEX "idx_bookings_date_range"`);
    await queryRunner.query(`DROP INDEX "idx_bookings_tenant_status"`);
    await queryRunner.query(`DROP INDEX "idx_bookings_partner_status"`);
    await queryRunner.query(`DROP INDEX "idx_bookings_scheduled_date"`);
    await queryRunner.query(`DROP INDEX "idx_bookings_status"`);
    await queryRunner.query(`DROP INDEX "idx_bookings_vehicle_id"`);
    await queryRunner.query(`DROP INDEX "idx_bookings_tenant_id"`);
    await queryRunner.query(`DROP INDEX "idx_bookings_partner_id"`);

    // Drop table
    await queryRunner.query(`DROP TABLE "bookings"`);

    // Drop enum
    await queryRunner.query(`DROP TYPE "booking_status"`);
  }
}
