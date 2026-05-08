import { useEffect, useState, useCallback } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { marketStats } from '@/data/marketStats';
import { cn } from '@/lib/utils';

const AUTOPLAY_MS = 6000;

export function MarketStatsCarousel() {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });
  const [selected, setSelected] = useState(0);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelected(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on('select', onSelect);
    return () => {
      emblaApi.off('select', onSelect);
    };
  }, [emblaApi, onSelect]);

  useEffect(() => {
    if (!emblaApi) return;
    const id = setInterval(() => emblaApi.scrollNext(), AUTOPLAY_MS);
    return () => clearInterval(id);
  }, [emblaApi]);

  return (
    <section id="why-now" className="py-16 md:py-24 bg-flotteq-light">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-extrabold text-center text-flotteq-navy">
          Pourquoi gérer ses véhicules autrement ?
        </h2>
        <p className="mt-3 text-center text-slate-600 max-w-2xl mx-auto">
          Les chiffres parlent d'eux-mêmes — et ce sont les vôtres qui sont en jeu.
        </p>

        <div className="mt-10 overflow-hidden" ref={emblaRef}>
          <div className="flex">
            {marketStats.map((s, i) => (
              <div key={i} className="min-w-0 flex-[0_0_100%] px-4">
                <div className="bg-white rounded-2xl border border-slate-100 p-10 md:p-14 text-center max-w-3xl mx-auto shadow-sm">
                  <div className="text-6xl md:text-7xl font-extrabold flotteq-gradient-text">{s.big}</div>
                  <p className="mt-4 text-lg md:text-xl text-slate-700 leading-relaxed">{s.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6 flex items-center justify-center gap-2">
          {marketStats.map((_, i) => (
            <button
              key={i}
              onClick={() => emblaApi?.scrollTo(i)}
              aria-label={`Aller à la stat ${i + 1}`}
              className={cn(
                'h-2 rounded-full transition-all',
                i === selected ? 'w-8 bg-flotteq-blue' : 'w-2 bg-slate-300'
              )}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
