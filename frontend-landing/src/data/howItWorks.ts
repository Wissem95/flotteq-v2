export interface Step {
  number: number;
  title: string;
  description: string;
}

export const steps: Step[] = [
  {
    number: 1,
    title: 'Inscrivez-vous en 2 minutes',
    description: 'Choisissez votre profil et votre plan. Aucune carte bancaire pour commencer.',
  },
  {
    number: 2,
    title: 'Ajoutez vos véhicules',
    description:
      "Saisissez votre immatriculation : la fiche du véhicule se remplit automatiquement. Ou importez une liste depuis Excel.",
  },
  {
    number: 3,
    title: 'Pilotez et gagnez du temps',
    description:
      "Recevez les bonnes alertes au bon moment. Trouvez le bon partenaire en deux clics. Suivez vos coûts en temps réel.",
  },
];
