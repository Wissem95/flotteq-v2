import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddProfilePhotoToDrivers1760950000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'drivers',
      new TableColumn({
        name: 'profile_photo_url',
        type: 'varchar',
        length: '500',
        isNullable: true,
      }),
    );

    await queryRunner.addColumn(
      'drivers',
      new TableColumn({
        name: 'profile_photo_thumbnail',
        type: 'varchar',
        length: '500',
        isNullable: true,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('drivers', 'profile_photo_thumbnail');
    await queryRunner.dropColumn('drivers', 'profile_photo_url');
  }
}
