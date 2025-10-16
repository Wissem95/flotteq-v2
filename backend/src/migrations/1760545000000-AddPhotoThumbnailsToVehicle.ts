import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPhotoThumbnailsToVehicle1760545000000 implements MigrationInterface {
  name = 'AddPhotoThumbnailsToVehicle1760545000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "vehicles"
      ADD COLUMN "photo_thumbnails" text
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "vehicles"
      DROP COLUMN "photo_thumbnails"
    `);
  }
}
