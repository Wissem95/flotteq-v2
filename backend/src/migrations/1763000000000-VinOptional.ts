import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Rend le VIN du véhicule optionnel (nullable).
 * En Postgres, la contrainte UNIQUE existante autorise plusieurs NULL,
 * donc plusieurs véhicules sans VIN ne posent pas de conflit.
 */
export class VinOptional1763000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "vehicles" ALTER COLUMN "vin" DROP NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Attention : échouera s'il existe des véhicules avec vin NULL.
    await queryRunner.query(
      `ALTER TABLE "vehicles" ALTER COLUMN "vin" SET NOT NULL`,
    );
  }
}
