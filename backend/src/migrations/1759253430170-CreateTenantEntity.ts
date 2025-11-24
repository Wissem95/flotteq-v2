import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateTenantEntity1759253430170 implements MigrationInterface {
  name = 'CreateTenantEntity1759253430170';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."tenants_status_enum" AS ENUM('trial', 'active', 'suspended', 'cancelled')`,
    );
    await queryRunner.query(
      `CREATE TABLE "tenants" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "email" character varying NOT NULL, "phone" character varying, "address" character varying, "city" character varying, "postal_code" character varying, "country" character varying, "status" "public"."tenants_status_enum" NOT NULL DEFAULT 'trial', "subscription_id" character varying, "trial_ends_at" date, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_32731f181236a46182a38c992a8" UNIQUE ("name"), CONSTRAINT "UQ_155c343439adc83ada6ee3f48be" UNIQUE ("email"), CONSTRAINT "PK_53be67a04681c66b87ee27c9321" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_32731f181236a46182a38c992a" ON "tenants" ("name") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_155c343439adc83ada6ee3f48b" ON "tenants" ("email") `,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD CONSTRAINT "FK_109638590074998bb72a2f2cf08" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "drivers" ADD CONSTRAINT "FK_7793872525aa2c0a99f86601d2b" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "vehicles" ADD CONSTRAINT "FK_83421ac7781fdc9554f5256841d" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "vehicles" DROP CONSTRAINT "FK_83421ac7781fdc9554f5256841d"`,
    );
    await queryRunner.query(
      `ALTER TABLE "drivers" DROP CONSTRAINT "FK_7793872525aa2c0a99f86601d2b"`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" DROP CONSTRAINT "FK_109638590074998bb72a2f2cf08"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_155c343439adc83ada6ee3f48b"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_32731f181236a46182a38c992a"`,
    );
    await queryRunner.query(`DROP TABLE "tenants"`);
    await queryRunner.query(`DROP TYPE "public"."tenants_status_enum"`);
  }
}
