export type ChecklistCategory = 'tires' | 'fluids' | 'body' | 'lights' | 'interior';

export interface ChecklistItem {
  id: string;
  category: ChecklistCategory;
  label: string;
  checked: boolean;
}

export interface VehicleCheckData {
  checklistItems: ChecklistItem[];
  photos: File[];
  timestamp: Date;
  location?: {
    lat: number;
    lng: number;
  };
}

export interface VehicleCheckSubmitDto {
  checklistData: {
    items: Array<{ id: string; label: string; checked: boolean; category: string }>;
    completionRate: number;
  };
  timestamp: string;
  location?: {
    lat: number;
    lng: number;
  };
}

export const CHECKLIST_ITEMS: ChecklistItem[] = [
  // Pneus (4 items)
  { id: 'tire-1', category: 'tires', label: 'État général des pneus', checked: false },
  { id: 'tire-2', category: 'tires', label: 'Pression des pneus', checked: false },
  { id: 'tire-3', category: 'tires', label: 'Usure de la bande de roulement', checked: false },
  { id: 'tire-4', category: 'tires', label: 'Roue de secours présente', checked: false },

  // Liquides (4 items)
  { id: 'fluid-1', category: 'fluids', label: 'Niveau d\'huile moteur', checked: false },
  { id: 'fluid-2', category: 'fluids', label: 'Liquide de refroidissement', checked: false },
  { id: 'fluid-3', category: 'fluids', label: 'Liquide lave-glace', checked: false },
  { id: 'fluid-4', category: 'fluids', label: 'Pas de fuites visibles', checked: false },

  // Carrosserie (4 items)
  { id: 'body-1', category: 'body', label: 'Pas de rayures majeures', checked: false },
  { id: 'body-2', category: 'body', label: 'Pas de bosses ou chocs', checked: false },
  { id: 'body-3', category: 'body', label: 'Rétroviseurs intacts', checked: false },
  { id: 'body-4', category: 'body', label: 'Pare-brise sans fissures', checked: false },

  // Éclairages (4 items)
  { id: 'light-1', category: 'lights', label: 'Feux avant fonctionnels', checked: false },
  { id: 'light-2', category: 'lights', label: 'Feux arrière fonctionnels', checked: false },
  { id: 'light-3', category: 'lights', label: 'Clignotants opérationnels', checked: false },
  { id: 'light-4', category: 'lights', label: 'Feux de freinage OK', checked: false },

  // Intérieur (4 items)
  { id: 'interior-1', category: 'interior', label: 'Propreté générale', checked: false },
  { id: 'interior-2', category: 'interior', label: 'Ceintures de sécurité', checked: false },
  { id: 'interior-3', category: 'interior', label: 'Klaxon fonctionnel', checked: false },
  { id: 'interior-4', category: 'interior', label: 'Essuie-glaces opérationnels', checked: false },
];

export const CATEGORY_LABELS: Record<ChecklistCategory, string> = {
  tires: 'Pneus',
  fluids: 'Liquides',
  body: 'Carrosserie',
  lights: 'Éclairages',
  interior: 'Intérieur',
};

export const CATEGORY_ICONS: Record<ChecklistCategory, string> = {
  tires: '🛞',
  fluids: '💧',
  body: '🚗',
  lights: '💡',
  interior: '🪑',
};
