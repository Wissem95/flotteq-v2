import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddInvitationFields1759900000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'users',
      new TableColumn({
        name: 'invitation_token',
        type: 'varchar',
        length: '255',
        isNullable: true,
      }),
    );

    await queryRunner.addColumn(
      'users',
      new TableColumn({
        name: 'invitation_expires_at',
        type: 'timestamp',
        isNullable: true,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('users', 'invitation_expires_at');
    await queryRunner.dropColumn('users', 'invitation_token');
  }
}
