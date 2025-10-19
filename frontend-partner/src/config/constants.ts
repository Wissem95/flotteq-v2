/**
 * Application-wide constants for partner frontend
 */

export const FILE_UPLOAD = {
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  MAX_FILES_PER_UPLOAD: 10,
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
  ALLOWED_DOCUMENT_TYPES: ['application/pdf', 'image/jpeg', 'image/png'],
} as const;

export const VALIDATION_RULES = {
  SIRET: {
    LENGTH: 14,
    PATTERN: /^\d{14}$/,
    MESSAGE: 'Le SIRET doit contenir exactement 14 chiffres',
  },
  PASSWORD: {
    MIN_LENGTH: 8,
    MAX_LENGTH: 50,
    PATTERN: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
    MESSAGE: 'Le mot de passe doit contenir au moins 8 caractères, 1 majuscule, 1 minuscule, 1 chiffre et 1 caractère spécial (@$!%*?&)',
  },
  POSTAL_CODE: {
    LENGTH: 5,
    PATTERN: /^\d{5}$/,
    MESSAGE: 'Le code postal doit contenir exactement 5 chiffres',
  },
  PHONE: {
    PATTERN: /^\+?[1-9]\d{1,14}$/,
    MESSAGE: 'Format de téléphone invalide',
  },
} as const;

export const PARTNER_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  SUSPENDED: 'suspended',
} as const;

export const PARTNER_SUPPORT = {
  EMAIL: 'support@flotteq.com',
  PHONE: '+33 1 23 45 67 89',
  APPROVAL_DELAY: '24-48 heures',
} as const;
