import { useState } from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { audiences, type AudienceKey } from '@/data/audiences';

export function Hero() {
  const [activeKey, setActiveKey] = useState<AudienceKey>('business');
  const active = audiences.find((a) => a.key === activeKey)!;

  return (
    <section className="pt-32 pb-16 md:pt-40 md:pb-24 container mx-auto px-4">
      <div className="grid lg:grid-cols-2 gap-12 items-center">
        <div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.05] drop-shadow-sm">
            Pilotez vos véhicules <span className="text-flotteq-teal">sereinement.</span>
          </h1>
          <p className="mt-5 text-lg md:text-xl text-white/85 max-w-xl">
            Entretien, conducteurs, assurances — tout est sous contrôle.
          </p>

          <Tabs value={activeKey} onValueChange={(v) => setActiveKey(v as AudienceKey)} className="mt-8">
            <TabsList className="bg-flotteq-light p-1 h-auto flex-wrap">
              {audiences.map((a) => (
                <TabsTrigger
                  key={a.key}
                  value={a.key}
                  className="data-[state=active]:bg-white data-[state=active]:text-flotteq-navy data-[state=active]:shadow text-sm md:text-base"
                >
                  {a.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

          <p className="mt-6 text-base text-white/90 leading-relaxed max-w-lg" key={active.key}>
            {active.heroSubtitle}
          </p>

          <div className="mt-8 flex flex-col sm:flex-row gap-3">
            <Button asChild className="bg-white text-flotteq-navy hover:bg-slate-100" size="lg">
              <a href={active.ctaHref}>Commencer gratuitement</a>
            </Button>
            <Button asChild variant="outline" size="lg" className="bg-transparent border-white text-white hover:bg-white/10 hover:text-white">
              <a href="#how">Comment ça marche ?</a>
            </Button>
          </div>
        </div>

        <div className="relative">
          <img
            src={active.heroImageUrl}
            alt={`Illustration : ${active.label}`}
            width={1200}
            height={900}
            loading="eager"
            decoding="async"
            className="w-full aspect-[4/3] object-cover rounded-2xl shadow-xl border border-slate-100"
            key={active.key}
          />
          <div className="absolute -inset-2 -z-10 rounded-2xl flotteq-gradient opacity-10 blur-xl" />
        </div>
      </div>
    </section>
  );
}
