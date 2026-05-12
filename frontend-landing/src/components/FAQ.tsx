import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { faq } from '@/data/faq';

export function FAQ() {
  return (
    <section id="faq" className="py-16 md:py-24">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-extrabold text-center text-white">
          Questions fréquentes
        </h2>
        <p className="mt-3 text-center text-white/85 max-w-2xl mx-auto">
          Tout ce que vous voulez savoir avant de tester FlotteQ.
        </p>

        <div className="mt-10 max-w-3xl mx-auto">
          <Accordion type="multiple" className="space-y-3">
            {faq.map((entry, i) => (
              <AccordionItem
                key={i}
                value={`q-${i}`}
                className="bg-white border border-slate-100 rounded-xl px-5 hover:border-flotteq-teal/40 hover:shadow-sm transition-all"
              >
                <AccordionTrigger className="text-left font-semibold text-flotteq-navy hover:no-underline hover:text-flotteq-blue py-4 transition-colors">
                  {entry.question}
                </AccordionTrigger>
                <AccordionContent className="text-slate-600 leading-relaxed pb-5">
                  {entry.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
}
