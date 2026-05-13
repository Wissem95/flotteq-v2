import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPartnerUserResetPasswordFields1762000000000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "partner_users" ADD COLUMN IF NOT EXISTS "reset_password_token" character varying DEFAULT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "partner_users" ADD COLUMN IF NOT EXISTS "reset_password_expires" TIMESTAMP DEFAULT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "partner_users" DROP COLUMN IF EXISTS "reset_password_expires"`,
    );
    await queryRunner.query(
      `ALTER TABLE "partner_users" DROP COLUMN IF EXISTS "reset_password_token"`,
    );
  }
}
