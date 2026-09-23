import { MigrationInterface, QueryRunner } from 'typeorm';

/** Assure le rôle applicatif sur les bases créées avant la migration initiale complète. */
export class EnsureUserRoleColumn1763000500000 implements MigrationInterface {
  name = 'EnsureUserRoleColumn1763000500000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DO $$
      BEGIN
        CREATE TYPE "users_role_enum" AS ENUM (
          'super_admin', 'support', 'tenant_admin', 'manager', 'driver', 'viewer'
        );
      EXCEPTION
        WHEN duplicate_object THEN NULL;
      END $$;
    `);
    await queryRunner.query(`
      ALTER TABLE "users"
      ADD COLUMN IF NOT EXISTS "role" "users_role_enum" NOT NULL DEFAULT 'viewer'
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {
    // Colonne conservée : elle peut préexister dans les bases déjà migrées.
  }
}
