export interface Differentiator {
  iconKey: 'hub' | 'handshake' | 'hexagon';
  title: string;
  description: string;
}

export const differentiators: Differentiator[] = [
  {
    iconKey: 'hub',
    title: 'Tout-en-un',
    description:
      'Véhicules, conducteurs, partenaires et coûts : un seul outil au lieu de cinq. Plus de copier-coller, plus de tableurs perdus.',
  },
  {
    iconKey: 'handshake',
    title: 'Marketplace intégrée',
    description:
      'Garages, assureurs et contrôles techniques directement dans l\'app. Devis, réservations et paiements en quelques clics.',
  },
  {
    iconKey: 'hexagon',
    title: 'Hébergé en France',
    description:
      'Données chez OVH Gravelines, RGPD natif, équipe basée en France. Aucune donnée ne quitte l\'Union européenne.',
  },
];
