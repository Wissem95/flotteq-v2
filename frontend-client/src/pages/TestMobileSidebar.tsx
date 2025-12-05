import { MobileSidebar } from '@/layouts/components/MobileSidebar';

/**
 * Page de test pour MobileSidebar - À supprimer après validation
 *
 * Sprint: M1, Ticket: T-M1.3
 */
export function TestMobileSidebar() {
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="border-2 border-dashed border-primary rounded-lg p-6">
          <h1 className="text-2xl font-bold mb-4">Test MobileSidebar</h1>
          <p className="text-muted-foreground mb-4">
            Resize la fenêtre à moins de 768px pour voir le bouton hamburger.
          </p>

          {/* MobileSidebar Test */}
          <div className="flex items-center gap-4 p-4 bg-muted rounded-lg">
            <MobileSidebar />
            <span className="text-sm font-medium">
              ← Hamburger menu (visible &lt; 768px uniquement)
            </span>
          </div>
        </div>

        {/* Instructions de test */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Tests à effectuer :</h2>
          <ul className="space-y-2 text-sm">
            <li className="flex items-start gap-2">
              <span className="text-primary font-bold">1.</span>
              <span>Resize fenêtre à 767px → Hamburger apparaît</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary font-bold">2.</span>
              <span>Clic sur hamburger → Drawer s&apos;ouvre de gauche</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary font-bold">3.</span>
              <span>Vérifier que les 11 items de navigation sont visibles</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary font-bold">4.</span>
              <span>Clic sur un item → Navigation + drawer se ferme</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary font-bold">5.</span>
              <span>Clic sur overlay semi-transparent → Drawer se ferme</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary font-bold">6.</span>
              <span>Appuyer sur Escape → Drawer se ferme</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary font-bold">7.</span>
              <span>Resize à 768px+ → Hamburger disparaît</span>
            </li>
          </ul>
        </div>

        {/* Indicateur de breakpoint */}
        <div className="border rounded-lg p-4 bg-muted">
          <p className="text-sm font-medium mb-2">Breakpoint actuel :</p>
          <div className="xs:bg-red-100 sm:bg-blue-100 md:bg-green-100 lg:bg-yellow-100 p-2 rounded">
            <span className="xs:inline hidden font-mono text-sm">XS (375px+)</span>
            <span className="sm:inline hidden font-mono text-sm">SM (640px+)</span>
            <span className="md:inline hidden font-mono text-sm">
              MD (768px+) - Hamburger DOIT être invisible
            </span>
            <span className="lg:inline hidden font-mono text-sm">
              LG (1024px+) - Hamburger DOIT être invisible
            </span>
          </div>
        </div>

        {/* Liste des navigation items */}
        <div className="border rounded-lg p-4 bg-muted">
          <p className="text-sm font-medium mb-2">Navigation items (11 attendus) :</p>
          <ol className="text-xs space-y-1 font-mono">
            <li>1. Tableau de bord → /dashboard</li>
            <li>2. Véhicules → /vehicles</li>
            <li>3. Conducteurs → /drivers</li>
            <li>4. Historique trajets → /trips-history</li>
            <li>5. Maintenances → /maintenances</li>
            <li>6. Documents → /documents</li>
            <li>7. Marketplace → /marketplace</li>
            <li>8. Mes réservations → /my-bookings</li>
            <li>9. Utilisateurs → /users</li>
            <li>10. Facturation → /billing</li>
            <li>11. Paramètres → /settings</li>
          </ol>
        </div>

        {/* Features validées */}
        <div className="border rounded-lg p-4 bg-muted">
          <p className="text-sm font-medium mb-2">Features à valider :</p>
          <ul className="text-xs space-y-1">
            <li>✅ shadcn/ui Sheet component</li>
            <li>✅ Hamburger icon (Menu de lucide-react)</li>
            <li>✅ md:hidden class (visible uniquement &lt; 768px)</li>
            <li>✅ Drawer 280px width, side=&quot;left&quot;</li>
            <li>✅ Logo Flotteq (Car icon) dans header</li>
            <li>✅ 11 navigation items avec icons</li>
            <li>✅ Active route highlighting (bg-accent)</li>
            <li>✅ Auto-close après navigation (setOpen(false))</li>
            <li>✅ User info footer (firstName, lastName, email)</li>
            <li>✅ Accessibilité (aria-label, sr-only, aria-current)</li>
            <li>✅ Keyboard navigation (Tab, Enter, Escape)</li>
            <li>✅ Badge support pour notifications</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
