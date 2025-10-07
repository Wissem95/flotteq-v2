import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { HardDrive, Edit, X, Check, AlertCircle } from 'lucide-react';
import { apiClient } from '@/api/httpClient';

interface StorageUsage {
  tenantName: string;
  planName: string;
  planQuotaMb: number;
  customQuotaMb: number | null;
  effectiveQuotaMb: number;
  usedMb: number;
  availableMb: number;
  usagePercent: number;
  fileCount: number;
}

interface Props {
  tenantId: number;
  storageUsage?: StorageUsage;
}

export const TenantStorageTab = ({ tenantId, storageUsage }: Props) => {
  const [isEditing, setIsEditing] = useState(false);
  const [customQuota, setCustomQuota] = useState<string>('');
  const queryClient = useQueryClient();

  const updateQuotaMutation = useMutation({
    mutationFn: async (quotaMb: number | null) => {
      const response = await apiClient.patch(`/tenants/${tenantId}/storage-quota`, {
        customStorageQuotaMb: quotaMb,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenant', tenantId] });
      queryClient.invalidateQueries({ queryKey: ['tenant-storage', tenantId] });
      setIsEditing(false);
      setCustomQuota('');
    },
  });

  if (!storageUsage) {
    return (
      <Card className="p-6">
        <p className="text-muted-foreground">Chargement des données de stockage...</p>
      </Card>
    );
  }

  const handleSaveQuota = () => {
    const quotaValue = customQuota.trim() === '' ? null : parseInt(customQuota);
    updateQuotaMutation.mutate(quotaValue);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setCustomQuota('');
  };

  const getProgressColor = (percent: number) => {
    if (percent >= 90) return 'bg-red-500';
    if (percent >= 75) return 'bg-orange-500';
    if (percent >= 50) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const isOverQuota = storageUsage.usedMb > storageUsage.effectiveQuotaMb;

  return (
    <div className="space-y-6">
      {/* Overview Card */}
      <Card className="p-6">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-full bg-blue-100">
              <HardDrive className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Stockage de documents</h3>
              <p className="text-sm text-muted-foreground">
                Gestion du quota de stockage
              </p>
            </div>
          </div>
        </div>

        {/* Usage Progress */}
        <div className="space-y-2 mb-6">
          <div className="flex justify-between text-sm">
            <span>Utilisation</span>
            <span className="font-medium">
              {storageUsage.usedMb.toFixed(2)} MB / {storageUsage.effectiveQuotaMb} MB
            </span>
          </div>
          <Progress
            value={Math.min(storageUsage.usagePercent, 100)}
            className="h-2"
            indicatorClassName={getProgressColor(storageUsage.usagePercent)}
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{storageUsage.fileCount} fichier(s)</span>
            <span>{storageUsage.usagePercent.toFixed(1)}% utilisé</span>
          </div>
        </div>

        {/* Over Quota Warning */}
        {isOverQuota && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              ⚠️ Le tenant a dépassé son quota de stockage. Les nouveaux uploads seront bloqués.
            </AlertDescription>
          </Alert>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="p-4 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground">Espace disponible</p>
            <p className="text-2xl font-bold text-green-600">
              {storageUsage.availableMb.toFixed(0)} MB
            </p>
          </div>
          <div className="p-4 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground">Fichiers stockés</p>
            <p className="text-2xl font-bold">{storageUsage.fileCount}</p>
          </div>
        </div>
      </Card>

      {/* Quota Management Card */}
      <Card className="p-6">
        <h4 className="font-semibold mb-4">Configuration du quota</h4>

        <div className="space-y-4">
          <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
            <div>
              <p className="text-sm font-medium">Quota du plan "{storageUsage.planName}"</p>
              <p className="text-xs text-muted-foreground">Quota par défaut selon le plan d'abonnement</p>
            </div>
            <p className="text-lg font-bold">{storageUsage.planQuotaMb} MB</p>
          </div>

          {!isEditing ? (
            <div className="flex justify-between items-center p-3 border rounded-lg">
              <div>
                <p className="text-sm font-medium">Quota personnalisé</p>
                <p className="text-xs text-muted-foreground">
                  {storageUsage.customQuotaMb
                    ? `Remplace le quota du plan`
                    : 'Non défini (utilise le quota du plan)'}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <p className="text-lg font-bold">
                  {storageUsage.customQuotaMb || '—'}
                  {storageUsage.customQuotaMb && ' MB'}
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setIsEditing(true);
                    setCustomQuota(storageUsage.customQuotaMb?.toString() || '');
                  }}
                >
                  <Edit className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ) : (
            <div className="p-4 border rounded-lg space-y-4">
              <div className="space-y-2">
                <Label htmlFor="customQuota">Quota personnalisé (MB)</Label>
                <Input
                  id="customQuota"
                  type="number"
                  min="0"
                  placeholder="Laisser vide pour utiliser le quota du plan"
                  value={customQuota}
                  onChange={(e) => setCustomQuota(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Laissez vide pour réinitialiser et utiliser le quota du plan ({storageUsage.planQuotaMb} MB)
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={handleSaveQuota}
                  disabled={updateQuotaMutation.isPending}
                  size="sm"
                >
                  <Check className="h-4 w-4 mr-2" />
                  Enregistrer
                </Button>
                <Button
                  variant="outline"
                  onClick={handleCancel}
                  disabled={updateQuotaMutation.isPending}
                  size="sm"
                >
                  <X className="h-4 w-4 mr-2" />
                  Annuler
                </Button>
              </div>
            </div>
          )}

          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm font-medium text-blue-900 mb-1">
              💡 Quota effectif actuel
            </p>
            <p className="text-xs text-blue-700">
              Le quota effectif est de <strong>{storageUsage.effectiveQuotaMb} MB</strong>
              {storageUsage.customQuotaMb
                ? ' (quota personnalisé appliqué)'
                : ' (quota du plan appliqué)'}
            </p>
          </div>
        </div>
      </Card>

      {/* Help Card */}
      <Card className="p-6 bg-muted">
        <h4 className="font-semibold mb-2">ℹ️ Informations</h4>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li>• Le quota personnalisé remplace celui du plan</li>
          <li>• Le quota est réinitialisé lors d'un changement de plan</li>
          <li>• Les fichiers supprimés libèrent immédiatement de l'espace</li>
          <li>• Les uploads sont bloqués si le quota est dépassé</li>
        </ul>
      </Card>
    </div>
  );
};
