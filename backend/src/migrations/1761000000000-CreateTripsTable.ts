import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableIndex,
  TableForeignKey,
} from 'typeorm';

export class CreateTripsTable1761000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'trips',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'uuid_generate_v4()',
          },
          {
            name: 'vehicle_id',
            type: 'uuid',
          },
          {
            name: 'driver_id',
            type: 'uuid',
          },
          {
            name: 'tenant_id',
            type: 'int',
          },
          {
            name: 'status',
            type: 'enum',
            enum: ['in_progress', 'completed', 'cancelled'],
            default: "'in_progress'",
          },
          // DÉPART
          {
            name: 'start_km',
            type: 'int',
          },
          {
            name: 'start_fuel_level',
            type: 'int',
          },
          {
            name: 'start_photos',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'start_notes',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'start_defects',
            type: 'jsonb',
            isNullable: true,
          },
          {
            name: 'started_at',
            type: 'timestamp',
          },
          {
            name: 'start_location',
            type: 'jsonb',
            isNullable: true,
          },
          // RETOUR
          {
            name: 'end_km',
            type: 'int',
            isNullable: true,
          },
          {
            name: 'end_fuel_level',
            type: 'int',
            isNullable: true,
          },
          {
            name: 'end_photos',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'end_notes',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'end_defects',
            type: 'jsonb',
            isNullable: true,
          },
          {
            name: 'ended_at',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'end_location',
            type: 'jsonb',
            isNullable: true,
          },
          // CALCULÉS
          {
            name: 'distance_km',
            type: 'int',
            isNullable: true,
          },
          {
            name: 'duration_minutes',
            type: 'int',
            isNullable: true,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'now()',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'now()',
          },
        ],
      }),
      true,
    );

    // Indexes
    await queryRunner.createIndex(
      'trips',
      new TableIndex({
        name: 'IDX_trips_vehicle_id',
        columnNames: ['vehicle_id'],
      }),
    );

    await queryRunner.createIndex(
      'trips',
      new TableIndex({
        name: 'IDX_trips_driver_id',
        columnNames: ['driver_id'],
      }),
    );

    await queryRunner.createIndex(
      'trips',
      new TableIndex({
        name: 'IDX_trips_tenant_id',
        columnNames: ['tenant_id'],
      }),
    );

    await queryRunner.createIndex(
      'trips',
      new TableIndex({
        name: 'IDX_trips_status',
        columnNames: ['status'],
      }),
    );

    await queryRunner.createIndex(
      'trips',
      new TableIndex({
        name: 'IDX_trips_started_at',
        columnNames: ['started_at'],
      }),
    );

    // Foreign Keys
    await queryRunner.createForeignKey(
      'trips',
      new TableForeignKey({
        columnNames: ['vehicle_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'vehicles',
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'trips',
      new TableForeignKey({
        columnNames: ['driver_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'drivers',
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'trips',
      new TableForeignKey({
        columnNames: ['tenant_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'tenants',
        onDelete: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('trips');
  }
}
