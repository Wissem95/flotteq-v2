import { MigrationInterface, QueryRunner } from 'typeorm';

/** Aligne les types et le soft delete de documents sur Document sans perdre les données. */
export class AlignDocumentSchemaToEntity1763000700000
  implements MigrationInterface
{
  name = 'AlignDocumentSchemaToEntity1763000700000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE "documents_entitytype_enum" AS ENUM (
          'vehicle', 'driver', 'maintenance', 'partner', 'partner_service'
        );
      EXCEPTION WHEN duplicate_object THEN NULL; END $$;
    `);
    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE "documents_document_type_enum" AS ENUM (
          'permis', 'carte_grise', 'assurance', 'controle_technique', 'facture',
          'contrat', 'siret', 'insurance_certificate', 'logo', 'autre'
        );
      EXCEPTION WHEN duplicate_object THEN NULL; END $$;
    `);

    await queryRunner.query(`
      ALTER TABLE "documents"
      ALTER COLUMN "entityType" TYPE "documents_entitytype_enum"
      USING "entityType"::text::"documents_entitytype_enum"
    `);
    await queryRunner.query(`
      ALTER TABLE "documents"
      ALTER COLUMN "document_type" TYPE "documents_document_type_enum"
      USING "document_type"::text::"documents_document_type_enum"
    `);
    await queryRunner.query(`
      DO $$ BEGIN
        IF EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_schema = 'public' AND table_name = 'documents' AND column_name = 'deleted_at'
        ) AND NOT EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_schema = 'public' AND table_name = 'documents' AND column_name = 'deletedAt'
        ) THEN
          ALTER TABLE "documents" RENAME COLUMN "deleted_at" TO "deletedAt";
        ELSIF NOT EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_schema = 'public' AND table_name = 'documents' AND column_name = 'deletedAt'
        ) THEN
          ALTER TABLE "documents" ADD COLUMN "deletedAt" TIMESTAMP;
        END IF;
      END $$;
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {
    // Pas de rollback automatique : les types peuvent désormais contenir des valeurs partenaire.
  }
}
