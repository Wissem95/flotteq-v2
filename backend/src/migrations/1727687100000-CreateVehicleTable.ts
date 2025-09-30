import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

export class CreateVehicleTable1727687100000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'vehicles',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'registration',
            type: 'varchar',
            isUnique: true,
          },
          {
            name: 'brand',
            type: 'varchar',
          },
          {
            name: 'model',
            type: 'varchar',
          },
          {
            name: 'year',
            type: 'int',
          },
          {
            name: 'mileage',
            type: 'int',
            default: 0,
          },
          {
            name: 'status',
            type: 'enum',
            enum: ['available', 'in_use', 'maintenance', 'retired'],
            default: "'available'",
          },
          {
            name: 'vin',
            type: 'varchar',
            length: '17',
          },
          {
            name: 'color',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'purchaseDate',
            type: 'date',
            isNullable: true,
          },
          {
            name: 'purchasePrice',
            type: 'decimal',
            precision: 10,
            scale: 2,
            isNullable: true,
          },
          {
            name: 'tenant_id',
            type: 'int',
          },
          {
            name: 'assigned_driver_id',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updatedAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            onUpdate: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    // Index sur tenant_id pour les requêtes multi-tenant
    await queryRunner.createIndex(
      'vehicles',
      new TableIndex({
        name: 'IDX_VEHICLE_TENANT',
        columnNames: ['tenant_id'],
      }),
    );

    // Index composite pour garantir l'unicité de la plaque par tenant
    await queryRunner.createIndex(
      'vehicles',
      new TableIndex({
        name: 'IDX_VEHICLE_REGISTRATION_TENANT',
        columnNames: ['registration', 'tenant_id'],
        isUnique: true,
      }),
    );

    // Index composite pour garantir l'unicité du VIN par tenant
    await queryRunner.createIndex(
      'vehicles',
      new TableIndex({
        name: 'IDX_VEHICLE_VIN_TENANT',
        columnNames: ['vin', 'tenant_id'],
        isUnique: true,
      }),
    );

    // Index sur status pour les filtres
    await queryRunner.createIndex(
      'vehicles',
      new TableIndex({
        name: 'IDX_VEHICLE_STATUS',
        columnNames: ['status'],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('vehicles');
  }
}