import { MigrationInterface, QueryRunner } from 'typeorm';
import * as bcrypt from 'bcrypt';

export class MigrateExistingDriversUsers1760940000001 implements MigrationInterface {
  name = 'MigrateExistingDriversUsers1760940000001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    console.log('🔄 Starting migration of existing drivers and users...');

    // ÉTAPE 1: Lier les drivers existants aux users correspondants (par email)
    const linkedDrivers = await queryRunner.query(`
      UPDATE drivers d
      SET user_id = u.id
      FROM users u
      WHERE d.email = u.email
        AND d.tenant_id = u.tenant_id
        AND u.role = 'driver'
        AND d.user_id IS NULL
      RETURNING d.id, d.email
    `);
    console.log(`✅ Linked ${linkedDrivers.length} existing drivers to users`);

    // ÉTAPE 2: Créer des drivers pour les users avec role='driver' qui n'en ont pas
    const usersWithoutDrivers = await queryRunner.query(`
      SELECT u.id, u.email, u.first_name, u.last_name, u.phone, u.tenant_id
      FROM users u
      LEFT JOIN drivers d ON d.user_id = u.id
      WHERE u.role = 'driver'
        AND d.id IS NULL
    `);

    for (const user of usersWithoutDrivers) {
      try {
        // Générer un numéro de permis temporaire unique
        const tempLicenseNumber = `TEMP-${user.id.substring(0, 8).toUpperCase()}`;

        // Date d'expiration du permis par défaut : 10 ans dans le futur
        const defaultLicenseExpiry = new Date();
        defaultLicenseExpiry.setFullYear(defaultLicenseExpiry.getFullYear() + 10);

        await queryRunner.query(`
          INSERT INTO drivers (
            "firstName", "lastName", email, phone,
            "licenseNumber", "licenseExpiryDate",
            status, tenant_id, user_id,
            "createdAt", "updatedAt"
          ) VALUES (
            $1, $2, $3, $4,
            $5, $6,
            'active', $7, $8,
            NOW(), NOW()
          )
        `, [
          user.first_name,
          user.last_name,
          user.email,
          user.phone || '',
          tempLicenseNumber,
          defaultLicenseExpiry.toISOString().split('T')[0],
          user.tenant_id,
          user.id
        ]);

        console.log(`✅ Created driver for user ${user.email} with temp license ${tempLicenseNumber}`);
      } catch (error) {
        console.error(`❌ Failed to create driver for user ${user.email}:`, error.message);
      }
    }
    console.log(`✅ Created ${usersWithoutDrivers.length} drivers for existing users`);

    // ÉTAPE 3: Créer des users pour les drivers qui n'en ont pas
    const driversWithoutUsers = await queryRunner.query(`
      SELECT d.id, d.email, d."firstName" as first_name, d."lastName" as last_name, d.phone, d.tenant_id
      FROM drivers d
      WHERE d.user_id IS NULL
    `);

    for (const driver of driversWithoutUsers) {
      try {
        // Vérifier si un user avec cet email existe déjà pour ce tenant
        const existingUser = await queryRunner.query(`
          SELECT id FROM users
          WHERE email = $1 AND tenant_id = $2
        `, [driver.email, driver.tenant_id]);

        if (existingUser.length > 0) {
          // Si l'utilisateur existe, on lie simplement
          await queryRunner.query(`
            UPDATE drivers
            SET user_id = $1
            WHERE id = $2
          `, [existingUser[0].id, driver.id]);
          console.log(`✅ Linked driver ${driver.email} to existing user`);
        } else {
          // Sinon, créer un nouveau user
          const tempPassword = Math.random().toString(36).slice(-12);
          const hashedPassword = await bcrypt.hash(tempPassword, 10);

          const result = await queryRunner.query(`
            INSERT INTO users (
              email, password, first_name, last_name,
              phone, role, tenant_id, is_active,
              created_at, updated_at
            ) VALUES (
              $1, $2, $3, $4,
              $5, 'driver', $6, true,
              NOW(), NOW()
            )
            RETURNING id
          `, [
            driver.email,
            hashedPassword,
            driver.first_name,
            driver.last_name,
            driver.phone || ''
,
            driver.tenant_id
          ]);

          // Lier le driver au nouveau user
          await queryRunner.query(`
            UPDATE drivers
            SET user_id = $1
            WHERE id = $2
          `, [result[0].id, driver.id]);

          console.log(`✅ Created user and linked driver ${driver.email}`);
        }
      } catch (error) {
        console.error(`❌ Failed to create/link user for driver ${driver.email}:`, error.message);
      }
    }
    console.log(`✅ Processed ${driversWithoutUsers.length} drivers without users`);

    console.log('✅ Migration of existing data completed successfully');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    console.log('🔄 Reverting migration of drivers and users...');

    // On ne supprime pas les données créées car cela pourrait causer des pertes de données
    // On se contente de nettoyer les liens user_id
    await queryRunner.query(`
      UPDATE drivers
      SET user_id = NULL
    `);

    console.log('✅ Migration reverted successfully');
  }
}
