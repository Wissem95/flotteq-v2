import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { documentsApi } from '@/api/endpoints/documents';
import type { VerifyDocumentDto } from '@/api/types/document.types';
import { useToast } from '@/hooks/use-toast';

// Hook de gestion des documents d'un partenaire (liste + vérification + téléchargement)
export const usePartnerDocuments = (partnerId: string, enabled = true) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const queryKey = ['partner-documents', partnerId];

  const { data, isLoading, error, refetch } = useQuery({
    queryKey,
    queryFn: () => documentsApi.getByEntity('partner', partnerId),
    enabled: enabled && !!partnerId,
  });

  // Validation / refus d'un document
  const verifyMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: VerifyDocumentDto }) =>
      documentsApi.verify(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey });
      toast({
        title: variables.data.status === 'approved' ? 'Document validé' : 'Document refusé',
        description: 'Le statut du document a été mis à jour',
      });
    },
    onError: (error: any) => {
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: error.response?.data?.message || 'Impossible de mettre à jour le document',
      });
    },
  });

  // Téléchargement d'un document via blob (ouvre le fichier dans un nouvel onglet)
  const downloadDocument = async (id: string, fileName: string) => {
    try {
      const blob = await documentsApi.download(id);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName || 'document';
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: err.response?.data?.message || 'Impossible de télécharger le document',
      });
    }
  };

  return {
    documents: data || [],
    isLoading,
    error,
    refetch,
    verifyDocument: verifyMutation.mutate,
    isVerifying: verifyMutation.isPending,
    downloadDocument,
  };
};
