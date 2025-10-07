export interface Plan {
  id: string;
  name: string;
  price: number;
  interval: 'month' | 'year';
  features: string[];
  maxVehicles: number;
  maxDrivers: number;
  storageGB: number;
}

export const PLANS: Plan[] = [
  {
    id: 'starter',
    name: 'Starter',
    price: 29,
    interval: 'month',
    maxVehicles: 5,
    maxDrivers: 5,
    storageGB: 1,
    features: [
      'Jusqu\'à 5 véhicules',
      'Jusqu\'à 5 conducteurs',
      'Gestion maintenances',
      '1 GB stockage documents',
    ],
  },
  {
    id: 'professional',
    name: 'Professional',
    price: 79,
    interval: 'month',
    maxVehicles: 20,
    maxDrivers: 20,
    storageGB: 5,
    features: [
      'Jusqu\'à 20 véhicules',
      'Jusqu\'à 20 conducteurs',
      'Gestion maintenances avancée',
      '5 GB stockage documents',
      'Rapports personnalisés',
    ],
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 199,
    interval: 'month',
    maxVehicles: -1, // Illimité
    maxDrivers: -1,
    storageGB: 50,
    features: [
      'Véhicules illimités',
      'Conducteurs illimités',
      'Toutes les fonctionnalités',
      '50 GB stockage',
      'Support prioritaire',
      'API access',
    ],
  },
];
