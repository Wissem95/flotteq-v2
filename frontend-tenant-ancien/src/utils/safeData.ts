// Utilitaires pour l'accès sécurisé aux données API
// Prévention des erreurs "undefined is not an object (evaluating 'e.length')"

/**
 * Retourne un tableau sécurisé, jamais null ou undefined
 */
export function safeArray<T>(data: T[] | null | undefined): T[] {
  return Array.isArray(data) ? data : [];
}

/**
 * Retourne la longueur sécurisée d'un tableau
 */
export function safeLength(data: any[] | null | undefined): number {
  return Array.isArray(data) ? data.length : 0;
}

/**
 * Filtre sécurisé sur un tableau
 */
export function safeFilter<T>(data: T[] | null | undefined, predicate: (item: T) => boolean): T[] {
  return Array.isArray(data) ? data.filter(predicate) : [];
}

/**
 * Map sécurisé sur un tableau
 */
export function safeMap<T, R>(data: T[] | null | undefined, mapper: (item: T) => R): R[] {
  return Array.isArray(data) ? data.map(mapper) : [];
}

/**
 * Calcul de pourcentage sécurisé avec protection division par zéro
 */
export function safePercentage(numerator: number, denominator: number): number {
  if (!denominator || denominator === 0) return 0;
  return Math.round((numerator / denominator) * 100);
}

/**
 * Valeur numérique sécurisée avec fallback
 */
export function safeNumber(value: number | null | undefined, fallback: number = 0): number {
  return typeof value === 'number' && !isNaN(value) ? value : fallback;
}

/**
 * Vérifie si une valeur est un tableau valide et non vide
 */
export function isValidArray<T>(data: T[] | null | undefined): data is T[] {
  return Array.isArray(data) && data.length > 0;
}

/**
 * Accès sécurisé à une propriété d'objet avec fallback
 */
export function safeProp<T>(obj: any, key: string, fallback: T): T {
  return obj && typeof obj === 'object' && obj[key] !== undefined ? obj[key] : fallback;
}