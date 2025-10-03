import { MigrationInterface, QueryRunner } from "typeorm";

export class AddPlanIdToTenants1759451549595 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Ajouter la colonne plan_id (si elle n'existe pas)
        await queryRunner.query(`
            ALTER TABLE "tenants"
            ADD COLUMN IF NOT EXISTS "plan_id" integer NULL
        `);

        // Ajouter la foreign key (si elle n'existe pas)
        const hasForeignKey = await queryRunner.query(`
            SELECT 1 FROM pg_constraint WHERE conname = 'FK_tenants_plan'
        `);

        if (!hasForeignKey || hasForeignKey.length === 0) {
            await queryRunner.query(`
                ALTER TABLE "tenants"
                ADD CONSTRAINT "FK_tenants_plan"
                FOREIGN KEY ("plan_id")
                REFERENCES "subscription_plans"("id")
                ON DELETE SET NULL
                ON UPDATE NO ACTION
            `);
        }

        // Créer des plans par défaut
        await queryRunner.query(`
            INSERT INTO "subscription_plans" (name, price, "maxVehicles", "maxUsers", "maxDrivers", "trialDays", features, "isActive")
            VALUES
                ('Essai Gratuit', 0, 10, 3, 5, 14, '{Gestion de base,Support email,10 véhicules max,3 utilisateurs max}', true),
                ('Standard', 49.99, 50, 10, 20, 0, '{Gestion complète,Support prioritaire,50 véhicules,10 utilisateurs,Export PDF,API access}', true),
                ('Premium', 99.99, -1, -1, -1, 0, '{Véhicules illimités,Utilisateurs illimités,Support 24/7,API illimitée,Rapports avancés,White label}', true)
            ON CONFLICT (name) DO NOTHING
        `);

        // Assigner le plan "Essai Gratuit" aux tenants en trial
        await queryRunner.query(`
            UPDATE "tenants"
            SET "plan_id" = (SELECT id FROM "subscription_plans" WHERE name = 'Essai Gratuit' LIMIT 1)
            WHERE "subscription_status" = 'trial'
        `);

        // Assigner le plan "Standard" aux tenants actifs
        await queryRunner.query(`
            UPDATE "tenants"
            SET "plan_id" = (SELECT id FROM "subscription_plans" WHERE name = 'Standard' LIMIT 1)
            WHERE "subscription_status" = 'active'
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Supprimer la foreign key
        await queryRunner.query(`
            ALTER TABLE "tenants"
            DROP CONSTRAINT "FK_tenants_plan"
        `);

        // Supprimer la colonne
        await queryRunner.query(`
            ALTER TABLE "tenants"
            DROP COLUMN "plan_id"
        `);
    }

}
