const DEFAULT_BACKEND_ORIGIN = 'http://localhost:3000';

export function getBackendOrigin(
  configuredBase = import.meta.env.VITE_API_BASE || DEFAULT_BACKEND_ORIGIN,
): string {
  return configuredBase.replace(/\/+$/, '').replace(/\/api$/, '');
}

export const BACKEND_ORIGIN = getBackendOrigin();
export const API_BASE_URL = `${BACKEND_ORIGIN}/api`;

export function resolveBackendUrl(
  resourceUrl: string,
  configuredBase = import.meta.env.VITE_API_BASE || DEFAULT_BACKEND_ORIGIN,
): string {
  if (/^https?:\/\//i.test(resourceUrl)) {
    return resourceUrl;
  }

  const origin = getBackendOrigin(configuredBase);
  const path = resourceUrl.startsWith('/') ? resourceUrl : `/${resourceUrl}`;
  return `${origin}${path}`;
}
