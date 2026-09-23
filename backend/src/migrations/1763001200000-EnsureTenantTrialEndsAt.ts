import { MigrationInterface, QueryRunner } from 'typeorm';

/** Rétablit la colonne historique utilisée par l'entité Tenant et les webhooks Stripe. */
export class EnsureTenantTrialEndsAt1763001200000
  implements MigrationInterface
{
  name = 'EnsureTenantTrialEndsAt1763001200000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "tenants"
      ADD COLUMN IF NOT EXISTS "trial_ends_at" TIMESTAMP
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {
    // Migration forward-only : supprimer cette colonne peut détruire des dates d'essai existantes.
  }
}
