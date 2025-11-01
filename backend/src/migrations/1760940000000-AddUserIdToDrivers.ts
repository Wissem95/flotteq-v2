import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUserIdToDrivers1760940000000 implements MigrationInterface {
  name = 'AddUserIdToDrivers1760940000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add user_id column to drivers table (nullable for transition)
    await queryRunner.query(`
      ALTER TABLE "drivers"
      ADD COLUMN "user_id" uuid NULL
    `);

    // Add unique constraint on user_id
    await queryRunner.query(`
      CREATE UNIQUE INDEX "IDX_drivers_user_id"
      ON "drivers" ("user_id")
      WHERE "user_id" IS NOT NULL
    `);

    // Add foreign key constraint with CASCADE delete
    await queryRunner.query(`
      ALTER TABLE "drivers"
      ADD CONSTRAINT "FK_drivers_user_id"
      FOREIGN KEY ("user_id")
      REFERENCES "users"("id")
      ON DELETE CASCADE
      ON UPDATE CASCADE
    `);

    console.log('✅ Migration AddUserIdToDrivers completed successfully');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop foreign key constraint
    await queryRunner.query(`
      ALTER TABLE "drivers"
      DROP CONSTRAINT IF EXISTS "FK_drivers_user_id"
    `);

    // Drop unique index
    await queryRunner.query(`
      DROP INDEX IF EXISTS "IDX_drivers_user_id"
    `);

    // Drop user_id column
    await queryRunner.query(`
      ALTER TABLE "drivers"
      DROP COLUMN IF EXISTS "user_id"
    `);

    console.log('✅ Migration AddUserIdToDrivers reverted successfully');
  }
}
