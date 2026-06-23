export type AudienceKey = 'business' | 'consumer' | 'partner' | 'driver';

export interface Audience {
  key: AudienceKey;
  label: string;
  heroSubtitle: string;
  heroImageUrl: string;
  accordionTitle: string;
  accordionImageUrl: string;
  features: string[];
  ctaLabel: string;
  ctaHref: string;
}

export const audiences: Audience[] = [
  {
    key: 'business',
    label: 'Entreprise',
    heroSubtitle:
      'Centralisez tous vos véhicules pros, vos conducteurs et vos partenaires dans un seul outil — gagnez 8h par mois sur Excel.',
    heroImageUrl: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=1200&q=80&auto=format&fit=crop',
    accordionTitle: 'Pour les entreprises avec une flotte',
    accordionImageUrl: 'https://images.unsplash.com/photo-1556761175-b413da4baf72?w=900&q=80&auto=format&fit=crop',
    features: [
      'Suivi multi-véhicules en temps réel',
      'Gestion des conducteurs et trajets',
      'Tableaux de bord coûts et budgets',
      'Conformité automatique (CT, assurance, révisions)',
    ],
    ctaLabel: "Découvrir l'offre Pro",
    ctaHref: 'https://app.flotteq.fr/register?audience=business',
  },
  {
    key: 'consumer',
    label: 'Particulier',
    heroSubtitle:
      "Oubliez le stress du contrôle technique, des révisions et de l'assurance — FlotteQ vous prévient au bon moment.",
    heroImageUrl: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=1200&q=80&auto=format&fit=crop',
    accordionTitle: 'Pour les particuliers',
    accordionImageUrl: 'https://images.unsplash.com/photo-1471444928139-48c5bf5173f8?w=900&q=80&auto=format&fit=crop',
    features: [
      'Rappels automatiques CT, révisions, assurance',
      "Carnet d'entretien numérique",
      "Réservation d'entretien en ligne",
      'Devis garage en 1 clic via la marketplace',
      'Suivi kilométrage et budget auto',
    ],
    ctaLabel: 'Commencer gratuitement',
    ctaHref: 'https://app.flotteq.fr/register?audience=consumer',
  },
  {
    key: 'partner',
    label: 'Partenaire',
    heroSubtitle:
      'Rejoignez le réseau FlotteQ : recevez des clients qualifiés, gérez vos rendez-vous et vos paiements depuis une seule app.',
    heroImageUrl: 'https://images.unsplash.com/photo-1486754735734-325b5831c3ad?w=1200&q=80&auto=format&fit=crop',
    accordionTitle: 'Pour les garages, assureurs, contrôles techniques',
    accordionImageUrl: 'https://images.unsplash.com/photo-1486006920555-c77dcf18193c?w=900&q=80&auto=format&fit=crop',
    features: [
      'Agenda de réservations en ligne',
      'Leads qualifiés depuis FlotteQ',
      'Gestion des devis et factures',
      'Paiements sécurisés via Stripe Connect',
    ],
    ctaLabel: 'Devenir partenaire',
    ctaHref: 'https://partner.flotteq.fr/register',
  },
  {
    key: 'driver',
    label: 'Conducteur',
    heroSubtitle:
      "Votre véhicule pro à portée de main : trajets, état des lieux, contact garage — tout sans paperasse.",
    heroImageUrl: 'https://images.unsplash.com/photo-1542362567-b07e54358753?w=1200&q=80&auto=format&fit=crop',
    accordionTitle: 'Pour les conducteurs en entreprise',
    accordionImageUrl: 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=900&q=80&auto=format&fit=crop',
    features: [
      'Véhicule assigné en un coup d\'œil',
      "Rapports d'état des lieux photo",
      'Planning des trajets',
      'Contact garage en 1 tap',
    ],
    ctaLabel: 'Découvrir l\'app conducteur',
    ctaHref: 'https://driver.flotteq.fr',
  },
];
