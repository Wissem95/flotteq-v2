import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';

const PORTALS = [
  {
    label: 'Espace Client',
    domain: 'app.flotteq.fr',
    href: 'https://app.flotteq.fr',
    accent: 'text-flotteq-blue bg-flotteq-blue/10',
  },
  {
    label: 'Espace Partenaire',
    domain: 'partner.flotteq.fr',
    href: 'https://partner.flotteq.fr',
    accent: 'text-purple-600 bg-purple-100',
  },
  {
    label: 'Espace Conducteur',
    domain: 'driver.flotteq.fr',
    href: 'https://driver.flotteq.fr',
    accent: 'text-emerald-600 bg-emerald-100',
  },
  {
    label: 'Administration',
    domain: 'admin.flotteq.fr',
    href: 'https://admin.flotteq.fr',
    accent: 'text-pink-600 bg-pink-100',
  },
];

export function LoginOverlay({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Choisissez votre espace</DialogTitle>
          <DialogDescription>
            Sélectionnez le portail correspondant à votre profil pour vous connecter.
          </DialogDescription>
        </DialogHeader>
        <div className="grid sm:grid-cols-2 gap-3 mt-2">
          {PORTALS.map((p) => (
            <a
              key={p.domain}
              href={p.href}
              className="flex items-center gap-3 p-4 rounded-xl border border-slate-200 hover:border-flotteq-blue hover:-translate-y-0.5 transition-all"
            >
              <div className={`h-10 w-10 rounded-lg grid place-items-center font-bold ${p.accent}`}>
                {p.label[0]}
              </div>
              <div>
                <div className="font-semibold text-flotteq-navy">{p.label}</div>
                <div className="text-xs text-slate-500 font-mono">{p.domain}</div>
              </div>
            </a>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
