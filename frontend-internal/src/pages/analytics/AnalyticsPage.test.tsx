import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { AnalyticsPage } from './AnalyticsPage';

vi.mock('@/api/endpoints/dashboard', () => ({
  dashboardApi: {
    getInternalAnalytics: vi.fn().mockResolvedValue({
      data: {
        periodDays: 30,
        pageviews: 12,
        visitors: 8,
        visits: 10,
        bounces: 4,
        bounceRate: 40,
        timeline: [
          {
            date: '2026-10-05T00:00:00Z',
            pageviews: 12,
            sessions: 10,
          },
        ],
      },
    }),
  },
}));

afterEach(cleanup);

describe('AnalyticsPage', () => {
  it('affiche les indicateurs Umami dans la section admin', async () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    render(
      <QueryClientProvider client={queryClient}>
        <AnalyticsPage dashboardUrl="https://analytics.flotteq.fr" />
      </QueryClientProvider>,
    );

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
    expect(await screen.findByText('12')).toBeInTheDocument();
    expect(screen.getByText('Pages vues')).toBeInTheDocument();
    expect(screen.getByText('40 %')).toBeInTheDocument();
    expect(screen.getByText('5 oct.')).toBeInTheDocument();
  });
});
