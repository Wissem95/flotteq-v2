import { beforeEach, describe, expect, it, vi } from 'vitest';
import api from '@/config/api';
import { uploadPhoto } from './photo-utils';

vi.mock('@/config/api', () => ({
  default: {
    post: vi.fn(),
  },
}));

describe('uploadPhoto', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('utilise le client API authentifié configuré pour la production', async () => {
    vi.mocked(api.post).mockResolvedValue({
      data: { photoUrl: '/uploads/trips/photo.jpg' },
    });
    const photo = new File(['photo'], 'photo.jpg', { type: 'image/jpeg' });

    const result = await uploadPhoto(photo);

    expect(result).toBe('/uploads/trips/photo.jpg');
    expect(api.post).toHaveBeenCalledTimes(1);
    expect(api.post).toHaveBeenCalledWith(
      '/driver/photos/single',
      expect.any(FormData),
      { headers: { 'Content-Type': 'multipart/form-data' } },
    );
    const formData = vi.mocked(api.post).mock.calls[0][1] as FormData;
    expect(formData.get('photo')).toBe(photo);
  });
});
