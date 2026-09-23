import { MigrationInterface, QueryRunner } from 'typeorm';

/** Garantit la valeur active des comptes historiques incomplets avant NOT NULL. */
export class RequireUserActiveFlag1763000900000 implements MigrationInterface {
  name = 'RequireUserActiveFlag1763000900000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      UPDATE "users" SET "is_active" = true WHERE "is_active" IS NULL
    `);
    await queryRunner.query(`
      ALTER TABLE "users"
      ALTER COLUMN "is_active" SET DEFAULT true,
      ALTER COLUMN "is_active" SET NOT NULL
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {
    // No-op afin de ne pas réintroduire de comptes d'état nullable après rollback.
  }
}
