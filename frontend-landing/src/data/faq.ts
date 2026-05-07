export interface FAQEntry {
  question: string;
  answer: string;
}

export const faq: FAQEntry[] = [
  {
    question: 'Puis-je migrer mes données depuis Excel ?',
    answer:
      'Oui. Importez votre liste de véhicules en CSV en quelques secondes. Vous pouvez aussi simplement saisir les immatriculations : les fiches se remplissent automatiquement.',
  },
  {
    question: 'Combien de véhicules puis-je gérer ?',
    answer:
      'De 1 à illimité selon votre plan. Starter va jusqu\'à 3, Pro jusqu\'à 10, Business jusqu\'à 50, Enterprise sans limite.',
  },
  {
    question: 'Comment se connectent les partenaires (garages, assureurs) ?',
    answer:
      "Les partenaires ont leur propre espace sur partner.flotteq.fr : ils gèrent leur agenda, reçoivent vos demandes de devis et sont payés via Stripe Connect.",
  },
  {
    question: 'La marketplace est-elle obligatoire ?',
    answer: 'Non. Vous pouvez utiliser FlotteQ uniquement pour la gestion interne. La marketplace est un service complémentaire.',
  },
  {
    question: 'Comment je résilie ?',
    answer:
      'En 1 clic depuis votre espace, sans engagement et sans pénalité. Vos données restent exportables 30 jours après la résiliation.',
  },
  {
    question: 'Mes données sont-elles vraiment protégées (RGPD) ?',
    answer:
      'Oui. Hébergement OVH Gravelines (France), chiffrement TLS 1.3, accès strictement contrôlé, exports utilisateurs disponibles à tout moment.',
  },
  {
    question: 'Y a-t-il une app mobile ?',
    answer:
      'L\'interface est entièrement responsive et fonctionne parfaitement sur mobile. Une app native iOS/Android est dans la roadmap.',
  },
  {
    question: 'Comment fonctionne le support ?',
    answer:
      'Email pour tous les plans, support prioritaire pour Business et Enterprise, account manager dédié pour Enterprise.',
  },
];
