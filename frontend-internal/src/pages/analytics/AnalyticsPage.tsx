import { useQuery } from '@tanstack/react-query';
import {
  Activity,
  BarChart3,
  ExternalLink,
  Eye,
  LockKeyhole,
  MousePointerClick,
  RefreshCw,
  Server,
  Users,
} from 'lucide-react';
import { dashboardApi } from '@/api/endpoints/dashboard';

interface AnalyticsPageProps {
  dashboardUrl?: string;
}

const trackedSurfaces = ['flotteq.fr'];

export function AnalyticsPage({
  dashboardUrl = import.meta.env.VITE_UMAMI_DASHBOARD_URL ||
    'https://analytics.flotteq.fr',
}: AnalyticsPageProps) {
  const analyticsQuery = useQuery({
    queryKey: ['internal-analytics', 30],
    queryFn: async () => (await dashboardApi.getInternalAnalytics(30)).data,
  });
  const analytics = analyticsQuery.data;
  const maximumPageviews = Math.max(
    1,
    ...(analytics?.timeline.map((point) => point.pageviews) ?? []),
  );
  const indicators = analytics
    ? [
        { label: 'Pages vues', value: analytics.pageviews, icon: Eye },
        { label: 'Visiteurs', value: analytics.visitors, icon: Users },
        {
          label: 'Sessions',
          value: analytics.visits,
          icon: MousePointerClick,
        },
        {
          label: 'Taux de rebond',
          value: `${analytics.bounceRate} %`,
          icon: Activity,
        },
      ]
    : [];

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

      <section aria-labelledby="analytics-summary" className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2
              id="analytics-summary"
              className="text-lg font-semibold text-slate-950"
            >
              Vue d’ensemble sur 30 jours
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              Données privées chargées par l’API FlotteQ.
            </p>
          </div>
          <button
            type="button"
            onClick={() => analyticsQuery.refetch()}
            disabled={analyticsQuery.isFetching}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:border-cyan-300 hover:text-cyan-800 disabled:cursor-wait disabled:opacity-60"
          >
            <RefreshCw
              className={`h-4 w-4 ${analyticsQuery.isFetching ? 'animate-spin' : ''}`}
              aria-hidden="true"
            />
            Actualiser
          </button>
        </div>

        {analyticsQuery.isPending && (
          <div
            role="status"
            className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-600"
          >
            Chargement des statistiques…
          </div>
        )}

        {analyticsQuery.isError && (
          <div
            role="alert"
            className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-sm text-amber-900"
          >
            Les statistiques sont temporairement indisponibles. Le reste de
            l’administration demeure accessible.
          </div>
        )}

        {analytics && (
          <>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {indicators.map(({ label, value, icon: Icon }) => (
                <article
                  key={label}
                  className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-medium text-slate-600">{label}</p>
                    <Icon className="h-5 w-5 text-cyan-700" aria-hidden="true" />
                  </div>
                  <p className="mt-3 text-3xl font-bold tracking-tight text-slate-950">
                    {value}
                  </p>
                </article>
              ))}
            </div>

            <article className="rounded-2xl border border-slate-200 bg-white p-6">
              <h3 className="font-semibold text-slate-950">
                Évolution des pages vues
              </h3>
              {analytics.timeline.length === 0 ? (
                <p className="mt-4 text-sm text-slate-600">
                  Aucune visite enregistrée sur cette période.
                </p>
              ) : (
                <div
                  className="mt-6 flex min-h-48 items-end gap-2 overflow-x-auto border-b border-slate-200 pb-2"
                  aria-label="Pages vues par jour"
                >
                  {analytics.timeline.map((point) => {
                    const label = new Date(point.date).toLocaleDateString(
                      'fr-FR',
                      {
                        day: 'numeric',
                        month: 'short',
                        timeZone: 'UTC',
                      },
                    );
                    return (
                      <div
                        key={point.date}
                        className="flex min-w-12 flex-1 flex-col items-center justify-end gap-2"
                        title={`${label} : ${point.pageviews} pages vues, ${point.sessions} sessions`}
                      >
                        <div
                          className="w-full max-w-12 rounded-t-md bg-cyan-600"
                          style={{
                            height: `${Math.max(8, (point.pageviews / maximumPageviews) * 144)}px`,
                          }}
                          aria-hidden="true"
                        />
                        <span className="whitespace-nowrap text-xs text-slate-500">
                          {label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </article>
          </>
        )}
      </section>

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
