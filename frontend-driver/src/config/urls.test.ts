import { describe, expect, it } from 'vitest';
import { resolveBackendUrl } from './urls';

describe('resolveBackendUrl', () => {
  it('construit une URL publique depuis VITE_API_BASE sans ajouter localhost', () => {
    expect(
      resolveBackendUrl('/uploads/trips/photo.jpg', 'https://api.flotteq.fr'),
    ).toBe('https://api.flotteq.fr/uploads/trips/photo.jpg');
  });

  it('retire le suffixe /api avant de résoudre une ressource statique', () => {
    expect(
      resolveBackendUrl('/uploads/profile.jpg', 'https://api.flotteq.fr/api'),
    ).toBe('https://api.flotteq.fr/uploads/profile.jpg');
  });

  it('conserve une URL absolue renvoyée par le backend', () => {
    expect(
      resolveBackendUrl('https://cdn.example.test/photo.jpg', 'https://api.flotteq.fr'),
    ).toBe('https://cdn.example.test/photo.jpg');
  });
});
