import { apiClient } from '../httpClient';
import type {
  PartnerDocument,
  VerifyDocumentDto,
} from '../types/document.types';

export const documentsApi = {
  // Récupère les documents d'une entité (ici un partenaire) — réservé super_admin/support
  getByEntity: async (
    entityType: string,
    entityId: string,
  ): Promise<PartnerDocument[]> => {
    const response = entityType === 'partner'
      ? await apiClient.get<PartnerDocument[]>(`/partners/${entityId}/documents`)
      : await apiClient.get<PartnerDocument[]>('/documents/admin/by-entity', {
          params: { entityType, entityId },
        });
    return response.data;
  },

  // Valide ou refuse un document
  verify: async (
    partnerId: string,
    id: string,
    source: PartnerDocument['source'],
    data: VerifyDocumentDto,
  ): Promise<PartnerDocument> => {
    const response = await apiClient.patch<PartnerDocument>(
      `/partners/${partnerId}/documents/${id}/verification`,
      { ...data, source },
    );
    return response.data;
  },

  // Télécharge le fichier (renvoie un blob)
  download: async (
    partnerId: string,
    id: string,
    source: PartnerDocument['source'],
  ): Promise<Blob> => {
    const response = await apiClient.get(
      `/partners/${partnerId}/documents/${id}/download`,
      { params: { source }, responseType: 'blob' },
    );
    return response.data;
  },
};
