import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCustomStorageQuotaToTenants1759606873842
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Ajouter colonne pour quota personnalisé (NULL = utilise le quota du plan)
    await queryRunner.query(`
            ALTER TABLE "tenants"
            ADD COLUMN "custom_storage_quota_mb" INTEGER NULL
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "tenants"
            DROP COLUMN "custom_storage_quota_mb"
        `);
  }
}
