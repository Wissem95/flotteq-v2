const COLUMNS = [
  {
    title: 'Produit',
    links: [
      { label: 'Pour les entreprises', href: '#audiences' },
      { label: 'Pour les particuliers', href: '#audiences' },
      { label: 'Pour les partenaires', href: '#audiences' },
      { label: 'Pour les conducteurs', href: '#audiences' },
      { label: 'Tarifs', href: '#pricing' },
    ],
  },
  {
    title: 'Ressources',
    links: [
      { label: 'FAQ', href: '#faq' },
      { label: 'Documentation', href: '#' },
      { label: 'Sécurité', href: '#' },
      { label: 'Statut', href: '#' },
    ],
  },
  {
    title: 'Légal',
    links: [
      { label: 'Mentions légales', href: '#' },
      { label: 'CGU', href: '#' },
      { label: 'CGV', href: '#' },
      { label: 'RGPD', href: '#' },
    ],
  },
  {
    title: 'Espaces',
    links: [
      { label: 'Espace client', href: 'https://app.flotteq.fr' },
      { label: 'Espace partenaire', href: 'https://partner.flotteq.fr' },
      { label: 'Espace conducteur', href: 'https://driver.flotteq.fr' },
      { label: 'Administration', href: 'https://admin.flotteq.fr' },
    ],
  },
];

export function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300">
      <div className="container mx-auto px-4 py-14">
        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-8">
          <div className="lg:col-span-1">
            <div className="text-xl font-extrabold text-white">FlotteQ</div>
            <p className="mt-3 text-sm text-slate-400 max-w-xs">
              La plateforme tout-en-un pour vos véhicules. Hébergé en France.
            </p>
          </div>
          {COLUMNS.map((col) => (
            <div key={col.title}>
              <div className="font-semibold text-white">{col.title}</div>
              <ul className="mt-3 space-y-2 text-sm">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <a href={l.href} className="hover:text-white transition-colors">
                      {l.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 pt-6 border-t border-slate-800 flex flex-col sm:flex-row justify-between items-center gap-3 text-sm text-slate-500">
          <div>© {new Date().getFullYear()} FlotteQ. Tous droits réservés.</div>
          <div>Hébergé en France 🇫🇷 — OVH Gravelines</div>
        </div>
      </div>
    </footer>
  );
}
