/**
 * Application-wide constants
 */

export const PAGINATION = {
  DRIVERS_PER_PAGE: 12,
  VEHICLES_PER_PAGE: 12,
  DEFAULT_PAGE: 1,
} as const;

export const FILE_UPLOAD = {
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  MAX_FILES_PER_UPLOAD: 10,
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
  ALLOWED_DOCUMENT_TYPES: ['application/pdf', 'image/jpeg', 'image/png'],
} as const;

export const API = {
  BASE_URL: import.meta.env.VITE_API_BASE || 'http://localhost:3000',
  TIMEOUT: 30000, // 30 seconds
} as const;
