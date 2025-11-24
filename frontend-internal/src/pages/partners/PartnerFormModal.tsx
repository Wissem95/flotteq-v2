import { useState, useEffect } from 'react';
import { useCreatePartner, useUpdatePartner } from '@/hooks/usePartners';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import type { Partner } from '@/api/types/partner.types';
import { PartnerType } from '@/api/types/partner.types';

interface PartnerFormModalProps {
  partner?: Partner | null;
  open: boolean;
  onClose: () => void;
}

export const PartnerFormModal = ({ partner, open, onClose }: PartnerFormModalProps) => {
  const isEdit = !!partner;
  const createPartner = useCreatePartner();
  const updatePartner = useUpdatePartner();

  const [formData, setFormData] = useState({
    companyName: '',
    type: 'garage' as PartnerType,
    email: '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
    latitude: '',
    longitude: '',
    description: '',
    siretNumber: '',
    ownerEmail: '',
    ownerPassword: '',
    ownerFirstName: '',
    ownerLastName: '',
  });

  useEffect(() => {
    if (partner) {
      setFormData({
        companyName: partner.companyName,
        type: partner.type,
        email: partner.email,
        phone: partner.phone,
        address: partner.address,
        city: partner.city,
        postalCode: partner.postalCode,
        latitude: partner.latitude?.toString() || '',
        longitude: partner.longitude?.toString() || '',
        description: partner.description || '',
        siretNumber: partner.siretNumber,
        ownerEmail: '',
        ownerPassword: '',
        ownerFirstName: '',
        ownerLastName: '',
      });
    } else {
      setFormData({
        companyName: '',
        type: PartnerType.GARAGE,
        email: '',
        phone: '',
        address: '',
        city: '',
        postalCode: '',
        latitude: '',
        longitude: '',
        description: '',
        siretNumber: '',
        ownerEmail: '',
        ownerPassword: '',
        ownerFirstName: '',
        ownerLastName: '',
      });
    }
  }, [partner]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (isEdit && partner) {
      updatePartner.mutate(
        {
          id: partner.id,
          data: {
            companyName: formData.companyName,
            type: formData.type,
            email: formData.email,
            phone: formData.phone,
            address: formData.address,
            city: formData.city,
            postalCode: formData.postalCode,
            latitude: formData.latitude ? parseFloat(formData.latitude) : undefined,
            longitude: formData.longitude ? parseFloat(formData.longitude) : undefined,
            description: formData.description || undefined,
            siretNumber: formData.siretNumber,
          },
        },
        {
          onSuccess: () => onClose(),
        },
      );
    } else {
      createPartner.mutate(
        {
          ...formData,
          latitude: formData.latitude ? parseFloat(formData.latitude) : undefined,
          longitude: formData.longitude ? parseFloat(formData.longitude) : undefined,
          description: formData.description || undefined,
        },
        {
          onSuccess: () => onClose(),
        },
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Modifier' : 'Créer'} un partenaire</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="companyName">Nom entreprise *</Label>
              <Input
                id="companyName"
                value={formData.companyName}
                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                required
              />
            </div>

            <div>
              <Label htmlFor="type">Type *</Label>
              <Select
                value={formData.type}
                onValueChange={(value) => setFormData({ ...formData, type: value as PartnerType })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="garage">Garage</SelectItem>
                  <SelectItem value="ct_center">Centre CT</SelectItem>
                  <SelectItem value="insurance">Assurance</SelectItem>
                  <SelectItem value="parts_supplier">Fournisseur Pièces</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>

            <div>
              <Label htmlFor="phone">Téléphone *</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                required
              />
            </div>

            <div>
              <Label htmlFor="siretNumber">SIRET *</Label>
              <Input
                id="siretNumber"
                value={formData.siretNumber}
                onChange={(e) => setFormData({ ...formData, siretNumber: e.target.value })}
                required
              />
            </div>

            <div>
              <Label htmlFor="postalCode">Code postal *</Label>
              <Input
                id="postalCode"
                value={formData.postalCode}
                onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                required
              />
            </div>

            <div className="col-span-2">
              <Label htmlFor="address">Adresse *</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                required
              />
            </div>

            <div>
              <Label htmlFor="city">Ville *</Label>
              <Input
                id="city"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                required
              />
            </div>

            <div>
              <Label htmlFor="latitude">Latitude</Label>
              <Input
                id="latitude"
                type="number"
                step="0.000001"
                value={formData.latitude}
                onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="longitude">Longitude</Label>
              <Input
                id="longitude"
                type="number"
                step="0.000001"
                value={formData.longitude}
                onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
              />
            </div>

            <div className="col-span-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
          </div>

          {!isEdit && (
            <>
              <hr className="my-4" />
              <h3 className="font-semibold">Compte propriétaire</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="ownerFirstName">Prénom *</Label>
                  <Input
                    id="ownerFirstName"
                    value={formData.ownerFirstName}
                    onChange={(e) => setFormData({ ...formData, ownerFirstName: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="ownerLastName">Nom *</Label>
                  <Input
                    id="ownerLastName"
                    value={formData.ownerLastName}
                    onChange={(e) => setFormData({ ...formData, ownerLastName: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="ownerEmail">Email *</Label>
                  <Input
                    id="ownerEmail"
                    type="email"
                    value={formData.ownerEmail}
                    onChange={(e) => setFormData({ ...formData, ownerEmail: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="ownerPassword">Mot de passe *</Label>
                  <Input
                    id="ownerPassword"
                    type="password"
                    value={formData.ownerPassword}
                    onChange={(e) => setFormData({ ...formData, ownerPassword: e.target.value })}
                    required
                  />
                </div>
              </div>
            </>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={createPartner.isPending || updatePartner.isPending}
            >
              {(createPartner.isPending || updatePartner.isPending) && (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              )}
              {isEdit ? 'Enregistrer' : 'Créer'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
