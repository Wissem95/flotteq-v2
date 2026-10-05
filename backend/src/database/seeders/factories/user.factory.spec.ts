import { UserFactory } from './user.factory';

describe('UserFactory', () => {
  it('refuse de créer un utilisateur de seed sans mot de passe explicite', () => {
    expect(() =>
      UserFactory.create({
        email: 'admin@example.test',
        tenantId: 1,
      }),
    ).toThrow('Un mot de passe de seed explicite est requis');
  });
});
