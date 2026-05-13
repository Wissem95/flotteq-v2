import type { ReactNode } from 'react';
import { Building2, Wrench, Car, ShieldCheck, ArrowRight } from 'lucide-react';

export type PortalCard = {
  key: 'client' | 'partner' | 'driver' | 'admin';
  label: string;
  domain: string;
  href: string;
  description: string;
  icon: ReactNode;
  accent: string;
};

const ICON_PROPS = { className: 'h-7 w-7', strokeWidth: 2 };

export const PORTAL_DEFS: Record<PortalCard['key'], Omit<PortalCard, 'href'>> = {
  client: {
    key: 'client',
    label: 'Espace Client',
    domain: 'app.flotteq.fr',
    description: 'Entreprises & particuliers qui gèrent leur flotte.',
    icon: <Building2 {...ICON_PROPS} />,
    accent: 'text-flotteq-blue bg-flotteq-blue/10 group-hover:bg-flotteq-blue group-hover:text-white',
  },
  partner: {
    key: 'partner',
    label: 'Espace Partenaire',
    domain: 'partner.flotteq.fr',
    description: 'Garages, contrôles techniques, assureurs.',
    icon: <Wrench {...ICON_PROPS} />,
    accent: 'text-purple-600 bg-purple-100 group-hover:bg-purple-600 group-hover:text-white',
  },
  driver: {
    key: 'driver',
    label: 'Espace Conducteur',
    domain: 'driver.flotteq.fr',
    description: 'Conducteurs invités à suivre un véhicule.',
    icon: <Car {...ICON_PROPS} />,
    accent: 'text-emerald-600 bg-emerald-100 group-hover:bg-emerald-600 group-hover:text-white',
  },
  admin: {
    key: 'admin',
    label: 'Administration',
    domain: 'admin.flotteq.fr',
    description: 'Équipe FlotteQ uniquement.',
    icon: <ShieldCheck {...ICON_PROPS} />,
    accent: 'text-pink-600 bg-pink-100 group-hover:bg-pink-600 group-hover:text-white',
  },
};

export function PortalGrid({
  title,
  subtitle,
  cards,
  footer,
}: {
  title: string;
  subtitle: string;
  cards: PortalCard[];
  footer: ReactNode;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 py-12">
      <div className="w-full max-w-3xl">
        <div className="text-center mb-8">
          <a
            href="https://flotteq.fr"
            className="inline-flex items-center gap-2 text-white/90 hover:text-white text-sm mb-6"
          >
            <span aria-hidden>←</span> Retour à flotteq.fr
          </a>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight">{title}</h1>
          <p className="mt-3 text-white/85 text-lg">{subtitle}</p>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8">
          <div className="grid sm:grid-cols-2 gap-4">
            {cards.map((p) => (
              <a
                key={p.key}
                href={p.href}
                className="group flex items-start gap-4 p-5 rounded-xl border-2 border-slate-100 hover:border-flotteq-blue hover:-translate-y-0.5 hover:shadow-lg transition-all duration-200"
              >
                <div className={`h-14 w-14 shrink-0 rounded-xl grid place-items-center transition-colors ${p.accent}`}>
                  {p.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold text-flotteq-navy text-base">{p.label}</span>
                    <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-flotteq-blue group-hover:translate-x-0.5 transition-all shrink-0" />
                  </div>
                  <p className="text-sm text-slate-600 mt-1 leading-snug">{p.description}</p>
                  <p className="text-xs text-slate-400 font-mono mt-1 truncate">{p.domain}</p>
                </div>
              </a>
            ))}
          </div>

          <div className="mt-6 pt-6 border-t border-slate-100 text-center text-sm text-slate-600">
            {footer}
          </div>
        </div>

        <p className="mt-8 text-center text-xs text-white/60">
          © {new Date().getFullYear()} FlotteQ · Hébergé en France
        </p>
      </div>
    </div>
  );
}
