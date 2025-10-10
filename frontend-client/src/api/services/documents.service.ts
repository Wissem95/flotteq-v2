import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '@/config/api';
import type {
  Document,
  UploadDocumentDto,
  ExpiringDocument,
  QueryDocumentsDto,
} from '../../types/document.types';

// ============= API Functions =============

export const documentsApi = {
  /**
   * Upload un nouveau document
   */
  async upload(dto: UploadDocumentDto): Promise<Document> {
    const formData = new FormData();
    formData.append('file', dto.file);
    formData.append('entityType', dto.entityType);
    formData.append('entityId', dto.entityId);

    if (dto.documentType) formData.append('documentType', dto.documentType);
    if (dto.expiryDate) formData.append('expiryDate', dto.expiryDate);
    if (dto.notes) formData.append('notes', dto.notes);

    const response = await api.post<Document>('/documents/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  /**
   * Récupérer tous les documents du tenant
   */
  async getAll(query?: QueryDocumentsDto): Promise<Document[]> {
    const response = await api.get<Document[]>('/documents', { params: query });
    return response.data;
  },

  /**
   * Récupérer un document par ID
   */
  async getOne(id: string): Promise<Document> {
    const response = await api.get<Document>(`/documents/${id}`);
    return response.data;
  },

  /**
   * Télécharger un document
   */
  async download(id: string): Promise<Blob> {
    const response = await api.get<Blob>(`/documents/${id}/download`, {
      responseType: 'blob',
    });
    return response.data;
  },

  /**
   * Supprimer un document
   */
  async delete(id: string): Promise<void> {
    await api.delete(`/documents/${id}`);
  },

  /**
   * Récupérer les documents expirant bientôt
   */
  async getExpiring(days: number = 30): Promise<ExpiringDocument[]> {
    const response = await api.get<ExpiringDocument[]>('/documents/alerts/expiring', {
      params: { days },
    });
    return response.data;
  },
};

// ============= React Query Hooks =============

/**
 * Hook pour récupérer tous les documents
 */
export const useDocuments = (query?: QueryDocumentsDto) => {
  return useQuery({
    queryKey: ['documents', query],
    queryFn: () => documentsApi.getAll(query),
  });
};

/**
 * Hook pour récupérer un document par ID
 */
export const useDocument = (id: string) => {
  return useQuery({
    queryKey: ['documents', id],
    queryFn: () => documentsApi.getOne(id),
    enabled: !!id,
  });
};

/**
 * Hook pour récupérer les documents expirant bientôt
 */
export const useExpiringDocuments = (days: number = 30) => {
  return useQuery({
    queryKey: ['documents', 'expiring', days],
    queryFn: () => documentsApi.getExpiring(days),
  });
};

/**
 * Hook pour uploader un document
 */
export const useUploadDocument = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: documentsApi.upload,
    onSuccess: () => {
      // Invalider le cache pour rafraîchir la liste
      queryClient.invalidateQueries({ queryKey: ['documents'] });
    },
  });
};

/**
 * Hook pour supprimer un document
 */
export const useDeleteDocument = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: documentsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
    },
  });
};

/**
 * Hook pour télécharger un document
 */
export const useDownloadDocument = () => {
  return useMutation({
    mutationFn: async ({ id, fileName }: { id: string; fileName: string }) => {
      const blob = await documentsApi.download(id);

      // Créer un lien temporaire pour télécharger
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    },
  });
};
