import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { AnalyticsPage } from './AnalyticsPage';

afterEach(cleanup);

describe('AnalyticsPage', () => {
  it('donne aux administrateurs un accès sûr au tableau de bord Umami', () => {
    render(<AnalyticsPage dashboardUrl="https://analytics.flotteq.fr" />);

    expect(
      screen.getByRole('heading', { name: 'Analytics Umami' }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole('link', { name: 'Ouvrir Umami' }),
    ).toHaveAttribute('href', 'https://analytics.flotteq.fr');
    expect(
      screen.getByRole('link', { name: 'Ouvrir Umami' }),
    ).toHaveAttribute('target', '_blank');
    expect(screen.getByText('flotteq.fr')).toBeInTheDocument();
  });
});
