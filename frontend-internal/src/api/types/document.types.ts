// Statut de vérification d'un document partenaire
export type DocumentVerificationStatus = 'pending' | 'approved' | 'rejected';

export interface PartnerDocument {
  id: string;
  fileName: string;
  mimeType: string;
  size: number;
  documentType: string;
  createdAt: string;
  verificationStatus: DocumentVerificationStatus;
  verificationNotes?: string | null;
  source: 'registration' | 'legacy';
}

export interface VerifyDocumentDto {
  status: 'approved' | 'rejected';
  notes?: string;
}
