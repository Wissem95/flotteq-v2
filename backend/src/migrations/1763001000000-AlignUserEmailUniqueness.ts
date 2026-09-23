import { MigrationInterface, QueryRunner } from 'typeorm';

/** Aligne l'unicité des emails sur le tenant, comme le définit User. */
export class AlignUserEmailUniqueness1763001000000
  implements MigrationInterface
{
  name = 'AlignUserEmailUniqueness1763001000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // L'ancienne contrainte générée sur une base vierge n'était pas supprimée
    // par CreateUserRolesAndPermissions, qui ne connaissait qu'un autre nom.
    await queryRunner.query(`
      ALTER TABLE "users"
      DROP CONSTRAINT IF EXISTS "UQ_97672ac88f789774dd47f7c8be3"
    `);
    await queryRunner.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS "IDX_users_email_tenantId"
      ON "users" ("email", "tenant_id")
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_users_email"
      ON "users" ("email")
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {
    // Forward-only: restoring global email uniqueness can reject valid tenants.
  }
}
