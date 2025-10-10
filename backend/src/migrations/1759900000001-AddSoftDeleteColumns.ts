import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddSoftDeleteColumns1759900000001 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Ajouter colonne deleted_at à la table tenants
    await queryRunner.addColumn(
      'tenants',
      new TableColumn({
        name: 'deleted_at',
        type: 'timestamp',
        isNullable: true,
        default: null,
      }),
    );

    // Ajouter colonne deleted_at à la table users
    await queryRunner.addColumn(
      'users',
      new TableColumn({
        name: 'deleted_at',
        type: 'timestamp',
        isNullable: true,
        default: null,
      }),
    );

    // Créer index sur deleted_at pour optimiser les requêtes
    await queryRunner.query(
      `CREATE INDEX "IDX_tenants_deleted_at" ON "tenants" ("deleted_at")`,
    );

    await queryRunner.query(
      `CREATE INDEX "IDX_users_deleted_at" ON "users" ("deleted_at")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Supprimer les index
    await queryRunner.query(`DROP INDEX "IDX_users_deleted_at"`);
    await queryRunner.query(`DROP INDEX "IDX_tenants_deleted_at"`);

    // Supprimer les colonnes
    await queryRunner.dropColumn('users', 'deleted_at');
    await queryRunner.dropColumn('tenants', 'deleted_at');
  }
}
