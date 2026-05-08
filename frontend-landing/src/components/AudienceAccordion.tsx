import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { audiences } from '@/data/audiences';

export function AudienceAccordion() {
  return (
    <section id="audiences" className="py-16 md:py-24">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-extrabold text-center text-flotteq-navy">
          Pour vous, quelle que soit votre situation
        </h2>
        <p className="mt-3 text-center text-slate-600 max-w-2xl mx-auto">
          Quatre profils, une seule plateforme. Cliquez pour découvrir le vôtre.
        </p>

        <div className="mt-10 max-w-4xl mx-auto">
          <Accordion type="single" collapsible defaultValue="business" className="space-y-4">
            {audiences.map((a) => (
              <AccordionItem
                key={a.key}
                value={a.key}
                className="bg-white rounded-2xl border border-slate-100 px-6 shadow-sm data-[state=open]:shadow-md transition-shadow"
              >
                <AccordionTrigger className="text-lg md:text-xl font-bold text-flotteq-navy hover:no-underline py-5">
                  {a.accordionTitle}
                </AccordionTrigger>
                <AccordionContent className="pb-6">
                  <div className="grid md:grid-cols-2 gap-6 items-start">
                    <img
                      src={a.accordionImageUrl}
                      alt={`Photo : ${a.label}`}
                      width={900}
                      height={600}
                      loading="lazy"
                      decoding="async"
                      className="w-full aspect-[3/2] object-cover rounded-xl"
                    />
                    <div>
                      <ul className="space-y-3">
                        {a.features.map((f) => (
                          <li key={f} className="flex gap-3 text-slate-700">
                            <span className="mt-1 h-2 w-2 rounded-full bg-flotteq-teal flex-shrink-0" />
                            <span>{f}</span>
                          </li>
                        ))}
                      </ul>
                      <Button asChild className="mt-6 bg-flotteq-blue hover:bg-flotteq-navy text-white">
                        <a href={a.ctaHref}>{a.ctaLabel}</a>
                      </Button>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
}
