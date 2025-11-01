/**
 * Traduit les messages d'erreur de l'API anglais vers le français
 */
export const translateErrorMessage = (message: string): string => {
  if (!message) return 'Une erreur est survenue';

  const translations: Record<string, string> = {
    // Erreurs véhicules
    'Vehicle is already assigned to another driver':
      'Ce véhicule est déjà assigné à un autre conducteur',
    'Vehicle with ID': 'Véhicule introuvable',
    'not found': 'introuvable',

    // Erreurs conducteurs
    'Driver license is expired': 'Le permis de conduire de ce conducteur est expiré',
    'Driver must be active to be assigned to a vehicle':
      'Le conducteur doit être actif pour se voir assigner un véhicule',
    'Driver with ID': 'Conducteur introuvable',
    'Cannot delete driver with': 'Impossible de supprimer ce conducteur car',
    'assigned vehicle(s)': 'véhicule(s) assigné(s)',

    // Erreurs génériques
    'Invalid credentials': 'Identifiants invalides',
    'Unauthorized': 'Non autorisé',
    'Forbidden': 'Accès interdit',
    'Bad Request': 'Requête invalide',
    'Internal Server Error': 'Erreur serveur interne',
  };

  // Chercher une correspondance
  let translatedMessage = message;

  for (const [en, fr] of Object.entries(translations)) {
    if (message.includes(en)) {
      translatedMessage = translatedMessage.replace(en, fr);
    }
  }

  return translatedMessage;
};

/**
 * Extrait le message d'erreur d'une erreur Axios
 */
export const getErrorMessage = (error: any): string => {
  // Cas 1: Message dans response.data.message (format NestJS)
  if (error?.response?.data?.message) {
    return translateErrorMessage(error.response.data.message);
  }

  // Cas 2: Message direct dans error.message
  if (error?.message) {
    return translateErrorMessage(error.message);
  }

  // Cas 3: Erreur réseau
  if (error?.code === 'ECONNABORTED' || error?.code === 'ENOTFOUND') {
    return 'Impossible de contacter le serveur';
  }

  // Cas 4: Timeout
  if (error?.code === 'ETIMEDOUT') {
    return 'La requête a expiré, veuillez réessayer';
  }

  // Cas par défaut
  return 'Une erreur est survenue';
};
