import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Building2, Users, TrendingUp, AlertCircle, CheckCircle, Clock, MoreVertical, Eye, Settings, Pause, Play, Trash2 } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import TenantModal from '@/components/modals/TenantModal';
import { tenantService, type Tenant, type TenantCreateData } from '@/services/tenantService';
import { toast } from '@/hooks/use-toast';

// Utilitaires sécurisés
import { safeArray, safeMap } from '@/utils/safeData';

const TenantsOverview: React.FC = () => {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [showTenantModal, setShowTenantModal] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');

  useEffect(() => {
    loadTenants();
  }, []);

  const loadTenants = async () => {
    setLoading(true);
    try {
      const response = await tenantService.getAll();
      const fetchedTenants = safeArray(response?.tenants);
      const fetchedStats = response?.stats || null;
      setTenants(fetchedTenants);
      setStats(fetchedStats);
    } catch (error) {
      console.error('Erreur lors du chargement des tenants:', error);
      // En cas d'erreur, s'assurer que tenants est un tableau vide
      setTenants([]);
      setStats(null);
      toast({
        title: "Erreur",
        description: "Impossible de charger les tenants",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddTenant = () => {
    setSelectedTenant(null);
    setModalMode('create');
    setShowTenantModal(true);
  };

  const handleEditTenant = (tenant: Tenant) => {
    setSelectedTenant(tenant);
    setModalMode('edit');
    setShowTenantModal(true);
  };

  const handleTenantSubmit = async (data: TenantCreateData) => {
    try {
      if (modalMode === 'create') {
        await tenantService.create(data);
        toast({
          title: "Tenant créé",
          description: `Le tenant ${data.name} a été créé avec succès`
        });
      } else if (selectedTenant) {
        await tenantService.update(selectedTenant.id, data);
        toast({
          title: "Tenant modifié",
          description: `Le tenant ${data.name} a été modifié avec succès`
        });
      }
      
      setShowTenantModal(false);
      loadTenants();
    } catch (error: any) {
      throw error; // Re-throw pour que TenantModal gère l'erreur
    }
  };

  const handleSuspendTenant = async (tenant: Tenant) => {
    try {
      await tenantService.suspend(tenant.id, 'Suspension manuelle depuis l\'interface admin');
      toast({
        title: "Tenant suspendu",
        description: `Le tenant ${tenant.name} a été suspendu`
      });
      loadTenants();
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de suspendre le tenant",
        variant: "destructive"
      });
    }
  };

  const handleActivateTenant = async (tenant: Tenant) => {
    try {
      await tenantService.activate(tenant.id);
      toast({
        title: "Tenant réactivé",
        description: `Le tenant ${tenant.name} a été réactivé`
      });
      loadTenants();
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de réactiver le tenant",
        variant: "destructive"
      });
    }
  };

  const handleDeleteTenant = async (tenant: Tenant) => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer le tenant "${tenant.name}" ? Cette action est irréversible.`)) {
      return;
    }

    try {
      await tenantService.delete(tenant.id);
      toast({
        title: "Tenant supprimé",
        description: `Le tenant ${tenant.name} a été supprimé`
      });
      loadTenants();
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le tenant",
        variant: "destructive"
      });
    }
  };

  const handleViewDetails = async (tenant: Tenant) => {
    try {
      const usage = await tenantService.getUsageDetails(tenant.id);
      toast({
        title: "Détails du tenant",
        description: `${tenant.name} utilise ${usage.usage_percentage.users}% de ses utilisateurs et ${usage.usage_percentage.vehicles}% de ses véhicules`
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de charger les détails",
        variant: "destructive"
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      active: { variant: 'default' as const, icon: CheckCircle, color: 'text-green-600' },
      inactive: { variant: 'secondary' as const, icon: Clock, color: 'text-gray-600' },
      suspended: { variant: 'destructive' as const, icon: AlertCircle, color: 'text-red-600' }
    };
    
    const config = variants[status as keyof typeof variants];
    const Icon = config.icon;
    
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className={`h-3 w-3 ${config.color}`} />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Gestion des Tenants</h1>
            <p className="text-gray-600">Chargement...</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestion des Tenants</h1>
          <p className="text-gray-600">Supervision de toutes les entreprises clientes</p>
        </div>
        <Button onClick={handleAddTenant}>
          <Building2 className="h-4 w-4 mr-2" />
          Ajouter un Tenant
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tenants</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.total || safeLength(tenants)}</div>
            <p className="text-xs text-muted-foreground">+{Math.round(stats?.monthly_growth || 0)}% ce mois</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Utilisateurs Actifs</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.total_users || safeArray(tenants).reduce((sum, tenant) => sum + tenant.users_count, 0)}
            </div>
            <p className="text-xs text-muted-foreground">Tous tenants confondus</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Véhicules Gérés</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.total_vehicles || safeArray(tenants).reduce((sum, tenant) => sum + tenant.vehicles_count, 0)}
            </div>
            <p className="text-xs text-muted-foreground">Total flotte</p>
          </CardContent>
        </Card>
      </div>

      {/* Tenants Table */}
      <Card>
        <CardHeader>
          <CardTitle>Liste des Tenants</CardTitle>
          <CardDescription>
            Toutes les entreprises utilisant la plateforme FlotteQ
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full table-auto">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium">Entreprise</th>
                  <th className="text-left py-3 px-4 font-medium">Domaine</th>
                  <th className="text-left py-3 px-4 font-medium">Statut</th>
                  <th className="text-left py-3 px-4 font-medium">Utilisateurs</th>
                  <th className="text-left py-3 px-4 font-medium">Véhicules</th>
                  <th className="text-left py-3 px-4 font-medium">Plan</th>
                  <th className="text-left py-3 px-4 font-medium">Dernière activité</th>
                  <th className="text-left py-3 px-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {safeMap(tenants, (tenant) => (
                  <tr key={tenant.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <Building2 className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <div className="font-medium">{tenant.name}</div>
                          <div className="text-sm text-gray-500">ID: {tenant.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm">{tenant.domain}</td>
                    <td className="py-3 px-4">{getStatusBadge(tenant.status)}</td>
                    <td className="py-3 px-4 text-sm">{tenant.users_count}</td>
                    <td className="py-3 px-4 text-sm">{tenant.vehicles_count}</td>
                    <td className="py-3 px-4">
                      <Badge variant="outline">{tenant.subscription_plan}</Badge>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-500">
                      {new Date(tenant.last_activity).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="py-3 px-4">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleViewDetails(tenant)}>
                            <Eye className="h-4 w-4 mr-2" />
                            Voir détails
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleEditTenant(tenant)}>
                            <Settings className="h-4 w-4 mr-2" />
                            Modifier
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          {tenant.status === 'active' ? (
                            <DropdownMenuItem 
                              onClick={() => handleSuspendTenant(tenant)}
                              className="text-orange-600"
                            >
                              <Pause className="h-4 w-4 mr-2" />
                              Suspendre
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem 
                              onClick={() => handleActivateTenant(tenant)}
                              className="text-green-600"
                            >
                              <Play className="h-4 w-4 mr-2" />
                              Réactiver
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={() => handleDeleteTenant(tenant)}
                            className="text-red-600"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Supprimer
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Modal de gestion des tenants */}
      <TenantModal
        isOpen={showTenantModal}
        onClose={() => setShowTenantModal(false)}
        onSubmit={handleTenantSubmit}
        tenant={selectedTenant}
        mode={modalMode}
      />
    </div>
  );
};

export default TenantsOverview;