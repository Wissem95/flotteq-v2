import {
  LayoutDashboard,
  Car,
  Users,
  Wrench,
  FileText,
  UserCog,
  CreditCard,
  Settings,
  ShoppingBag,
  Calendar,
  Route,
  type LucideIcon,
} from 'lucide-react';

/**
 * Interface pour les éléments de navigation
 *
 * @property label - Texte affiché dans le menu
 * @property path - Chemin de la route
 * @property icon - Composant d'icône Lucide React
 * @property disabled - Si true, l'élément est désactivé (optionnel)
 * @property badge - Nombre à afficher dans un badge (optionnel)
 */
export interface NavItem {
  label: string;
  path: string;
  icon: LucideIcon;
  disabled?: boolean;
  badge?: number;
}

/**
 * Configuration de navigation partagée pour TenantLayout
 *
 * Utilisée par:
 * - Desktop sidebar dans TenantLayout
 * - Mobile sidebar (MobileSidebar component)
 *
 * ⚠️ IMPORTANT: Maintenir la cohérence avec TenantLayout.tsx menuItems
 *
 * Sprint: M1, Ticket: T-M1.3
 */
export const navigationItems: NavItem[] = [
  {
    label: 'Tableau de bord',
    path: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    label: 'Véhicules',
    path: '/vehicles',
    icon: Car,
  },
  {
    label: 'Conducteurs',
    path: '/drivers',
    icon: Users,
  },
  {
    label: 'Historique trajets',
    path: '/trips-history',
    icon: Route,
  },
  {
    label: 'Maintenances',
    path: '/maintenances',
    icon: Wrench,
  },
  {
    label: 'Documents',
    path: '/documents',
    icon: FileText,
  },
  {
    label: 'Marketplace',
    path: '/marketplace',
    icon: ShoppingBag,
  },
  {
    label: 'Mes réservations',
    path: '/my-bookings',
    icon: Calendar,
  },
  {
    label: 'Utilisateurs',
    path: '/users',
    icon: UserCog,
  },
  {
    label: 'Facturation',
    path: '/billing',
    icon: CreditCard,
  },
  {
    label: 'Paramètres',
    path: '/settings',
    icon: Settings,
  },
];
