// Statut de vérification d'un document partenaire
export type DocumentVerificationStatus = 'pending' | 'approved' | 'rejected';

export interface PartnerDocument {
  id: string;
  fileName: string;
  fileUrl: string;
  mimeType: string;
  documentType: string;
  createdAt: string;
  verificationStatus: DocumentVerificationStatus;
  verificationNotes?: string | null;
}

export interface VerifyDocumentDto {
  status: 'approved' | 'rejected';
  notes?: string;
}
