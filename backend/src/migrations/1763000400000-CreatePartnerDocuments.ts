import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreatePartnerDocuments1763000400000 implements MigrationInterface {
  name = 'CreatePartnerDocuments1763000400000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "partner_documents" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "partner_id" uuid NOT NULL,
        "uploaded_by_partner_user_id" uuid NOT NULL,
        "file_name" character varying(255) NOT NULL,
        "file_path" text NOT NULL,
        "mime_type" character varying(100) NOT NULL,
        "size" integer NOT NULL,
        "document_type" character varying(40) NOT NULL,
        "verification_status" character varying(20) NOT NULL DEFAULT 'pending',
        "verification_notes" text,
        "verified_by_id" uuid,
        "verified_at" TIMESTAMP,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP,
        CONSTRAINT "PK_partner_documents_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_partner_documents_partner" FOREIGN KEY ("partner_id")
          REFERENCES "partners"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_partner_documents_uploader" FOREIGN KEY ("uploaded_by_partner_user_id")
          REFERENCES "partner_users"("id") ON DELETE CASCADE,
        CONSTRAINT "CHK_partner_documents_type" CHECK ("document_type" IN ('siret', 'insurance_certificate')),
        CONSTRAINT "CHK_partner_documents_status" CHECK ("verification_status" IN ('pending', 'approved', 'rejected'))
      )
    `);
    await queryRunner.query(
      'CREATE INDEX "IDX_partner_documents_partner_created" ON "partner_documents" ("partner_id", "created_at" DESC)',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'DROP INDEX IF EXISTS "IDX_partner_documents_partner_created"',
    );
    await queryRunner.query('DROP TABLE IF EXISTS "partner_documents"');
  }
}
