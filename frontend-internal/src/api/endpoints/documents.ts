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
    const response = await apiClient.get<PartnerDocument[]>(
      '/documents/admin/by-entity',
      { params: { entityType, entityId } },
    );
    return response.data;
  },

  // Valide ou refuse un document
  verify: async (id: string, data: VerifyDocumentDto): Promise<PartnerDocument> => {
    const response = await apiClient.patch<PartnerDocument>(
      `/documents/${id}/verification`,
      data,
    );
    return response.data;
  },

  // Télécharge le fichier (renvoie un blob)
  download: async (id: string): Promise<Blob> => {
    const response = await apiClient.get(`/documents/${id}/download`, {
      responseType: 'blob',
    });
    return response.data;
  },
};
