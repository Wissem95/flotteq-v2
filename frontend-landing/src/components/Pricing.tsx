import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { plans } from '@/data/pricing';
import { cn } from '@/lib/utils';

export function Pricing() {
  return (
    <section id="pricing" className="py-16 md:py-24 bg-flotteq-light">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-extrabold text-center text-flotteq-navy">
          Tarifs simples, transparents
        </h2>
        <p className="mt-3 text-center text-slate-600 max-w-2xl mx-auto">
          Choisissez votre plan. Sans engagement, résiliable en un clic.
        </p>

        <div className="mt-12 grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {plans.map((p) => (
            <Card
              key={p.key}
              className={cn(
                'border-slate-100 relative',
                p.highlight && 'border-flotteq-teal border-2 shadow-lg'
              )}
            >
              {p.highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-flotteq-teal text-white text-xs font-bold uppercase tracking-wide">
                  Le plus populaire
                </div>
              )}
              <CardContent className="p-7 flex flex-col h-full">
                <h3 className="text-xl font-bold text-flotteq-navy">{p.name}</h3>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold text-flotteq-navy">{p.priceLabel}</span>
                  {p.priceSuffix && <span className="text-slate-500">{p.priceSuffix}</span>}
                </div>
                <p className="mt-3 text-sm text-slate-600 leading-relaxed">{p.description}</p>

                <ul className="mt-6 space-y-2 flex-1">
                  {p.features.map((f) => (
                    <li key={f} className="flex gap-2 text-sm text-slate-700">
                      <span className="mt-1 h-1.5 w-1.5 rounded-full bg-flotteq-teal flex-shrink-0" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  asChild
                  className={cn(
                    'mt-6 w-full',
                    p.highlight
                      ? 'bg-flotteq-blue hover:bg-flotteq-navy text-white'
                      : 'bg-white border border-slate-200 text-flotteq-navy hover:bg-slate-50'
                  )}
                >
                  <a href={p.ctaHref}>{p.ctaLabel}</a>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
