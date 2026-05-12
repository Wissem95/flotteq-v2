import { steps } from '@/data/howItWorks';

export function HowItWorks() {
  return (
    <section id="how" className="py-16 md:py-24">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-extrabold text-center text-white">
          Comment ça marche
        </h2>
        <p className="mt-3 text-center text-white/85 max-w-2xl mx-auto">
          Trois étapes pour reprendre le contrôle de vos véhicules.
        </p>

        <ol className="mt-12 grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {steps.map((s) => (
            <li key={s.number} className="relative">
              <div className="h-12 w-12 rounded-full bg-white text-flotteq-navy grid place-items-center text-xl font-extrabold">
                {s.number}
              </div>
              <h3 className="mt-5 text-xl font-bold text-white">{s.title}</h3>
              <p className="mt-2 text-white/85 leading-relaxed">{s.description}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
