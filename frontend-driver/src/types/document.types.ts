export const DocumentEntityType = {
  VEHICLE: 'vehicle',
  DRIVER: 'driver',
  MAINTENANCE: 'maintenance',
} as const;

export type DocumentEntityType = typeof DocumentEntityType[keyof typeof DocumentEntityType];

export const DocumentType = {
  PERMIS: 'permis',
  CARTE_GRISE: 'carte_grise',
  ASSURANCE: 'assurance',
  CONTROLE_TECHNIQUE: 'controle_technique',
  FACTURE: 'facture',
  CONTRAT: 'contrat',
  AUTRE: 'autre',
} as const;

export type DocumentType = typeof DocumentType[keyof typeof DocumentType];

export interface Document {
  id: string;
  fileName: string;
  fileUrl: string;
  mimeType: string;
  size: number;
  entityType: DocumentEntityType;
  entityId: string;
  uploadedById: string;
  documentType?: DocumentType;
  expiryDate?: string;
  notes?: string;
  tenantId: number;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

export interface UploadDocumentDto {
  file: File;
  entityType: DocumentEntityType;
  entityId: string;
  documentType?: DocumentType;
  expiryDate?: string;
  notes?: string;
}

export interface ExpiringDocument {
  id: string;
  fileName: string;
  documentType: DocumentType;
  entityType: DocumentEntityType;
  entityId: string;
  expiryDate: string;
  daysUntilExpiry: number;
  urgencyLevel: 'critical' | 'warning' | 'info';
}

export interface QueryDocumentsDto {
  entityType?: DocumentEntityType;
  entityId?: string;
}

// Labels pour l'UI
export const DocumentTypeLabels: Record<DocumentType, string> = {
  [DocumentType.PERMIS]: 'Permis de conduire',
  [DocumentType.CARTE_GRISE]: 'Carte grise',
  [DocumentType.ASSURANCE]: 'Assurance',
  [DocumentType.CONTROLE_TECHNIQUE]: 'Contrôle technique',
  [DocumentType.FACTURE]: 'Facture',
  [DocumentType.CONTRAT]: 'Contrat',
  [DocumentType.AUTRE]: 'Autre',
};

export const DocumentEntityTypeLabels: Record<DocumentEntityType, string> = {
  [DocumentEntityType.VEHICLE]: 'Véhicule',
  [DocumentEntityType.DRIVER]: 'Conducteur',
  [DocumentEntityType.MAINTENANCE]: 'Maintenance',
};
