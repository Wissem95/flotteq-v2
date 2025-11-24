import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreatePartnerTables1760560000000 implements MigrationInterface {
  name = 'CreatePartnerTables1760560000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create PartnerType enum
    await queryRunner.query(`
      CREATE TYPE "partner_type" AS ENUM ('garage', 'ct_center', 'insurance', 'parts_supplier')
    `);

    // Create PartnerStatus enum
    await queryRunner.query(`
      CREATE TYPE "partner_status" AS ENUM ('pending', 'approved', 'rejected', 'suspended')
    `);

    // Create PartnerUserRole enum
    await queryRunner.query(`
      CREATE TYPE "partner_user_role" AS ENUM ('owner', 'manager', 'employee')
    `);

    // Create partners table
    await queryRunner.query(`
      CREATE TABLE "partners" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "company_name" varchar NOT NULL,
        "type" partner_type NOT NULL,
        "email" varchar NOT NULL UNIQUE,
        "phone" varchar NOT NULL,
        "address" varchar NOT NULL,
        "city" varchar NOT NULL,
        "postal_code" varchar NOT NULL,
        "latitude" decimal(10,6) NULL,
        "longitude" decimal(10,6) NULL,
        "commission_rate" decimal(5,2) NOT NULL DEFAULT 10,
        "description" text NULL,
        "siret_number" varchar NOT NULL UNIQUE,
        "insurance_document" varchar NULL,
        "rating" decimal(3,2) NOT NULL DEFAULT 0,
        "total_reviews" int NOT NULL DEFAULT 0,
        "status" partner_status NOT NULL DEFAULT 'pending',
        "created_at" timestamp NOT NULL DEFAULT now(),
        "updated_at" timestamp NOT NULL DEFAULT now(),
        "deleted_at" timestamp NULL
      )
    `);

    // Create partner_users table
    await queryRunner.query(`
      CREATE TABLE "partner_users" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "partner_id" uuid NOT NULL,
        "email" varchar NOT NULL UNIQUE,
        "password" varchar NOT NULL,
        "first_name" varchar NOT NULL,
        "last_name" varchar NOT NULL,
        "role" partner_user_role NOT NULL DEFAULT 'owner',
        "is_active" boolean NOT NULL DEFAULT true,
        "last_login_at" timestamp NULL,
        "created_at" timestamp NOT NULL DEFAULT now(),
        "updated_at" timestamp NOT NULL DEFAULT now(),
        "deleted_at" timestamp NULL,
        CONSTRAINT "FK_partner_users_partner" FOREIGN KEY ("partner_id") REFERENCES "partners"("id") ON DELETE CASCADE
      )
    `);

    // Create partner_services table
    await queryRunner.query(`
      CREATE TABLE "partner_services" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "partner_id" uuid NOT NULL,
        "name" varchar NOT NULL,
        "description" text NULL,
        "price" decimal(10,2) NOT NULL,
        "duration_minutes" int NOT NULL,
        "is_active" boolean NOT NULL DEFAULT true,
        "created_at" timestamp NOT NULL DEFAULT now(),
        "updated_at" timestamp NOT NULL DEFAULT now(),
        "deleted_at" timestamp NULL,
        CONSTRAINT "FK_partner_services_partner" FOREIGN KEY ("partner_id") REFERENCES "partners"("id") ON DELETE CASCADE
      )
    `);

    // Create indexes for partners table
    await queryRunner.query(
      `CREATE INDEX "idx_partners_company_name" ON "partners"("company_name")`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_partners_email" ON "partners"("email")`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_partners_status" ON "partners"("status")`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_partners_type" ON "partners"("type")`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_partners_city" ON "partners"("city")`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_partners_lat_lng" ON "partners"("latitude", "longitude")`,
    );

    // Create indexes for partner_users table
    await queryRunner.query(
      `CREATE INDEX "idx_partner_users_email" ON "partner_users"("email")`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_partner_users_partner_id" ON "partner_users"("partner_id")`,
    );

    // Create indexes for partner_services table
    await queryRunner.query(
      `CREATE INDEX "idx_partner_services_partner_id" ON "partner_services"("partner_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_partner_services_partner_active" ON "partner_services"("partner_id", "is_active")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop tables in reverse order (respecting foreign keys)
    await queryRunner.query(`DROP TABLE "partner_services"`);
    await queryRunner.query(`DROP TABLE "partner_users"`);
    await queryRunner.query(`DROP TABLE "partners"`);

    // Drop enums
    await queryRunner.query(`DROP TYPE "partner_user_role"`);
    await queryRunner.query(`DROP TYPE "partner_status"`);
    await queryRunner.query(`DROP TYPE "partner_type"`);
  }
}
