import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPartnerDocumentTypes1760547565000
  implements MigrationInterface
{
  name = 'AddPartnerDocumentTypes1760547565000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add new values to document_entity_type enum
    await queryRunner.query(`
      ALTER TYPE "public"."document_entity_type" ADD VALUE IF NOT EXISTS 'partner';
    `);
    await queryRunner.query(`
      ALTER TYPE "public"."document_entity_type" ADD VALUE IF NOT EXISTS 'partner_service';
    `);

    // Add new values to document_type enum
    await queryRunner.query(`
      ALTER TYPE "public"."document_type" ADD VALUE IF NOT EXISTS 'siret';
    `);
    await queryRunner.query(`
      ALTER TYPE "public"."document_type" ADD VALUE IF NOT EXISTS 'insurance_certificate';
    `);
    await queryRunner.query(`
      ALTER TYPE "public"."document_type" ADD VALUE IF NOT EXISTS 'logo';
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Note: PostgreSQL does not support removing enum values directly
    // You would need to recreate the enum type to remove values
    // For safety, this migration does not implement rollback
    // If rollback is needed, you must recreate the enum with the old values
    console.log('Warning: Rollback not implemented for enum value additions');
    console.log(
      'To rollback, you need to manually recreate the enum types without the new values',
    );
  }
}
