import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { MainLayout } from './MainLayout';

vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    user: {
      firstName: 'Admin',
      lastName: 'FlotteQ',
      role: 'super_admin',
    },
    logout: vi.fn(),
  }),
}));

afterEach(cleanup);

describe('MainLayout', () => {
  it('rend Analytics accessible depuis la navigation administrateur', () => {
    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <Routes>
          <Route element={<MainLayout />}>
            <Route path="/dashboard" element={<p>Tableau de bord</p>} />
          </Route>
        </Routes>
      </MemoryRouter>,
    );

    expect(
      screen.getByRole('button', { name: 'Analytics' }),
    ).toBeInTheDocument();
  });

  it('ouvre une navigation administrateur adaptée aux petits écrans', () => {
    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <Routes>
          <Route element={<MainLayout />}>
            <Route path="/dashboard" element={<p>Tableau de bord</p>} />
          </Route>
        </Routes>
      </MemoryRouter>,
    );

    fireEvent.click(
      screen.getByRole('button', {
        name: 'Ouvrir la navigation administrateur',
      }),
    );

    expect(
      screen.getByRole('dialog', { name: 'Navigation administrateur' }),
    ).toBeInTheDocument();
    expect(
      screen.getAllByRole('button', { name: 'Analytics' }).length,
    ).toBeGreaterThanOrEqual(1);
  });
});
