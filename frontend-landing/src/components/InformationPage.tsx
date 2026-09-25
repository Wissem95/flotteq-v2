import type { InformationPage as InformationPageContent } from '../data/informationPages';
import { Footer } from './Footer';

type InformationPageProps = {
  page: InformationPageContent;
};

export function InformationPage({ page }: InformationPageProps) {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-slate-950 text-white">
        <div className="container mx-auto flex min-h-16 items-center justify-between px-4">
          <a className="text-xl font-extrabold tracking-tight" href="/">
            FlotteQ
          </a>
          <a className="text-sm text-slate-200 underline-offset-4 hover:underline" href="/documentation">
            Documentation
          </a>
        </div>
      </header>

      <article className="container mx-auto max-w-4xl px-4 py-12 md:py-20">
        <p className="text-sm font-semibold text-flotteq-blue">FlotteQ · BELPRE LOCATION</p>
        <h1 className="mt-3 text-4xl font-extrabold tracking-tight text-slate-950 md:text-5xl">
          {page.title}
        </h1>
        <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">{page.summary}</p>
        <p className="mt-4 text-sm text-slate-500">Version publiée le 25 septembre 2026.</p>

        <div className="mt-12 space-y-10">
          {page.sections.map((section) => (
            <section key={section.title} className="border-l-2 border-flotteq-teal pl-5">
              <h2 className="text-xl font-bold text-slate-900">{section.title}</h2>
              <div className="mt-3 space-y-3 leading-7 text-slate-700">
                {section.paragraphs.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
              {section.link && (
                <a
                  className="mt-4 inline-block font-medium text-flotteq-blue underline underline-offset-4"
                  href={section.link.href}
                  target="_blank"
                  rel="noreferrer"
                >
                  {section.link.label}
                </a>
              )}
            </section>
          ))}
        </div>
      </article>
      <Footer />
    </main>
  );
}
