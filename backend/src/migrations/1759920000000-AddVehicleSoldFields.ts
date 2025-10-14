import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddVehicleSoldFields1759920000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Ajouter la colonne current_value
    await queryRunner.addColumn(
      'vehicles',
      new TableColumn({
        name: 'current_value',
        type: 'decimal',
        precision: 10,
        scale: 2,
        isNullable: true,
      }),
    );

    // Ajouter la colonne sold_date
    await queryRunner.addColumn(
      'vehicles',
      new TableColumn({
        name: 'sold_date',
        type: 'date',
        isNullable: true,
      }),
    );

    // Ajouter SOLD à l'enum status (si pas déjà présent)
    await queryRunner.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_enum
          WHERE enumlabel = 'sold'
          AND enumtypid = (
            SELECT oid FROM pg_type WHERE typname = 'vehicles_status_enum'
          )
        ) THEN
          ALTER TYPE vehicles_status_enum ADD VALUE 'sold';
        END IF;
      END $$;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('vehicles', 'current_value');
    await queryRunner.dropColumn('vehicles', 'sold_date');
    // Note : On ne peut pas facilement retirer une valeur d'un enum PostgreSQL
    // Une migration down devrait être faite manuellement si nécessaire
  }
}
