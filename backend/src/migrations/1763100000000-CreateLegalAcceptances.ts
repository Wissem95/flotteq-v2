import { MigrationInterface, QueryRunner } from 'typeorm';

/** Conserve la preuve d’acceptation des documents contractuels à l’inscription. */
export class CreateLegalAcceptances1763100000000 implements MigrationInterface {
  name = 'CreateLegalAcceptances1763100000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "legal_acceptances" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "tenant_id" integer NOT NULL,
        "user_id" uuid NOT NULL,
        "customer_type" character varying(20) NOT NULL,
        "terms_version" character varying(32) NOT NULL,
        "privacy_policy_version" character varying(32) NOT NULL,
        "immediate_service_requested" boolean NOT NULL DEFAULT false,
        "accepted_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_legal_acceptances_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_legal_acceptances_tenant" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id"),
        CONSTRAINT "FK_legal_acceptances_user" FOREIGN KEY ("user_id") REFERENCES "users"("id"),
        CONSTRAINT "CHK_legal_acceptances_customer_type" CHECK ("customer_type" IN ('consumer', 'professional'))
      )
    `);
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_legal_acceptances_user_id" ON "legal_acceptances" ("user_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_legal_acceptances_tenant_id" ON "legal_acceptances" ("tenant_id")`,
    );
  }

  public async down(): Promise<void> {
    throw new Error(
      'Migration forward-only: les preuves de consentement ne doivent pas être supprimées.',
    );
  }
}
