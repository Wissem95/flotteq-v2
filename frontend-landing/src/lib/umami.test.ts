import { afterEach, describe, expect, it } from 'vitest';
import { installUmamiTracker } from './umami';

afterEach(() => {
  document.head.querySelectorAll('[data-flotteq-umami]').forEach((node) => {
    node.remove();
  });
});

describe('installUmamiTracker', () => {
  it('installe une seule balise de suivi avec les domaines FlotteQ autorisés', () => {
    const options = {
      hostUrl: 'https://analytics.flotteq.fr',
      websiteId: '11111111-2222-3333-4444-555555555555',
      domains: ['flotteq.fr', 'www.flotteq.fr'],
    };

    installUmamiTracker(options);
    installUmamiTracker(options);

    const scripts = document.head.querySelectorAll<HTMLScriptElement>(
      'script[data-flotteq-umami]',
    );

    expect(scripts).toHaveLength(1);
    expect(scripts[0].src).toBe('https://analytics.flotteq.fr/script.js');
    expect(scripts[0].dataset.websiteId).toBe(options.websiteId);
    expect(scripts[0].dataset.domains).toBe('flotteq.fr,www.flotteq.fr');
  });

  it('ne charge aucun script tant que l’identifiant du site est absent', () => {
    installUmamiTracker({
      hostUrl: 'https://analytics.flotteq.fr',
      websiteId: '',
      domains: ['flotteq.fr'],
    });

    expect(
      document.head.querySelector('script[data-flotteq-umami]'),
    ).not.toBeInTheDocument();
  });
});
