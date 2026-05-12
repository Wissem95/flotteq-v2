import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  { href: '#audiences', label: 'Pour vous' },
  { href: '#pricing', label: 'Tarifs' },
  { href: '#faq', label: 'FAQ' },
];

export function Header({ onLoginClick }: { onLoginClick: () => void }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={cn(
        'fixed top-0 inset-x-0 z-40 transition-all',
        scrolled ? 'bg-white/90 backdrop-blur border-b border-slate-100' : 'bg-transparent'
      )}
    >
      <div className="container mx-auto flex items-center justify-between h-16 px-4">
        <a
          href="/"
          className={cn(
            'text-xl font-extrabold tracking-tight transition-colors',
            scrolled ? 'flotteq-gradient-text' : 'text-white'
          )}
        >
          FlotteQ
        </a>

        <nav
          className={cn(
            'hidden md:flex items-center gap-6 text-sm font-medium transition-colors',
            scrolled ? 'text-slate-700' : 'text-white/90'
          )}
        >
          {NAV_ITEMS.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className={cn(
                'transition-colors',
                scrolled ? 'hover:text-flotteq-blue' : 'hover:text-white'
              )}
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-3">
          <Button
            variant="ghost"
            onClick={onLoginClick}
            className={cn(
              !scrolled && 'text-white hover:bg-white/10 hover:text-white'
            )}
          >
            Connexion
          </Button>
          <Button
            asChild
            className={cn(
              scrolled
                ? 'bg-flotteq-blue hover:bg-flotteq-navy text-white'
                : 'bg-white text-flotteq-navy hover:bg-slate-100'
            )}
          >
            <a href="https://app.flotteq.fr/register">Essai gratuit</a>
          </Button>
        </div>

        {/* Mobile burger */}
        <Sheet>
          <SheetTrigger asChild className="md:hidden">
            <Button
              variant="ghost"
              size="icon"
              aria-label="Ouvrir le menu"
              className={cn(!scrolled && 'text-white hover:bg-white/10 hover:text-white')}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="4" y1="6" x2="20" y2="6" />
                <line x1="4" y1="12" x2="20" y2="12" />
                <line x1="4" y1="18" x2="20" y2="18" />
              </svg>
            </Button>
          </SheetTrigger>
          <SheetContent>
            <div className="flex flex-col gap-4 mt-8">
              {NAV_ITEMS.map((item) => (
                <a key={item.href} href={item.href} className="text-lg font-medium text-slate-700">
                  {item.label}
                </a>
              ))}
              <hr className="my-4" />
              <Button variant="outline" onClick={onLoginClick}>Connexion</Button>
              <Button asChild className="bg-flotteq-blue text-white hover:bg-flotteq-navy">
                <a href="https://app.flotteq.fr/register">Essai gratuit</a>
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
