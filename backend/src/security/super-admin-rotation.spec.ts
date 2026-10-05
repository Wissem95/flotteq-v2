import * as bcrypt from 'bcrypt';
import { UserRole } from '../entities/user.entity';
import { rotateSuperAdminPassword } from './super-admin-rotation';

describe('rotateSuperAdminPassword', () => {
  it('refuse un mot de passe insuffisamment robuste', async () => {
    const repository = {
      findOne: jest.fn(),
      update: jest.fn(),
    };

    await expect(
      rotateSuperAdminPassword(
        repository as never,
        'admin@example.test',
        'Password123',
      ),
    ).rejects.toThrow('au moins 12 caractères');
    expect(repository.findOne).not.toHaveBeenCalled();
  });

  it('remplace le secret, invalide le renouvellement et ne renvoie jamais le secret', async () => {
    const repository = {
      findOne: jest.fn().mockResolvedValue({
        id: 'super-admin-id',
        email: 'admin@example.test',
        role: UserRole.SUPER_ADMIN,
        isActive: true,
      }),
      update: jest.fn().mockResolvedValue({ affected: 1 }),
    };

    const result = await rotateSuperAdminPassword(
      repository as never,
      'ADMIN@example.test',
      'NouveauSecret123!',
    );

    expect(repository.findOne).toHaveBeenCalledWith({
      where: {
        email: 'admin@example.test',
        role: UserRole.SUPER_ADMIN,
        isActive: true,
      },
    });
    const update = repository.update.mock.calls[0][1];
    expect(await bcrypt.compare('NouveauSecret123!', update.password)).toBe(
      true,
    );
    expect(update.refreshToken).toBeNull();
    expect(update.resetPasswordToken).toBeNull();
    expect(update.resetPasswordExpires).toBeNull();
    expect(result).toEqual({
      userId: 'super-admin-id',
      email: 'admin@example.test',
    });
    expect(JSON.stringify(result)).not.toContain('NouveauSecret123!');
  });
});
