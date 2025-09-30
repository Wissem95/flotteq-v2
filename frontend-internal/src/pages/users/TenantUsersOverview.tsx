// TenantUsersOverview.tsx - Vue globale de tous les utilisateurs des tenants FlotteQ

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Search,
  Users,
  Building2,
  Download,
  MoreVertical,
  Eye,
  Ban,
  Trash2,
  UserCheck,
  UserX,
  Calendar,
  AlertCircle,
  CheckCircle,
  Filter,
  RefreshCw,
  ArrowUpDown
} from 'lucide-react';
import tenantUsersService, { 
  type TenantUser, 
  type TenantUsersStats, 
  type TenantUsersFilters 
} from '@/services/tenantUsersService';
import { toast } from '@/hooks/use-toast';

// Utilitaires sécurisés
import { safeArray, safeMap } from '@/utils/safeData';

const TenantUsersOverview: React.FC = () => {
  // États principaux
  const [users, setUsers] = useState<TenantUser[]>([]);
  const [stats, setStats] = useState<TenantUsersStats | null>(null);
  const [tenants, setTenants] = useState<Array<{ id: string; name: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  
  // Filtres
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTenant, setSelectedTenant] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  
  // Modales et actions
  const [selectedUser, setSelectedUser] = useState<TenantUser | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Chargement initial
  useEffect(() => {
    loadUsers();
  }, [currentPage, searchTerm, selectedTenant, statusFilter, sortBy, sortOrder]);

  // Chargement avec debounce pour la recherche
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (currentPage !== 1) {
        setCurrentPage(1); // Reset pagination when searching
      } else {
        loadUsers();
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  const loadUsers = async () => {
    try {
      setLoading(true);

      const filters: TenantUsersFilters = {
        page: currentPage,
        per_page: 20,
        search: searchTerm || undefined,
        tenant_id: selectedTenant !== 'all' ? selectedTenant : undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        sort_by: sortBy,
        sort_order: sortOrder
      };

      const response = await tenantUsersService.getAll(filters);
      
      const fetchedUsers = safeArray(response?.users?.data);
      const fetchedStats = response?.stats || null;
      const fetchedTenants = safeArray(response?.tenants);

      setUsers(fetchedUsers);
      setStats(fetchedStats);
      setTenants(fetchedTenants);
      setTotalPages(response?.users?.last_page || 1);
      setTotalUsers(response?.users?.total || 0);

    } catch (error: any) {
      console.error('Erreur lors du chargement des utilisateurs:', error);
      // En cas d'erreur, s'assurer que les états sont vides
      setUsers([]);
      setStats(null);
      setTenants([]);
      toast({
        title: "Erreur",
        description: error.message || "Impossible de charger les utilisateurs des tenants",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await loadUsers();
      toast({
        title: "Actualisé",
        description: "Les données ont été mises à jour"
      });
    } catch (error) {
      // L'erreur est déjà gérée dans loadUsers
    } finally {
      setRefreshing(false);
    }
  };

  const handleToggleStatus = async (user: TenantUser) => {
    if (actionLoading) return;
    
    setActionLoading(user.id);
    try {
      await tenantUsersService.toggleStatus(user.id);
      
      const action = user.is_active ? 'suspendu' : 'réactivé';
      toast({
        title: "Statut modifié",
        description: `L'utilisateur ${user.first_name} ${user.last_name} a été ${action}`
      });
      
      // Recharger les données
      await loadUsers();
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Erreur lors du changement de statut",
        variant: "destructive"
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async () => {
    if (!selectedUser || actionLoading) return;
    
    setActionLoading(selectedUser.id);
    try {
      await tenantUsersService.delete(selectedUser.id);
      toast({
        title: "Utilisateur supprimé",
        description: `L'utilisateur ${selectedUser.first_name} ${selectedUser.last_name} a été supprimé`
      });
      
      setShowDeleteModal(false);
      setSelectedUser(null);
      
      // Recharger les données
      await loadUsers();
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Erreur lors de la suppression",
        variant: "destructive"
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleExport = async () => {
    try {
      const filters: TenantUsersFilters = {
        search: searchTerm || undefined,
        tenant_id: selectedTenant !== 'all' ? selectedTenant : undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        sort_by: sortBy,
        sort_order: sortOrder
      };

      await tenantUsersService.exportAndDownload(filters);
      toast({
        title: "Export réussi",
        description: "Le fichier CSV a été téléchargé"
      });
    } catch (error: any) {
      toast({
        title: "Erreur d'export",
        description: error.message || "Impossible d'exporter les données",
        variant: "destructive"
      });
    }
  };

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('desc');
    }
  };

  const resetFilters = () => {
    setSearchTerm('');
    setSelectedTenant('all');
    setStatusFilter('all');
    setSortBy('created_at');
    setSortOrder('desc');
    setCurrentPage(1);
  };

  const getUserStatusBadge = (user: TenantUser) => {
    if (user.is_active) {
      return (
        <Badge variant="default" className="bg-green-600 hover:bg-green-700">
          <CheckCircle className="w-3 h-3 mr-1" />
          Actif
        </Badge>
      );
    } else {
      return (
        <Badge variant="destructive">
          <AlertCircle className="w-3 h-3 mr-1" />
          Suspendu
        </Badge>
      );
    }
  };

  const getTenantBadge = (user: TenantUser) => {
    return (
      <Badge variant="outline" className="max-w-[150px] truncate">
        <Building2 className="w-3 h-3 mr-1" />
        {user.tenant?.name || 'N/A'}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const SortableHeader: React.FC<{ column: string; children: React.ReactNode }> = ({ column, children }) => (
    <button
      onClick={() => handleSort(column)}
      className="flex items-center gap-1 hover:text-gray-900 transition-colors"
    >
      {children}
      <ArrowUpDown className="w-3 h-3" />
    </button>
  );

  return (
    <div className="space-y-6">
      {/* Header avec titre et actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Utilisateurs de la Plateforme
          </h1>
          <p className="text-gray-600 mt-1">
            Gestion de tous les utilisateurs clients des tenants FlotteQ
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={handleRefresh}
            disabled={refreshing}
            size="sm"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Actualiser
          </Button>
          <Button 
            variant="outline" 
            onClick={handleExport}
            size="sm"
          >
            <Download className="h-4 w-4 mr-2" />
            Exporter CSV
          </Button>
        </div>
      </div>

      {/* Statistiques rapides */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Utilisateurs</p>
                <p className="text-2xl font-bold">{stats?.total_users || 0}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Utilisateurs Actifs</p>
                <p className="text-2xl font-bold text-green-600">{stats?.active_users || 0}</p>
              </div>
              <UserCheck className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Comptes Suspendus</p>
                <p className="text-2xl font-bold text-red-600">{stats?.inactive_users || 0}</p>
              </div>
              <UserX className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Inscriptions (7j)</p>
                <p className="text-2xl font-bold text-purple-600">{stats?.recent_registrations || 0}</p>
              </div>
              <Calendar className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtres et recherche */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filtres de recherche
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={resetFilters}>
              Réinitialiser
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Rechercher par nom ou email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <Select value={selectedTenant} onValueChange={setSelectedTenant}>
              <SelectTrigger className="w-full md:w-[200px]">
                <Building2 className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Tous les tenants" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les tenants</SelectItem>
                {safeMap(tenants, (tenant) => (
                  <SelectItem key={tenant.id} value={tenant.id}>
                    {tenant.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={(v: any) => setStatusFilter(v)}>
              <SelectTrigger className="w-full md:w-[150px]">
                <SelectValue placeholder="Tous les statuts" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="active">Actifs</SelectItem>
                <SelectItem value="inactive">Suspendus</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tableau des utilisateurs */}
      <Card>
        <CardHeader>
          <CardTitle>
            Utilisateurs ({totalUsers})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Chargement des utilisateurs...</p>
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <div className="text-xl font-medium text-gray-900 mb-2">
                Aucun utilisateur trouvé
              </div>
              <div className="text-gray-500 mb-4">
                {searchTerm || selectedTenant !== 'all' || statusFilter !== 'all' 
                  ? 'Essayez de modifier vos filtres de recherche'
                  : 'Aucun utilisateur de tenants n\'est encore enregistré'
                }
              </div>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>
                      <SortableHeader column="first_name">Utilisateur</SortableHeader>
                    </TableHead>
                    <TableHead>Tenant</TableHead>
                    <TableHead>
                      <SortableHeader column="is_active">Statut</SortableHeader>
                    </TableHead>
                    <TableHead>Rôle</TableHead>
                    <TableHead>
                      <SortableHeader column="created_at">Inscrit le</SortableHeader>
                    </TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {safeMap(users, (user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">
                            {user.first_name} {user.last_name}
                          </p>
                          <p className="text-sm text-gray-600">{user.email}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        {getTenantBadge(user)}
                      </TableCell>
                      <TableCell>
                        {getUserStatusBadge(user)}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {user.role || 'user'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3 text-gray-400" />
                          <span className="text-sm">
                            {formatDate(user.created_at)}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedUser(user);
                                setShowDetailsModal(true);
                              }}
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              Voir détails
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleToggleStatus(user)}
                              disabled={actionLoading === user.id}
                            >
                              {user.is_active ? (
                                <>
                                  <Ban className="h-4 w-4 mr-2" />
                                  Suspendre
                                </>
                              ) : (
                                <>
                                  <UserCheck className="h-4 w-4 mr-2" />
                                  Réactiver
                                </>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedUser(user);
                                setShowDeleteModal(true);
                              }}
                              className="text-red-600"
                              disabled={actionLoading === user.id}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Supprimer
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-between items-center mt-4">
                  <p className="text-sm text-gray-600">
                    Page {currentPage} sur {totalPages} ({totalUsers} utilisateurs au total)
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                    >
                      Précédent
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                    >
                      Suivant
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Modal de suppression */}
      <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmer la suppression</DialogTitle>
            <DialogDescription>
              Cette action est irréversible. L'utilisateur et toutes ses données seront définitivement supprimés.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p>
              Êtes-vous sûr de vouloir supprimer l'utilisateur{' '}
              <strong>
                {selectedUser?.first_name} {selectedUser?.last_name}
              </strong> ?
            </p>
            {selectedUser?.tenant && (
              <p className="text-sm text-gray-600 mt-2">
                Tenant: {selectedUser.tenant.name}
              </p>
            )}
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowDeleteModal(false)}
              disabled={actionLoading === selectedUser?.id}
            >
              Annuler
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDelete}
              disabled={actionLoading === selectedUser?.id}
            >
              {actionLoading === selectedUser?.id ? 'Suppression...' : 'Supprimer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de détails */}
      <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Détails de l'utilisateur</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Nom complet</label>
                  <p className="text-sm">{selectedUser.first_name} {selectedUser.last_name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Email</label>
                  <p className="text-sm">{selectedUser.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Tenant</label>
                  <p className="text-sm">{selectedUser.tenant?.name || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Rôle</label>
                  <p className="text-sm">{selectedUser.role || 'user'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Statut</label>
                  <div className="mt-1">
                    {getUserStatusBadge(selectedUser)}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Inscrit le</label>
                  <p className="text-sm">{formatDate(selectedUser.created_at)}</p>
                </div>
              </div>
              
              {selectedUser.stats && (
                <div className="border-t pt-4">
                  <h4 className="font-medium mb-2">Statistiques</h4>
                  <div className="text-sm text-gray-600">
                    <p>Inscrit depuis {selectedUser.stats.days_since_registration} jours</p>
                  </div>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDetailsModal(false)}>
              Fermer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TenantUsersOverview;