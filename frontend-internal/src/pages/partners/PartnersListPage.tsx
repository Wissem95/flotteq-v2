import { useState } from 'react';
import { usePartners } from '@/hooks/usePartners';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Search, Eye, Loader2, Plus } from 'lucide-react';
import { PartnerDetailModal } from './PartnerDetailModal';
import { PartnerFormModal } from './PartnerFormModal';
import type { PartnerType, PartnerStatus, Partner } from '@/api/types/partner.types';

export const PartnersListPage = () => {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [typeFilter, setTypeFilter] = useState<PartnerType | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<PartnerStatus | 'all'>('all');
  const [cityFilter, setCityFilter] = useState('');
  const [selectedPartner, setSelectedPartner] = useState<Partner | null>(null);
  const [editPartner, setEditPartner] = useState<Partner | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const { data, isLoading, isError } = usePartners({
    page,
    limit: 10,
    search: search || undefined,
    type: typeFilter === 'all' ? undefined : typeFilter,
    status: statusFilter === 'all' ? undefined : statusFilter,
    city: cityFilter || undefined,
  });

  const getStatusBadge = (status: PartnerStatus) => {
    const variants = {
      pending: 'secondary',
      approved: 'default',
      rejected: 'destructive',
      suspended: 'outline',
    };
    const colors = {
      pending: 'bg-yellow-500 hover:bg-yellow-600',
      approved: 'bg-green-500 hover:bg-green-600',
      rejected: 'bg-red-500 hover:bg-red-600',
      suspended: 'bg-gray-500 hover:bg-gray-600',
    };

    return (
      <Badge variant={variants[status]} className={colors[status]}>
        {status.toUpperCase()}
      </Badge>
    );
  };

  const getTypeLabel = (type: PartnerType) => {
    const labels: Record<PartnerType, string> = {
      garage: 'Garage',
      ct_center: 'Centre CT',
      insurance: 'Assurance',
      parts_supplier: 'Fournisseur Pièces',
    };
    return labels[type];
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-flotteq-blue" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center py-12">
        <p className="text-destructive">Erreur lors du chargement des partenaires</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Gestion des Partenaires</h1>
          <p className="text-muted-foreground mt-1">
            {data?.total || 0} partenaire(s) au total
          </p>
        </div>
        <Button onClick={() => setShowCreateModal(true)} className="bg-flotteq-blue hover:bg-flotteq-navy">
          <Plus className="h-4 w-4 mr-2" />
          Nouveau Partenaire
        </Button>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative md:col-span-2">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher par nom, email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Type Filter */}
          <Select
            value={typeFilter}
            onValueChange={(value) => setTypeFilter(value as PartnerType | 'all')}
          >
            <SelectTrigger>
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les types</SelectItem>
              <SelectItem value="garage">Garage</SelectItem>
              <SelectItem value="ct_center">Centre CT</SelectItem>
              <SelectItem value="insurance">Assurance</SelectItem>
              <SelectItem value="parts_supplier">Fournisseur Pièces</SelectItem>
            </SelectContent>
          </Select>

          {/* Status Filter */}
          <Select
            value={statusFilter}
            onValueChange={(value) => setStatusFilter(value as PartnerStatus | 'all')}
          >
            <SelectTrigger>
              <SelectValue placeholder="Statut" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les statuts</SelectItem>
              <SelectItem value="pending">En attente</SelectItem>
              <SelectItem value="approved">Approuvé</SelectItem>
              <SelectItem value="rejected">Rejeté</SelectItem>
              <SelectItem value="suspended">Suspendu</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* City Filter */}
        <div className="mt-4">
          <Input
            placeholder="Filtrer par ville..."
            value={cityFilter}
            onChange={(e) => setCityFilter(e.target.value)}
          />
        </div>
      </Card>

      {/* Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Entreprise</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Ville</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead>Note</TableHead>
              <TableHead>Commission</TableHead>
              <TableHead>Créé le</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data?.data?.map((partner) => (
              <TableRow key={partner.id}>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-medium">{partner.companyName}</span>
                    <span className="text-xs text-muted-foreground">{partner.email}</span>
                  </div>
                </TableCell>
                <TableCell>{getTypeLabel(partner.type)}</TableCell>
                <TableCell>{partner.city}</TableCell>
                <TableCell>{getStatusBadge(partner.status)}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <span className="font-medium">{Number(partner.rating).toFixed(1)}</span>
                    <span className="text-muted-foreground text-sm">
                      ({partner.totalReviews})
                    </span>
                  </div>
                </TableCell>
                <TableCell>{Number(partner.commissionRate).toFixed(0)}%</TableCell>
                <TableCell>
                  {new Date(partner.createdAt).toLocaleDateString('fr-FR')}
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setSelectedPartner(partner)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      {/* Pagination */}
      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">
          Page {page} sur {Math.ceil((data?.total || 0) / 10)}
        </p>
        <div className="space-x-2">
          <Button
            variant="outline"
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
          >
            Précédent
          </Button>
          <Button
            variant="outline"
            disabled={page >= Math.ceil((data?.total || 0) / 10)}
            onClick={() => setPage(page + 1)}
          >
            Suivant
          </Button>
        </div>
      </div>

      {/* Detail Modal */}
      {selectedPartner && (
        <PartnerDetailModal
          partner={selectedPartner}
          open={!!selectedPartner}
          onClose={() => setSelectedPartner(null)}
          onEdit={(partner) => {
            setEditPartner(partner);
            setSelectedPartner(null);
          }}
        />
      )}

      {/* Form Modal */}
      <PartnerFormModal
        partner={editPartner}
        open={showCreateModal || !!editPartner}
        onClose={() => {
          setShowCreateModal(false);
          setEditPartner(null);
        }}
      />
    </div>
  );
};
