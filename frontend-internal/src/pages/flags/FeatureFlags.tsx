import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
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
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Plus,
  Search,
  Filter,
  Flag,
  Settings,
  Users,
  Calendar,
  MoreHorizontal,
  Eye,
  Edit,
  Copy,
  Trash2,
  Play,
  Pause,
  TestTube,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  Zap,
  Target,
} from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { featureFlagsService, type FeatureFlag, type FeatureFlagStats } from '@/services/featureFlagsService';

const FeatureFlags: React.FC = () => {
  const [flags, setFlags] = useState<FeatureFlag[]>([]);
  const [stats, setStats] = useState<FeatureFlagStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [riskFilter, setRiskFilter] = useState('all');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [categories, setCategories] = useState<string[]>([]);
  const [editingFlag, setEditingFlag] = useState<FeatureFlag | null>(null);
  const [newFlag, setNewFlag] = useState({
    name: '',
    key: '',
    description: '',
    type: 'boolean' as const,
    category: '',
    risk_level: 'low' as const,
    rollout_percentage: 0,
    target_plans: [] as string[],
    target_regions: [] as string[],
    conditions: [] as any[],
  });

  useEffect(() => {
    loadInitialData();
  }, [searchTerm, statusFilter, categoryFilter, riskFilter]);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const [flagsResponse, statsData, categoriesData] = await Promise.all([
        featureFlagsService.getFeatureFlags({
          search: searchTerm || undefined,
          status: statusFilter !== 'all' ? statusFilter as any : undefined,
          category: categoryFilter !== 'all' ? categoryFilter : undefined,
          risk_level: riskFilter !== 'all' ? riskFilter as any : undefined,
        }),
        featureFlagsService.getStatistics(),
        featureFlagsService.getCategories(),
      ]);
      
      setFlags(flagsResponse.data || []);
      setStats(statsData);
      setCategories(categoriesData);
    } catch (error) {
      console.error('Error loading feature flags:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les feature flags',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateFlag = async () => {
    try {
      if (!newFlag.name.trim() || !newFlag.key.trim()) {
        toast({
          title: 'Erreur',
          description: 'Le nom et la clé sont obligatoires',
          variant: 'destructive',
        });
        return;
      }

      const flagData = {
        ...newFlag,
        name: newFlag.name.trim(),
        key: newFlag.key.trim(),
        description: newFlag.description.trim(),
        status: 'disabled' as const,
      };
      
      if (editingFlag) {
        await featureFlagsService.updateFeatureFlag(editingFlag.id, flagData);
        toast({
          title: 'Succès',
          description: 'Le feature flag a été modifié avec succès',
        });
      } else {
        await featureFlagsService.createFeatureFlag(flagData);
        toast({
          title: 'Succès',
          description: 'Le feature flag a été créé avec succès',
        });
      }
      
      setShowCreateDialog(false);
      setEditingFlag(null);
      setNewFlag({
        name: '',
        key: '',
        description: '',
        type: 'boolean',
        category: '',
        risk_level: 'low',
        rollout_percentage: 0,
        target_plans: [],
        target_regions: [],
        conditions: [],
      });
      loadInitialData();
    } catch (error) {
      console.error('Error creating/updating flag:', error);
      toast({
        title: 'Erreur',
        description: editingFlag ? 'Impossible de modifier le flag' : 'Impossible de créer le flag',
        variant: 'destructive',
      });
    }
  };

  const handleToggleFlag = async (flagId: number, currentStatus: string) => {
    try {
      if (currentStatus === 'enabled') {
        await featureFlagsService.disableFlag(flagId);
        toast({
          title: 'Flag désactivé',
          description: 'Le feature flag a été désactivé avec succès',
        });
      } else {
        await featureFlagsService.enableFlag(flagId);
        toast({
          title: 'Flag activé',
          description: 'Le feature flag a été activé avec succès',
        });
      }
      loadInitialData();
    } catch (error) {
      console.error('Error toggling flag:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de modifier le statut du flag',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteFlag = async (flagId: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce feature flag ?')) {
      return;
    }
    
    try {
      await featureFlagsService.deleteFeatureFlag(flagId);
      toast({
        title: 'Flag supprimé',
        description: 'Le feature flag a été supprimé avec succès',
      });
      loadInitialData();
    } catch (error) {
      console.error('Error deleting flag:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de supprimer le flag',
        variant: 'destructive',
      });
    }
  };

  const handleEditFlag = (flag: FeatureFlag) => {
    setEditingFlag(flag);
    setNewFlag({
      name: flag.name,
      key: flag.key,
      description: flag.description || '',
      type: flag.type,
      category: flag.category || '',
      risk_level: flag.risk_level,
      rollout_percentage: flag.rollout_percentage || 0,
      target_plans: flag.target_plans || [],
      target_regions: flag.target_regions || [],
      conditions: flag.conditions || [],
    });
    setShowCreateDialog(true);
  };

  const handleCloneFlag = async (flag: FeatureFlag) => {
    try {
      await featureFlagsService.cloneFlag(flag.id);
      toast({
        title: 'Flag cloné',
        description: 'Le feature flag a été cloné avec succès',
      });
      loadInitialData();
    } catch (error) {
      console.error('Error cloning flag:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de cloner le flag',
        variant: 'destructive',
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'enabled':
        return (
          <Badge className="bg-green-100 text-green-800">
            <CheckCircle className="w-3 h-3 mr-1" />
            Activé
          </Badge>
        );
      case 'disabled':
        return (
          <Badge variant="secondary">
            <Pause className="w-3 h-3 mr-1" />
            Désactivé
          </Badge>
        );
      case 'testing':
        return (
          <Badge className="bg-blue-100 text-blue-800">
            <TestTube className="w-3 h-3 mr-1" />
            Test
          </Badge>
        );
      case 'rollback':
        return (
          <Badge variant="destructive">
            <AlertTriangle className="w-3 h-3 mr-1" />
            Rollback
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getRiskBadge = (riskLevel: string) => {
    switch (riskLevel) {
      case 'high':
        return <Badge variant="destructive">Élevé</Badge>;
      case 'medium':
        return <Badge className="bg-orange-100 text-orange-800">Moyen</Badge>;
      case 'low':
        return <Badge className="bg-green-100 text-green-800">Faible</Badge>;
      default:
        return <Badge variant="outline">{riskLevel}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  const filteredFlags = flags.filter(flag => {
    const matchesSearch = !searchTerm || 
      flag.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      flag.key.toLowerCase().includes(searchTerm.toLowerCase()) ||
      flag.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || flag.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || flag.category === categoryFilter;
    const matchesRisk = riskFilter === 'all' || flag.risk_level === riskFilter;
    
    return matchesSearch && matchesStatus && matchesCategory && matchesRisk;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Flag className="w-6 h-6" />
            Feature Flags
          </h1>
          <p className="text-gray-600">Gestion des fonctionnalités et déploiements progressifs</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Configuration
          </Button>
          <Button onClick={() => setShowCreateDialog(true)} className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Nouveau Flag
          </Button>
        </div>
      </div>

      {/* Statistics */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Flags</CardTitle>
              <Flag className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total_flags}</div>
              <p className="text-xs text-muted-foreground">
                {stats.enabled_flags} activés
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Flags à Risque</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.high_risk_flags}</div>
              <p className="text-xs text-muted-foreground">
                Surveillance requise
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Modifiés Récemment</CardTitle>
              <Clock className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.recently_modified}</div>
              <p className="text-xs text-muted-foreground">
                Dernières 24h
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Catégories</CardTitle>
              <Target className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{Object.keys(stats.flags_by_category).length}</div>
              <p className="text-xs text-muted-foreground">
                Différentes catégories
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
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
                  placeholder="Rechercher par nom, clé ou description..."
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
                <SelectItem value="enabled">Activé</SelectItem>
                <SelectItem value="disabled">Désactivé</SelectItem>
                <SelectItem value="testing">Test</SelectItem>
                <SelectItem value="rollback">Rollback</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Catégorie" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes</SelectItem>
                {categories.map(category => (
                  <SelectItem key={category} value={category}>{category}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={riskFilter} onValueChange={setRiskFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Risque" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les risques</SelectItem>
                <SelectItem value="low">Faible</SelectItem>
                <SelectItem value="medium">Moyen</SelectItem>
                <SelectItem value="high">Élevé</SelectItem>
              </SelectContent>
            </Select>
            
            <Button 
              variant="outline" 
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('all');
                setCategoryFilter('all');
                setRiskFilter('all');
              }}
            >
              Réinitialiser
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Feature Flags Table */}
      <Card>
        <CardHeader>
          <CardTitle>Feature Flags ({filteredFlags.length})</CardTitle>
          <CardDescription>
            Gestion et contrôle des fonctionnalités de l'application
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
                  <TableHead>Nom & Clé</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Rollout</TableHead>
                  <TableHead>Risque</TableHead>
                  <TableHead>Catégorie</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredFlags.map((flag) => (
                  <TableRow key={flag.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{flag.name}</div>
                        <div className="text-sm text-gray-500 font-mono">{flag.key}</div>
                        {flag.description && (
                          <div className="text-xs text-gray-500 truncate max-w-[200px]">
                            {flag.description}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{flag.type}</Badge>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(flag.status)}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {flag.rollout_percentage}%
                      </div>
                    </TableCell>
                    <TableCell>
                      {getRiskBadge(flag.risk_level)}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{flag.category || 'Aucune'}</Badge>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEditFlag(flag)}>
                            <Edit className="w-4 h-4 mr-2" />
                            Modifier
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleCloneFlag(flag)}>
                            <Copy className="w-4 h-4 mr-2" />
                            Cloner
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleToggleFlag(flag.id, flag.status)}>
                            {flag.status === 'enabled' ? (
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
                            onClick={() => handleDeleteFlag(flag.id)}
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
          
          {filteredFlags.length === 0 && !loading && (
            <div className="text-center py-12">
              <Flag className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <div className="text-xl font-medium text-gray-900 mb-2">
                Aucun feature flag trouvé
              </div>
              <div className="text-gray-500 mb-4">
                {searchTerm || statusFilter !== 'all' || categoryFilter !== 'all' || riskFilter !== 'all'
                  ? 'Essayez de modifier vos filtres de recherche'
                  : 'Commencez par créer votre premier feature flag'
                }
              </div>
              <Button onClick={() => setShowCreateDialog(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Créer un flag
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingFlag ? 'Modifier le Feature Flag' : 'Créer un Feature Flag'}</DialogTitle>
            <DialogDescription>
              Configurez les paramètres de ce feature flag
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="flag_name">Nom du flag</Label>
                <Input
                  id="flag_name"
                  value={newFlag.name}
                  onChange={(e) => setNewFlag(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Ex: Nouveau Dashboard"
                />
              </div>
              
              <div>
                <Label htmlFor="flag_key">Clé unique</Label>
                <Input
                  id="flag_key"
                  value={newFlag.key}
                  onChange={(e) => setNewFlag(prev => ({ ...prev, key: e.target.value }))}
                  placeholder="Ex: new_dashboard"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="flag_description">Description</Label>
              <Textarea
                id="flag_description"
                value={newFlag.description}
                onChange={(e) => setNewFlag(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Description de la fonctionnalité"
                rows={2}
              />
            </div>
            
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <Label htmlFor="flag_type">Type</Label>
                <Select value={newFlag.type} onValueChange={(value: any) => setNewFlag(prev => ({ ...prev, type: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="boolean">Booléen</SelectItem>
                    <SelectItem value="variant">Variante</SelectItem>
                    <SelectItem value="experiment">Expériment</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="flag_category">Catégorie</Label>
                <Select value={newFlag.category} onValueChange={(value) => setNewFlag(prev => ({ ...prev, category: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(category => (
                      <SelectItem key={category} value={category}>{category}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="flag_risk">Niveau de risque</Label>
                <Select value={newFlag.risk_level} onValueChange={(value: any) => setNewFlag(prev => ({ ...prev, risk_level: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Faible</SelectItem>
                    <SelectItem value="medium">Moyen</SelectItem>
                    <SelectItem value="high">Élevé</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div>
              <Label htmlFor="flag_rollout">Pourcentage de rollout (%)</Label>
              <Input
                id="flag_rollout"
                type="number"
                min="0"
                max="100"
                value={newFlag.rollout_percentage}
                onChange={(e) => setNewFlag(prev => ({ ...prev, rollout_percentage: parseInt(e.target.value) || 0 }))}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowCreateDialog(false);
              setEditingFlag(null);
              setNewFlag({
                name: '',
                key: '',
                description: '',
                type: 'boolean',
                category: '',
                risk_level: 'low',
                rollout_percentage: 0,
                target_plans: [],
                target_regions: [],
                conditions: [],
              });
            }}>
              Annuler
            </Button>
            <Button 
              onClick={handleCreateFlag}
              disabled={!newFlag.name || !newFlag.key}
            >
              {editingFlag ? 'Modifier le Flag' : 'Créer le Flag'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FeatureFlags;