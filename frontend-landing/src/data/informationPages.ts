export type InformationSection = {
  title: string;
  paragraphs: string[];
  link?: { href: string; label: string };
};

export type InformationPage = {
  path: string;
  title: string;
  summary: string;
  sections: InformationSection[];
};

export const INFORMATION_PAGES: InformationPage[] = [
  {
    path: '/mentions-legales',
    title: 'Mentions légales',
    summary: 'Informations sur l’éditeur et l’hébergement de FlotteQ.',
    sections: [
      {
        title: 'Éditeur',
        paragraphs: [
          'FlotteQ est une solution de gestion de flotte éditée par BELPRE LOCATION, société par actions simplifiée unipersonnelle au capital de 1 000 euros.',
          'Siège social : 5 rue Berthie Albrecht, 95210 Saint-Gratien. SIREN : 952 175 529. SIRET : 952 175 529 00017. RCS Pontoise : 952 175 529. Numéro de TVA intracommunautaire : FR80952175529.',
          'Directeur de la publication : Sylvain Prenol. Contact : support@flotteq.fr.',
        ],
      },
      {
        title: 'Hébergement',
        paragraphs: [
          'Les services FlotteQ sont hébergés chez OVH SAS, 2 rue Kellermann, 59100 Roubaix, France.',
        ],
        link: { href: 'https://www.ovhcloud.com/fr/', label: 'Site d’OVHcloud' },
      },
      {
        title: 'Propriété intellectuelle',
        paragraphs: [
          'Les éléments du site et du service, notamment les marques, textes, visuels, interfaces et logiciels, sont protégés. Toute reproduction ou exploitation non autorisée est interdite.',
        ],
      },
    ],
  },
  {
    path: '/cgu',
    title: 'Conditions générales d’utilisation',
    summary: 'Règles d’accès et d’utilisation de la plateforme FlotteQ.',
    sections: [
      {
        title: 'Objet et accès',
        paragraphs: [
          'Les présentes conditions encadrent l’utilisation de FlotteQ par les particuliers, professionnels, conducteurs et partenaires disposant d’un compte autorisé.',
          'L’utilisateur fournit des informations exactes, garde ses identifiants confidentiels et informe FlotteQ sans délai de tout accès non autorisé suspecté.',
        ],
      },
      {
        title: 'Compte et usages autorisés',
        paragraphs: [
          'Chaque compte est personnel. L’utilisateur ne doit pas contourner les droits d’accès, perturber le service, importer de contenu illicite ou utiliser FlotteQ à des fins frauduleuses.',
          'Les données saisies dans la plateforme restent sous la responsabilité de l’organisation ou de l’utilisateur qui les renseigne. Les administrateurs d’une organisation gèrent les droits de leurs membres.',
        ],
      },
      {
        title: 'Évolutions et disponibilité',
        paragraphs: [
          'FlotteQ peut faire évoluer le service pour des raisons techniques, de sécurité ou d’amélioration fonctionnelle. Les opérations de maintenance peuvent entraîner une indisponibilité temporaire.',
          'Toute utilisation de FlotteQ implique l’acceptation de ces conditions et de la politique de confidentialité.',
        ],
      },
    ],
  },
  {
    path: '/cgv',
    title: 'Conditions générales de vente',
    summary: 'Conditions applicables aux abonnements FlotteQ.',
    sections: [
      {
        title: 'Offres et prix',
        paragraphs: [
          'Les abonnements FlotteQ sont proposés notamment en offre Pro à 29 euros TTC par mois et Business à 79 euros TTC par mois. Les caractéristiques et le prix applicables sont ceux affichés avant la validation du paiement.',
          'BELPRE LOCATION facture les abonnements. Le paiement et les factures sont gérés par Stripe. Les moyens de paiement disponibles sont affichés par Stripe au moment du règlement.',
        ],
      },
      {
        title: 'Souscription, renouvellement et résiliation',
        paragraphs: [
          'L’abonnement débute après confirmation du paiement ou selon les conditions de l’essai éventuellement proposé. Il se renouvelle à chaque période de facturation jusqu’à sa résiliation.',
          'Le client peut gérer son offre, ses moyens de paiement, ses factures et la résiliation depuis le portail de facturation Stripe accessible depuis son espace FlotteQ. Une résiliation prend effet selon les informations affichées dans ce portail.',
        ],
      },
      {
        title: 'Particuliers et accès immédiat',
        paragraphs: [
          'Un particulier peut demander l’accès immédiat à FlotteQ avant la fin du délai légal de rétractation. Cette demande est recueillie distinctement avant le paiement et conservée avec la version des documents acceptés.',
          'Les droits de rétractation, de remboursement et les éventuelles exceptions sont appliqués conformément au droit impératif applicable. Ils ne sont pas réduits par une clause contraire.',
        ],
      },
      {
        title: 'Formulaire de rétractation',
        paragraphs: [
          'Pour exercer son droit de rétractation lorsqu’il s’applique, le consommateur peut adresser à BELPRE LOCATION, 5 rue Berthie Albrecht, 95210 Saint-Gratien, ou à support@flotteq.fr, une déclaration dénuée d’ambiguïté exprimant sa décision de se rétracter.',
          'Modèle : « À l’attention de BELPRE LOCATION, je vous notifie par la présente ma rétractation du contrat portant sur l’abonnement FlotteQ souscrit le [date], pour le compte associé à [adresse e-mail]. Nom : [nom]. Adresse : [adresse]. Date : [date]. Signature, uniquement en cas d’envoi sur papier : [signature]. »',
        ],
      },
      {
        title: 'Assistance et litiges',
        paragraphs: [
          'Pour toute question de facturation ou réclamation, contactez support@flotteq.fr en précisant l’adresse e-mail du compte et, si disponible, la référence de facture.',
          'Pour les consommateurs, les droits et voies de recours prévus par la loi restent applicables. Les professionnels et BELPRE LOCATION recherchent d’abord une résolution amiable de tout différend.',
        ],
      },
    ],
  },
  {
    path: '/rgpd',
    title: 'Politique de confidentialité',
    summary: 'Comment FlotteQ traite les données personnelles nécessaires au service.',
    sections: [
      {
        title: 'Responsable du traitement',
        paragraphs: [
          'BELPRE LOCATION est responsable du traitement des données personnelles traitées pour fournir FlotteQ. Pour toute question ou exercice de droits, écrivez à support@flotteq.fr avec l’objet « Données personnelles ».',
        ],
      },
      {
        title: 'Données et finalités',
        paragraphs: [
          'FlotteQ traite les données de compte et de contact, les données nécessaires à la gestion de flotte renseignées par les utilisateurs, les données de facturation et les données techniques de sécurité.',
          'Ces traitements servent à créer et administrer les comptes, fournir les fonctionnalités souscrites, assurer le support, prévenir les abus, respecter les obligations légales et gérer la facturation.',
        ],
      },
      {
        title: 'Destinataires et conservation',
        paragraphs: [
          'Les données sont accessibles aux personnes autorisées de BELPRE LOCATION, à l’organisation cliente qui administre son espace et aux sous-traitants nécessaires au fonctionnement du service, dans la limite de leurs missions.',
          'Les données sont conservées pendant la durée nécessaire à la fourniture du service, puis selon les durées légales applicables, notamment pour les documents de facturation. Les données sont supprimées ou anonymisées lorsqu’elles ne sont plus nécessaires, sous réserve des obligations de conservation.',
        ],
      },
      {
        title: 'Vos droits',
        paragraphs: [
          'Vous pouvez demander l’accès, la rectification, l’effacement, la limitation, l’opposition ou la portabilité de vos données lorsque ces droits s’appliquent. Une pièce permettant de vérifier votre identité peut être demandée en cas de doute raisonnable.',
          'Vous pouvez également introduire une réclamation auprès de la CNIL.',
        ],
        link: { href: 'https://www.cnil.fr/', label: 'Site de la CNIL' },
      },
    ],
  },
  {
    path: '/cookies',
    title: 'Politique de cookies',
    summary: 'Informations sur les traceurs utilisés par les services FlotteQ.',
    sections: [
      {
        title: 'Cookies nécessaires',
        paragraphs: [
          'FlotteQ peut utiliser des traceurs strictement nécessaires au fonctionnement, à la sécurité et au maintien d’une session authentifiée. Ils ne servent pas à la publicité ciblée.',
        ],
      },
      {
        title: 'Cookies optionnels',
        paragraphs: [
          'Si des traceurs optionnels, notamment de mesure d’audience, sont ajoutés, FlotteQ demandera votre choix avant leur dépôt lorsque la loi l’exige. Vous pourrez modifier ce choix depuis les réglages proposés sur le site.',
        ],
      },
      {
        title: 'Gérer les traceurs',
        paragraphs: [
          'Vous pouvez aussi supprimer ou bloquer les cookies depuis les paramètres de votre navigateur. Le blocage de certains traceurs nécessaires peut dégrader le fonctionnement du service.',
        ],
      },
    ],
  },
  {
    path: '/securite',
    title: 'Sécurité',
    summary: 'Principes de sécurité appliqués à FlotteQ.',
    sections: [
      {
        title: 'Protection des accès',
        paragraphs: [
          'L’accès à FlotteQ repose sur des comptes individuels, des rôles et des contrôles d’autorisation. Les utilisateurs doivent choisir un mot de passe robuste et ne jamais partager leurs identifiants.',
        ],
      },
      {
        title: 'Signalement',
        paragraphs: [
          'Pour signaler une vulnérabilité ou un incident de sécurité, contactez support@flotteq.fr avec l’objet « Signalement sécurité ». Évitez d’inclure des données personnelles inutiles dans votre message.',
        ],
      },
      {
        title: 'Transparence',
        paragraphs: [
          'Cette page décrit des principes opérationnels. FlotteQ ne revendique aucune certification ou niveau de disponibilité qui ne serait pas explicitement publié.',
        ],
      },
    ],
  },
  {
    path: '/statut',
    title: 'Statut du service',
    summary: 'Suivi de la disponibilité technique communiquée par FlotteQ.',
    sections: [
      {
        title: 'Vérification technique',
        paragraphs: [
          'L’état technique de l’API est disponible via le point de contrôle public. Cette information concerne l’API et ne constitue pas une garantie de disponibilité de chaque fonctionnalité.',
        ],
        link: { href: 'https://api.flotteq.fr/api/health', label: 'Voir l’état technique de l’API' },
      },
      {
        title: 'Incident',
        paragraphs: [
          'Si vous rencontrez une anomalie, contactez support@flotteq.fr avec une description, l’heure approximative et, si possible, une capture d’écran. Les informations de compte ne doivent pas être partagées publiquement.',
        ],
      },
    ],
  },
  {
    path: '/documentation',
    title: 'Documentation',
    summary: 'Repères pour démarrer avec FlotteQ.',
    sections: [
      {
        title: 'Démarrer',
        paragraphs: [
          'Créez votre compte, choisissez une offre, puis complétez les informations de votre organisation. Vous pouvez ensuite ajouter vos véhicules, conducteurs et documents selon les droits de votre compte.',
        ],
      },
      {
        title: 'Gérer votre abonnement',
        paragraphs: [
          'Depuis votre espace, le portail de facturation permet de consulter les factures, mettre à jour le moyen de paiement, changer d’offre ou résilier selon les options applicables à votre abonnement.',
        ],
      },
      {
        title: 'Besoin d’aide',
        paragraphs: [
          'Consultez la FAQ du site ou écrivez à support@flotteq.fr. Pour accélérer le traitement, indiquez l’adresse e-mail de votre compte et décrivez le résultat attendu.',
        ],
      },
    ],
  },
];

export function getInformationPage(pathname: string): InformationPage | undefined {
  const normalizedPath = pathname.replace(/\/+$/, '') || '/';
  return INFORMATION_PAGES.find((page) => page.path === normalizedPath);
}
