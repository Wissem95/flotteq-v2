const DEFAULT_ADMIN_PASSWORD = 'umami';
const WEBSITE_DOMAIN = 'flotteq.fr';
const WEBSITE_NAME = 'FlotteQ';

async function login(baseUrl, password, fetchImpl) {
  const response = await fetchImpl(`${baseUrl}/api/auth/login`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ username: 'admin', password }),
  });

  if (response.status === 401) {
    return null;
  }

  if (!response.ok) {
    throw new Error(`Connexion Umami impossible, HTTP ${response.status}`);
  }

  return response.json();
}

async function secureInitialAdmin(baseUrl, adminPassword, fetchImpl) {
  const securedSession = await login(baseUrl, adminPassword, fetchImpl);
  if (securedSession) {
    return securedSession;
  }

  const initialSession = await login(
    baseUrl,
    DEFAULT_ADMIN_PASSWORD,
    fetchImpl,
  );
  if (!initialSession) {
    throw new Error(
      "Le compte Umami n'accepte ni le mot de passe configuré ni le mot de passe initial.",
    );
  }

  const update = await fetchImpl(
    `${baseUrl}/api/users/${initialSession.user.id}`,
    {
      method: 'POST',
      headers: {
        authorization: `Bearer ${initialSession.token}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        password: adminPassword,
        role: initialSession.user.role,
        username: initialSession.user.username,
      }),
    },
  );

  if (!update.ok) {
    throw new Error(
      `Sécurisation du compte Umami impossible, HTTP ${update.status}`,
    );
  }

  const verifiedSession = await login(baseUrl, adminPassword, fetchImpl);
  if (!verifiedSession) {
    throw new Error("Le nouveau mot de passe Umami n'a pas pu être vérifié.");
  }

  return verifiedSession;
}

async function ensureWebsite(baseUrl, token, fetchImpl) {
  const list = await fetchImpl(`${baseUrl}/api/websites`, {
    headers: { authorization: `Bearer ${token}` },
  });

  if (!list.ok) {
    throw new Error(`Lecture des sites Umami impossible, HTTP ${list.status}`);
  }

  const payload = await list.json();
  const websites = Array.isArray(payload) ? payload : payload.data || [];
  const existing = websites.find((website) => website.domain === WEBSITE_DOMAIN);
  if (existing) {
    return existing.id;
  }

  const create = await fetchImpl(`${baseUrl}/api/websites`, {
    method: 'POST',
    headers: {
      authorization: `Bearer ${token}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify({ name: WEBSITE_NAME, domain: WEBSITE_DOMAIN }),
  });

  if (!create.ok) {
    throw new Error(`Création du site Umami impossible, HTTP ${create.status}`);
  }

  return (await create.json()).id;
}

export async function bootstrapUmami({
  baseUrl = 'http://127.0.0.1:3000',
  adminPassword,
  fetchImpl = fetch,
}) {
  if (!adminPassword || adminPassword.length < 20) {
    throw new Error('UMAMI_ADMIN_PASSWORD doit contenir au moins 20 caractères.');
  }

  const session = await secureInitialAdmin(baseUrl, adminPassword, fetchImpl);
  return ensureWebsite(baseUrl, session.token, fetchImpl);
}

if (process.env.UMAMI_BOOTSTRAP_RUN === '1') {
  const websiteId = await bootstrapUmami({
    adminPassword: process.env.UMAMI_ADMIN_PASSWORD,
  });
  process.stdout.write(websiteId);
}
