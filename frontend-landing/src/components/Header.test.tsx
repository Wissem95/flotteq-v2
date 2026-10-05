import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Header } from './Header';

afterEach(cleanup);

describe('Header', () => {
  it('donne un nom et une description accessibles au menu mobile', () => {
    render(<Header onLoginClick={vi.fn()} />);

    fireEvent.click(screen.getByRole('button', { name: 'Ouvrir le menu' }));

    expect(
      screen.getByRole('dialog', { name: 'Navigation principale' }),
    ).toHaveAccessibleDescription(
      'Accédez aux sections publiques et aux espaces FlotteQ.',
    );
  });
});
