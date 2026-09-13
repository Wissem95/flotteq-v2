import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, within } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { usersService } from '@/api/services/users.service';
import { UserRole } from '@/types/user.types';
import { UsersPage } from './UsersPage';

vi.mock('@/api/services/users.service');

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    user: {
      id: 'current-user-id',
      email: 'moi@flotteq.test',
      firstName: 'Moi',
      lastName: 'Admin',
      role: UserRole.TENANT_ADMIN,
      tenantId: 1,
    },
  }),
}));

const renderPage = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <UsersPage />
    </QueryClientProvider>,
  );
};

describe('UsersPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(usersService.getAll).mockResolvedValue({
      data: [
        {
          id: 'current-user-id',
          email: 'moi@flotteq.test',
          firstName: 'Moi',
          lastName: 'Admin',
          role: UserRole.TENANT_ADMIN,
          isActive: true,
          tenantId: 1,
          createdAt: '2026-01-01T00:00:00.000Z',
          updatedAt: '2026-01-01T00:00:00.000Z',
        },
        {
          id: 'other-user-id',
          email: 'autre@flotteq.test',
          firstName: 'Autre',
          lastName: 'Utilisateur',
          role: UserRole.DRIVER,
          isActive: true,
          tenantId: 1,
          createdAt: '2026-01-01T00:00:00.000Z',
          updatedAt: '2026-01-01T00:00:00.000Z',
        },
      ],
      meta: {
        total: 2,
        page: 1,
        limit: 20,
        totalPages: 1,
        hasNextPage: false,
        hasPreviousPage: false,
      },
    });
  });

  it('masque Supprimer sur la ligne de l utilisateur connecté tout en la laissant pour les autres', async () => {
    renderPage();

    const currentUserRow = await screen.findByRole('row', { name: /moi admin/i });
    const otherUserRow = screen.getByRole('row', { name: /autre utilisateur/i });

    expect(within(currentUserRow).queryByTitle('Supprimer')).not.toBeInTheDocument();
    expect(within(otherUserRow).getByTitle('Supprimer')).toBeInTheDocument();
  });
});
