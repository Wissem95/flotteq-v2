import { visionCards } from '@/data/vision';

export function Vision() {
  return (
    <section className="py-16 md:py-24">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-extrabold text-center text-white">
          Notre vision
        </h2>
        <p className="mt-3 text-center text-white/85 max-w-2xl mx-auto">
          Pourquoi nous construisons FlotteQ, pour qui, et avec quel engagement.
        </p>

        <div className="mt-12 grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {visionCards.map((c) => (
            <article
              key={c.title}
              className="bg-white rounded-2xl border border-slate-100 p-7 shadow-sm hover:shadow-md transition-shadow"
            >
              <h3 className="text-xl font-bold text-flotteq-navy">{c.title}</h3>
              <p className="mt-3 text-slate-600 leading-relaxed">{c.text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
