import { AppDataSource } from '../config/migration.config';
import { User } from '../entities/user.entity';
import { rotateSuperAdminPassword } from './super-admin-rotation';

async function main(): Promise<void> {
  const email = process.env.SUPER_ADMIN_EMAIL;
  const newPassword = process.env.SUPER_ADMIN_NEW_PASSWORD;
  if (!email || !newPassword) {
    throw new Error(
      'SUPER_ADMIN_EMAIL et SUPER_ADMIN_NEW_PASSWORD sont requis',
    );
  }

  await AppDataSource.initialize();
  try {
    const result = await rotateSuperAdminPassword(
      AppDataSource.getRepository(User),
      email,
      newPassword,
    );
    console.log(
      `Rotation appliquée pour ${result.email}; renouvellement de session invalidé.`,
    );
  } finally {
    await AppDataSource.destroy();
  }
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : 'Erreur inconnue';
  console.error(`Rotation impossible : ${message}`);
  process.exitCode = 1;
});
