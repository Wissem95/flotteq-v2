import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1759242722889 implements MigrationInterface {
    name = 'InitialSchema1759242722889'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."drivers_status_enum" AS ENUM('active', 'inactive', 'suspended', 'on_leave')`);
        await queryRunner.query(`CREATE TABLE "drivers" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "firstName" character varying NOT NULL, "lastName" character varying NOT NULL, "email" character varying NOT NULL, "phone" character varying NOT NULL, "licenseNumber" character varying NOT NULL, "licenseExpiryDate" date NOT NULL, "medicalCertificateExpiryDate" date, "birthDate" date, "status" "public"."drivers_status_enum" NOT NULL DEFAULT 'active', "address" character varying, "city" character varying, "postalCode" character varying, "emergencyContact" character varying, "emergencyPhone" character varying, "notes" text, "tenant_id" integer NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_d4cfc1aafe3a14622aee390edb2" UNIQUE ("email"), CONSTRAINT "UQ_754b3d50a8cc64f7ad5c24f62b4" UNIQUE ("licenseNumber"), CONSTRAINT "PK_92ab3fb69e566d3eb0cae896047" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."vehicles_status_enum" AS ENUM('available', 'in_use', 'maintenance', 'out_of_service')`);
        await queryRunner.query(`CREATE TABLE "vehicles" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "registration" character varying NOT NULL, "brand" character varying NOT NULL, "model" character varying NOT NULL, "year" integer NOT NULL, "initial_mileage" integer, "current_km" integer NOT NULL DEFAULT '0', "status" "public"."vehicles_status_enum" NOT NULL DEFAULT 'available', "vin" character varying NOT NULL, "color" character varying NOT NULL, "purchaseDate" date NOT NULL, "purchasePrice" numeric(10,2) NOT NULL, "assigned_driver_id" uuid, "tenant_id" integer NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_669d41b3f773ae79e8cf0512bdb" UNIQUE ("registration"), CONSTRAINT "UQ_8288ce015b69c5856cf54e07a67" UNIQUE ("vin"), CONSTRAINT "PK_18d8646b59304dce4af3a9e35b6" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "email" character varying NOT NULL, "password" character varying NOT NULL, "first_name" character varying, "last_name" character varying, "tenant_id" integer NOT NULL, "refresh_token" text, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."maintenances_type_enum" AS ENUM('preventive', 'corrective', 'inspection', 'tire_change', 'oil_change')`);
        await queryRunner.query(`CREATE TYPE "public"."maintenances_status_enum" AS ENUM('scheduled', 'in_progress', 'completed', 'cancelled')`);
        await queryRunner.query(`CREATE TABLE "maintenances" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "vehicle_id" uuid NOT NULL, "type" "public"."maintenances_type_enum" NOT NULL, "description" text NOT NULL, "scheduledDate" date NOT NULL, "completedDate" date, "status" "public"."maintenances_status_enum" NOT NULL DEFAULT 'scheduled', "cost" numeric(10,2) NOT NULL, "performedBy" character varying, "nextMaintenanceKm" integer, "tenant_id" integer NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_62403473bd524a42d58589aa78b" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "vehicles" ADD CONSTRAINT "FK_206dc3b1eaf70992421f45433fa" FOREIGN KEY ("assigned_driver_id") REFERENCES "drivers"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "maintenances" ADD CONSTRAINT "FK_d501088741618ca66074d85e411" FOREIGN KEY ("vehicle_id") REFERENCES "vehicles"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "maintenances" DROP CONSTRAINT "FK_d501088741618ca66074d85e411"`);
        await queryRunner.query(`ALTER TABLE "vehicles" DROP CONSTRAINT "FK_206dc3b1eaf70992421f45433fa"`);
        await queryRunner.query(`DROP TABLE "maintenances"`);
        await queryRunner.query(`DROP TYPE "public"."maintenances_status_enum"`);
        await queryRunner.query(`DROP TYPE "public"."maintenances_type_enum"`);
        await queryRunner.query(`DROP TABLE "users"`);
        await queryRunner.query(`DROP TABLE "vehicles"`);
        await queryRunner.query(`DROP TYPE "public"."vehicles_status_enum"`);
        await queryRunner.query(`DROP TABLE "drivers"`);
        await queryRunner.query(`DROP TYPE "public"."drivers_status_enum"`);
    }

}
