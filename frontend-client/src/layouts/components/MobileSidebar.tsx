import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, Car } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { navigationItems } from '@/config/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

/**
 * MobileSidebar - Navigation mobile avec drawer shadcn/ui Sheet
 *
 * Visible uniquement sur écrans < 768px (< md breakpoint).
 * Utilise shadcn/ui Sheet pour un drawer accessible avec animations.
 *
 * Features:
 * - Bouton hamburger (Menu icon) visible < md
 * - Drawer latéral gauche avec navigation complète
 * - Auto-fermeture après navigation
 * - Highlight item actif avec useLocation
 * - Accessible clavier (Escape, Tab, Enter)
 *
 * @example
 * ```tsx
 * <MobileSidebar />
 * ```
 *
 * Sprint: M1, Ticket: T-M1.3
 */
export function MobileSidebar() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const { user } = useAuth();

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      {/* Trigger - Hamburger Button */}
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden text-white hover:bg-white/10"
          aria-label="Ouvrir le menu de navigation"
        >
          <Menu className="h-6 w-6" />
          <span className="sr-only">Ouvrir le menu</span>
        </Button>
      </SheetTrigger>

      {/* Content - Drawer Panel */}
      <SheetContent side="left" className="w-[280px] p-0 flex flex-col flotteq-gradient border-0">
        {/* Header avec Logo */}
        <SheetHeader className="border-b border-white/20 px-6 py-4">
          <div className="flex items-center gap-2">
            <Car className="h-6 w-6 text-white" />
            <SheetTitle className="text-xl font-bold text-white">Flotteq</SheetTitle>
          </div>
        </SheetHeader>

        {/* Navigation Items */}
        <nav className="flex-1 flex flex-col gap-1 p-4 overflow-y-auto" aria-label="Navigation principale">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setOpen(false)}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                  'text-white/80 hover:bg-white/10 hover:text-white',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:ring-offset-2',
                  isActive && 'bg-white/20 text-white font-semibold',
                  item.disabled && 'opacity-40 cursor-not-allowed pointer-events-none'
                )}
                aria-current={isActive ? 'page' : undefined}
                aria-disabled={item.disabled}
              >
                <Icon className="h-5 w-5 flex-shrink-0" aria-hidden="true" />
                <span className="flex-1">{item.label}</span>
                {item.badge && (
                  <Badge variant="secondary" className="ml-auto bg-white/20 text-white border-0">
                    {item.badge}
                  </Badge>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer User Info */}
        <div className="border-t border-white/20 p-4">
          <div className="flex items-center gap-3 rounded-lg bg-white/10 p-3">
            <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
              <span className="text-sm font-semibold text-white">
                {user?.firstName?.[0]?.toUpperCase() || 'U'}
                {user?.lastName?.[0]?.toUpperCase() || ''}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate text-white">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-xs text-white/70 truncate">
                {user?.email}
              </p>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
