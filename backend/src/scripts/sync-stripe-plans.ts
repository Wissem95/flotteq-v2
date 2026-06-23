/**
 * Synchronise les plans d'abonnement FlotteQ avec Stripe.
 *
 * Pour chaque plan PAYANT (price > 0) sans stripePriceId, crée un produit + un prix
 * mensuel récurrent en EUR dans Stripe, puis enregistre stripeProductId / stripePriceId
 * en base. Les plans gratuits (Starter) et "sur devis" (Enterprise) sont ignorés.
 *
 * Idempotent : un plan déjà synchronisé (stripePriceId présent) est sauté.
 * Si le tarif d'un plan a changé, le script crée un NOUVEAU prix Stripe (les prix
 * Stripe sont immuables) et met à jour stripePriceId.
 *
 * Usage: ts-node src/scripts/sync-stripe-plans.ts
 * Requiert STRIPE_SECRET_KEY dans l'environnement.
 */

import Stripe from 'stripe';
import { DataSource } from 'typeorm';
import { join } from 'path';
import { SubscriptionPlan } from '../entities/subscription-plan.entity';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-09-30.clover' as any,
});

async function syncStripePlans() {
  if (!process.env.STRIPE_SECRET_KEY) {
    console.error('❌ STRIPE_SECRET_KEY manquant dans l\'environnement.');
    process.exit(1);
  }

  const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    // En production l'env utilise DB_USER ; on garde DB_USERNAME en repli.
    username: process.env.DB_USER || process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'flotteq123',
    database: process.env.DB_NAME || 'flotteq_dev',
    // Charger toutes les entités (Subscription référence Tenant, etc.) via glob,
    // sinon TypeORM lève "Entity metadata ... was not found".
    entities: [join(__dirname, '..', '**', '*.entity.{ts,js}')],
    synchronize: false,
  });

  await dataSource.initialize();
  console.log('✅ Base de données connectée');

  const planRepo = dataSource.getRepository(SubscriptionPlan);
  const plans = await planRepo.find({ where: { isActive: true } });

  for (const plan of plans) {
    // On ne facture via Stripe que les plans à prix > 0 (Starter gratuit + Enterprise sur devis ignorés)
    if (!plan.price || plan.price <= 0) {
      console.log(`⏭️  Plan "${plan.name}" gratuit/sur devis — ignoré`);
      continue;
    }

    if (plan.stripePriceId) {
      console.log(
        `✓ Plan "${plan.name}" déjà synchronisé (price ${plan.stripePriceId})`,
      );
      continue;
    }

    try {
      // Réutilise le produit s'il existe déjà, sinon le crée
      let productId = plan.stripeProductId;
      if (!productId) {
        const product = await stripe.products.create({
          name: `FlotteQ ${plan.name}`,
          metadata: { planId: plan.id.toString() },
        });
        productId = product.id;
      }

      const price = await stripe.prices.create({
        product: productId,
        unit_amount: Math.round(Number(plan.price) * 100), // en centimes
        currency: 'eur',
        recurring: { interval: 'month' },
        metadata: { planId: plan.id.toString() },
      });

      plan.stripeProductId = productId;
      plan.stripePriceId = price.id;
      await planRepo.save(plan);

      console.log(
        `✅ Plan "${plan.name}" → product ${productId}, price ${price.id} (${plan.price}€/mois)`,
      );
    } catch (error) {
      console.error(`❌ Échec sync plan "${plan.name}":`, error);
    }
  }

  await dataSource.destroy();
  console.log('✅ Terminé !');
}

syncStripePlans()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Erreur:', error);
    process.exit(1);
  });
