import { describe, expect, it } from 'vitest';
import { buildProfileUpdatePayload } from './profile.utils';

const profile = {
  firstName: 'QA',
  lastName: 'Driver',
  email: 'qa@example.test',
  phone: '+33600000000',
  address: '1 rue Test',
  city: 'Paris',
  postalCode: '75001',
  emergencyContact: '',
  emergencyPhone: '',
  birthDate: '',
  profilePhotoUrl: null,
  profilePhotoThumbnail: null,
};

describe('buildProfileUpdatePayload', () => {
  it('omet la date de naissance optionnelle lorsqu’elle est vide', () => {
    expect(buildProfileUpdatePayload(profile)).toEqual({
      firstName: 'QA',
      lastName: 'Driver',
      phone: '+33600000000',
      address: '1 rue Test',
      city: 'Paris',
      postalCode: '75001',
      emergencyContact: '',
      emergencyPhone: '',
    });
  });

  it('conserve une date de naissance renseignée', () => {
    expect(
      buildProfileUpdatePayload({ ...profile, birthDate: '1990-01-01' }),
    ).toMatchObject({ birthDate: '1990-01-01' });
  });
});
