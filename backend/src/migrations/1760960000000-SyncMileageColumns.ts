import { MigrationInterface, QueryRunner } from 'typeorm';

export class SyncMileageColumns1760960000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Cas 1 : Si mileage > 0 et current_km = 0 → copier mileage vers current_km
    await queryRunner.query(`
      UPDATE vehicles
      SET current_km = mileage
      WHERE mileage > 0 AND (current_km = 0 OR current_km IS NULL);
    `);

    // Cas 2 : Si current_km > 0 et mileage = 0 → copier current_km vers mileage
    await queryRunner.query(`
      UPDATE vehicles
      SET mileage = current_km
      WHERE current_km > 0 AND (mileage = 0 OR mileage IS NULL);
    `);

    // Cas 3 : Si les 2 sont différents (conflits) → prendre le max des deux
    await queryRunner.query(`
      UPDATE vehicles
      SET
        current_km = GREATEST(current_km, mileage),
        mileage = GREATEST(current_km, mileage)
      WHERE current_km != mileage AND current_km > 0 AND mileage > 0;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Pas de rollback nécessaire - les données sont synchronisées
  }
}
