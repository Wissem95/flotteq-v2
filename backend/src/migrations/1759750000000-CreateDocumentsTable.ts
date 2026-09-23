import { MigrationInterface, QueryRunner } from 'typeorm';

/** Crée la table documents avant les migrations qui lui ajoutent ses métadonnées. */
export class CreateDocumentsTable1759750000000 implements MigrationInterface {
  name = 'CreateDocumentsTable1759750000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TYPE "public"."document_entity_type" AS ENUM ('vehicle', 'driver', 'maintenance')
    `);
    await queryRunner.query(`
      CREATE TYPE "public"."document_type" AS ENUM (
        'permis', 'carte_grise', 'assurance', 'controle_technique', 'facture', 'contrat', 'autre'
      )
    `);
    await queryRunner.query(`
      CREATE TABLE "documents" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "fileName" character varying NOT NULL,
        "fileUrl" character varying NOT NULL,
        "mimeType" character varying NOT NULL,
        "size" integer NOT NULL,
        "entityType" "public"."document_entity_type" NOT NULL,
        "entityId" uuid NOT NULL,
        "uploaded_by_id" uuid NOT NULL,
        "tenant_id" integer NOT NULL,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP,
        CONSTRAINT "PK_documents_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_documents_uploaded_by" FOREIGN KEY ("uploaded_by_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION,
        CONSTRAINT "FK_documents_tenant" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE "documents"');
    await queryRunner.query('DROP TYPE "public"."document_type"');
    await queryRunner.query('DROP TYPE "public"."document_entity_type"');
  }
}
