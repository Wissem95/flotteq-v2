import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddSoftDeleteToVehiclesDrivers1759900000002
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Ajouter colonne deleted_at à la table vehicles
    await queryRunner.addColumn(
      'vehicles',
      new TableColumn({
        name: 'deleted_at',
        type: 'timestamp',
        isNullable: true,
        default: null,
      }),
    );

    // Ajouter colonne deleted_at à la table drivers
    await queryRunner.addColumn(
      'drivers',
      new TableColumn({
        name: 'deleted_at',
        type: 'timestamp',
        isNullable: true,
        default: null,
      }),
    );

    // Créer index sur deleted_at pour optimiser les requêtes
    await queryRunner.query(
      `CREATE INDEX "IDX_vehicles_deleted_at" ON "vehicles" ("deleted_at")`,
    );

    await queryRunner.query(
      `CREATE INDEX "IDX_drivers_deleted_at" ON "drivers" ("deleted_at")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Supprimer les index
    await queryRunner.query(`DROP INDEX "IDX_drivers_deleted_at"`);
    await queryRunner.query(`DROP INDEX "IDX_vehicles_deleted_at"`);

    // Supprimer les colonnes
    await queryRunner.dropColumn('drivers', 'deleted_at');
    await queryRunner.dropColumn('vehicles', 'deleted_at');
  }
}
