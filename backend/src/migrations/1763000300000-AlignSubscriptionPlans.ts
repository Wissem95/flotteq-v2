import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Aligne les plans d'abonnement sur la grille de la landing flotteq.fr (#pricing) :
 *   Starter (Gratuit, 3 véh) · Pro 29€ (10 véh) · Business 79€ (50 véh) · Enterprise (sur devis, illimité).
 *
 * Construite à partir de l'ÉTAT RÉEL de la base de production :
 *   Starter 37€ · Business 99€ · Enterprise 299€ · Standard 49.99€ · Freemium 0€
 * (chaque plan payant ayant déjà un stripePriceId lié à l'ANCIEN prix).
 *
 * SÉCURITÉ FACTURATION : pour chaque plan dont le prix change, on remet stripePriceId
 * à NULL. Sinon un nouveau client verrait le nouveau prix affiché mais serait facturé
 * l'ancien prix Stripe. Les bons prix Stripe doivent être (re)créés ensuite via
 * `ts-node src/scripts/sync-stripe-plans.ts` (qui ne crée un prix que si stripePriceId
 * est vide et price > 0).
 *
 * Les abonnements existants ne sont pas impactés : leur abonnement Stripe conserve son
 * propre prix ; plan.stripePriceId ne sert qu'aux NOUVELLES souscriptions.
 *
 * Ordre des renommages important ("name" est UNIQUE) : on renomme l'ancien "Starter"
 * en "Pro" AVANT de renommer "Freemium" en "Starter".
 */
export class AlignSubscriptionPlans1763000300000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1) "Standard" (49.99€) : hors grille → désactivé (conservé pour les abonnements existants)
    await queryRunner.query(`
      UPDATE "subscription_plans" SET "isActive" = false WHERE "name" = 'Standard'
    `);

    // 2) Ancien "Starter" (37€) -> "Pro" (29€, 10 véhicules). Prix changé -> stripePriceId à recréer.
    await queryRunner.query(`
      UPDATE "subscription_plans"
      SET "name" = 'Pro', "price" = 29, "maxVehicles" = 10, "maxUsers" = 5, "maxDrivers" = 10,
          "isActive" = true, "stripePriceId" = NULL
      WHERE "name" = 'Starter'
    `);

    // 3) "Freemium" (0€) -> "Starter" (Gratuit, 3 véhicules)
    await queryRunner.query(`
      UPDATE "subscription_plans"
      SET "name" = 'Starter', "price" = 0, "maxVehicles" = 3, "maxUsers" = 2, "maxDrivers" = 3,
          "isActive" = true
      WHERE "name" = 'Freemium'
    `);

    // 4) "Business" : 99€ -> 79€ (limites inchangées). Prix changé -> stripePriceId à recréer.
    await queryRunner.query(`
      UPDATE "subscription_plans"
      SET "price" = 79, "isActive" = true, "stripePriceId" = NULL
      WHERE "name" = 'Business'
    `);

    // 5) "Enterprise" : 299€ -> 0 (sur devis). Pas de self-service -> stripePriceId à NULL.
    await queryRunner.query(`
      UPDATE "subscription_plans"
      SET "price" = 0, "isActive" = true, "stripePriceId" = NULL
      WHERE "name" = 'Enterprise'
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Restauration best-effort des prix/limites/noms.
    // ATTENTION : les anciens stripePriceId mis à NULL ne sont PAS restaurés (à reconfigurer si besoin).
    await queryRunner.query(`
      UPDATE "subscription_plans" SET "price" = 299 WHERE "name" = 'Enterprise'
    `);
    await queryRunner.query(`
      UPDATE "subscription_plans" SET "price" = 99 WHERE "name" = 'Business'
    `);
    await queryRunner.query(`
      UPDATE "subscription_plans"
      SET "name" = 'Freemium', "price" = 0, "maxVehicles" = 2, "maxUsers" = 2, "maxDrivers" = 2
      WHERE "name" = 'Starter'
    `);
    await queryRunner.query(`
      UPDATE "subscription_plans"
      SET "name" = 'Starter', "price" = 37, "maxVehicles" = 3, "maxUsers" = 5, "maxDrivers" = 10
      WHERE "name" = 'Pro'
    `);
    await queryRunner.query(`
      UPDATE "subscription_plans" SET "isActive" = true WHERE "name" = 'Standard'
    `);
  }
}
