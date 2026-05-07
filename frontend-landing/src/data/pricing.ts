export interface Plan {
  key: 'starter' | 'pro' | 'business' | 'enterprise';
  name: string;
  priceLabel: string;
  priceSuffix?: string;
  description: string;
  features: string[];
  ctaLabel: string;
  ctaHref: string;
  highlight?: boolean;
}

// Prices below are placeholders to validate against the live Stripe dashboard before ship.
// See spec §4.7 open question. Backend seeds: backend/src/seeds/seed.ts
export const plans: Plan[] = [
  {
    key: 'starter',
    name: 'Starter',
    priceLabel: 'Gratuit',
    description: 'Pour démarrer ou pour les particuliers avec 1 à 3 véhicules.',
    features: ['Jusqu\'à 3 véhicules', 'Rappels d\'entretien', 'Marketplace en lecture', 'Support communautaire'],
    ctaLabel: 'Commencer',
    ctaHref: 'https://app.flotteq.fr/register?plan=starter',
  },
  {
    key: 'pro',
    name: 'Pro',
    priceLabel: '29 €',
    priceSuffix: '/mois',
    description: 'Pour les TPE et les particuliers exigeants.',
    features: ['Jusqu\'à 10 véhicules', 'Toutes les features Starter', 'Réservations marketplace', 'Support email 48h'],
    ctaLabel: 'Choisir Pro',
    ctaHref: 'https://app.flotteq.fr/register?plan=pro',
    highlight: true,
  },
  {
    key: 'business',
    name: 'Business',
    priceLabel: '79 €',
    priceSuffix: '/mois',
    description: 'Pour les PME multi-conducteurs.',
    features: ['Jusqu\'à 50 véhicules', 'Multi-utilisateurs', 'Reporting avancé', 'Support prioritaire 24h'],
    ctaLabel: 'Choisir Business',
    ctaHref: 'https://app.flotteq.fr/register?plan=business',
  },
  {
    key: 'enterprise',
    name: 'Enterprise',
    priceLabel: 'Sur devis',
    description: 'Pour les flottes >50 véhicules avec besoins spécifiques.',
    features: ['Véhicules illimités', 'SLA personnalisé', 'Intégrations sur mesure', 'Account manager dédié'],
    ctaLabel: 'Nous contacter',
    ctaHref: 'mailto:contact@flotteq.fr?subject=Demande%20Enterprise',
  },
];
