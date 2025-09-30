import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
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
  Plus,
  Search,
  Filter,
  Gift,
  TrendingUp,
  Users,
  Calendar,
  MoreHorizontal,
  Eye,
  Edit,
  Copy,
  Trash2,
  Play,
  Pause,
  Target,
  DollarSign,
  Percent,
  Clock,
  CheckCircle,
  AlertTriangle,
  XCircle,
} from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { promotionsService, type Promotion, type PromotionStats } from '@/services/promotionsService';


const PromotionsOverview: React.FC = () => {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [stats, setStats] = useState<PromotionStats | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalPromotions, setTotalPromotions] = useState(0);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  useEffect(() => {
    loadData();
  }, [searchTerm, statusFilter, typeFilter, currentPage]);

  useEffect(() => {
    loadStats();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      const filters = {
        search: searchTerm || undefined,
        status: statusFilter !== 'all' ? (statusFilter as 'active' | 'inactive') : undefined,
        type: typeFilter !== 'all' ? typeFilter : undefined,
        page: currentPage,
        per_page: 10,
      };
      
      const response = await promotionsService.getPromotions(filters);
      setPromotions(response.data || []);
      setCurrentPage(response.current_page || 1);
      setTotalPages(response.last_page || 1);
      setTotalPromotions(response.total || 0);
    } catch (error) {
      console.error('Error loading promotions:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les promotions',
        variant: 'destructive',
      });
      setPromotions([]);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const statsData = await promotionsService.getStatistics();
      setStats(statsData);
    } catch (error) {
      console.error('Error loading stats:', error);
      setStats({
        total_promotions: 0,
        active_promotions: 0,
        total_usage: 0,
        total_revenue: 0,
        total_discount: 0,
        top_promotions: [],
      });
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const getStatusBadge = (isActive: boolean) => {
    if (isActive) {
      return <Badge className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Actif</Badge>;
    } else {
      return <Badge className="bg-gray-100 text-gray-800"><Pause className="w-3 h-3 mr-1" />Inactif</Badge>;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'discount':
        return 'Remise';
      case 'trial':
        return 'Essai gratuit';
      case 'bonus':
        return 'Bonus';
      default:
        return type;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'discount':
        return <Percent className="w-4 h-4 text-blue-600" />;
      case 'trial':
        return <Gift className="w-4 h-4 text-purple-600" />;
      case 'bonus':
        return <TrendingUp className="w-4 h-4 text-orange-600" />;
      default:
        return <Gift className="w-4 h-4" />;
    }
  };

  const formatPromotionValue = (promotion: Promotion) => {
    if (promotion.discount_type === 'percentage') {
      return `${promotion.discount_percentage}%`;
    } else if (promotion.discount_type === 'fixed') {
      return formatCurrency(promotion.discount_value);
    }
    return '-';
  };

  const handleToggleStatus = async (promotionId: number, currentStatus: boolean) => {
    try {
      if (currentStatus) {
        await promotionsService.deactivatePromotion(promotionId);
        toast({
          title: 'Promotion désactivée',
          description: 'La promotion a été désactivée avec succès',
        });
      } else {
        await promotionsService.activatePromotion(promotionId);
        toast({
          title: 'Promotion activée',
          description: 'La promotion a été activée avec succès',
        });
      }
      loadData();
      loadStats();
    } catch (error) {
      console.error('Error toggling promotion status:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de modifier le statut de la promotion',
        variant: 'destructive',
      });
    }
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast({
      title: 'Code copié',
      description: `Le code "${code}" a été copié dans le presse-papiers`,
    });
  };

  const handleDeletePromotion = async (promotionId: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette promotion ?')) {
      return;
    }
    
    try {
      await promotionsService.deletePromotion(promotionId);
      toast({
        title: 'Promotion supprimée',
        description: 'La promotion a été supprimée avec succès',
      });
      loadData();
      loadStats();
    } catch (error) {
      console.error('Error deleting promotion:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de supprimer la promotion',
        variant: 'destructive',
      });
    }
  };

  const handleCreatePromotion = () => {
    // TODO: Implement create promotion dialog/modal
    toast({
      title: 'Fonctionnalité à venir',
      description: 'La création de promotions sera bientôt disponible',
    });
  };

  const handleEditPromotion = (promotionId: number) => {
    // TODO: Implement edit promotion dialog/modal
    toast({
      title: 'Fonctionnalité à venir',
      description: 'La modification de promotions sera bientôt disponible',
    });
  };

  const handleViewDetails = (promotionId: number) => {
    // TODO: Implement view promotion details
    toast({
      title: 'Fonctionnalité à venir',
      description: 'Les détails de la promotion seront bientôt disponibles',
    });
  };

  const handleDuplicatePromotion = async (promotion: Promotion) => {
    try {
      const newName = `${promotion.name} (Copie)`;
      const newCode = `${promotion.code}_COPY_${Date.now()}`;
      
      await promotionsService.duplicatePromotion(promotion.id, newName, newCode);
      toast({
        title: 'Promotion dupliquée',
        description: 'La promotion a été dupliquée avec succès',
      });
      loadData();
      loadStats();
    } catch (error) {
      console.error('Error duplicating promotion:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de dupliquer la promotion',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Gift className="w-6 h-6" />
            Offres & Promotions
          </h1>
          <p className="text-gray-600">Codes promo et campagnes marketing</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="flex items-center gap-2">
            <Target className="w-4 h-4" />
            Campagnes
          </Button>
          <Button onClick={handleCreatePromotion} className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Nouvelle promotion
          </Button>
        </div>
      </div>

      {/* Statistiques principales */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total promotions</CardTitle>
              <Gift className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total_promotions}</div>
              <p className="text-xs text-muted-foreground">
                {stats.active_promotions} actives
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Utilisations</CardTitle>
              <Users className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total_usage.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                Taux de conversion: {stats.conversion_rate}%
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Économies totales</CardTitle>
              <DollarSign className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{formatCurrency(stats.total_discount)}</div>
              <p className="text-xs text-muted-foreground">
                Accordées aux clients
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Performance</CardTitle>
              <TrendingUp className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.top_promotions[0]?.code?.substring(0, 8) || 'N/A'}...
              </div>
              <p className="text-xs text-muted-foreground">
                Meilleure promotion
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filtres et recherche */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filtres et recherche
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 flex-wrap">
            <div className="flex-1 min-w-[300px]">
              <div className="relative">
                <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Rechercher par code ou nom de promotion..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="active">Actif</SelectItem>
                <SelectItem value="inactive">Inactif</SelectItem>
                <SelectItem value="scheduled">Programmé</SelectItem>
                <SelectItem value="expired">Expiré</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les types</SelectItem>
                <SelectItem value="discount">Remise</SelectItem>
                <SelectItem value="trial">Essai gratuit</SelectItem>
                <SelectItem value="bonus">Bonus</SelectItem>
              </SelectContent>
            </Select>
            
            <Button 
              variant="outline" 
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('all');
                setTypeFilter('all');
              }}
            >
              Réinitialiser
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Liste des promotions */}
      <Card>
        <CardHeader>
          <CardTitle>Promotions ({totalPromotions})</CardTitle>
          <CardDescription>
            Gestion des codes promo et campagnes promotionnelles
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse flex space-x-4 p-4 border rounded">
                  <div className="rounded-full bg-gray-200 h-10 w-10"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code & Nom</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Valeur</TableHead>
                  <TableHead>Utilisation</TableHead>
                  <TableHead>Validité</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {promotions.map((promotion) => (
                  <TableRow key={promotion.id}>
                    <TableCell>
                      <div>
                        <div className="font-mono font-medium text-blue-600">{promotion.code}</div>
                        <div className="text-sm font-medium">{promotion.name}</div>
                        <div className="text-xs text-gray-500 truncate max-w-[200px]">
                          {promotion.description}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getTypeIcon(promotion.type)}
                        <span className="text-sm">{getTypeLabel(promotion.type)}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{formatPromotionValue(promotion)}</div>
                      {promotion.min_purchase_amount && (
                        <div className="text-xs text-gray-500">
                          Min: {formatCurrency(promotion.min_purchase_amount)}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{promotion.current_usage_count}</div>
                        {promotion.usage_limit_total && (
                          <div className="text-xs text-gray-500">
                            / {promotion.usage_limit_total} max
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{formatDate(promotion.start_date)}</div>
                        <div className="text-gray-500">→ {formatDate(promotion.end_date)}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(promotion.is_active)}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleViewDetails(promotion.id)}>
                            <Eye className="w-4 h-4 mr-2" />
                            Voir détails
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleEditPromotion(promotion.id)}>
                            <Edit className="w-4 h-4 mr-2" />
                            Modifier
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleCopyCode(promotion.code)}>
                            <Copy className="w-4 h-4 mr-2" />
                            Copier le code
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDuplicatePromotion(promotion)}>
                            <Copy className="w-4 h-4 mr-2" />
                            Dupliquer
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleToggleStatus(promotion.id, promotion.is_active)}>
                            {promotion.is_active ? (
                              <>
                                <Pause className="w-4 h-4 mr-2" />
                                Désactiver
                              </>
                            ) : (
                              <>
                                <Play className="w-4 h-4 mr-2" />
                                Activer
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            className="text-red-600"
                            onClick={() => handleDeletePromotion(promotion.id)}
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Supprimer
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
          
          {promotions.length === 0 && !loading && (
            <div className="text-center py-12">
              <Gift className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <div className="text-xl font-medium text-gray-900 mb-2">
                Aucune promotion trouvée
              </div>
              <div className="text-gray-500 mb-4">
                {searchTerm || statusFilter !== 'all' || typeFilter !== 'all'
                  ? 'Essayez de modifier vos filtres de recherche'
                  : 'Commencez par créer votre première promotion'
                }
              </div>
              <Button onClick={handleCreatePromotion}>
                <Plus className="w-4 h-4 mr-2" />
                Créer une promotion
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PromotionsOverview;