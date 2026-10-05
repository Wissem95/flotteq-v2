import { BarChart3, ExternalLink, LockKeyhole, Server } from 'lucide-react';

interface AnalyticsPageProps {
  dashboardUrl?: string;
}

const trackedSurfaces = ['flotteq.fr'];

export function AnalyticsPage({
  dashboardUrl = import.meta.env.VITE_UMAMI_DASHBOARD_URL ||
    'https://analytics.flotteq.fr',
}: AnalyticsPageProps) {
  return (
    <section className="space-y-6">
      <div>
        <p className="text-sm font-medium text-cyan-700">Pilotage commercial</p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-950">
          Analytics Umami
        </h1>
        <p className="mt-2 max-w-3xl text-sm text-slate-600">
          Analysez l’acquisition, les parcours et les conversions FlotteQ depuis
          l’instance privée hébergée avec la plateforme.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <article className="rounded-2xl border border-cyan-100 bg-gradient-to-br from-cyan-50 to-white p-6 lg:col-span-2">
          <div className="flex items-start gap-4">
            <span className="rounded-xl bg-cyan-700 p-3 text-white shadow-sm">
              <BarChart3 className="h-6 w-6" aria-hidden="true" />
            </span>
            <div className="min-w-0 flex-1">
              <h2 className="text-lg font-semibold text-slate-950">
                Tableau de bord analytique
              </h2>
              <p className="mt-1 text-sm text-slate-600">
                Les statistiques détaillées restent protégées par
                l’authentification Umami et ne sont jamais exposées au navigateur
                public.
              </p>
              <a
                className="mt-5 inline-flex items-center gap-2 rounded-lg bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-600 focus-visible:ring-offset-2"
                href={dashboardUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                Ouvrir Umami
                <ExternalLink className="h-4 w-4" aria-hidden="true" />
              </a>
            </div>
          </div>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-6">
          <div className="flex items-center gap-3">
            <Server className="h-5 w-5 text-cyan-700" aria-hidden="true" />
            <h2 className="font-semibold text-slate-950">Hébergement privé</h2>
          </div>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            Umami et sa base PostgreSQL sont isolés des données métier FlotteQ.
          </p>
          <div className="mt-4 flex items-center gap-2 text-xs font-medium text-emerald-700">
            <LockKeyhole className="h-4 w-4" aria-hidden="true" />
            Accès administrateur séparé
          </div>
        </article>
      </div>

      <article className="rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-slate-950">
          Surfaces suivies
        </h2>
        <p className="mt-1 text-sm text-slate-600">
          Le site vitrine est le premier parcours suivi. Les applications
          authentifiées pourront être ajoutées sans mélanger les données métier.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {trackedSurfaces.map((surface) => (
            <span
              key={surface}
              className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-700"
            >
              {surface}
            </span>
          ))}
        </div>
      </article>
    </section>
  );
}
