import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Ajoute le suivi de vérification des documents (validation par l'équipe FlotteQ).
 * Champs : verification_status (pending/approved/rejected), verification_notes,
 * verified_by_id, verified_at.
 */
export class DocumentVerification1763000200000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'documents_verification_status_enum') THEN
          CREATE TYPE "documents_verification_status_enum" AS ENUM ('pending', 'approved', 'rejected');
        END IF;
      END$$;
    `);
    await queryRunner.query(
      `ALTER TABLE "documents" ADD COLUMN IF NOT EXISTS "verification_status" "documents_verification_status_enum" NOT NULL DEFAULT 'pending'`,
    );
    await queryRunner.query(
      `ALTER TABLE "documents" ADD COLUMN IF NOT EXISTS "verification_notes" text`,
    );
    await queryRunner.query(
      `ALTER TABLE "documents" ADD COLUMN IF NOT EXISTS "verified_by_id" uuid`,
    );
    await queryRunner.query(
      `ALTER TABLE "documents" ADD COLUMN IF NOT EXISTS "verified_at" TIMESTAMP`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "documents" DROP COLUMN IF EXISTS "verified_at"`,
    );
    await queryRunner.query(
      `ALTER TABLE "documents" DROP COLUMN IF EXISTS "verified_by_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "documents" DROP COLUMN IF EXISTS "verification_notes"`,
    );
    await queryRunner.query(
      `ALTER TABLE "documents" DROP COLUMN IF EXISTS "verification_status"`,
    );
    await queryRunner.query(
      `DROP TYPE IF EXISTS "documents_verification_status_enum"`,
    );
  }
}
