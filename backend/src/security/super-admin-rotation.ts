import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { User, UserRole } from '../entities/user.entity';

type RotationRepository = Pick<Repository<User>, 'findOne' | 'update'>;

const SECURE_PASSWORD =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{12,}$/;

export interface SuperAdminRotationResult {
  userId: string;
  email: string;
}

export async function rotateSuperAdminPassword(
  repository: RotationRepository,
  email: string,
  newPassword: string,
): Promise<SuperAdminRotationResult> {
  if (!SECURE_PASSWORD.test(newPassword)) {
    throw new Error(
      'Le nouveau mot de passe doit contenir au moins 12 caractères, une minuscule, une majuscule, un chiffre et un caractère spécial',
    );
  }

  const normalizedEmail = email.trim().toLowerCase();
  const user = await repository.findOne({
    where: {
      email: normalizedEmail,
      role: UserRole.SUPER_ADMIN,
      isActive: true,
    },
  });
  if (!user) {
    throw new Error('Super administrateur actif introuvable');
  }

  const password = await bcrypt.hash(newPassword, 12);
  const updateResult = await repository.update(user.id, {
    password,
    refreshToken: null,
    resetPasswordToken: null,
    resetPasswordExpires: null,
  });
  if (updateResult.affected !== 1) {
    throw new Error('La rotation du mot de passe n’a pas été appliquée');
  }

  return { userId: user.id, email: user.email };
}
