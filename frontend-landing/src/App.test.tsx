import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import App from './App';

afterEach(() => {
  cleanup();
  window.history.pushState({}, '', '/');
});

describe('pages d’information publique', () => {
  it('affiche les CGU à leur URL et relie la politique de confidentialité', () => {
    window.history.pushState({}, '', '/cgu');

    render(<App />);

    expect(
      screen.getByRole('heading', { name: 'Conditions générales d’utilisation' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: 'Politique de confidentialité' }),
    ).toHaveAttribute('href', '/rgpd');
  });

  it('sert la page de confidentialité également avec une barre oblique finale', () => {
    window.history.pushState({}, '', '/rgpd/');

    render(<App />);

    expect(
      screen.getByRole('heading', { name: 'Politique de confidentialité' }),
    ).toBeInTheDocument();
  });
});
