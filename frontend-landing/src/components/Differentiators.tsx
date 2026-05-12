import { Card, CardContent } from '@/components/ui/card';
import { Hub } from '@/icons/Hub';
import { Handshake } from '@/icons/Handshake';
import { Hexagon } from '@/icons/Hexagon';
import { differentiators } from '@/data/differentiators';
import type { ComponentType, SVGProps } from 'react';

const ICONS: Record<string, ComponentType<SVGProps<SVGSVGElement>>> = {
  hub: Hub,
  handshake: Handshake,
  hexagon: Hexagon,
};

export function Differentiators() {
  return (
    <section className="py-16 md:py-24 bg-flotteq-light">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-extrabold text-center text-flotteq-navy">
          Pourquoi FlotteQ ?
        </h2>
        <p className="mt-3 text-center text-slate-600 max-w-2xl mx-auto">
          Trois engagements qui nous rendent différents.
        </p>

        <div className="mt-12 grid md:grid-cols-3 gap-6">
          {differentiators.map((d) => {
            const Icon = ICONS[d.iconKey];
            return (
              <Card key={d.title} className="border-slate-100 hover:shadow-lg hover:-translate-y-1 hover:border-flotteq-teal/40 transition-all">
                <CardContent className="p-7">
                  <div className="h-14 w-14 rounded-xl bg-flotteq-blue/10 grid place-items-center text-flotteq-blue">
                    <Icon className="h-8 w-8" />
                  </div>
                  <h3 className="mt-5 text-xl font-bold text-flotteq-navy">{d.title}</h3>
                  <p className="mt-2 text-slate-600 leading-relaxed">{d.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
