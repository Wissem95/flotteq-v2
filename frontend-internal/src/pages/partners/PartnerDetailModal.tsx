import { useState, useEffect } from 'react';
import {
  useApprovePartner,
  useRejectPartner,
  useSuspendPartner,
  useUpdateCommissionRate,
  usePartnerServices,
  useDeletePartner,
} from '@/hooks/usePartners';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import {
  CheckCircle,
  XCircle,
  PauseCircle,
  Edit3,
  MapPin,
  Phone,
  Mail,
  Building2,
  FileText,
  Star,
  DollarSign,
  CreditCard,
  Loader2,
  Trash2,
  Edit,
} from 'lucide-react';
import type { Partner, PartnerStatus } from '@/api/types/partner.types';

interface PartnerDetailModalProps {
  partner: Partner;
  open: boolean;
  onClose: () => void;
  onEdit?: (partner: Partner) => void;
}

type ActionType = 'approve' | 'reject' | 'suspend' | 'commission' | 'delete' | null;

export const PartnerDetailModal = ({ partner, open, onClose, onEdit }: PartnerDetailModalProps) => {
  const [actionType, setActionType] = useState<ActionType>(null);
  const [reason, setReason] = useState('');
  const [commissionRate, setCommissionRate] = useState(partner.commissionRate.toString());

  const approvePartner = useApprovePartner();
  const rejectPartner = useRejectPartner();
  const suspendPartner = useSuspendPartner();
  const updateCommission = useUpdateCommissionRate();
  const deletePartner = useDeletePartner();

  const { data: services, isLoading: servicesLoading } = usePartnerServices(partner.id);

  useEffect(() => {
    setCommissionRate(partner.commissionRate.toString());
  }, [partner.commissionRate]);

  const handleApprove = () => {
    approvePartner.mutate(partner.id, {
      onSuccess: () => {
        setActionType(null);
        onClose();
      },
    });
  };

  const handleReject = () => {
    rejectPartner.mutate(
      { id: partner.id, data: reason ? { reason } : undefined },
      {
        onSuccess: () => {
          setActionType(null);
          setReason('');
          onClose();
        },
      },
    );
  };

  const handleSuspend = () => {
    suspendPartner.mutate(
      { id: partner.id, data: reason ? { reason } : undefined },
      {
        onSuccess: () => {
          setActionType(null);
          setReason('');
          onClose();
        },
      },
    );
  };

  const handleUpdateCommission = () => {
    const rate = parseFloat(commissionRate);
    if (isNaN(rate) || rate < 0 || rate > 100) {
      return;
    }

    updateCommission.mutate(
      { id: partner.id, data: { commissionRate: rate } },
      {
        onSuccess: () => {
          setActionType(null);
          onClose();
        },
      },
    );
  };

  const handleDelete = () => {
    deletePartner.mutate(partner.id, {
      onSuccess: () => {
        setActionType(null);
        onClose();
      },
    });
  };

  const getStatusBadge = (status: PartnerStatus) => {
    const variants = {
      pending: 'bg-yellow-500 hover:bg-yellow-600',
      approved: 'bg-green-500 hover:bg-green-600',
      rejected: 'bg-red-500 hover:bg-red-600',
      suspended: 'bg-gray-500 hover:bg-gray-600',
    };

    return (
      <Badge className={variants[status]}>
        {status.toUpperCase()}
      </Badge>
    );
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle className="text-2xl">{partner.companyName}</DialogTitle>
              {getStatusBadge(partner.status)}
            </div>
            <DialogDescription>Détails et actions administrateur</DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Company Info */}
            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Informations Entreprise
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Type</Label>
                  <p className="font-medium">{partner.type}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">SIRET</Label>
                  <p className="font-medium font-mono">{partner.siretNumber}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground flex items-center gap-1">
                    <Mail className="h-3 w-3" /> Email
                  </Label>
                  <p className="font-medium">{partner.email}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground flex items-center gap-1">
                    <Phone className="h-3 w-3" /> Téléphone
                  </Label>
                  <p className="font-medium">{partner.phone}</p>
                </div>
              </div>
            </div>

            <Separator />

            {/* Address */}
            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Adresse
              </h3>
              <div className="space-y-2">
                <p className="font-medium">{partner.address}</p>
                <p className="text-muted-foreground">
                  {partner.postalCode} {partner.city}
                </p>
                {partner.latitude && partner.longitude && (
                  <p className="text-sm text-muted-foreground">
                    GPS: {partner.latitude}, {partner.longitude}
                  </p>
                )}
              </div>
            </div>

            {partner.description && (
              <>
                <Separator />
                <div>
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Description
                  </h3>
                  <p className="text-muted-foreground">{partner.description}</p>
                </div>
              </>
            )}

            <Separator />

            {/* Stats */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Statistiques</h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-yellow-500" />
                  <div>
                    <p className="text-sm text-muted-foreground">Note</p>
                    <p className="text-lg font-semibold">
                      {Number(partner.rating).toFixed(1)} ({partner.totalReviews} avis)
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-green-500" />
                  <div>
                    <p className="text-sm text-muted-foreground">Commission</p>
                    <p className="text-lg font-semibold">{Number(partner.commissionRate).toFixed(0)}%</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-blue-500" />
                  <div>
                    <p className="text-sm text-muted-foreground">Stripe</p>
                    <p className="text-sm font-semibold">
                      {partner.stripeOnboardingCompleted ? (
                        <Badge variant="default" className="bg-green-500">
                          Configuré
                        </Badge>
                      ) : (
                        <Badge variant="outline">Non configuré</Badge>
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Documents */}
            {partner.insuranceDocument && (
              <>
                <Separator />
                <div>
                  <h3 className="text-lg font-semibold mb-3">Documents</h3>
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    <a
                      href={partner.insuranceDocument}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      Assurance professionnelle
                    </a>
                  </div>
                </div>
              </>
            )}

            <Separator />

            {/* Services */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Services proposés</h3>
              {servicesLoading ? (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Chargement des services...
                </div>
              ) : services && services.length > 0 ? (
                <div className="space-y-2">
                  {services.map((service) => (
                    <div
                      key={service.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div>
                        <p className="font-medium">{service.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {service.description}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Durée: {service.duration} min
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-semibold">{service.price} €</p>
                        <Badge variant={service.isActive ? 'default' : 'outline'}>
                          {service.isActive ? 'Actif' : 'Inactif'}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">Aucun service proposé</p>
              )}
            </div>
          </div>

          <DialogFooter className="flex gap-2 flex-wrap justify-between">
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => onEdit?.(partner)}
              >
                <Edit className="h-4 w-4 mr-2" />
                Modifier
              </Button>
              <Button
                variant="destructive"
                onClick={() => setActionType('delete')}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Supprimer
              </Button>
            </div>

            <div className="flex gap-2">
              {partner.status === 'pending' && (
                <>
                  <Button
                    variant="default"
                    className="bg-green-600 hover:bg-green-700"
                    onClick={() => setActionType('approve')}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Approuver
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => setActionType('reject')}
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Rejeter
                  </Button>
                </>
              )}

              {partner.status === 'approved' && (
                <Button
                  variant="outline"
                  onClick={() => setActionType('suspend')}
                >
                  <PauseCircle className="h-4 w-4 mr-2" />
                  Suspendre
                </Button>
              )}

              <Button
                variant="outline"
                onClick={() => setActionType('commission')}
              >
                <Edit3 className="h-4 w-4 mr-2" />
                Modifier Commission
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Approve Dialog */}
      <AlertDialog open={actionType === 'approve'} onOpenChange={() => setActionType(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Approuver le partenaire</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir approuver <strong>{partner.companyName}</strong> ?
              Le partenaire pourra alors proposer ses services.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleApprove}
              className="bg-green-600 hover:bg-green-700"
              disabled={approvePartner.isPending}
            >
              {approvePartner.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                'Approuver'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reject Dialog */}
      <AlertDialog open={actionType === 'reject'} onOpenChange={() => setActionType(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Rejeter le partenaire</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir rejeter <strong>{partner.companyName}</strong> ?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <Label htmlFor="reject-reason">Motif (optionnel)</Label>
            <Textarea
              id="reject-reason"
              placeholder="Expliquez pourquoi le partenaire est rejeté..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="mt-2"
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setReason('')}>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleReject}
              className="bg-red-600 hover:bg-red-700"
              disabled={rejectPartner.isPending}
            >
              {rejectPartner.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                'Rejeter'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Suspend Dialog */}
      <AlertDialog open={actionType === 'suspend'} onOpenChange={() => setActionType(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Suspendre le partenaire</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir suspendre <strong>{partner.companyName}</strong> ?
              Le partenaire ne pourra plus proposer ses services.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <Label htmlFor="suspend-reason">Motif (optionnel)</Label>
            <Textarea
              id="suspend-reason"
              placeholder="Expliquez pourquoi le partenaire est suspendu..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="mt-2"
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setReason('')}>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleSuspend}
              className="bg-gray-600 hover:bg-gray-700"
              disabled={suspendPartner.isPending}
            >
              {suspendPartner.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                'Suspendre'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Commission Dialog */}
      <AlertDialog open={actionType === 'commission'} onOpenChange={() => setActionType(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Modifier le taux de commission</AlertDialogTitle>
            <AlertDialogDescription>
              Définir le taux de commission pour <strong>{partner.companyName}</strong>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <Label htmlFor="commission-rate">Taux de commission (%)</Label>
            <Input
              id="commission-rate"
              type="number"
              min="0"
              max="100"
              step="0.01"
              value={commissionRate}
              onChange={(e) => setCommissionRate(e.target.value)}
              className="mt-2"
            />
            <p className="text-sm text-muted-foreground mt-2">
              Valeur actuelle: {partner.commissionRate}%
            </p>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleUpdateCommission}
              className="bg-flotteq-blue hover:bg-flotteq-navy"
              disabled={
                updateCommission.isPending ||
                parseFloat(commissionRate) < 0 ||
                parseFloat(commissionRate) > 100 ||
                isNaN(parseFloat(commissionRate))
              }
            >
              {updateCommission.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                'Enregistrer'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Dialog */}
      <AlertDialog open={actionType === 'delete'} onOpenChange={() => setActionType(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer le partenaire</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer <strong>{partner.companyName}</strong> ?
              Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
              disabled={deletePartner.isPending}
            >
              {deletePartner.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                'Supprimer'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
