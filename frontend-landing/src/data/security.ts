export interface SecurityItem {
  iconKey: 'shield' | 'lock' | 'flag' | 'backup';
  label: string;
  description: string;
}

export const securityItems: SecurityItem[] = [
  { iconKey: 'shield', label: 'RGPD', description: 'Conformité native, données en France.' },
  { iconKey: 'lock', label: 'TLS 1.3', description: 'Connexions chiffrées de bout en bout.' },
  { iconKey: 'flag', label: 'Hébergé en France', description: 'OVH Gravelines, jamais hors UE.' },
  { iconKey: 'backup', label: 'Sauvegardes', description: 'Quotidiennes, restoration jusqu\'à J-30.' },
];
