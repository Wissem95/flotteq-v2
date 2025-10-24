import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { AlertCircle, CheckCircle } from 'lucide-react';
import type { Commission } from '@/api/types/commission.types';
import { useMarkAsPaid } from '@/hooks/useCommissions';

interface PendingCommissionsListProps {
  commissions: Commission[];
}

export const PendingCommissionsList = ({ commissions }: PendingCommissionsListProps) => {
  const [selectedCommission, setSelectedCommission] = useState<Commission | null>(null);
  const [paymentReference, setPaymentReference] = useState('');
  const markAsPaid = useMarkAsPaid();

  const handleMarkAsPaid = () => {
    if (!selectedCommission || !paymentReference.trim()) return;

    markAsPaid.mutate(
      {
        id: selectedCommission.id,
        data: { paymentReference: paymentReference.trim() },
      },
      {
        onSuccess: () => {
          setSelectedCommission(null);
          setPaymentReference('');
        },
      }
    );
  };

  const formatDate = (date: Date | null) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('fr-FR');
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-yellow-600" />
            Commissions en attente de paiement
          </CardTitle>
        </CardHeader>
        <CardContent>
          {commissions.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-3" />
              <p className="text-muted-foreground">
                Aucune commission en attente de paiement
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Partenaire</TableHead>
                  <TableHead>Booking</TableHead>
                  <TableHead className="text-right">Montant</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {commissions.map((commission) => (
                  <TableRow key={commission.id}>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDate(commission.createdAt)}
                    </TableCell>
                    <TableCell className="font-medium">
                      {commission.partnerName}
                    </TableCell>
                    <TableCell className="text-sm font-mono">
                      {commission.bookingReference}
                    </TableCell>
                    <TableCell className="text-right font-bold text-green-600">
                      €{Number(commission.amount).toFixed(2)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedCommission(commission)}
                      >
                        Marquer payé
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Dialog pour marquer comme payé */}
      <Dialog
        open={!!selectedCommission}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedCommission(null);
            setPaymentReference('');
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Marquer la commission comme payée</DialogTitle>
            <DialogDescription>
              Confirmez le paiement de la commission pour{' '}
              <strong>{selectedCommission?.partnerName}</strong>
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="reference">Référence de paiement *</Label>
              <Input
                id="reference"
                placeholder="Ex: VIREMENT_20251024_001"
                value={paymentReference}
                onChange={(e) => setPaymentReference(e.target.value)}
              />
            </div>

            <div className="rounded-lg bg-muted p-3 space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Montant :</span>
                <span className="font-bold">
                  €{selectedCommission?.amount ? Number(selectedCommission.amount).toFixed(2) : '0.00'}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Booking :</span>
                <span className="font-mono text-xs">
                  {selectedCommission?.bookingReference}
                </span>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setSelectedCommission(null);
                setPaymentReference('');
              }}
            >
              Annuler
            </Button>
            <Button
              onClick={handleMarkAsPaid}
              disabled={!paymentReference.trim() || markAsPaid.isPending}
            >
              {markAsPaid.isPending ? 'Enregistrement...' : 'Confirmer le paiement'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
