import { MigrationInterface, QueryRunner } from 'typeorm';

/** Tables présentes dans les entités et services mais absentes des migrations historiques. */
export class CreateMissingOperationalTables1763000600000
  implements MigrationInterface
{
  name = 'CreateMissingOperationalTables1763000600000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE "reports_type_enum" AS ENUM ('mechanical', 'accident', 'damage', 'cleaning', 'other');
      EXCEPTION WHEN duplicate_object THEN NULL; END $$;
    `);
    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE "reports_status_enum" AS ENUM ('open', 'acknowledged', 'resolved');
      EXCEPTION WHEN duplicate_object THEN NULL; END $$;
    `);
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "reports" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "vehicle_id" uuid NOT NULL,
        "driver_id" uuid NOT NULL,
        "tenant_id" integer NOT NULL,
        "type" "reports_type_enum" NOT NULL,
        "description" text NOT NULL,
        "notes" text,
        "status" "reports_status_enum" NOT NULL DEFAULT 'open',
        "photos" text,
        "acknowledged_at" TIMESTAMP,
        "acknowledged_by" uuid,
        "resolved_at" TIMESTAMP,
        "resolved_by" uuid,
        "resolution_notes" text,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_reports_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_reports_vehicle" FOREIGN KEY ("vehicle_id") REFERENCES "vehicles"("id"),
        CONSTRAINT "FK_reports_driver" FOREIGN KEY ("driver_id") REFERENCES "drivers"("id"),
        CONSTRAINT "FK_reports_tenant" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id"),
        CONSTRAINT "FK_reports_acknowledged_by" FOREIGN KEY ("acknowledged_by") REFERENCES "users"("id"),
        CONSTRAINT "FK_reports_resolved_by" FOREIGN KEY ("resolved_by") REFERENCES "users"("id")
      )
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_reports_vehicle_id" ON "reports" ("vehicle_id");
      CREATE INDEX IF NOT EXISTS "IDX_reports_driver_id" ON "reports" ("driver_id");
      CREATE INDEX IF NOT EXISTS "IDX_reports_tenant_id" ON "reports" ("tenant_id");
      CREATE INDEX IF NOT EXISTS "IDX_reports_status" ON "reports" ("status");
      CREATE INDEX IF NOT EXISTS "IDX_reports_created_at" ON "reports" ("created_at");
    `);

    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE "audit_logs_action_enum" AS ENUM ('CREATE', 'UPDATE', 'DELETE', 'READ');
      EXCEPTION WHEN duplicate_object THEN NULL; END $$;
    `);
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "audit_logs" (
        "id" SERIAL NOT NULL,
        "tenant_id" integer NOT NULL,
        "user_id" uuid,
        "action" "audit_logs_action_enum" NOT NULL,
        "entity_type" character varying(100) NOT NULL,
        "entity_id" character varying,
        "old_value" jsonb,
        "new_value" jsonb,
        "metadata" jsonb,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_audit_logs_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_audit_logs_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL
      )
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_audit_logs_tenant_entity_type" ON "audit_logs" ("tenant_id", "entity_type");
      CREATE INDEX IF NOT EXISTS "IDX_audit_logs_tenant_user" ON "audit_logs" ("tenant_id", "user_id");
      CREATE INDEX IF NOT EXISTS "IDX_audit_logs_tenant_created_at" ON "audit_logs" ("tenant_id", "created_at");
    `);

    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE "maintenance_templates_type_enum" AS ENUM ('preventive', 'corrective', 'inspection', 'tire_change', 'oil_change');
      EXCEPTION WHEN duplicate_object THEN NULL; END $$;
    `);
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "maintenance_templates" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "name" character varying(100) NOT NULL,
        "type" "maintenance_templates_type_enum" NOT NULL,
        "description" text NOT NULL,
        "estimatedCost" numeric(10,2) NOT NULL,
        "estimatedDurationDays" integer,
        "kmInterval" integer,
        "isActive" boolean NOT NULL DEFAULT true,
        "tenant_id" integer NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_maintenance_templates_id" PRIMARY KEY ("id")
      )
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {
    // No-op : IF NOT EXISTS permet d'adopter une table préexistante, à ne pas supprimer au rollback.
  }
}
