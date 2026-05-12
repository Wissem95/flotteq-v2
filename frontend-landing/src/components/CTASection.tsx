import { Button } from '@/components/ui/button';

export function CTASection() {
  return (
    <section className="py-20 flotteq-gradient text-white relative overflow-hidden">
      <div className="absolute inset-0 opacity-10 [background-image:radial-gradient(circle_at_30%_20%,white_0,transparent_60%),radial-gradient(circle_at_70%_80%,white_0,transparent_50%)]" />
      <div className="container mx-auto px-4 relative">
        <h2 className="text-3xl md:text-5xl font-extrabold text-center max-w-3xl mx-auto leading-tight">
          Prêt à reprendre le contrôle de vos véhicules ?
        </h2>
        <p className="mt-4 text-center text-white/80 text-lg max-w-2xl mx-auto">
          Inscription en 2 minutes, sans engagement, gratuit pour démarrer.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
          <Button asChild size="lg" className="bg-white text-flotteq-navy hover:bg-slate-100">
            <a href="https://app.flotteq.fr/register">Commencer gratuitement</a>
          </Button>
          <Button asChild size="lg" variant="outline" className="bg-transparent border-white text-white hover:bg-white/10 hover:text-white">
            <a href="#pricing">Voir les tarifs</a>
          </Button>
        </div>
      </div>
    </section>
  );
}
