export interface SeedCredentials {
  superAdminPassword: string;
  demoPassword: string;
}

const SECURE_PASSWORD =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{12,}$/;

export function assertSeedingAllowed(
  environment: NodeJS.ProcessEnv = process.env,
): void {
  if (environment.NODE_ENV === 'production') {
    throw new Error('Cannot seed database in production');
  }
}

export function requireSeedPassword(
  variableName: string,
  environment: NodeJS.ProcessEnv = process.env,
): string {
  const password = environment[variableName];
  if (!password) {
    throw new Error(`${variableName} est requis pour exécuter le seed`);
  }
  if (!SECURE_PASSWORD.test(password)) {
    throw new Error(
      `${variableName} doit contenir au moins 12 caractères, une minuscule, une majuscule, un chiffre et un caractère spécial`,
    );
  }
  return password;
}

export function getSeedCredentials(
  environment: NodeJS.ProcessEnv = process.env,
): SeedCredentials {
  assertSeedingAllowed(environment);
  return {
    superAdminPassword: requireSeedPassword(
      'SEED_SUPER_ADMIN_PASSWORD',
      environment,
    ),
    demoPassword: requireSeedPassword('SEED_DEMO_PASSWORD', environment),
  };
}
